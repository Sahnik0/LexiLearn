import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, Video, Download, Link as LinkIcon, Search,
  Filter, Star, ExternalLink, AlertCircle, BookOpen,
  Download as DownloadIcon, Share2, Bookmark, Eye,
  Volume2, Settings, ArrowRight, RefreshCw, CheckCircle,
  XCircle, Sparkles, ChevronRight, AlertTriangle, Info,
  Calendar, Clock, Users, Tag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../firebase';
import { ref, set, get, update } from 'firebase/database';
import { debounce } from 'lodash';
import '../styles/fonts.css';

// Comprehensive resource data structure
const resources = {
  teaching: [
    {
      id: 't1',
      title: "Multisensory Teaching Methods",
      description: "A comprehensive guide to implementing multisensory teaching techniques in the classroom, with practical examples and lesson plans.",
      type: "guide",
      format: "pdf",
      difficulty: "intermediate",
      language: "english",
      tags: ["teaching", "methodology", "classroom"],
      rating: 4.8,
      downloads: 1234,
      lastUpdated: "2024-02-15",
      size: "2.4MB",
      url: "#",
      preview: {
        type: "pdf",
        content: "sample-preview.pdf",
        thumbnail: "preview-thumb.jpg"
      },
      requirements: ["account"],
      accessibility: {
        screenReader: true,
        textToSpeech: true,
        highContrast: true
      }
    },
    {
      id: 't2',
      title: "Structured Literacy Curriculum",
      description: "Complete curriculum package with lesson plans, worksheets, and assessment tools for structured literacy instruction.",
      type: "curriculum",
      format: "mixed",
      difficulty: "advanced",
      language: "english",
      tags: ["curriculum", "literacy", "assessment"],
      rating: 4.9,
      downloads: 2156,
      lastUpdated: "2024-02-18",
      size: "156MB",
      url: "#",
      preview: {
        type: "mixed",
        content: "curriculum-preview.pdf",
        thumbnail: "curriculum-thumb.jpg"
      },
      requirements: ["account", "teacher"],
      accessibility: {
        screenReader: true,
        textToSpeech: true,
        highContrast: true
      }
    }
  ],
  tools: [
    {
      id: 'tl1',
      title: "Reading Assistant Pro",
      description: "Advanced text-to-speech software with customizable reading support features and progress tracking.",
      type: "software",
      platform: ["windows", "mac", "ios"],
      difficulty: "beginner",
      language: "multiple",
      tags: ["software", "reading", "assistance"],
      rating: 4.7,
      downloads: 8901,
      lastUpdated: "2024-02-10",
      url: "#",
      trial: true,
      requirements: ["account", "download"],
      accessibility: {
        screenReader: true,
        textToSpeech: true,
        keyboard: true
      }
    },
    {
      id: 'tl2',
      title: "Visual Learning Suite",
      description: "Comprehensive set of visual learning tools and manipulatives for multisensory instruction.",
      type: "toolkit",
      platform: ["web"],
      difficulty: "intermediate",
      language: "english",
      tags: ["visual", "learning", "tools"],
      rating: 4.6,
      downloads: 5632,
      lastUpdated: "2024-02-12",
      url: "#",
      trial: false,
      requirements: ["account", "subscription"],
      accessibility: {
        screenReader: true,
        keyboard: true
      }
    }
  ],
  parents: [
    {
      id: 'p1',
      title: "Parent's Complete Guide to Dyslexia",
      description: "Essential information and strategies for parents supporting children with dyslexia at home and school.",
      type: "guide",
      format: "pdf",
      difficulty: "beginner",
      language: "english",
      tags: ["parenting", "support", "guide"],
      rating: 4.9,
      downloads: 3456,
      lastUpdated: "2024-02-01",
      url: "#",
      preview: {
        type: "pdf",
        content: "parent-guide-preview.pdf",
        thumbnail: "guide-thumb.jpg"
      },
      requirements: ["account"],
      accessibility: {
        screenReader: true,
        textToSpeech: true
      }
    },
    {
      id: 'p2',
      title: "Home Learning Activities Collection",
      description: "Curated collection of engaging learning activities and games for home practice.",
      type: "activities",
      format: "mixed",
      difficulty: "beginner",
      language: "english",
      tags: ["activities", "games", "practice"],
      rating: 4.8,
      downloads: 2789,
      lastUpdated: "2024-02-05",
      url: "#",
      preview: {
        type: "mixed",
        content: "activities-preview.pdf",
        thumbnail: "activities-thumb.jpg"
      },
      requirements: ["account"],
      accessibility: {
        screenReader: true,
        textToSpeech: true
      }
    }
  ]
};

function Resources() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('teaching');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    difficulty: 'all',
    language: 'all',
    accessibility: 'all'
  });
  const [sort, setSort] = useState('rating');
  const [bookmarks, setBookmarks] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(null);
  const [userSettings, setUserSettings] = useState({
    highContrast: false,
    fontSize: 'normal',
    dyslexicFont: false
  });
  
  const searchRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          const userDataRef = ref(database, `users/${currentUser.uid}`);
          const snapshot = await get(userDataRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setBookmarks(userData.bookmarks || []);
            setRecentlyViewed(userData.recentlyViewed || []);
            setUserSettings(userData.settings || {
              highContrast: false,
              fontSize: 'normal',
              dyslexicFont: false
            });
          }
        } catch (err) {
          setError('Failed to load user data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (previewRef.current && !previewRef.current.contains(event.target)) {
        setShowPreview(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const debouncedSearch = debounce((query) => {
    setSearchQuery(query);
  }, 300);

  const handleSearch = (e) => {
    e.preventDefault();
    debouncedSearch(e.target.value);
  };

  const toggleBookmark = async (resourceId) => {
    if (!currentUser) {
      setError('Please sign in to bookmark resources');
      return;
    }

    try {
      const newBookmarks = bookmarks.includes(resourceId)
        ? bookmarks.filter(id => id !== resourceId)
        : [...bookmarks, resourceId];
      
      await update(ref(database, `users/${currentUser.uid}`), {
        bookmarks: newBookmarks
      });
      
      setBookmarks(newBookmarks);
    } catch (err) {
      setError('Failed to update bookmark');
      console.error(err);
    }
  };

  const addToRecentlyViewed = async (resourceId) => {
    if (!currentUser) return;

    try {
      const newRecentlyViewed = [
        resourceId,
        ...recentlyViewed.filter(id => id !== resourceId)
      ].slice(0, 10);

      await update(ref(database, `users/${currentUser.uid}`), {
        recentlyViewed: newRecentlyViewed
      });

      setRecentlyViewed(newRecentlyViewed);
    } catch (err) {
      console.error('Failed to update recently viewed:', err);
    }
  };

  const getSortedAndFilteredResources = () => {
    let filtered = resources[activeTab].filter(resource => {
      const matchesSearch = searchQuery === '' ||
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilters = 
        (filters.type === 'all' || resource.type === filters.type) &&
        (filters.difficulty === 'all' || resource.difficulty === filters.difficulty) &&
        (filters.language === 'all' || resource.language === filters.language) &&
        (filters.accessibility === 'all' || 
          resource.accessibility[filters.accessibility]);

      return matchesSearch && matchesFilters;
    });

    // Sort resources
    filtered.sort((a, b) => {
      switch (sort) {
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'date':
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        default:
          return 0;
      }
    });

    return filtered;
  };

  return (
    <div className={`min-h-screen bg-black text-white ${
      userSettings.dyslexicFont ? 'font-opendyslexic' : ''
    } ${userSettings.highContrast ? 'high-contrast' : ''}`}>
      /* Animated Background */
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-black to-black" />
          {[...Array(15)].map((_, i) => (
            <div
          key={i}
          className="absolute rounded-full bg-blue-400/10 blur-xl animate-float"
          style={{
            width: `${Math.random() * 200 + 100}px`,
            height: `${Math.random() * 200 + 100}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 7 + 10}s`,
            animationDelay: `${Math.random() * 5}s`
          }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-300% animate-gradient">
            Learning Resources
          </span>
            </h1>
            <p className="text-xl text-white/80">
          Discover our comprehensive collection of dyslexia support materials
            </p>
          </div>

          {/* Search and Filters */}
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search resources..."
                  onChange={handleSearch}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-white/50"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-white/50" />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="all">All Types</option>
                <option value="guide">Guides</option>
                <option value="video">Videos</option>
                <option value="software">Software</option>
                <option value="curriculum">Curriculum</option>
              </select>

              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="rating">Highest Rated</option>
                <option value="downloads">Most Downloaded</option>
                <option value="date">Recently Updated</option>
              </select>
            </div>
          </div>
        </div>
        {/* Resource Categories */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-1">
            {['teaching', 'tools', 'parents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md transition-all ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/5 rounded-xl h-64"></div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            getSortedAndFilteredResources().map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isBookmarked={bookmarks.includes(resource.id)}
                onBookmark={() => toggleBookmark(resource.id)}
                onView={() => {
                  addToRecentlyViewed(resource.id);
                  setShowPreview(resource);
                }}
                settings={userSettings}
              />
            ))
          )}
        </div>

        {/* Resource Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div ref={previewRef} className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">{showPreview.title}</h2>
                  <button
                    onClick={() => setShowPreview(null)}
                    className="text-white/50 hover:text-white"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-white/80">{showPreview.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {showPreview.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoCard icon={<Calendar />} label="Updated" value={new Date(showPreview.lastUpdated).toLocaleDateString()} />
                    <InfoCard icon={<Star />} label="Rating" value={showPreview.rating.toFixed(1)} />
                    <InfoCard icon={<Download />} label="Downloads" value={showPreview.downloads.toLocaleString()} />
                    <InfoCard icon={<Users />} label="Level" value={showPreview.difficulty} />
                  </div>
                </div>
              </div>
              <div className="p-6 flex justify-between">
                <button
                  onClick={() => toggleBookmark(showPreview.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  <Bookmark className={bookmarks.includes(showPreview.id) ? "text-blue-400" : ""} />
                  {bookmarks.includes(showPreview.id) ? "Bookmarked" : "Bookmark"}
                </button>
                <a
                  href={showPreview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                  <Download /> Download Resource
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        <button
          onClick={() => setShowSettings(true)}
          className="fixed bottom-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20"
        >
          <Settings className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

// Helper Components
function ResourceCard({ resource, isBookmarked, onBookmark, onView, settings }) {
  return (
    <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          {getResourceIcon(resource.type)}
          <span className="text-sm text-white/50">{resource.type}</span>
        </div>
        <button
          onClick={onBookmark}
          className="text-white/50 hover:text-white"
        >
          <Bookmark className={isBookmarked ? "text-blue-400 fill-current" : ""} />
        </button>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
      <p className="text-white/70 mb-4 line-clamp-2">{resource.description}</p>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-400" />
          <span>{resource.rating.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          <span>{resource.downloads.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={onView}
          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <Eye className="h-4 w-4" /> Preview
        </button>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-white/70 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" /> Open
        </a>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-white/5 rounded-lg p-3">
      <div className="flex items-center gap-2 text-white/50 mb-1">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function getResourceIcon(type) {
  switch (type) {
    case 'guide':
      return <Book className="h-6 w-6" />;
    case 'video':
      return <Video className="h-6 w-6" />;
    case 'curriculum':
      return <BookOpen className="h-6 w-6" />;
    case 'software':
      return <DownloadIcon className="h-6 w-6" />;
    default:
      return <LinkIcon className="h-6 w-6" />;
  }
}

export default Resources;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { 
  MessageSquare, Users, Heart, Share2, 
  Search, Filter, ChevronRight, Clock,
  AlertCircle, BookOpen, Star, User
} from 'lucide-react';

function Support() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('forum');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);

  const forumTopics = [
    {
      id: 1,
      title: "Teaching Strategies for Math",
      author: "Sarah K.",
      replies: 15,
      lastActive: "2 hours ago",
      category: "Teaching",
      tags: ["mathematics", "strategies", "education"]
    },
    {
      id: 2,
      title: "Building Reading Confidence",
      author: "Michael R.",
      replies: 23,
      lastActive: "1 day ago",
      category: "Reading",
      tags: ["confidence", "reading", "motivation"]
    },
    {
      id: 3,
      title: "Technology Tools Discussion",
      author: "David L.",
      replies: 8,
      lastActive: "3 hours ago",
      category: "Technology",
      tags: ["tools", "software", "assistive-tech"]
    }
  ];

  const successStories = [
    {
      id: 1,
      title: "From Struggling Reader to Published Author",
      author: "Emma Thompson",
      content: "I was diagnosed with dyslexia at age 8. With support and determination, I've published my first novel...",
      likes: 45,
      category: "Career Success",
      date: "2024-02-15"
    },
    {
      id: 2,
      title: "Finding My Way in Medical School",
      author: "Dr. James Wilson",
      content: "Dyslexia didn't stop me from pursuing my dream of becoming a doctor. Here's my journey...",
      likes: 32,
      category: "Education",
      date: "2024-02-10"
    }
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredContent = () => {
    const content = activeTab === 'forum' ? forumTopics : successStories;
    return content.filter(item => {
      const matchesSearch = searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filter === 'all' || item.category === filter;
      
      return matchesSearch && matchesFilter;
    });
  };

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const storiesRef = collection(db, 'stories');
        const q = query(storiesRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const storiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStories(storiesData);
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };

    fetchStories();
  }, []);

  const StoryModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      content: '',
      category: 'Education'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!currentUser) return;

      setIsSubmitting(true);
      try {
        const storiesRef = collection(db, 'stories');
        await addDoc(storiesRef, {
          ...formData,
          author: currentUser.displayName || 'Anonymous',
          userId: currentUser.uid,
          timestamp: serverTimestamp(),
          likes: 0,
          date: new Date().toISOString()
        });

        setShowStoryModal(false);
        setFormData({ title: '', content: '', category: 'Education' });
        const q = query(storiesRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const storiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStories(storiesData);
      } catch (error) {
        console.error('Error submitting story:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full mx-4">
          <h2 className="text-2xl font-bold mb-4">Share Your Success Story</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                  placeholder="Enter your story title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Education">Education</option>
                  <option value="Career Success">Career Success</option>
                  <option value="Personal Growth">Personal Growth</option>
                  <option value="Learning Strategies">Learning Strategies</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Story</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg h-40 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                  placeholder="Share your success story here..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => setShowStoryModal(false)}
                className="px-4 py-2 text-white/70 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Share Story'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">

        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-black to-black" />
          {[...Array(10)].map((_, i) => (
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-300% animate-gradient">
            Community Support
          </span>
            </h1>
            <p className="text-xl text-white/80">
          Connect, share, and learn from others in the dyslexia community
            </p>
          </div>

          {/* Search and Filters */}
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search discussions..."
                  onChange={handleSearch}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-white/50"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-white/50" />
              </div>
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            >
              <option value="all">All Categories</option>
              <option value="Teaching">Teaching</option>
              <option value="Reading">Reading</option>
              <option value="Technology">Technology</option>
              <option value="Education">Education</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-lg p-1">
            <button
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'forum' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setActiveTab('forum')}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Discussion Forum
              </div>
            </button>
            <button
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'stories' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setActiveTab('stories')}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Success Stories
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6">
          {!currentUser ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
              <p className="text-white/80 mb-6">
                Sign in to participate in discussions and share your experiences
              </p>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto"
              >
                <User className="h-5 w-5" />
                Sign In
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'forum' ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Recent Discussions</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      New Topic
                    </button>
                  </div>
                  <div className="space-y-4">
                    {filteredContent().map((topic) => (
                      <div key={topic.id} className="border border-white/10 rounded-lg p-6 hover:bg-white/5 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{topic.title}</h3>
                            <div className="flex items-center gap-4 text-white/60 text-sm">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {topic.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {topic.lastActive}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                {topic.replies} replies
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {topic.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-white/10 rounded-full text-sm text-white/70">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Success Stories</h2>
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                      onClick={() => setShowStoryModal(true)}
                    >
                      <Star className="h-5 w-5" />
                      Share Your Story
                    </button>
                  </div>
                  <div className="space-y-6">
                    {stories.map((story) => (
                      <div key={story.id} className="border border-white/10 rounded-lg p-6 hover:bg-white/5 transition-all">
                        <h3 className="text-2xl font-semibold mb-2">{story.title}</h3>
                        <div className="flex items-center gap-4 text-white/60 text-sm mb-4">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {story.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(story.date).toLocaleDateString()}
                          </span>
                          <span className="px-2 py-1 bg-white/10 rounded-full">
                            {story.category}
                          </span>
                        </div>
                        <p className="text-white/80 mb-4">{story.content}</p>
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-2 text-white/60 hover:text-red-400 transition-colors">
                            <Heart className="h-5 w-5" />
                            {story.likes}
                          </button>
                          <button className="flex items-center gap-2 text-white/60 hover:text-blue-400 transition-colors">
                            <Share2 className="h-5 w-5" />
                            Share
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {showStoryModal && <StoryModal />}
    </div>
  );
}

export default Support;
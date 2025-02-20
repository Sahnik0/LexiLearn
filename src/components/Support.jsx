import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Users, Heart, Share2 } from 'lucide-react';

function Support() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('forum');

  const forumTopics = [
    {
      id: 1,
      title: "Teaching Strategies for Math",
      author: "Sarah K.",
      replies: 15,
      lastActive: "2 hours ago",
    },
    {
      id: 2,
      title: "Building Reading Confidence",
      author: "Michael R.",
      replies: 23,
      lastActive: "1 day ago",
    },
    {
      id: 3,
      title: "Technology Tools Discussion",
      author: "David L.",
      replies: 8,
      lastActive: "3 hours ago",
    },
  ];

  const successStories = [
    {
      id: 1,
      title: "From Struggling Reader to Published Author",
      author: "Emma Thompson",
      content: "I was diagnosed with dyslexia at age 8. With support and determination, I've published my first novel...",
      likes: 45,
    },
    {
      id: 2,
      title: "Finding My Way in Medical School",
      author: "Dr. James Wilson",
      content: "Dyslexia didn't stop me from pursuing my dream of becoming a doctor. Here's my journey...",
      likes: 32,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Support</h1>
          <p className="text-xl text-gray-600">
            Connect, share, and learn from others in the dyslexia community
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1">
            <button
              className={`px-6 py-2 rounded-md ${
                activeTab === 'forum' ? 'bg-indigo-600 text-white' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('forum')}
            >
              Discussion Forum
            </button>
            <button
              className={`px-6 py-2 rounded-md ${
                activeTab === 'stories' ? 'bg-indigo-600 text-white' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('stories')}
            >
              Success Stories
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {!currentUser ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Join Our Community</h2>
              <p className="text-gray-600 mb-4">
                Sign in to participate in discussions and share your experiences
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
              >
                Sign In
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'forum' ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Recent Discussions</h2>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                      New Topic
                    </button>
                  </div>
                  <div className="space-y-4">
                    {forumTopics.map((topic) => (
                      <div key={topic.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">{topic.title}</h3>
                            <p className="text-sm text-gray-600">
                              Posted by {topic.author} • {topic.lastActive}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center text-gray-600">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {topic.replies}
                            </span>
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
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                      Share Your Story
                    </button>
                  </div>
                  <div className="space-y-6">
                    {successStories.map((story) => (
                      <div key={story.id} className="border rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">By {story.author}</p>
                        <p className="text-gray-700 mb-4">{story.content}</p>
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center text-gray-600 hover:text-red-500">
                            <Heart className="h-4 w-4 mr-1" />
                            {story.likes}
                          </button>
                          <button className="flex items-center text-gray-600 hover:text-indigo-600">
                            <Share2 className="h-4 w-4 mr-1" />
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
    </div>
  );
}

export default Support;
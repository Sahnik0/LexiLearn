import { useState } from 'react';
import { Book, Video, Download, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Resources() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('teaching');

  const resources = {
    teaching: [
      {
        title: "Multisensory Teaching Methods",
        description: "A comprehensive guide to implementing multisensory teaching techniques in the classroom.",
        type: "guide",
        url: "#",
      },
      {
        title: "Structured Literacy Approach",
        description: "Learn about the systematic and explicit teaching of reading and writing.",
        type: "video",
        url: "#",
      },
      {
        title: "Classroom Accommodations Guide",
        description: "Practical strategies for supporting dyslexic students in the classroom.",
        type: "pdf",
        url: "#",
      },
    ],
    tools: [
      {
        title: "Reading Assistant Software",
        description: "Text-to-speech tools and reading support applications.",
        type: "link",
        url: "#",
      },
      {
        title: "Writing Support Tools",
        description: "Grammar and spelling assistance specifically designed for dyslexic users.",
        type: "link",
        url: "#",
      },
      {
        title: "Visual Learning Materials",
        description: "Visual aids and graphic organizers for learning support.",
        type: "pdf",
        url: "#",
      },
    ],
    parents: [
      {
        title: "Parent's Guide to Dyslexia",
        description: "Essential information for parents of dyslexic children.",
        type: "guide",
        url: "#",
      },
      {
        title: "Home Learning Strategies",
        description: "Activities and techniques to support learning at home.",
        type: "video",
        url: "#",
      },
      {
        title: "Progress Monitoring Tools",
        description: "Templates and guides for tracking your child's progress.",
        type: "pdf",
        url: "#",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Learning Resources</h1>
          <p className="text-xl text-gray-600">
            Access our comprehensive collection of dyslexia support materials
          </p>
        </div>

        {/* Resource Categories */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1">
            <button
              className={`px-6 py-2 rounded-md ${
                activeTab === 'teaching' ? 'bg-indigo-600 text-white' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('teaching')}
            >
              Teaching Methods
            </button>
            <button
              className={`px-6 py-2 rounded-md ${
                activeTab === 'tools' ? 'bg-indigo-600 text-white' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('tools')}
            >
              Learning Tools
            </button>
            <button
              className={`px-6 py-2 rounded-md ${
                activeTab === 'parents' ? 'bg-indigo-600 text-white' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('parents')}
            >
              Parent Resources
            </button>
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources[activeTab].map((resource, index) => (
            <ResourceCard
              key={index}
              resource={resource}
              requiresAuth={resource.type === 'pdf'}
              currentUser={currentUser}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ resource, requiresAuth, currentUser }) {
  const getIcon = (type) => {
    switch (type) {
      case 'guide':
        return <Book className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'pdf':
        return <Download className="h-6 w-6" />;
      default:
        return <LinkIcon className="h-6 w-6" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-indigo-600 mb-4">{getIcon(resource.type)}</div>
      <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
      <p className="text-gray-600 mb-4">{resource.description}</p>
      {requiresAuth && !currentUser ? (
        <p className="text-sm text-indigo-600">Please login to access this resource</p>
      ) : (
        <a
          href={resource.url}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700"
        >
          Access Resource
          <LinkIcon className="h-4 w-4 ml-2" />
        </a>
      )}
    </div>
  );
}

export default Resources;
import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, set, get, remove } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import {
  Book,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertCircle,
  Search,
  SortAsc,
  Calendar
} from 'lucide-react';

const Notes = () => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadNotes();
  }, [currentUser]);

  const loadNotes = async () => {
    if (!currentUser) return;
    
    try {
      const notesRef = ref(database, `users/${currentUser.uid}/notes`);
      const snapshot = await get(notesRef);
      
      if (snapshot.exists()) {
        const notesData = snapshot.val();
        setNotes(Object.values(notesData));
      }
    } catch (err) {
      setError('Failed to load notes');
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    if (!currentUser || !activeNote?.title || !activeNote?.content) return;
    
    try {
      const noteId = activeNote.id || Date.now().toString();
      const noteData = {
        id: noteId,
        title: activeNote.title,
        content: activeNote.content,
        lastModified: new Date().toISOString(),
        createdAt: activeNote.createdAt || new Date().toISOString()
      };

      await set(
        ref(database, `users/${currentUser.uid}/notes/${noteId}`),
        noteData
      );

      setNotes(prev => {
        const filtered = prev.filter(note => note.id !== noteId);
        return [...filtered, noteData];
      });
      
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Failed to save note');
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!currentUser) return;
    
    try {
      await remove(ref(database, `users/${currentUser.uid}/notes/${noteId}`));
      setNotes(prev => prev.filter(note => note.id !== noteId));
      if (activeNote?.id === noteId) {
        setActiveNote(null);
        setIsEditing(false);
      }
    } catch (err) {
      setError('Failed to delete note');
      console.error(err);
    }
  };

  const createNewNote = () => {
    const newNote = {
      id: null,
      title: '',
      content: '',
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    setActiveNote(newNote);
    setIsEditing(true);
  };

  const getSortedAndFilteredNotes = () => {
    return notes
      .filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.lastModified) - new Date(a.lastModified);
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated Background */}
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
              My Notes
            </span>
          </h1>
          <p className="text-xl text-white/80">
            Keep track of your learning journey with personal notes
          </p>
        </div>

        {/* Search and Controls */}
        <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-white/50"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-white/50" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
              
              <button
                onClick={createNewNote}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Plus className="h-5 w-5" /> New Note
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-500">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notes List */}
          <div className="space-y-4">
            {getSortedAndFilteredNotes().map(note => (
              <div
                key={note.id}
                className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 cursor-pointer transition-all hover:bg-white/10 ${
                  activeNote?.id === note.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  setActiveNote(note);
                  setIsEditing(false);
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{note.title}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNote(note);
                        setIsEditing(true);
                      }}
                      className="p-1 hover:text-blue-400"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="p-1 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-white/70 line-clamp-2">{note.content}</p>
                <div className="flex items-center gap-2 mt-4 text-sm text-white/50">
                  <Calendar className="h-4 w-4" />
                  {new Date(note.lastModified).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {/* Note Editor */}
          {(activeNote || isEditing) && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <input
                  type="text"
                  value={activeNote?.title || ''}
                  onChange={(e) => setActiveNote({...activeNote, title: e.target.value})}
                  placeholder="Note Title"
                  className="text-2xl font-bold bg-transparent border-none focus:outline-none placeholder-white/30 w-full"
                  readOnly={!isEditing}
                />
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveNote}
                        className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          if (!activeNote?.id) setActiveNote(null);
                        }}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              
              <textarea
                value={activeNote?.content || ''}
                onChange={(e) => setActiveNote({...activeNote, content: e.target.value})}
                placeholder="Write your note here..."
                className="w-full h-[500px] bg-white/5 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/30"
                readOnly={!isEditing}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
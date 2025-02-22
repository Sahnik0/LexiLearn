import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Send, MessageCircle, UserCircle } from 'lucide-react';

const DiscussionForum = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const messagesRef = collection(db, 'discussions');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messageData);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'discussions'), {
        text: newMessage,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userEmail: currentUser.email,
        timestamp: serverTimestamp(),
        photoURL: currentUser.photoURL || null,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        {/* Chat Header */}
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="text-blue-400" />
            <h2 className="text-lg font-semibold">Community Chat</h2>
          </div>
        </div>

        {/* Messages Container */}
        <div 
          ref={chatContainerRef}
          className="h-[600px] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          {messages.map((message, index) => {
            const isUserMessage = message.userId === currentUser?.uid;
            const showAvatar = !isUserMessage;

            return (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  isUserMessage ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {showAvatar && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    {message.photoURL ? (
                      <img 
                        src={message.photoURL} 
                        alt={message.userName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <UserCircle className="w-6 h-6 text-white/70" />
                    )}
                  </div>
                )}
                
                <div className={`flex flex-col ${isUserMessage ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-white/60">{message.userName}</span>
                    <span className="text-xs text-white/40">{formatDate(message.timestamp)}</span>
                  </div>
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isUserMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-white/90'
                    }`}
                  >
                    <p>{message.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-white/10 p-4">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={currentUser ? "Type a message..." : "Please login to chat"}
              disabled={!currentUser || isLoading}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-full pr-12
                       text-white placeholder-white/40 focus:outline-none focus:border-blue-500
                       focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!currentUser || isLoading || !newMessage.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-400
                       hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DiscussionForum; 
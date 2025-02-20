import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, User, LogOut, GraduationCap, Menu, X, Brain, Sparkles, ArrowRight, BookMarked, ScreenShare, HeartHandshake } from 'lucide-react';
import { useState, useEffect } from 'react';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Update active section based on scroll position
      const sections = ['home', 'features', 'journey', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/10 backdrop-blur-md border-b border-white/10 shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <Brain className="h-8 w-8 text-blue-400 transition-transform duration-500 group-hover:scale-110" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-blue-400 animate-pulse" />
              <div className="absolute inset-0 bg-blue-400 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
              LexiLearn
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/#home" active={activeSection === 'home'}>Home</NavLink>
            <NavLink to="/learning" active={window.location.pathname === '/learning'}>
              <BookMarked className="h-5 w-5 mr-1" />
              Learning
            </NavLink>
            <NavLink to="/resources" active={window.location.pathname === '/resources'}>
              <BookOpen className="h-5 w-5 mr-1" />
              Resources
            </NavLink>
            <NavLink to="/screening" active={window.location.pathname === '/screening'}>
              <ScreenShare className="h-5 w-5 mr-1" />
              Screening
            </NavLink>
            <NavLink to="/support" active={window.location.pathname === '/support'}>
              <HeartHandshake className="h-5 w-5 mr-1" />
              Support
            </NavLink>
            
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <User className="h-5 w-5 mr-2" />
                  <span className="text-white/90">{currentUser.email}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110"
                >
                  <LogOut className="h-5 w-5 text-white/90" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="relative group px-6 py-2 rounded-full overflow-hidden"
              >
                <span className="relative z-10 flex items-center text-white">
                  Login
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-blue-400 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden transition-all duration-300 ${
            isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}
        >
          <div className="py-4 space-y-4 bg-white/10 backdrop-blur-md rounded-2xl mt-2 border border-white/10">
            <MobileNavLink to="/#home" active={activeSection === 'home'}>Home</MobileNavLink>
            <MobileNavLink to="/learning" active={window.location.pathname === '/learning'}>Learning</MobileNavLink>
            <MobileNavLink to="/resources" active={window.location.pathname === '/resources'}>Resources</MobileNavLink>
            <MobileNavLink to="/screening" active={window.location.pathname === '/screening'}>Screening</MobileNavLink>
            <MobileNavLink to="/support" active={window.location.pathname === '/support'}>Support</MobileNavLink>
            {currentUser ? (
              <div className="pt-4 border-t border-white/10">
                <div className="px-4 py-2 text-sm text-white/80">{currentUser.email}</div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="block mx-4 px-4 py-2 text-center rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`relative group flex items-center transition-all duration-300 ${
        active ? 'text-blue-400' : 'text-white/90 hover:text-white'
      }`}
    >
      <span className="relative">
        {children}
        <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-blue-400 transform origin-left transition-transform duration-300 ${
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`} />
      </span>
    </Link>
  );
}

function MobileNavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`block px-4 py-2 transition-colors ${
        active 
          ? 'bg-white/10 text-blue-400' 
          : 'text-white/90 hover:bg-white/5'
      }`}
    >
      {children}
    </Link>
  );
}

export default Navbar;
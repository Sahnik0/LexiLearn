import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Resources from './components/Resources';
import Screening from './components/Screening';
import Support from './components/Support';
import Learning from './components/Learning';
import Login from './components/Login';
import './styles/fonts.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/screening" element={<Screening />} />
            <Route path="/support" element={<Support />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

function Login() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error("Failed to sign in", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to LexiLearn</h2>
          <p className="mt-2 text-gray-600">Sign in to access all features</p>
        </div>
        
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <LogIn className="h-5 w-5 mr-2" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
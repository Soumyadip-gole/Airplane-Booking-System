import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { Loader } from 'lucide-react';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { setAuthFromExternal } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        console.log('🔄 Processing Google authentication callback...');

        // Extract token and user from URL parameters
        // Check both regular searchParams and hash-based params
        let token = searchParams.get('token');
        let userParam = searchParams.get('user');

        // If not found in regular params, check if they're in the hash part
        if ((!token || !userParam) && location.hash) {
          // Parse the hash properly - the format appears to be #/path?query
          const hashParts = location.hash.split('?');
          if (hashParts.length > 1) {
            const hashParams = new URLSearchParams(hashParts[1]);
            token = token || hashParams.get('token');
            userParam = userParam || hashParams.get('user');
          }
        }

        if (!token || !userParam) {
          throw new Error('Missing authentication data');
        }
        
        // Parse user data
        const decodedUserData = decodeURIComponent(userParam);
        const userData = JSON.parse(decodedUserData);

        // Create User object
        const user: User = {
          id: userData.id ? userData.id.toString() : Date.now().toString(),
          email: userData.email,
          name: userData.name,
          number: userData.number || undefined
        };
        
        // Set authentication in the context
        setAuthFromExternal(token, user);
        
        // Immediately redirect to search page
        navigate('/search');

      } catch (error) {
        console.error('❌ Google authentication callback error:', error);
        // If authentication fails, redirect to auth page
        navigate('/auth');
      }
    };

    handleGoogleCallback();
  }, [navigate, searchParams, location.hash, setAuthFromExternal]);

  // Simple loading screen while processing
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-800">Completing Login</h2>
        <div className="flex justify-center">
          <Loader className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthFromExternal } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        console.log('Processing Google authentication callback...');
        console.log('Current URL:', window.location.href);
        
        // Get token and user data from URL parameters
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');

        console.log('Token received:', !!token);
        console.log('User param received:', !!userParam);

        if (token && userParam) {
          try {
            // Parse the user data from the URL parameter
            const userData = JSON.parse(decodeURIComponent(userParam));
            console.log('Parsed user data:', userData);

            // Validate the user data structure
            if (!userData.email || !userData.name) {
              throw new Error('Invalid user data structure');
            }

            // Create a properly formatted User object
            const validatedUser: User = {
              id: userData.id?.toString() || Date.now().toString(),
              email: userData.email,
              name: userData.name,
              number: userData.number || undefined
            };

            console.log('Setting authentication with validated user:', validatedUser);

            // Set the authentication data
            setAuthFromExternal(token, validatedUser);

            // Navigate to the search page
            console.log('Redirecting to search page...');
            navigate('/search', { replace: true });
            return;

          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            throw new Error('Failed to parse user data from callback');
          }
        }

        // If we don't have the required parameters, redirect to auth page
        console.error('Missing required authentication parameters');
        navigate('/auth', { replace: true });
        
      } catch (error) {
        console.error('Error processing Google authentication:', error);
        navigate('/auth', { replace: true });
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, setAuthFromExternal]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Completing your Google sign-in...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we redirect you...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
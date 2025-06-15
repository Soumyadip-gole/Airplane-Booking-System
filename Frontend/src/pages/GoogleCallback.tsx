import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { AlertTriangle, CheckCircle, Loader, Plane } from 'lucide-react';

const GoogleCallback: React.FC = () => {
  // Add debug logging at the very start
  console.log('🔍 GoogleCallback component is rendering');
  console.log('🌐 Current URL:', window.location.href);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthFromExternal } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const [userName, setUserName] = useState('');

  // Log URL parameters immediately
  console.log('🔑 Token from URL:', searchParams.get('token') ? 'Present' : 'Missing');
  console.log('👤 User param from URL:', searchParams.get('user') ? 'Present' : 'Missing');

  useEffect(() => {
    console.log('🔄 useEffect triggered in GoogleCallback');
    
    const handleGoogleCallback = async () => {
      try {
        console.log('🔄 Processing Google authentication callback...');
        console.log('📍 Current URL:', window.location.href);
        
        // Extract token and user from URL parameters
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        
        console.log('🔑 Token:', token ? 'Present' : 'Missing');
        console.log('👤 User param:', userParam ? 'Present' : 'Missing');
        
        if (!token) {
          throw new Error('Authentication token is missing');
        }
        
        if (!userParam) {
          throw new Error('User information is missing');
        }
        
        // Parse user data - the URL shows it's already URL encoded
        let userData;
        try {
          // Decode the URL-encoded JSON string
          const decodedUserData = decodeURIComponent(userParam);
          console.log('📝 Decoded user data:', decodedUserData);
          
          // Parse the JSON
          userData = JSON.parse(decodedUserData);
          console.log('✅ Parsed user data:', userData);
        } catch (parseError) {
          console.error('❌ Failed to parse user data:', parseError);
          throw new Error('Invalid user data format');
        }
        
        // Validate user data
        if (!userData.email || !userData.name) {
          throw new Error('Missing required user information');
        }
        
        // Create User object
        const user: User = {
          id: userData.id ? userData.id.toString() : Date.now().toString(),
          email: userData.email,
          name: userData.name,
          number: userData.number || undefined
        };
        
        console.log('✅ Setting authentication for user:', user.name);
        setUserName(user.name);
        
        // Set authentication
        setAuthFromExternal(token, user);
        
        setStatus('success');
        
        // Redirect to search page after a brief success display
        setTimeout(() => {
          console.log('🚀 Redirecting to search page...');
          navigate('/search', { replace: true });
        }, 1500);
        
      } catch (error) {
        console.error('❌ Google authentication failed:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
        setStatus('error');
        
        // Redirect to auth page after showing error
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, setAuthFromExternal]);

  console.log('🎨 About to render with status:', status);

  const renderContent = () => {
    console.log('🎨 renderContent called with status:', status);
    
    switch (status) {
      case 'processing':
        console.log('🔄 Rendering processing state');
        return (
          <>
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <Loader className="relative h-20 w-20 text-blue-600 mx-auto animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Completing Google Sign-In</h2>
            <p className="text-lg text-gray-600 mb-6">
              Processing your authentication...
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </>
        );

      case 'success':
        console.log('✅ Rendering success state');
        return (
          <>
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-2xl opacity-20"></div>
              <CheckCircle className="relative h-20 w-20 text-green-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to SkyBook!</h2>
            <p className="text-lg text-gray-600 mb-4">
              Hello {userName}! You've been successfully signed in.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 mb-4">
              <Plane className="h-4 w-4" />
              <span>Taking you to flight search...</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </>
        );

      case 'error':
        console.log('❌ Rendering error state');
        return (
          <>
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 rounded-full blur-2xl opacity-20"></div>
              <AlertTriangle className="relative h-20 w-20 text-red-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Failed</h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-800 font-medium mb-2">Error:</p>
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
            <p className="text-gray-600 mb-4">
              You'll be redirected to try again.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span>Redirecting...</span>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          </>
        );

      default:
        console.log('❓ Rendering default state (null)');
        return null;
    }
  };

  console.log('🎨 Final render with status:', status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="card-modern p-8 text-center">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;
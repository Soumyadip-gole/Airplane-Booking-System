import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, number?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setAuthFromExternal: (token: string, userData: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Validation function for server response format
const validateAuthResponse = (response: any): boolean => {
  return (
    response &&
    typeof response === 'object' &&
    typeof response.token === 'string' &&
    response.token.length > 0 &&
    typeof response.email === 'string' &&
    typeof response.name === 'string'
  );
};

// Validation function for external user data (Google auth)
const validateExternalUserData = (userData: any): boolean => {
  return (
    userData &&
    typeof userData === 'object' &&
    typeof userData.email === 'string' &&
    userData.email.length > 0 &&
    typeof userData.name === 'string' &&
    userData.name.length > 0
  );
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (storedToken) {
        try {
          console.log('🔍 Found stored token, validating with server...');
          apiService.setToken(storedToken);
          const userData = await apiService.getUser();
          
          // Validate user data from server
          if (!userData || !userData.email || !userData.name) {
            throw new Error('Invalid user data received from server');
          }
          
          setUser(userData);
          setToken(storedToken);
          console.log('✅ Token validated, user authenticated:', {
            email: userData.email,
            name: userData.name,
            id: userData.id
          });
        } catch (error) {
          console.warn('⚠️ Token validation failed:', error);
          
          if (error instanceof Error) {
            if (error.message.includes('Unable to connect to server')) {
              console.warn('🌐 Server connection failed during token validation - keeping token for retry');
              // Don't clear token immediately - server might be temporarily down
            } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
              console.info('🔄 Stored authentication token has expired or is invalid - clearing session');
              // Clear invalid token
              localStorage.removeItem('token');
              sessionStorage.removeItem('token');
              apiService.setToken(null);
              setToken(null);
              setUser(null);
            } else {
              console.warn('❓ Unexpected error during token validation:', error.message);
            }
          }
        }
      } else {
        console.log('🔍 No stored token found - user needs to authenticate');
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Initiating login request...');
      
      const response = await apiService.login({ email, password });
      
      if (!validateAuthResponse(response)) {
        console.error('❌ Invalid response format:', response);
        throw new Error('Invalid response format from server');
      }

      console.log('✅ Login response validated:', {
        hasToken: !!response.token,
        userName: response.name,
        userEmail: response.email
      });

      const userData: User = {
        id: response.id?.toString() || Date.now().toString(),
        email: response.email,
        name: response.name,
        number: response.number || undefined
      };

      // Store token securely
      localStorage.setItem('token', response.token);
      sessionStorage.setItem('token', response.token);
      
      // Update API service and state
      apiService.setToken(response.token);
      setToken(response.token);
      setUser(userData);
      
      console.log('🎉 Login successful - user state updated');
    } catch (error) {
      console.error('❌ Login failed:', error);
      // Clear any partial state on error
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      apiService.setToken(null);
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, number?: string) => {
    try {
      console.log('📝 Initiating registration request...');
      
      const response = await apiService.register({ email, password, name, number });
      
      if (!validateAuthResponse(response)) {
        console.error('❌ Invalid response format:', response);
        throw new Error('Invalid response format from server');
      }

      console.log('✅ Registration response validated:', {
        hasToken: !!response.token,
        userName: response.name,
        userEmail: response.email
      });

      const userData: User = {
        id: response.id?.toString() || Date.now().toString(),
        email: response.email,
        name: response.name,
        number: response.number || number || undefined
      };

      // Store token securely
      localStorage.setItem('token', response.token);
      sessionStorage.setItem('token', response.token);
      
      // Update API service and state
      apiService.setToken(response.token);
      setToken(response.token);
      setUser(userData);
      
      console.log('🎉 Registration successful - user state updated');
    } catch (error) {
      console.error('❌ Registration failed:', error);
      // Clear any partial state on error
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      apiService.setToken(null);
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    console.log('👋 Logging out user...');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    apiService.setToken(null);
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      console.log('📝 User data updated:', {
        email: updatedUser.email,
        name: updatedUser.name
      });
    }
  };

  const setAuthFromExternal = (authToken: string, userData: User) => {
    try {
      console.log('🔗 Setting authentication from external provider...');
      
      // Validate token
      if (!authToken || typeof authToken !== 'string' || authToken.length < 10) {
        throw new Error('Invalid authentication token provided');
      }
      
      // Validate user data
      if (!validateExternalUserData(userData)) {
        throw new Error('Invalid user data provided from external authentication');
      }

      console.log('✅ External auth data validated:', {
        hasToken: !!authToken,
        userName: userData.name,
        userEmail: userData.email,
        userId: userData.id
      });

      // Ensure user data is properly formatted
      const validatedUser: User = {
        id: userData.id || Date.now().toString(),
        email: userData.email.trim(),
        name: userData.name.trim(),
        number: userData.number || undefined
      };

      // Store token securely
      localStorage.setItem('token', authToken);
      sessionStorage.setItem('token', authToken);
      
      // Update API service and state
      apiService.setToken(authToken);
      setToken(authToken);
      setUser(validatedUser);
      
      // Set loading to false after external auth
      setIsLoading(false);
      
      console.log('🎉 External authentication successful - user state updated');
    } catch (error) {
      console.error('❌ External authentication failed:', error);
      // Clear any partial state on error
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      apiService.setToken(null);
      setToken(null);
      setUser(null);
      setIsLoading(false);
      throw error;
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    setAuthFromExternal,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
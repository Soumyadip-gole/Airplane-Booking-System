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

// Updated validation function for your server's response format
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          console.log('Found stored token, validating with server...');
          apiService.setToken(storedToken);
          const userData = await apiService.getUser();
          setUser(userData);
          setToken(storedToken);
          console.log('Token validated, user authenticated:', userData);
        } catch (error) {
          // Provide more specific error handling with clearer messaging
          if (error instanceof Error) {
            if (error.message.includes('Unable to connect to server')) {
              console.warn('Server connection failed during token validation - keeping token for retry');
              // Don't clear token immediately - server might be temporarily down
              // Just set loading to false and let user try to reconnect
            } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
              console.info('Stored authentication token has expired or is invalid - clearing session (this is normal behavior)');
              // Clear invalid token
              localStorage.removeItem('token');
              sessionStorage.removeItem('token');
              apiService.setToken(null);
              setToken(null);
              setUser(null);
            } else {
              console.warn('Unexpected error during token validation:', error.message);
              // For other errors, don't clear the token but log the issue
            }
          } else {
            console.warn('Unknown error during token validation:', error);
          }
        }
      } else {
        console.log('No stored token found - user needs to authenticate');
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Initiating login request...');
      
      const response = await apiService.login({ email, password });
      
      // Validate response format based on your server's structure
      if (!validateAuthResponse(response)) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from server');
      }

      console.log('Login response validated:', {
        hasToken: !!response.token,
        userName: response.name,
        userEmail: response.email
      });

      // Create user object from the response
      const userData: User = {
        id: response.id?.toString() || Date.now().toString(), // Fallback ID if not provided
        email: response.email,
        name: response.name,
        number: response.number || undefined
      };

      // Securely store token in both localStorage and sessionStorage for redundancy
      localStorage.setItem('token', response.token);
      sessionStorage.setItem('token', response.token);
      
      // Update API service with token
      apiService.setToken(response.token);
      
      // Update application state
      setToken(response.token);
      setUser(userData);
      
      console.log('Login successful - user state updated:', userData);
    } catch (error) {
      console.error('Login failed:', error);
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
      console.log('Initiating registration request...');
      
      const response = await apiService.register({ email, password, name, number });
      
      // Validate response format based on your server's structure
      if (!validateAuthResponse(response)) {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format from server');
      }

      console.log('Registration response validated:', {
        hasToken: !!response.token,
        userName: response.name,
        userEmail: response.email
      });

      // Create user object from the response
      const userData: User = {
        id: response.id?.toString() || Date.now().toString(), // Fallback ID if not provided
        email: response.email,
        name: response.name,
        number: response.number || number || undefined
      };

      // Securely store token in both localStorage and sessionStorage for redundancy
      localStorage.setItem('token', response.token);
      sessionStorage.setItem('token', response.token);
      
      // Update API service with token
      apiService.setToken(response.token);
      
      // Update application state
      setToken(response.token);
      setUser(userData);
      
      console.log('Registration successful - user state updated:', userData);
    } catch (error) {
      console.error('Registration failed:', error);
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
    console.log('Logging out user...');
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
      console.log('User data updated:', updatedUser);
    }
  };

  const setAuthFromExternal = (authToken: string, userData: User) => {
    console.log('Setting authentication from external provider:', {
      hasToken: !!authToken,
      userName: userData.name,
      userEmail: userData.email
    });

    // Store token securely
    localStorage.setItem('token', authToken);
    sessionStorage.setItem('token', authToken);
    
    // Update API service with token
    apiService.setToken(authToken);
    
    // Update application state
    setToken(authToken);
    setUser(userData);
    
    // CRITICAL: Set loading to false after external auth
    setIsLoading(false);
    
    console.log('External authentication successful - user state updated:', userData);
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
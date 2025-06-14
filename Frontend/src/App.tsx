import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import FlightSearch from './pages/FlightSearch';
import FlightDetails from './pages/FlightDetails';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import GoogleCallback from './pages/GoogleCallback';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/search" replace />} />
            <Route 
              path="search" 
              element={
                <ProtectedRoute>
                  <FlightSearch />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="flight/:id" 
              element={
                <ProtectedRoute>
                  <FlightDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="bookings" 
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
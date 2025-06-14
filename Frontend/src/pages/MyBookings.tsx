import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Booking } from '../types';
import { Calendar, Plane, MapPin, Clock, Edit2, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingTier, setEditingTier] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await apiService.getBookings();
      console.log('Raw bookings data:', data);
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (bookingId: string) => {
    try {
      const booking = await apiService.getBookingDetails(bookingId);
      setSelectedBooking(booking);
      setEditingTier(booking.tier);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking details');
    }
  };

  const handleUpdateTier = async () => {
    if (!selectedBooking) return;

    setUpdateLoading(true);
    try {
      await apiService.updateBooking(selectedBooking.id, { tier: editingTier });
      setSelectedBooking({ ...selectedBooking, tier: editingTier });
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id ? { ...b, tier: editingTier } : b
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await apiService.deleteBooking(bookingId);
      setBookings(bookings.filter(b => b.id !== bookingId));
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === 'Time TBD') return 'Time TBD';
    
    try {
      // Handle format like "2025-06-26 10:00+05:30"
      if (timeString.includes(' ') && timeString.includes('+')) {
        const timePart = timeString.split(' ')[1].split('+')[0];
        return timePart;
      }
      
      // Handle ISO date format
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      }
      
      // Return as-is if it's already in time format
      return timeString;
    } catch (error) {
      console.warn('Error formatting time:', timeString, error);
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Handle different date formats
      let date: Date;
      
      if (dateString.includes('T')) {
        // ISO format like "2025-06-14T05:23:31.372Z"
        date = new Date(dateString);
      } else if (dateString.includes('-') && dateString.length === 10) {
        // Format like "2025-06-24"
        date = new Date(dateString + 'T00:00:00');
      } else {
        date = new Date(dateString);
      }
      
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return dateString;
    }
  };

  const formatBookingDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting booking date:', dateString, error);
      return dateString;
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'first':
        return 'bg-purple-100 text-purple-800';
      case 'business':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusDisplayText = (status?: string) => {
    if (!status) return 'Confirmed';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Sort bookings: confirmed first, then cancelled
  const sortedBookings = [...bookings].sort((a, b) => {
    const statusA = a.status?.toLowerCase() || 'confirmed';
    const statusB = b.status?.toLowerCase() || 'confirmed';
    
    // Confirmed bookings come first
    if (statusA === 'confirmed' && statusB !== 'confirmed') return -1;
    if (statusA !== 'confirmed' && statusB === 'confirmed') return 1;
    
    // Within same status, sort by flight date (newest first)
    return new Date(b.flightDate).getTime() - new Date(a.flightDate).getTime();
  });

  // Group bookings by status
  const confirmedBookings = sortedBookings.filter(booking => 
    !booking.status || booking.status.toLowerCase() === 'confirmed'
  );
  const cancelledBookings = sortedBookings.filter(booking => 
    booking.status?.toLowerCase() === 'cancelled'
  );

  const renderBookingCard = (booking: Booking) => {
    const isCancelled = booking.status?.toLowerCase() === 'cancelled';
    
    return (
      <div
        key={booking.id}
        className={`card-modern p-6 cursor-pointer hover:scale-[1.01] transition-all duration-200 ${
          selectedBooking?.id === booking.id ? 'ring-2 ring-blue-500' : ''
        } ${isCancelled ? 'opacity-75' : ''}`}
        onClick={() => handleViewDetails(booking.id)}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isCancelled ? 'bg-red-100' : 'bg-blue-100'}`}>
              <Plane className={`h-5 w-5 ${isCancelled ? 'text-red-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {booking.airline} {booking.flightNumber}
              </h3>
              <p className="text-sm text-gray-500">{formatDate(booking.flightDate)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="flex space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierBadgeColor(booking.tier)}`}>
                {booking.tier.charAt(0).toUpperCase() + booking.tier.slice(1)}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(booking.status)}`}>
                {getStatusDisplayText(booking.status)}
              </span>
            </div>
            {booking.bookingDate && (
              <p className="text-xs text-gray-400">
                Booked: {formatBookingDate(booking.bookingDate)}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-500 mb-1">Departure</p>
            <p className="font-medium">{booking.depIata}</p>
            <p className="text-xs text-gray-600">{formatTime(booking.depTime)}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Arrival</p>
            <p className="font-medium">{booking.arrIata}</p>
            <p className="text-xs text-gray-600">{formatTime(booking.arrTime)}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Booking ID: #{booking.id}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(booking.id);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteBooking(booking.id);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
              title="Cancel Booking"
              disabled={isCancelled}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-modern p-6">
              <div className="bg-gray-300 h-6 w-48 rounded mb-4"></div>
              <div className="bg-gray-300 h-4 w-full rounded mb-2"></div>
              <div className="bg-gray-300 h-4 w-3/4 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">Manage your flight reservations</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bookings List */}
        <div className="lg:col-span-2">
          {bookings.length === 0 ? (
            <div className="card-modern p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-4">You haven't made any flight reservations.</p>
              <button
                onClick={() => window.location.href = '/search'}
                className="btn-primary"
              >
                Search Flights
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Confirmed Bookings Section */}
              {confirmedBookings.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Confirmed Bookings ({confirmedBookings.length})
                      </h2>
                      <p className="text-sm text-gray-600">Your active flight reservations</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {confirmedBookings.map(renderBookingCard)}
                  </div>
                </div>
              )}

              {/* Cancelled Bookings Section */}
              {cancelledBookings.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-red-100 p-2 rounded-full">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Cancelled Bookings ({cancelledBookings.length})
                      </h2>
                      <p className="text-sm text-gray-600">Your cancelled flight reservations</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {cancelledBookings.map(renderBookingCard)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Booking Details Panel */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <div className="card-modern p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Flight</p>
                  <p className="font-medium">{selectedBooking.airline} {selectedBooking.flightNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Flight Date</p>
                  <p className="font-medium">{formatDate(selectedBooking.flightDate)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="font-medium">{selectedBooking.depIata}</p>
                    <p className="text-xs text-gray-400">{formatTime(selectedBooking.depTime)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">To</p>
                    <p className="font-medium">{selectedBooking.arrIata}</p>
                    <p className="text-xs text-gray-400">{formatTime(selectedBooking.arrTime)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(selectedBooking.status)}`}>
                    {getStatusDisplayText(selectedBooking.status)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">Class</label>
                  <select
                    value={editingTier}
                    onChange={(e) => setEditingTier(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    disabled={selectedBooking.status?.toLowerCase() === 'cancelled'}
                  >
                    <option value="economy">Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>

                {editingTier !== selectedBooking.tier && selectedBooking.status?.toLowerCase() !== 'cancelled' && (
                  <button
                    onClick={handleUpdateTier}
                    disabled={updateLoading}
                    className="w-full btn-primary"
                  >
                    {updateLoading ? 'Updating...' : 'Update Class'}
                  </button>
                )}

                <div className="pt-4 border-t border-blue-200 space-y-2">
                  {selectedBooking.bookingDate && (
                    <div>
                      <p className="text-xs text-gray-500">Booking Date</p>
                      <p className="text-sm font-medium">{formatDate(selectedBooking.bookingDate)}</p>
                    </div>
                  )}
                  {selectedBooking.createdAt && (
                    <div>
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm font-medium">{formatDate(selectedBooking.createdAt)}</p>
                    </div>
                  )}
                  {selectedBooking.updatedAt && selectedBooking.updatedAt !== selectedBooking.createdAt && (
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium">{formatDate(selectedBooking.updatedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card-modern p-6">
              <div className="text-center text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a booking to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
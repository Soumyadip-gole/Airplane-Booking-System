import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Flight, BookingRequest } from '../types';
import { Plane, Clock, MapPin, Calendar, CheckCircle, ArrowRight, Sparkles, Star, Search } from 'lucide-react';

const FlightDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true); // Always start with loading true
  const [error, setError] = useState('');
  const [bookingTier, setBookingTier] = useState('economy');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const searchDate = location.state?.searchDate || new Date().toISOString().split('T')[0];

  useEffect(() => {
    const initializeFlight = async () => {
      // Check if we have flight data from navigation state
      const stateFlightData = location.state?.flight;
      
      if (stateFlightData && id) {
        console.log('Using flight data from navigation state:', stateFlightData);
        
        // Even if we have state data, we should fetch fresh details for the most accurate information
        try {
          console.log('Fetching fresh flight details for:', { id, searchDate });
          const freshFlightData = await apiService.getFlightDetails(id, searchDate);
          setFlight(freshFlightData);
          console.log('Fresh flight details loaded:', freshFlightData);
        } catch (err) {
          console.warn('Failed to fetch fresh details, using state data:', err);
          // Fallback to state data if API call fails
          setFlight(stateFlightData);
        }
      } else if (id) {
        // No state data, must fetch from API
        console.log('No state data available, fetching flight details for:', { id, searchDate });
        try {
          const flightData = await apiService.getFlightDetails(id, searchDate);
          setFlight(flightData);
          console.log('Flight details loaded from API:', flightData);
        } catch (err) {
          console.error('Failed to fetch flight details:', err);
          setError(err instanceof Error ? err.message : 'Failed to load flight details');
        }
      } else {
        setError('No flight ID provided');
      }
      
      setLoading(false);
    };

    initializeFlight();
  }, [id, searchDate, location.state]);

  const handleBooking = async () => {
    if (!flight) return;

    setBookingLoading(true);
    setError('');

    try {
      const bookingData: BookingRequest = {
        flightNumber: flight.flightNumber,
        airline: typeof flight.airline === 'string' ? flight.airline : flight.airline.name,
        flightDate: searchDate,
        depIata: flight.from?.airport || flight.departure?.airport || '',
        arrIata: flight.to?.airport || flight.arrival?.airport || '',
        depTime: flight.from?.time || flight.depTime || '',
        arrTime: flight.to?.time || flight.arrTime || '',
        tier: bookingTier,
      };

      console.log('Creating booking with data:', bookingData);
      await apiService.createBooking(bookingData);
      setBookingSuccess(true);
    } catch (err) {
      console.error('Booking failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to book flight');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return 'N/A';
    try {
      // Handle the new format: "2025-07-07 20:00+05:30"
      if (time.includes(' ') && time.includes('+')) {
        const timePart = time.split(' ')[1].split('+')[0];
        return timePart;
      } else if (time.includes('T') || time.includes(' ')) {
        const date = new Date(time);
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } else {
        return time;
      }
    } catch {
      return time;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getTierPrice = (basePrice?: number) => {
    if (!basePrice) {
      // Return estimated prices when no base price is available
      switch (bookingTier) {
        case 'business':
          return '$1,250';
        case 'first':
          return '$2,000';
        default:
          return '$500';
      }
    }
    
    switch (bookingTier) {
      case 'business':
        return `$${Math.round(basePrice * 2.5)}`;
      case 'first':
        return `$${Math.round(basePrice * 4)}`;
      default:
        return `$${basePrice}`;
    }
  };

  const getAirlineName = (airline: any) => {
    if (typeof airline === 'string') {
      return airline;
    }
    return airline?.name || 'Unknown Airline';
  };

  const getAircraftInfo = (aircraft: any) => {
    if (typeof aircraft === 'string') {
      return aircraft;
    }
    return aircraft?.model || 'Unknown Aircraft';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="card-modern p-8">
            <div className="space-y-4">
              <div className="bg-gray-300 h-8 w-64 rounded-xl"></div>
              <div className="bg-gray-300 h-6 w-full rounded-xl"></div>
              <div className="bg-gray-300 h-6 w-3/4 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !flight) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-6 py-4 rounded-xl backdrop-blur-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Flight not found</p>
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-modern p-12 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-2xl opacity-20"></div>
            <CheckCircle className="relative h-20 w-20 text-green-500 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-xl text-gray-600 mb-8">
            Your flight has been successfully booked. You will receive a confirmation email shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/bookings')}
              className="btn-primary"
            >
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>View My Bookings</span>
              </div>
            </button>
            <button
              onClick={() => navigate('/search')}
              className="btn-secondary"
            >
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Search More Flights</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/search')}
        className="mb-8 text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2 transition-colors duration-200"
      >
        <ArrowRight className="h-4 w-4 rotate-180" />
        <span>Back to Search</span>
      </button>

      <div className="card-modern overflow-hidden">
        {/* Flight Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur"></div>
              <div className="relative bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                <Plane className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {getAirlineName(flight.airline)} {flight.flightNumber}
                </h1>
                <Sparkles className="h-6 w-6 text-blue-200" />
              </div>
              <p className="text-blue-100 text-lg">{getAircraftInfo(flight.aircraft)}</p>
              <div className="flex items-center space-x-4 mt-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  flight.status === 'Expected' ? 'bg-green-400/20 text-green-100' : 'bg-yellow-400/20 text-yellow-100'
                }`}>
                  {flight.status}
                </span>
                {flight.distance && (
                  <span className="text-blue-200 flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{flight.distance}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Flight Details */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <span>Flight Information</span>
                </h3>
                
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Flight Date</p>
                      <p className="font-semibold text-lg">{formatDate(searchDate)}</p>
                    </div>
                  </div>

                  {/* Route Information - Updated for new API format */}
                  {flight.from && flight.to ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <div className="flex items-center justify-center space-x-2 mb-3">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-500">Departure</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 mb-1">{flight.from.airport}</p>
                          <p className="text-gray-600 mb-2">{flight.from.city}</p>
                          <p className="text-xl font-bold text-blue-600">{formatTime(flight.from.time)}</p>
                          {flight.from.terminal && (
                            <p className="text-sm text-gray-500 mt-1">Terminal {flight.from.terminal}</p>
                          )}
                        </div>

                        <div className="flex flex-col items-center px-8">
                          <div className="flex items-center mb-2">
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent w-16"></div>
                            <ArrowRight className="h-6 w-6 text-blue-400 mx-2" />
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent w-16"></div>
                          </div>
                          {flight.duration && (
                            <div className="text-center bg-blue-50 px-3 py-1 rounded-full">
                              <Clock className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                              <p className="text-sm font-medium text-blue-600">{flight.duration}</p>
                            </div>
                          )}
                        </div>

                        <div className="text-center flex-1">
                          <div className="flex items-center justify-center space-x-2 mb-3">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-500">Arrival</span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900 mb-1">{flight.to.airport}</p>
                          <p className="text-gray-600 mb-2">{flight.to.city}</p>
                          <p className="text-xl font-bold text-blue-600">{formatTime(flight.to.time)}</p>
                          {flight.to.terminal && (
                            <p className="text-sm text-gray-500 mt-1">Terminal {flight.to.terminal}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Departure</p>
                          <p className="font-medium">{flight.departure?.airport} - {flight.depTime || 'Time TBD'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Arrival</p>
                          <p className="font-medium">{flight.arrival?.airport} - {flight.arrTime || 'Time TBD'}</p>
                          {flight.arrival?.airportName && (
                            <p className="text-sm text-gray-500">{flight.arrival.airportName}</p>
                          )}
                        </div>
                      </div>

                      {flight.duration && (
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-medium">{flight.duration}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-1">
              <div className="card-modern p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Book This Flight</span>
                </h3>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-xl mb-6">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Select Class
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: 'economy', label: 'Economy' },
                        { value: 'business', label: 'Business' },
                        { value: 'first', label: 'First Class' },
                      ].map((tier) => (
                        <label
                          key={tier.value}
                          className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            bookingTier === tier.value 
                              ? 'border-blue-500 bg-blue-50 shadow-lg' 
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="tier"
                              value={tier.value}
                              checked={bookingTier === tier.value}
                              onChange={(e) => setBookingTier(e.target.value)}
                              className="sr-only"
                            />
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                                bookingTier === tier.value 
                                  ? 'border-blue-500 bg-blue-500' 
                                  : 'border-gray-300'
                              }`}>
                                {bookingTier === tier.value && (
                                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{tier.label}</p>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="w-full btn-primary"
                  >
                    {bookingLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Booking...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Book Flight</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
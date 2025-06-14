import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Flight, FlightSearchParams } from '../types';
import { Search, Plane, Clock, MapPin, Calendar, ArrowRight, Filter, RotateCcw } from 'lucide-react';

const FlightSearch: React.FC = () => {
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>('oneWay');
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({
    from: '',
    fromLocal: '',
    to: '',
    toLocal: '',
  });
  const [departureDate, setDepartureDate] = useState('');
  const [departureTimeStart, setDepartureTimeStart] = useState('');
  const [departureTimeEnd, setDepartureTimeEnd] = useState('');
  
  // Return trip fields
  const [returnDate, setReturnDate] = useState('');
  const [returnTimeStart, setReturnTimeStart] = useState('');
  const [returnTimeEnd, setReturnTimeEnd] = useState('');
  
  const [flights, setFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleDepartureDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDepartureDate(newDate);
    
    // Auto-set return date to be at least 1 day after departure for round trip
    if (tripType === 'roundTrip' && newDate && !returnDate) {
      const depDate = new Date(newDate);
      depDate.setDate(depDate.getDate() + 1);
      setReturnDate(depDate.toISOString().split('T')[0]);
    }
  };

  const handleReturnDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReturnDate(e.target.value);
  };

  const handleDepartureTimeStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = e.target.value;
    setDepartureTimeStart(startTime);
    
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      
      // Add 12 hours to the start time
      let endHours = hours + 12;
      let endMinutes = minutes;
      
      // If end time goes beyond 24 hours, wrap to next day
      if (endHours >= 24) {
        endHours = endHours - 24;
      }
      
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      setDepartureTimeEnd(endTime);
    }
  };

  const handleDepartureTimeEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endTime = e.target.value;
    
    if (departureTimeStart && endTime) {
      const [startHours, startMinutes] = departureTimeStart.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      const startTotalMinutes = startHours * 60 + startMinutes;
      let endTotalMinutes = endHours * 60 + endMinutes;
      
      // If end time is earlier than start time, assume it's next day
      if (endTotalMinutes < startTotalMinutes) {
        endTotalMinutes += 24 * 60; // Add 24 hours worth of minutes
      }
      
      const diffMinutes = endTotalMinutes - startTotalMinutes;
      const maxMinutes = 12 * 60; // 12 hours maximum
      
      if (diffMinutes > maxMinutes) {
        setError('Time range cannot exceed 12 hours');
        return;
      } else {
        setError('');
      }
    }
    
    setDepartureTimeEnd(endTime);
  };

  const handleReturnTimeStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startTime = e.target.value;
    setReturnTimeStart(startTime);
    
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      
      // Add 12 hours to the start time
      let endHours = hours + 12;
      let endMinutes = minutes;
      
      // If end time goes beyond 24 hours, wrap to next day
      if (endHours >= 24) {
        endHours = endHours - 24;
      }
      
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      setReturnTimeEnd(endTime);
    }
  };

  const handleReturnTimeEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endTime = e.target.value;
    
    if (returnTimeStart && endTime) {
      const [startHours, startMinutes] = returnTimeStart.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      const startTotalMinutes = startHours * 60 + startMinutes;
      let endTotalMinutes = endHours * 60 + endMinutes;
      
      // If end time is earlier than start time, assume it's next day
      if (endTotalMinutes < startTotalMinutes) {
        endTotalMinutes += 24 * 60;
      }
      
      const diffMinutes = endTotalMinutes - startTotalMinutes;
      const maxMinutes = 12 * 60;
      
      if (diffMinutes > maxMinutes) {
        setError('Return time range cannot exceed 12 hours');
        return;
      } else {
        setError('');
      }
    }
    
    setReturnTimeEnd(endTime);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate departure fields
    if (!departureDate || !departureTimeStart || !departureTimeEnd) {
      setError('Please fill in all departure date and time fields');
      return;
    }
    
    // Validate return fields for round trip
    if (tripType === 'roundTrip' && (!returnDate || !returnTimeStart || !returnTimeEnd)) {
      setError('Please fill in all return date and time fields for round trip');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Search outbound flights
      const startDate = new Date(`${departureDate}T${departureTimeStart}`);
      let endDate = new Date(`${departureDate}T${departureTimeEnd}`);
      
      // If end time is earlier than start time, it means next day
      if (endDate <= startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }
      
      const fromLocal = startDate.toISOString().slice(0, 16);
      const toLocal = endDate.toISOString().slice(0, 16);

      const outboundSearchData: FlightSearchParams = {
        from: searchParams.from.toUpperCase(),
        to: searchParams.to.toUpperCase(),
        fromLocal: fromLocal,
        toLocal: toLocal,
      };

      console.log('Searching outbound flights with parameters:', outboundSearchData);

      const outboundResults = await apiService.searchFlights(outboundSearchData);
      setFlights(outboundResults);
      
      // Search return flights if round trip
      if (tripType === 'roundTrip') {
        const returnStartDate = new Date(`${returnDate}T${returnTimeStart}`);
        let returnEndDate = new Date(`${returnDate}T${returnTimeEnd}`);
        
        // If end time is earlier than start time, it means next day
        if (returnEndDate <= returnStartDate) {
          returnEndDate.setDate(returnEndDate.getDate() + 1);
        }
        
        const returnFromLocal = returnStartDate.toISOString().slice(0, 16);
        const returnToLocal = returnEndDate.toISOString().slice(0, 16);

        const returnSearchData: FlightSearchParams = {
          from: searchParams.to.toUpperCase(), // Swap: return from destination
          to: searchParams.from.toUpperCase(), // Swap: return to origin
          fromLocal: returnFromLocal,
          toLocal: returnToLocal,
        };

        console.log('Searching return flights with parameters:', returnSearchData);

        const returnResults = await apiService.searchFlights(returnSearchData);
        setReturnFlights(returnResults);
        
        if (outboundResults.length === 0 && returnResults.length === 0) {
          setError('No flights found for the selected criteria. Please try different dates or destinations.');
        } else if (outboundResults.length === 0) {
          setError('No outbound flights found. Please try different departure criteria.');
        } else if (returnResults.length === 0) {
          setError('No return flights found. Please try different return criteria.');
        }
      } else {
        setReturnFlights([]); // Clear return flights for one-way
        if (outboundResults.length === 0) {
          setError('No flights found for the selected criteria. Please try different dates or destinations.');
        }
      }
    } catch (err) {
      console.error('Flight search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search flights');
    } finally {
      setLoading(false);
    }
  };

  const handleFlightSelect = (flight: Flight, isReturn = false) => {
    const flightId = flight.flightNumber.replace(/\s+/g, '');
    const searchDate = isReturn ? returnDate : departureDate;
    
    console.log('Navigating to flight details:', {
      flightId,
      originalFlightNumber: flight.flightNumber,
      date: searchDate,
      isReturn,
    });
    
    navigate(`/flight/${flightId}`, { 
      state: { 
        flight, 
        searchDate,
        isReturn,
        tripType
      } 
    });
  };

  const formatDuration = (duration?: string) => {
    if (!duration || duration === 'N/A') return 'Duration not available';
    return duration;
  };

  const getTimeRangeDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return '';
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    let endTotalMinutes = endHours * 60 + endMinutes;
    
    // If end time is earlier than start time, assume it's next day
    if (endTotalMinutes < startTotalMinutes) {
      endTotalMinutes += 24 * 60;
    }
    
    const diffMinutes = endTotalMinutes - startTotalMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    const isNextDay = endHours < startHours || (endHours === startHours && endMinutes < startMinutes);
    
    return `${hours}h ${minutes}m range${isNextDay ? ' (next day)' : ''}`;
  };

  const getAirlineName = (airline: any) => {
    if (typeof airline === 'string') {
      return airline;
    }
    return airline?.name || 'Unknown Airline';
  };

  const getAircraftModel = (aircraft: any) => {
    if (typeof aircraft === 'string') {
      return aircraft;
    }
    return aircraft?.model || 'Unknown Aircraft';
  };

  const renderFlightCard = (flight: Flight, index: number, isReturn = false) => (
    <div
      key={`${flight.id}-${index}-${isReturn ? 'return' : 'outbound'}`}
      onClick={() => handleFlightSelect(flight, isReturn)}
      className="card-modern p-6 cursor-pointer hover:scale-[1.01] transition-all duration-200 group"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                <Plane className={`h-6 w-6 text-white ${isReturn ? 'rotate-180' : ''}`} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {getAirlineName(flight.airline)} {flight.flightNumber}
              </h3>
              <p className="text-sm text-gray-500 flex items-center space-x-2">
                <span>{getAircraftModel(flight.aircraft)}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  flight.status === 'Expected' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {flight.status}
                </span>
                {isReturn && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Return Flight
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500 mb-1">Departure</p>
              <p className="text-2xl font-bold text-gray-900">{flight.departure?.airport}</p>
              <p className="text-sm text-gray-600">{flight.depTime || 'Time TBD'}</p>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent w-16"></div>
                  <ArrowRight className="h-5 w-5 text-blue-400 mx-2" />
                  <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent w-16"></div>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-500">{formatDuration(flight.duration)}</p>
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500 mb-1">Arrival</p>
              <p className="text-2xl font-bold text-gray-900">{flight.arrival?.airport}</p>
              {flight.arrival?.airportName && (
                <p className="text-xs text-gray-500 mb-1">{flight.arrival.airportName}</p>
              )}
              <p className="text-sm text-gray-600">{flight.arrTime || 'Time TBD'}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 lg:mt-0 lg:ml-8 text-center lg:text-right">
          {flight.price && (
            <p className="text-3xl font-bold text-gradient mb-2">${flight.price}</p>
          )}
          <button className="btn-primary group-hover:scale-105 transition-transform duration-200">
            <div className="flex items-center space-x-2">
              <span>View Details</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTimeRangeSection = (
    title: string,
    startTime: string,
    endTime: string,
    onStartChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onEndChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    isReturn = false
  ) => (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {title}
      </label>
      <div className={`bg-gradient-to-r ${isReturn ? 'from-sky-50 to-blue-50' : 'from-blue-50 to-sky-50'} rounded-xl p-6 border border-blue-200/50`}>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Start Time */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-gray-600 mb-2">From</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
              <input
                type="time"
                required
                value={startTime}
                onChange={onStartChange}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-200 text-center font-medium"
              />
            </div>
          </div>

          {/* Arrow Separator */}
          <div className="flex items-center justify-center px-2">
            <div className="flex items-center space-x-2">
              <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent w-8"></div>
              <ArrowRight className="h-5 w-5 text-blue-500" />
              <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent w-8"></div>
            </div>
          </div>

          {/* End Time */}
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-gray-600 mb-2">To</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
              <input
                type="time"
                required
                value={endTime}
                onChange={onEndChange}
                className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-200 text-center font-medium"
              />
            </div>
          </div>
        </div>

        {/* Time Range Display */}
        {startTime && endTime && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200/50">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">
                {getTimeRangeDuration(startTime, endTime)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderFlightSection = (
    title: string,
    flightList: Flight[],
    isReturn = false,
    sectionClass = ""
  ) => (
    <div className={`space-y-6 ${sectionClass}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {title} ({flightList.length} found)
        </h2>
        <button className="btn-secondary">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>
      
      <div className="space-y-4">
        {flightList.map((flight, index) => renderFlightCard(flight, index, isReturn))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gradient mb-4">Find Your Perfect Flight</h1>
        <p className="text-xl text-gray-600">Discover amazing destinations with our premium flight search</p>
      </div>

      {/* Search Form */}
      <div className="card-modern p-8 mb-12">
        <form onSubmit={handleSearch} className="space-y-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-6 py-4 rounded-xl backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Trip Type Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-blue-50/80 backdrop-blur-sm p-1 rounded-xl border border-blue-200/50">
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => setTripType('oneWay')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    tripType === 'oneWay'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-blue-600 hover:bg-blue-100/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4" />
                    <span>One Way</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTripType('roundTrip')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    tripType === 'roundTrip'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-blue-600 hover:bg-blue-100/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>Round Trip</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* From Airport */}
            <div className="space-y-2">
              <label htmlFor="from" className="block text-sm font-medium text-gray-700">
                From (IATA Code)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="from"
                  name="from"
                  required
                  value={searchParams.from}
                  onChange={handleInputChange}
                  placeholder="e.g., JFK"
                  className="input-modern pl-10 uppercase"
                  maxLength={3}
                />
              </div>
            </div>

            {/* To Airport */}
            <div className="space-y-2">
              <label htmlFor="to" className="block text-sm font-medium text-gray-700">
                To (IATA Code)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="to"
                  name="to"
                  required
                  value={searchParams.to}
                  onChange={handleInputChange}
                  placeholder="e.g., LAX"
                  className="input-modern pl-10 uppercase"
                  maxLength={3}
                />
              </div>
            </div>

            {/* Departure Date */}
            <div className="space-y-2">
              <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700">
                Departure Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  id="departureDate"
                  required
                  value={departureDate}
                  onChange={handleDepartureDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-modern pl-10"
                />
              </div>
            </div>

            {/* Return Date - Only show for round trip */}
            {tripType === 'roundTrip' && (
              <div className="space-y-2">
                <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700">
                  Return Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    id="returnDate"
                    required
                    value={returnDate}
                    onChange={handleReturnDateChange}
                    min={departureDate || new Date().toISOString().split('T')[0]}
                    className="input-modern pl-10"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Departure Time Range */}
          {renderTimeRangeSection(
            'Departure Time Range',
            departureTimeStart,
            departureTimeEnd,
            handleDepartureTimeStartChange,
            handleDepartureTimeEndChange
          )}

          {/* Return Time Range - Only show for round trip */}
          {tripType === 'roundTrip' && renderTimeRangeSection(
            'Return Time Range',
            returnTimeStart,
            returnTimeEnd,
            handleReturnTimeStartChange,
            handleReturnTimeEndChange,
            true
          )}

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary group"
            >
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>{loading ? 'Searching...' : `Search ${tripType === 'roundTrip' ? 'Round Trip' : 'One Way'} Flights`}</span>
                {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />}
              </div>
            </button>
          </div>
        </form>
      </div>

      {/* Flight Results */}
      {(flights.length > 0 || returnFlights.length > 0) && (
        <div className="space-y-8">
          {/* Round Trip Split Layout */}
          {tripType === 'roundTrip' && flights.length > 0 && returnFlights.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Left Side - Departure Flights */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                        <ArrowRight className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Departure Flights</h2>
                        <p className="text-sm text-gray-600">{searchParams.from} → {searchParams.to}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Found</p>
                      <p className="text-2xl font-bold text-blue-600">{flights.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                  {flights.map((flight, index) => renderFlightCard(flight, index, false))}
                </div>
              </div>

              {/* Right Side - Return Flights */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 border border-blue-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-r from-sky-500 to-blue-500 p-2 rounded-lg">
                        <ArrowRight className="h-5 w-5 text-white rotate-180" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Return Flights</h2>
                        <p className="text-sm text-gray-600">{searchParams.to} → {searchParams.from}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Found</p>
                      <p className="text-2xl font-bold text-sky-600">{returnFlights.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                  {returnFlights.map((flight, index) => renderFlightCard(flight, index, true))}
                </div>
              </div>
            </div>
          ) : (
            /* Single Column Layout for One Way or Partial Results */
            <>
              {/* Outbound Flights */}
              {flights.length > 0 && renderFlightSection('Outbound Flights', flights, false)}

              {/* Return Flights (if only return flights exist) */}
              {returnFlights.length > 0 && tripType === 'roundTrip' && flights.length === 0 && 
                renderFlightSection('Return Flights', returnFlights, true)}
            </>
          )}
        </div>
      )}

      {flights.length === 0 && returnFlights.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full blur-2xl opacity-20"></div>
            <Plane className="relative h-24 w-24 text-gray-300 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Ready to explore the world?</h3>
          <p className="text-gray-500">Search for flights to see amazing destinations and deals</p>
        </div>
      )}
    </div>
  );
};

export default FlightSearch;
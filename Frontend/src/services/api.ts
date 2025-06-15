import { User, Flight, Booking, FlightSearchParams, BookingRequest, AuthResponse, FlightSearchResponse, FlightDetailsResponse } from '../types';

const BASE_URL = 'https://airplane-booking-system.onrender.com';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    console.log('🔑 API token updated:', !!token);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      console.log(`🌐 Making API request to: ${endpoint}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`📡 API response status: ${response.status} for ${endpoint}`);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        console.error(`❌ API error for ${endpoint}:`, errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ API request successful for ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Unable to connect to server at ${BASE_URL}. Please check your internet connection or try again later.`);
      }
      
      throw error;
    }
  }

  // Helper function to transform search flight data to frontend format
  private transformSearchFlightData(serverFlight: any): Flight {
    return {
      id: serverFlight.flightNumber?.replace(/\s+/g, '') || Math.random().toString(36).substr(2, 9),
      flightNumber: serverFlight.flightNumber,
      airline: serverFlight.airline,
      status: serverFlight.status || 'Unknown',
      departure: serverFlight.departure,
      arrival: serverFlight.arrival,
      aircraft: serverFlight.aircraft,
      duration: serverFlight.duration || 'N/A',
      depTime: 'Time TBD',
      arrTime: 'Time TBD',
      price: serverFlight.price || undefined,
    };
  }

  // Helper function to transform flight details data to frontend format
  private transformFlightDetailsData(serverFlight: any): Flight {
    return {
      id: serverFlight.flightNumber?.replace(/\s+/g, '') || Math.random().toString(36).substr(2, 9),
      flightNumber: serverFlight.flightNumber,
      airline: serverFlight.airline,
      status: serverFlight.status,
      from: serverFlight.from,
      to: serverFlight.to,
      aircraft: serverFlight.aircraft,
      distance: serverFlight.distance,
      duration: serverFlight.duration,
      depTime: serverFlight.from?.time,
      arrTime: serverFlight.to?.time,
      price: serverFlight.price || undefined,
    };
  }

  // Auth endpoints
  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    console.log('🔐 Attempting login for:', data.email);
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: { email: string; password: string; name: string; number?: string }): Promise<AuthResponse> {
    console.log('📝 Attempting registration for:', data.email);
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async googleAuth() {
    console.log('🔗 Initiating Google OAuth flow...');
    
    // Get the current frontend URL dynamically
    const currentOrigin = window.location.origin;
    const callbackUrl = `${currentOrigin}/auth/google/callback`;
    
    // Create the Google auth URL with proper callback
    const googleAuthUrl = `${BASE_URL}/auth/google?callback_url=${encodeURIComponent(callbackUrl)}`;
    
    console.log('🌐 Frontend origin:', currentOrigin);
    console.log('🔄 Callback URL:', callbackUrl);
    console.log('🚀 Redirecting to Google auth:', googleAuthUrl);
    
    // Redirect to Google OAuth
    window.location.href = googleAuthUrl;
  }

  // User endpoints
  async getUser(): Promise<User> {
    console.log('👤 Fetching user profile...');
    return this.request('/user/get');
  }

  async updateUser(data: Partial<User>): Promise<User> {
    console.log('📝 Updating user profile...');
    return this.request('/user/update', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(): Promise<void> {
    console.log('🗑️ Deleting user account...');
    return this.request('/user/delete', {
      method: 'DELETE',
    });
  }

  // Flight endpoints
  async searchFlights(params: FlightSearchParams): Promise<Flight[]> {
    const queryString = `from=${params.from}&to=${params.to}&fromLocal=${params.fromLocal}&toLocal=${params.toLocal}`;
    
    console.log('✈️ Searching flights with params:', params);
    
    try {
      const response: FlightSearchResponse = await this.request(`/api/flights/search?${queryString}`);
      
      if (response && response.filteredFlights && Array.isArray(response.filteredFlights)) {
        const transformedFlights = response.filteredFlights.map(flight => this.transformSearchFlightData(flight));
        console.log(`✅ Found ${transformedFlights.length} flights`);
        return transformedFlights;
      } else {
        console.warn('⚠️ Unexpected flight search response format:', response);
        return [];
      }
    } catch (error) {
      console.error('❌ Flight search error:', error);
      throw error;
    }
  }

  async getFlightDetails(id: string, date: string): Promise<Flight> {
    const cleanId = id.replace(/\s+/g, '');
    const url = `/api/flights/searchone?id=${cleanId}&date=${date}`;
    
    console.log('✈️ Fetching flight details for:', { id: cleanId, date });
    
    try {
      const response: FlightDetailsResponse = await this.request(url);
      
      if (response && response.flights && Array.isArray(response.flights) && response.flights.length > 0) {
        const flightData = this.transformFlightDetailsData(response.flights[0]);
        console.log('✅ Flight details retrieved successfully');
        return flightData;
      } else {
        throw new Error('Flight not found');
      }
    } catch (error) {
      console.error('❌ Flight details error:', error);
      throw error;
    }
  }

  // Booking endpoints
  async createBooking(data: BookingRequest): Promise<Booking> {
    console.log('📅 Creating booking for flight:', data.flightNumber);
    return this.request('/booking', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookings(): Promise<Booking[]> {
    console.log('📋 Fetching user bookings...');
    return this.request('/booking');
  }

  async getBookingDetails(id: string): Promise<Booking> {
    console.log('📋 Fetching booking details for:', id);
    return this.request(`/booking/${id}`);
  }

  async updateBooking(id: string, data: { tier: string }): Promise<Booking> {
    console.log('📝 Updating booking:', id);
    return this.request(`/booking/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBooking(id: string): Promise<void> {
    console.log('🗑️ Cancelling booking:', id);
    return this.request(`/booking/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
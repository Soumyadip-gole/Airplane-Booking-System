import { User, Flight, Booking, FlightSearchParams, BookingRequest, AuthResponse, FlightSearchResponse, FlightDetailsResponse } from '../types';

const BASE_URL = 'https://airplane-booking-system.onrender.com';

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
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
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Unable to connect to server. Please check your internet connection.`);
      }
      throw error;
    }
  }

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
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: { email: string; password: string; name: string; number?: string }): Promise<AuthResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async googleAuth() {
    window.location.href = `${BASE_URL}/auth/google`;
  }

  // User endpoints
  async getUser(): Promise<User> {
    return this.request('/user/get');
  }

  async updateUser(data: Partial<User>): Promise<User> {
    return this.request('/user/update', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(): Promise<void> {
    return this.request('/user/delete', {
      method: 'DELETE',
    });
  }

  // Flight endpoints
  async searchFlights(params: FlightSearchParams): Promise<Flight[]> {
    const queryString = `from=${params.from}&to=${params.to}&fromLocal=${params.fromLocal}&toLocal=${params.toLocal}`;
    
    try {
      const response: FlightSearchResponse = await this.request(`/api/flights/search?${queryString}`);
      
      if (response && response.filteredFlights && Array.isArray(response.filteredFlights)) {
        return response.filteredFlights.map(flight => this.transformSearchFlightData(flight));
      } else {
        return [];
      }
    } catch (error) {
      throw error;
    }
  }

  async getFlightDetails(id: string, date: string): Promise<Flight> {
    const cleanId = id.replace(/\s+/g, '');
    const url = `/api/flights/searchone?id=${cleanId}&date=${date}`;
    
    try {
      const response: FlightDetailsResponse = await this.request(url);
      
      if (response && response.flights && Array.isArray(response.flights) && response.flights.length > 0) {
        return this.transformFlightDetailsData(response.flights[0]);
      } else {
        throw new Error('Flight not found');
      }
    } catch (error) {
      throw error;
    }
  }

  // Booking endpoints
  async createBooking(data: BookingRequest): Promise<Booking> {
    return this.request('/booking', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookings(): Promise<Booking[]> {
    return this.request('/booking');
  }

  async getBookingDetails(id: string): Promise<Booking> {
    return this.request(`/booking/${id}`);
  }

  async updateBooking(id: string, data: { tier: string }): Promise<Booking> {
    return this.request(`/booking/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBooking(id: string): Promise<void> {
    return this.request(`/booking/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export interface User {
  id: string;
  email: string;
  name: string;
  number?: string;
}

// Updated Flight interface to handle both search and details responses
export interface Flight {
  id?: string; // We'll generate this from flightNumber
  flightNumber: string;
  airline: {
    name: string;
    code: string;
  } | string; // Can be object (search) or string (details)
  status: string;
  departure?: {
    airport: string;
  };
  arrival?: {
    airport: string;
    airportName?: string;
  };
  aircraft: {
    model: string;
    registration: string;
  } | string; // Can be object (search) or string (details)
  duration: string;
  // For flight details response
  from?: {
    airport: string;
    city: string;
    time: string;
    terminal: string;
  };
  to?: {
    airport: string;
    city: string;
    time: string;
    terminal: string;
  };
  distance?: string;
  // Legacy compatibility fields
  depTime?: string;
  arrTime?: string;
  price?: number;
}

// Server response wrapper for flight details
export interface FlightDetailsResponse {
  flights: Flight[];
}

// Server response wrapper for flight search
export interface FlightSearchResponse {
  filteredFlights: {
    flightNumber: string;
    airline: {
      name: string;
      code: string;
    };
    departure: {
      airport: string;
    };
    arrival: {
      airport: string;
      airportName?: string;
    };
    aircraft: {
      model: string;
      registration: string;
    };
    status: string;
    duration: string;
  }[];
}

export interface Booking {
  id: string;
  flightNumber: string;
  airline: string;
  flightDate: string;
  depIata: string;
  arrIata: string;
  depTime: string;
  arrTime: string;
  tier: string;
  createdAt?: string;
  status?: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  id?: number | string;
  number?: string;
}

export interface FlightSearchParams {
  from: string;
  fromLocal: string;
  to: string;
  toLocal: string;
}

export interface BookingRequest {
  flightNumber: string;
  airline: string;
  flightDate: string;
  depIata: string;
  arrIata: string;
  depTime: string;
  arrTime: string;
  tier: string;
}
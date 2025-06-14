export interface User {
  id: string;
  email: string;
  name: string;
  number?: string;
}

export interface Flight {
  id?: string;
  flightNumber: string;
  airline: {
    name: string;
    code: string;
  } | string;
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
  } | string;
  duration: string;
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
  depTime?: string;
  arrTime?: string;
  price?: number;
}

export interface FlightDetailsResponse {
  flights: Flight[];
}

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
  updatedAt?: string;
  bookingDate?: string;
  status?: string;
  userId?: number;
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
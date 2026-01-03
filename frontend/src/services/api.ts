import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tripAPI = {
  createTrip: (tripData: any) => api.post('/trips/', tripData),
  getTrips: () => api.get('/trips/'),
  generatePacking: (tripId: number) => api.post(/trips/${tripId}/generate-packing/),
  getMapLocations: () => api.get('/map/locations/'),
  saveItinerary: (tripId: number, itinerary: any) => api.post(/trips/${tripId}/itinerary/, itinerary),
};

export default api;
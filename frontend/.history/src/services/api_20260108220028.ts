// FRONTEND/src/services/api.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const response = await axios.post(`${BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('token', access);
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiClient.post('/token/', { email, password }),
  
  register: (userData: any) =>
    apiClient.post('/register/', userData),
  
  // User trips
  getTrips: () => apiClient.get('/trips/'),
  
  createTrip: (tripData: any) =>
    apiClient.post('/trips/', tripData),
  
  getTrip: (id: number) =>
    apiClient.get(`/trips/${id}/`),
  
  updateTrip: (id: number, tripData: any) =>
    apiClient.put(`/trips/${id}/`, tripData),
  
  deleteTrip: (id: number) =>
    apiClient.delete(`/trips/${id}/`),
  
  // Real-time data endpoints
  getFreeLocations: (tripId: number) =>
    apiClient.get(`/trips/${tripId}/locations/`),
  
  getFreeWeather: (tripId: number) =>
    apiClient.get(`/trips/${tripId}/weather/`),
  
  getLocalEvents: (tripId: number) =>
    apiClient.get(`/trips/${tripId}/events/`),
  
  // New: Get recommendations
  getRecommendations: (tripId: number) =>
    apiClient.get(`/trips/${tripId}/recommendations/`),
  
  // New: Generate smart itinerary
  generateSmartItinerary: (tripId: number) =>
    apiClient.post(`/trips/${tripId}/generate-itinerary/`),
  
  // New: Get safety info
  getSafetyInfo: (tripId: number) =>
    apiClient.get(`/trips/${tripId}/safety/`),
  
  // User profile
  getUserProfile: () => apiClient.get('/profile/'),
  
  updateUserProfile: (profileData: any) =>
    apiClient.put('/profile/', profileData),
};
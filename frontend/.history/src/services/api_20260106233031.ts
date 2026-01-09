// Define ImportMeta for TypeScript
interface ImportMeta {
  env: {
    VITE_API_URL?: string;
  };
}

// IMPORTANT: Make sure this matches your backend URL
const API_URL = 'http://localhost:8000/api'; // ✅ INCLUDES /api

// ========== TOKEN MANAGEMENT ==========
const TOKEN_REFRESH_ENDPOINT = `${API_URL}/token/refresh/`;

// Check if token is expired (JWT token)
const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    
    return Date.now() >= expiry;
  } catch {
    return true;
  }
};

// Refresh token function
const refreshToken = async (): Promise<string | null> => {
  try {
    console.log('🔄 Attempting token refresh...');
    
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.error('❌ No refresh token available');
      localStorage.removeItem('token');
      return null;
    }
    
    const response = await fetch(TOKEN_REFRESH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.access);
      
      // Update refresh token if provided
      if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh);
      }
      
      console.log('✅ Token refreshed successfully');
      return data.access;
    } else {
      console.error('❌ Token refresh failed:', response.status);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null;
    }
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

// Auth fetch wrapper with retry on 401
const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Get current token
  let token = localStorage.getItem('token');
  
  // Check if token needs refresh
  if (token && isTokenExpired(token)) {
    console.log('⚠️ Token expired, attempting refresh...');
    const newToken = await refreshToken();
    if (newToken) {
      token = newToken;
    }
  }
  
  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  // Make request
  let response = await fetch(url, {
    ...options,
    headers,
  });
  
  // If token is invalid/expired (401), try to refresh once
  if (response.status === 401) {
    console.log('🔄 401 received, refreshing token...');
    
    const newToken = await refreshToken();
    if (newToken) {
      // Retry the request with new token
      (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...options,
        headers,
      });
    } else {
      // Refresh failed - force logout
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userEmail');
      
      console.error('❌ Session expired. Please login again.');
      throw new Error('Session expired. Please login again.');
    }
  }
  
  return response;
};

export const api = {
  // ========== AUTH ENDPOINTS ==========
  async login(email: string, password: string) {
    console.log('🔐 Login attempt for:', email);
    
    const response = await fetch(`${API_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: email,  // ✅ JWT expects 'username' field
        password: password 
      }),
    });
    
    const data = await response.json();
    
    // ✅ CRITICAL: Save tokens to localStorage
    if (data.access) {
      localStorage.setItem('token', data.access);
      if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh);
      }
      localStorage.setItem('userEmail', email);
      console.log('✅ Token saved to localStorage');
      return data;
    } else if (data.token) {
      // Alternative: if backend returns just 'token' key
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', email);
      console.log('✅ Token saved to localStorage');
      return data;
    } else {
      console.error('❌ No token in response:', data);
      throw new Error('No authentication token received');
    }
  },

  async signup(email: string, password: string) {
    console.log('📝 Signup attempt for:', email);
    
    const response = await fetch(`${API_URL}/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: email,
        username: email,
        password: password 
      }),
    });
    
    const data = await response.json();
    
    // Auto-login after successful registration
    if (response.ok) {
      try {
        await this.login(email, password);
      } catch (loginError) {
        console.log('⚠️ Auto-login failed, user needs to login manually');
      }
    }
    
    return data;
  },

  // ========== TRIP ENDPOINTS (using authFetch) ==========
  async createTrip(tripData: any) {
    console.log('🚀 === CREATE TRIP DEBUG START ===');
    console.log('1. API_URL:', API_URL);
    console.log('2. Full endpoint URL:', `${API_URL}/trips/`);
    console.log('3. Token exists:', !!localStorage.getItem('token'));
    console.log('4. Trip data being sent:', tripData);
    console.log('🚀 === DEBUG END ===');
    
    const response = await authFetch(`${API_URL}/trips/`, {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
    
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Request failed:', response.status, errorText);
      throw new Error(`Failed to create trip: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Trip created successfully:', data);
    return data;
  },

  async getTrips() {
    console.log('📋 Fetching trips from:', `${API_URL}/trips/`);
    
    const response = await authFetch(`${API_URL}/trips/`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get trips:', errorText);
      throw new Error(`Failed to get trips: ${response.statusText}`);
    }
    
    return response.json();
  },

  async getTrip(id: number) {
    console.log('🔍 Fetching trip ID:', id, 'from:', `${API_URL}/trips/${id}/`);
    
    const response = await authFetch(`${API_URL}/trips/${id}/`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get trip:', errorText);
      throw new Error(`Failed to get trip: ${response.statusText}`);
    }
    
    return response.json();
  },

  // ========== FREE API ENDPOINTS (using authFetch) ==========
  async getFreeLocations(tripId: number) {
    console.log(`📍 Fetching free locations for trip ${tripId}`);
    const response = await authFetch(`${API_URL}/trips/${tripId}/locations/`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch locations: ${error}`);
    }
    
    return response.json();
  },

  async getFreeWeather(tripId: number) {
    console.log(`🌤️ Fetching free weather for trip ${tripId}`);
    const response = await authFetch(`${API_URL}/trips/${tripId}/weather/`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch weather: ${error}`);
    }
    
    return response.json();
  },

  async getPlaceDetails(placeName: string, location: string) {
    console.log(`🔍 Getting free details for: ${placeName}`);
    const response = await authFetch(
      `${API_URL}/places/details/?place=${encodeURIComponent(placeName)}&location=${encodeURIComponent(location)}`
    );
    
    return response.json();
  },

  async getTransportInfo(tripId: number) {
    console.log(`🚗 Fetching transport info for trip ${tripId}`);
    const response = await authFetch(`${API_URL}/trips/${tripId}/transport/`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch transport info: ${error}`);
    }
    
    return response.json();
  },

  async getLocalEvents(tripId: number) {
    console.log(`🎭 Fetching local events for trip ${tripId}`);
    const response = await authFetch(`${API_URL}/trips/${tripId}/events/`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch events: ${error}`);
    }
    
    return response.json();
  },

  async generateSmartItinerary(tripId: number) {
    console.log(`📅 Generating smart itinerary for trip ${tripId}`);
    const response = await authFetch(`${API_URL}/trips/${tripId}/generate-itinerary/`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to generate itinerary: ${error}`);
    }
    
    return response.json();
  },

  // ========== UTILITY FUNCTIONS ==========
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    console.log('👋 User logged out');
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const hasToken = !!token;
    
    // Check if token is expired
    if (token && isTokenExpired(token)) {
      console.log('⚠️ Token exists but is expired');
      return false;
    }
    
    console.log('🔐 Auth check:', hasToken ? 'User is authenticated' : 'No valid token found');
    return hasToken && !isTokenExpired(token);
  },

  getCurrentUser(): string | null {
    return localStorage.getItem('userEmail');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Force refresh token (useful for manual refresh)
  async forceTokenRefresh(): Promise<boolean> {
    const newToken = await refreshToken();
    return !!newToken;
  },

  // Debug function to test free APIs
  async testFreeApis(destination: string = 'Paris') {
    console.log(`🧪 Testing free APIs for: ${destination}`);
    const response = await fetch(`${API_URL}/debug/free-apis/?destination=${encodeURIComponent(destination)}`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to test APIs: ${error}`);
    }
    
    return response.json();
  },

  // Check auth status on app startup
  checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token && isTokenExpired(token)) {
      console.log('🔄 App start: Token expired, refreshing...');
      refreshToken().catch(() => {
        console.log('❌ Auto-refresh failed');
      });
    }
  },
};

// Check auth status when this module loads
api.checkAuthStatus();

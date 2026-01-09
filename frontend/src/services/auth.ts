// frontend/src/services/auth.ts

const API_URL = 'http://localhost:8000/api'; // Make sure this matches your backend

export const auth = {
  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    window.location.href = '/';
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },
  
  getCurrentUser(): string | null {
    return localStorage.getItem('userEmail');
  },

  getCurrentUserId(): string | null {
    return localStorage.getItem('userId');
  },

  async refreshToken(): Promise<string | null> {
    try {
      console.log('🔄 Attempting token refresh...');
      
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        console.error('❌ No refresh token available');
        this.logout();
        return null;
      }
      
      const response = await fetch(`${API_URL}/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
        
        // If a new refresh token is provided, update it
        if (data.refresh) {
          localStorage.setItem('refreshToken', data.refresh);
        }
        
        console.log('✅ Token refreshed successfully');
        return data.access;
      } else {
        console.error('❌ Token refresh failed:', response.status);
        this.logout();
        return null;
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      this.logout();
      return null;
    }
  },

  async login(credentials: { email: string; password: string }) {
    try {
      console.log('🔐 Attempting login...');
      
      const response = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.email,
          password: credentials.password,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store tokens based on your backend response structure
      if (data.access) {
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh || data.access);
        localStorage.setItem('userEmail', credentials.email);
        localStorage.setItem('userId', data.user_id || data.id || '');
        
        console.log('✅ Login successful');
        return { success: true, data };
      } else if (data.token) {
        // Alternative: if backend returns just 'token' key
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('userEmail', credentials.email);
        localStorage.setItem('userId', data.user_id || data.id || '');
        
        console.log('✅ Login successful');
        return { success: true, data };
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  async register(userData: { email: string; password: string; username?: string }) {
    try {
      console.log('📝 Attempting registration...');
      
      const response = await fetch(`${API_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          username: userData.username || userData.email,
          password: userData.password,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || JSON.stringify(errorData));
      }
      
      const data = await response.json();
      
      // Auto-login after registration if tokens are returned
      if (data.access || data.token) {
        await this.login({ email: userData.email, password: userData.password });
      }
      
      console.log('✅ Registration successful');
      return { success: true, data };
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  },

  // Check if token is expired (simplified check)
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    
    try {
      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      // Decode the payload (second part)
      const payload = JSON.parse(atob(parts[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      
      return Date.now() >= expiry;
    } catch {
      return true;
    }
  },
};

// Helper function to get auth headers with automatic token refresh
export async function getAuthHeaders(): Promise<HeadersInit> {
  // Check if token is expired
  if (auth.isTokenExpired()) {
    console.log('⚠️ Token expired, attempting refresh...');
    const newToken = await auth.refreshToken();
    if (!newToken) {
      throw new Error('Authentication failed. Please login again.');
    }
  }
  
  const token = auth.getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
}

// Authenticated fetch wrapper with auto-retry on 401
export async function authFetch(url: string, options: RequestInit = {}) {
  let headers = await getAuthHeaders();
  
  let response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    } as HeadersInit,
  });
  
  // If token is invalid/expired, try to refresh once
  if (response.status === 401) {
    console.log('🔄 401 received, refreshing token...');
    
    const newToken = await auth.refreshToken();
    if (newToken) {
      // Retry the request with new token
      response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newToken}`,
          ...options.headers,
        } as HeadersInit,
      });
    } else {
      // Refresh failed, redirect to login
      auth.logout();
      throw new Error('Session expired. Please login again.');
    }
  }
  
  return response;
}

// Check auth status on app startup
export function checkAuthStatus() {
  if (auth.isLoggedIn() && auth.isTokenExpired()) {
    console.log('🔄 App start: Token expired, refreshing...');
    auth.refreshToken().catch(() => {
      console.log('❌ Auto-refresh failed, logging out...');
      auth.logout();
    });
  }
}

// Call this when your app starts
checkAuthStatus();
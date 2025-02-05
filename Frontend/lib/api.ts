import { API_URL } from '@/config'
import { mockGetProducts, mockGetProduct, mockEstimateFurniture, mockEstimateRepair } from "./mockApi"
import { useAuth } from '@/store/auth'

// Helper function to get cookie value
function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
}

const getAuthHeaders = () => {
  const token = getCookie('token')
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getProducts(category?: string) {
  if (process.env.NODE_ENV === "development") {
    return mockGetProducts(category) as Promise<any[]>
  }

  try {
    const response = await fetch(`${API_URL}/products${category ? `?category=${category}` : ""}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("There was a problem fetching the products:", error)
    return [] // Return an empty array instead of throwing
  }
}

export async function getProduct(id: string) {
  if (process.env.NODE_ENV === "development") {
    return mockGetProduct(id) as Promise<any>
  }

  const response = await fetch(`${API_URL}/products/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch product")
  }
  return response.json()
}

export async function login(email: string, password: string) {
  try {
    console.log('Starting login request with email:', email);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      console.error('Login error response:', errorData);
      throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await response.json();
    console.log('Raw login response:', JSON.stringify(data, null, 2));
    
    if (!data.access_token || !data.user) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from server');
    }
    
    // Create user data object
    const userData = {
      id: data.user._id || data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role || 'user',
      isAdmin: data.user.role === 'admin'
    };
    
    console.log('Setting user data:', userData);
    
    // Update auth store
    const auth = useAuth.getState();
    auth.setToken(data.access_token);
    auth.setUser(userData);
    
    // Verify cookie was set by the server
    const token = document.cookie.split(';').find(c => c.trim().startsWith('token='));
    if (!token) {
      console.error('Token cookie not found after login');
      throw new Error('Authentication failed - no token cookie');
    }
    
    console.log('Login successful, token cookie present');
    
    return {
      access_token: data.access_token,
      user: userData
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function register(name: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      name, 
      email, 
      password,
      role: email === 'admin@cornwallis.com' ? 'admin' : 'user',
      isAdmin: email === 'admin@cornwallis.com'
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(error.message || "Failed to register");
  }

  const data = await response.json();
  
  // Store token in cookie
  document.cookie = `token=${data.access_token}; path=/; max-age=86400; secure; samesite=lax`;
  
  // Update auth store
  const auth = useAuth.getState();
  auth.setUser(data.user);
  auth.setToken(data.access_token);
  
  return data;
}

export async function createEstimate(image: File, details: { requirements: string }) {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('requirements', details.requirements);

  const token = getCookie('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/estimate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create estimate' }));
    throw new Error(error.message || 'Failed to create estimate');
  }

  return response.json();
}

export const adminApi = {
  getFurniture: async () => {
    const response = await fetch(`${API_URL}/admin/furniture`, {
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch furniture');
    return response.json();
  },

  createFurniture: async (formData: FormData) => {
    const token = getCookie('token');
    const response = await fetch(`${API_URL}/admin/furniture`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create furniture' }));
      throw new Error(error.message || 'Failed to create furniture');
    }
    return response.json();
  },

  updateFurniture: async (id: string, data: FormData | object) => {
    const response = await fetch(`${API_URL}/admin/furniture/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        ...getAuthHeaders(),
        ...(!(data instanceof FormData) && { 'Content-Type': 'application/json' }),
      },
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update furniture');
    return response.json();
  },

  deleteFurniture: async (id: string) => {
    const response = await fetch(`${API_URL}/admin/furniture/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete furniture');
    return response.json();
  },

  getEstimates: async () => {
    const response = await fetch(`${API_URL}/admin/estimates`, {
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch estimates');
    return response.json();
  },

  getOrders: async (userId?: string) => {
    const url = userId
      ? `${API_URL}/admin/orders?userId=${userId}`
      : `${API_URL}/admin/orders`;
    const response = await fetch(url, {
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  updateEstimate: async (estimateId: string, status: string) => {
    const response = await fetch(`${API_URL}/admin/estimates/${estimateId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update estimate');
    return response.json();
  },

  updateOrder: async (orderId: string, status: string) => {
    const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update order');
    return response.json();
  },
};
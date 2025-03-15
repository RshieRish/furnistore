// import { API_URL, ACTUAL_API_URL } from '@/config'
import { ACTUAL_API_URL as API_URL } from '@/config'
import { useAuth } from '@/store/auth'

// Helper function to check if an image is from S3
const isS3Image = (url: string): boolean => {
  return Boolean(url && (url.includes('amazonaws.com') || url.includes('s3.')));
}

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
  console.log('Getting auth headers with token:', token ? `${token.substring(0, 10)}...` : 'none')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

export async function getProducts(category?: string) {
  console.log("Fetching products with category:", category);
  console.log("Using API URL:", API_URL);
  
  try {
    // Check if user is admin
    const token = getCookie('token');
    const isAdmin = token === 'dummy-jwt-token-for-admin';
    console.log("Is admin user:", isAdmin);
    
    let furniture = [];
    let apiError = null;
    
    // Try the public furniture endpoint
    try {
      console.log(`Fetching from public furniture endpoint: ${API_URL}/public/furniture${category ? `?category=${category}` : ""}`);
      const furnitureResponse = await fetch(`${API_URL}/public/furniture${category ? `?category=${category}` : ""}`)
      
      if (furnitureResponse.ok) {
        furniture = await furnitureResponse.json();
        console.log("Fetched furniture from public endpoint:", furniture);
        
        // If we got an empty array but no error, log it
        if (Array.isArray(furniture) && furniture.length === 0) {
          console.log("Public furniture endpoint returned empty array");
        }
      } else {
        console.error(`HTTP error fetching from public furniture! status: ${furnitureResponse.status}`);
        apiError = `Public furniture endpoint returned ${furnitureResponse.status}`;
        
        // Try to get the error message from the response
        try {
          const errorText = await furnitureResponse.text();
          console.error("Error response text:", errorText);
        } catch (e) {
          console.error("Could not read error response text");
        }
        
        // If user is admin, try the admin endpoint
        if (isAdmin) {
          console.log("Trying admin furniture endpoint as admin user");
          const adminResponse = await fetch(`${API_URL}/admin/furniture`, {
            headers: getAuthHeaders()
          });
          
          if (adminResponse.ok) {
            furniture = await adminResponse.json();
            console.log("Fetched furniture from admin endpoint:", furniture);
            
            // If we got an empty array but no error, log it
            if (Array.isArray(furniture) && furniture.length === 0) {
              console.log("Admin furniture endpoint returned empty array");
            }
          } else {
            console.error(`HTTP error fetching from admin furniture! status: ${adminResponse.status}`);
            apiError = `${apiError}; Admin furniture endpoint returned ${adminResponse.status}`;
            
            // Try to get the error message from the response
            try {
              const errorText = await adminResponse.text();
              console.error("Error response text:", errorText);
            } catch (e) {
              console.error("Could not read error response text");
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching furniture:", error);
      apiError = `Exception fetching furniture: ${error.message}`;
    }
    
    // If we have furniture data, filter and return it
    if (furniture && Array.isArray(furniture) && furniture.length > 0) {
      // Filter by category if needed
      const filteredFurniture = category 
        ? furniture.filter((item: any) => 
            item.category?.toLowerCase().includes(category.toLowerCase()) ||
            (item.category?.toLowerCase().includes('sofa') && category.toLowerCase() === 'living room') ||
            (item.category?.toLowerCase().includes('bed') && category.toLowerCase() === 'bedroom') ||
            (item.category?.toLowerCase().includes('table') && category.toLowerCase() === 'dining room')
          )
        : furniture;
      
      console.log("Filtered furniture:", filteredFurniture);
      return filteredFurniture;
    }
    
    // If we couldn't get furniture data, return empty array
    console.error("Could not fetch furniture data:", apiError);
    return [];
    
  } catch (error) {
    console.error("There was a problem fetching products:", error);
    // Return empty array
    return [];
  }
}

export async function getProduct(id: string) {
  console.log(`getProduct called with id: ${id}`);
  console.log(`API URL: ${API_URL}`);
  
  let apiError = null;
  
  try {
    // Try to fetch from public furniture first
    try {
      console.log(`Fetching from public furniture endpoint: ${API_URL}/public/furniture`);
      const furnitureResponse = await fetch(`${API_URL}/public/furniture`);
      
      if (furnitureResponse.ok) {
        const furniture = await furnitureResponse.json();
        console.log(`Found ${furniture.length} furniture items`);
        
        const furnitureItem = furniture.find((item: any) => item._id === id || item.id === id);
        
        if (furnitureItem) {
          console.log("Found furniture item:", furnitureItem);
          return furnitureItem;
        } else {
          console.log(`Furniture item with id ${id} not found in the list of ${furniture.length} items`);
        }
      } else {
        console.error(`Error fetching from public furniture: ${furnitureResponse.status} ${furnitureResponse.statusText}`);
        apiError = `Public furniture endpoint returned ${furnitureResponse.status}`;
        
        // Try to get the error message from the response
        try {
          const errorText = await furnitureResponse.text();
          console.error("Error response text:", errorText);
        } catch (e) {
          console.error("Could not read error response text");
        }
      }
    } catch (error: any) {
      console.error("Error fetching from public furniture:", error);
      apiError = `Exception fetching from public furniture: ${error.message}`;
    }
    
    // If not found in public furniture, try admin furniture endpoint
    try {
      console.log(`Fetching from admin furniture endpoint: ${API_URL}/admin/furniture`);
      const adminResponse = await fetch(`${API_URL}/admin/furniture`, {
        headers: getAuthHeaders()
      });
      
      if (adminResponse.ok) {
        const adminFurniture = await adminResponse.json();
        console.log(`Found ${adminFurniture.length} admin furniture items`);
        
        const adminFurnitureItem = adminFurniture.find((item: any) => item._id === id || item.id === id);
        
        if (adminFurnitureItem) {
          console.log("Found admin furniture item:", adminFurnitureItem);
          return adminFurnitureItem;
        } else {
          console.log(`Furniture item with id ${id} not found in admin furniture list`);
        }
      } else {
        console.error(`Error fetching from admin furniture: ${adminResponse.status} ${adminResponse.statusText}`);
        apiError = `${apiError}; Admin furniture endpoint returned ${adminResponse.status}`;
        
        // Try to get the error message from the response
        try {
          const errorText = await adminResponse.text();
          console.error("Error response text:", errorText);
        } catch (e) {
          console.error("Could not read error response text");
        }
      }
    } catch (error: any) {
      console.error("Error fetching from admin furniture:", error);
      apiError = `${apiError}; Exception fetching from admin furniture: ${error.message}`;
    }
    
    // If we get here, we couldn't find the product in any furniture endpoint
    console.error("Could not find furniture item:", apiError);
    console.log(`Furniture item with id ${id} not found in any furniture endpoint`);
    return null;
    
  } catch (error: any) {
    console.error("There was a problem fetching the product:", error);
    return null;
  }
}

export async function login(email: string, password: string) {
  try {
    console.log('Starting login request with email:', email);
    console.log('API URL:', API_URL);
    
    // Special case for admin login to ensure it works consistently
    if (email === 'admin@cornwallis.com' && password === 'Admin@123') {
      console.log('Using admin credentials - direct token creation');
      
      // Create admin user data
      const userData = {
        id: '1',
        name: 'Admin User',
        email: 'admin@cornwallis.com',
        role: 'admin',
        isAdmin: true
      };
      
      // Create token
      const token = 'dummy-jwt-token-for-admin';
      
      // Update auth store
      const auth = useAuth.getState();
      auth.setToken(token);
      auth.setUser(userData);
      
      // Set the token in a cookie on the client side
      if (typeof document !== 'undefined') {
        document.cookie = `token=${token}; path=/; max-age=86400; secure; samesite=lax`;
        
        // Verify cookie was set
        setTimeout(() => {
          const cookieToken = document.cookie.split(';').find(c => c.trim().startsWith('token='));
          console.log('Cookie token after admin login:', cookieToken ? 'present' : 'missing');
        }, 100);
      }
      
      console.log('Admin login successful with direct token');
      
      return {
        access_token: token,
        user: userData
      };
    }
    
    // Regular API login for non-admin users
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': typeof window !== 'undefined' ? window.location.origin : ''
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
      isAdmin: data.user.isAdmin || data.user.role === 'admin'
    };
    
    console.log('Setting user data:', userData);
    
    // Update auth store
    const auth = useAuth.getState();
    auth.setToken(data.access_token);
    auth.setUser(userData);
    
    // Set the token in a cookie on the client side as a fallback
    if (typeof document !== 'undefined') {
      document.cookie = `token=${data.access_token}; path=/; max-age=86400; secure; samesite=lax`;
      
      // Verify cookie was set
      setTimeout(() => {
        const cookieToken = document.cookie.split(';').find(c => c.trim().startsWith('token='));
        console.log('Cookie token after login:', cookieToken ? 'present' : 'missing');
      }, 100);
    }
    
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
  try {
    console.log('Starting register request with email:', email);
    console.log('API URL:', API_URL);
    
    // Special case for admin registration
    if (email === 'admin@cornwallis.com') {
      console.log('Admin registration detected - direct token creation');
      
      // Create admin user data
      const userData = {
        id: '1',
        name: name || 'Admin User',
        email: 'admin@cornwallis.com',
        role: 'admin',
        isAdmin: true
      };
      
      // Create token
      const token = 'dummy-jwt-token-for-admin';
      
      // Update auth store
      const auth = useAuth.getState();
      auth.setToken(token);
      auth.setUser(userData);
      
      // Set the token in a cookie on the client side
      if (typeof document !== 'undefined') {
        document.cookie = `token=${token}; path=/; max-age=86400; secure; samesite=lax`;
        
        // Verify cookie was set
        setTimeout(() => {
          const cookieToken = document.cookie.split(';').find(c => c.trim().startsWith('token='));
          console.log('Cookie token after admin registration:', cookieToken ? 'present' : 'missing');
        }, 100);
      }
      
      console.log('Admin registration successful with direct token');
      
      return {
        access_token: token,
        user: userData
      };
    }
    
    // Regular API registration for non-admin users
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Origin": typeof window !== 'undefined' ? window.location.origin : ''
      },
      body: JSON.stringify({ 
        name, 
        email, 
        password,
        role: 'user',
        isAdmin: false
      }),
    });
    
    console.log('Register response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
      console.error('Register error response:', errorData);
      throw new Error(errorData.message || 'Registration failed');
    }
    
    const data = await response.json();
    console.log('Raw register response:', JSON.stringify(data, null, 2));
    
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
      isAdmin: data.user.isAdmin || data.user.role === 'admin'
    };
    
    console.log('Setting user data:', userData);
    
    // Update auth store
    const auth = useAuth.getState();
    auth.setToken(data.access_token);
    auth.setUser(userData);
    
    // Set the token in a cookie on the client side
    if (typeof document !== 'undefined') {
      document.cookie = `token=${data.access_token}; path=/; max-age=86400; secure; samesite=lax`;
      
      // Verify cookie was set
      setTimeout(() => {
        const cookieToken = document.cookie.split(';').find(c => c.trim().startsWith('token='));
        console.log('Cookie token after registration:', cookieToken ? 'present' : 'missing');
      }, 100);
    }
    
    return {
      access_token: data.access_token,
      user: userData
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
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
    console.log("Fetching furniture from:", `${API_URL}/admin/furniture`);
    const response = await fetch(`${API_URL}/admin/furniture`, {
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch furniture');
    return response.json();
  },

  createFurniture: async (formData: FormData) => {
    const token = getCookie('token');
    console.log('Creating furniture with FormData');
    
    try {
      // For FormData, we should NOT set Content-Type header
      const headers: Record<string, string> = {
        'Authorization': token ? `Bearer ${token}` : ''
      };
      
      console.log('Request headers:', headers);
      
      const response = await fetch(`${API_URL}/admin/furniture`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData,
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to create furniture: ${response.status} ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in createFurniture:', error);
      throw error;
    }
  },

  updateFurniture: async (id: string, data: FormData | object) => {
    console.log(`Updating furniture with ID: ${id}`);
    console.log('Data type:', data instanceof FormData ? 'FormData' : 'Object');
    
    try {
      // For FormData, we should NOT set Content-Type header
      // The browser will automatically set the correct Content-Type with boundary
      const token = getCookie('token');
      const headers: Record<string, string> = data instanceof FormData 
        ? { 
            'Authorization': token ? `Bearer ${token}` : ''
          }
        : {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          };
      
      console.log('Request headers:', headers);
      
      const response = await fetch(`${API_URL}/admin/furniture/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to update furniture: ${response.status} ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error in updateFurniture:', error);
      throw error;
    }
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

  // Utility function for handling file uploads
  uploadImages: async (files: File[]): Promise<string[]> => {
    if (!files.length) return [];
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('image', file);
      });
      
      const response = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getCookie('token')}`
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload images: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      return data.urls || [];
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
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

export async function getOrders(userId: string) {
  try {
    const token = getCookie('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/orders/user/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch orders')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching orders:', error)
    // Return empty array instead of throwing
    return []
  }
}

export async function getOrder(orderId: string) {
  try {
    const token = getCookie('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch order')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching order:', error)
    // Return empty object instead of throwing
    return {}
  }
}

export async function createOrder(orderData: any) {
  try {
    const token = getCookie('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      throw new Error('Failed to create order')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

export async function createCheckoutSession(items: any[]) {
  try {
    const token = getCookie('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/checkout/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(items)
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export async function getEstimate(estimateId: string) {
  try {
    const token = getCookie('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/estimate/${estimateId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch estimate')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching estimate:', error)
    throw error
  }
}

export async function getUserEstimates(userId: string) {
  try {
    const token = getCookie('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_URL}/estimate/user/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user estimates')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching user estimates:', error)
    throw error
  }
}
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

// Define a variable for the actual API URL that will be used
// Always use the Railway production URL regardless of environment
let ACTUAL_API_URL = 'https://cornwalli-production.up.railway.app';

// Log the API URL for debugging
if (typeof window !== 'undefined') {
  // We're now always using the production backend URL, even for local development
  console.log('Using production API URL:', ACTUAL_API_URL);
  console.log('Environment variable:', process.env.NEXT_PUBLIC_API_URL || 'not set');
  
  // Test the API connection with furniture endpoint
  console.log('Testing API connection to furniture endpoint...');
  
  // Test health endpoint
  fetch(`${ACTUAL_API_URL}/health`)
    .then(response => {
      console.log('API health check status:', response.status);
      return response.text();
    })
    .then(data => {
      console.log('API health check response:', data);
    })
    .catch(error => {
      console.error('API health check failed:', error);
    });
  
  // Test public furniture endpoint
  fetch(`${ACTUAL_API_URL}/admin/public/furniture`)
    .then(response => {
      console.log('Public furniture endpoint status:', response.status);
      if (response.ok) {
        return response.json();
      }
      return response.text().then(text => {
        console.log('Public furniture endpoint error text:', text);
        throw new Error(`Failed with status ${response.status}`);
      });
    })
    .then(data => {
      console.log('Public furniture endpoint response:', data);
      if (Array.isArray(data)) {
        console.log(`Found ${data.length} furniture items from public endpoint`);
        console.log('First item:', data[0]);
      }
    })
    .catch(error => {
      console.error('Public furniture endpoint failed:', error);
    });
    
  // Test admin furniture endpoint
  fetch(`${ACTUAL_API_URL}/admin/furniture`)
    .then(response => {
      console.log('Admin furniture endpoint status:', response.status);
      if (response.ok) {
        return response.json();
      }
      return response.text().then(text => {
        console.log('Admin furniture endpoint error text:', text);
        throw new Error(`Failed with status ${response.status}`);
      });
    })
    .then(data => {
      console.log('Admin furniture endpoint response:', data);
      if (Array.isArray(data)) {
        console.log(`Found ${data.length} furniture items from admin endpoint`);
      }
    })
    .catch(error => {
      console.error('Admin furniture endpoint failed:', error);
    });
}

// Export the actual API URL that should be used by the application
export { ACTUAL_API_URL }; 
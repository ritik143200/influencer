// Test script to verify Recent Activity API
const testRecentActivityAPI = async () => {
  try {
    const response = await fetch('http://localhost:5002/api/activity', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', data);
    } else {
      console.log('❌ API Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
};

// Test the API
testRecentActivityAPI();

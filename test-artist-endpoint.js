// Test script to verify artists endpoint

async function testArtistsEndpoint() {
  try {
    console.log('Testing artists endpoint...');
    
    // Test without authentication (public endpoint)
    const response = await fetch('http://localhost:5002/api/artist');
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log(`✅ Found ${data.data.length} artists`);
      data.data.forEach((artist, index) => {
        console.log(`Artist ${index + 1}:`, {
          id: artist._id,
          fullName: artist.fullName,
          email: artist.email,
          categories: artist.categories,
          profileType: artist.profileType
        });
      });
    } else {
      console.log('❌ No artists found or error in response');
    }
    
  } catch (error) {
    console.error('❌ Error testing artists endpoint:', error.message);
  }
}

// Also test with admin auth
async function testArtistsEndpointWithAuth() {
  try {
    console.log('\nTesting artists endpoint with admin auth...');
    
    // Test with admin token (you'll need to replace this with a real token)
    const adminToken = 'YOUR_ADMIN_JWT_TOKEN'; // Replace with actual token
    
    const response = await fetch('http://localhost:5002/api/artist', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('Auth response status:', response.status);
    const data = await response.json();
    console.log('Auth response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing artists endpoint with auth:', error.message);
  }
}

// Run tests
testArtistsEndpoint();
// testArtistsEndpointWithAuth(); // Uncomment and add token to test with auth

console.log('\n📝 To test with authentication:');
console.log('1. Get a real admin JWT token');
console.log('2. Replace YOUR_ADMIN_JWT_TOKEN in the script');
console.log('3. Uncomment testArtistsEndpointWithAuth()');
console.log('4. Run: node test-artist-endpoint.js');

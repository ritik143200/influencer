// Test script to verify influencer inquiries endpoint

async function testInfluencerInquiries() {
  try {
    console.log('🔍 Testing influencer inquiries endpoint...');
    
    // You'll need to replace this with a real influencer JWT token
    const influencerToken = 'YOUR_INFLUENCER_JWT_TOKEN'; // Replace with actual token
    
    if (influencerToken === 'YOUR_INFLUENCER_JWT_TOKEN') {
      console.log('❌ Please replace YOUR_INFLUENCER_JWT_TOKEN with a real token');
      console.log('📝 To get a token:');
      console.log('1. Register/login as an influencer');
      console.log('2. Copy the JWT token from the response');
      console.log('3. Replace the placeholder in this script');
      return;
    }
    
    const response = await fetch('http://localhost:5001/api/influencer/inquiries', {
      headers: {
        'Authorization': `Bearer ${influencerToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📄 Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log(`✅ Found ${data.data.length} inquiries`);
      
      if (data.data.length > 0) {
        data.data.forEach((inquiry, index) => {
          console.log(`\n📨 Inquiry ${index + 1}:`, {
            id: inquiry._id,
            status: inquiry.status,
            clientName: inquiry.userId?.name || 'Unknown',
            clientEmail: inquiry.userId?.email || 'Unknown',
            category: inquiry.category,
            eventType: inquiry.eventType,
            budget: inquiry.budget,
            location: inquiry.location,
            forwardedTo: inquiry.forwardedTo?.map(f => ({
              influencerId: f.userId?._id,
              influencerName: f.userId?.fullName || f.userId?.firstName + ' ' + f.userId?.lastName,
              influencerEmail: f.userId?.email,
              forwardedAt: f.forwardedAt
            })) || []
          });
        });
      } else {
        console.log('ℹ️ No inquiries found for this influencer');
        console.log('💡 This could mean:');
        console.log('   - No inquiries have been forwarded to this influencer yet');
        console.log('   - The influencer ID in the token doesn\'t match any forwarded inquiries');
        console.log('   - There might be an authentication issue');
      }
    } else {
      console.log('❌ Error in response:', data.message || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Error testing influencer inquiries:', error.message);
    console.error('🔧 Stack trace:', error.stack);
  }
}

// Test without authentication (should fail)
async function testWithoutAuth() {
  try {
    console.log('\n🔍 Testing without authentication (should fail)...');
    
    const response = await fetch('http://localhost:5001/api/influencer/inquiries', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    const data = await response.json();
    console.log('📄 Response data:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Correctly requires authentication');
    } else {
      console.log('❌ Should require authentication but doesn\'t');
    }
    
  } catch (error) {
    console.error('❌ Error testing without auth:', error.message);
  }
}

// Run tests
console.log('🚀 Starting influencer inquiries endpoint tests...\n');

testWithoutAuth();
testInfluencerInquiries();

console.log('\n📝 Additional testing steps:');
console.log('1. Get a real influencer JWT token by logging in as an influencer');
console.log('2. Replace YOUR_INFLUENCER_JWT_TOKEN in the script');
console.log('3. Run: node test-influencer-inquiries.js');
console.log('4. To test with forwarded inquiries:');
console.log('   - Have an admin forward an inquiry to this influencer');
console.log('   - Run this test again to verify the inquiry appears');

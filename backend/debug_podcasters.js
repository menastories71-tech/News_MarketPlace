const axios = require('axios');

async function debugPodcastersAPI() {
  const baseURL = 'http://localhost:3000/api';
  
  try {
    // Test 1: Check if admin login works
    console.log('🔐 Testing admin login...');
    const loginResponse = await axios.post(`${baseURL}/admin/auth/login`, {
      email: 'admin@newsmarketplace.com',
      password: 'admin123'
    });
    
    console.log('✅ Admin login successful');
    const accessToken = loginResponse.data.tokens.accessToken;
    
    // Test 2: Check profile endpoint
    console.log('👤 Testing profile endpoint...');
    const profileResponse = await axios.get(`${baseURL}/admin/auth/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('✅ Profile fetched:', profileResponse.data.admin.role);
    
    // Test 3: Check podcasters endpoint
    console.log('🎙️ Testing podcasters endpoint...');
    const podcastersResponse = await axios.get(`${baseURL}/podcasters/admin?page=1&limit=10`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('✅ Podcasters fetched:', podcastersResponse.data.podcasters.length, 'records');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔍 401 Error Details:');
      console.log('- Token might be invalid/expired');
      console.log('- Admin might not exist in database');
      console.log('- JWT secrets might not match');
    }
    
    if (error.response?.status === 403) {
      console.log('🔍 403 Error Details:');
      console.log('- Admin might not have required permissions');
      console.log('- Admin role level might be insufficient');
    }
  }
}

debugPodcastersAPI();
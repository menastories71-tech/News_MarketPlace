const axios = require('axios');

async function testPowerlistOrders() {
  try {
    const baseUrl = 'http://localhost:3000/api';
    
    // Test creating a powerlist order
    console.log('Testing powerlist orders creation...');
    const orderData = {
      powerlistId: 1,
      powerlistName: 'Test Powerlist',
      price: 99.99,
      customerInfo: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        message: 'This is a test order'
      },
      status: 'pending'
    };

    const response = await axios.post(`${baseUrl}/powerlist-orders`, orderData);
    console.log('Powerlist order created successfully:', response.data);
    
  } catch (error) {
    console.error('Error testing powerlist orders:', error.response?.data || error.message);
  }
}

testPowerlistOrders();
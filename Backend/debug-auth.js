const axios = require('axios');
const mongoose = require('mongoose');
const config = require('./config/config');

const API_BASE = 'http://localhost:5000/api';

async function debugAuth() {
  console.log('🔍 Debugging Authentication Issues\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Checking server status...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/health');
      console.log('✅ Server is running on port 5000');
    } catch (error) {
      console.log('❌ Server not running on port 5000');
      try {
        const healthResponse2 = await axios.get('http://localhost:5002/health');
        console.log('✅ Server is running on port 5002');
        console.log('⚠️  Frontend should use port 5002, not 5000');
      } catch (error2) {
        console.log('❌ Server not running on port 5002 either');
        console.log('💡 Please start your backend server first');
        return;
      }
    }

    // Test 2: Check database connection
    console.log('\n2️⃣ Checking database connection...');
    try {
      await mongoose.connect(config.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('✅ Database connected successfully');
      
      // Check roles
      const Role = mongoose.model('Role');
      const roles = await Role.find();
      console.log(`   Found ${roles.length} roles in database`);
      
      // Check users
      const User = mongoose.model('User');
      const users = await User.find().select('name email');
      console.log(`   Found ${users.length} users in database`);
      
      await mongoose.connection.close();
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
    }

    // Test 3: Test registration endpoint
    console.log('\n3️⃣ Testing registration endpoint...');
    const testUser = {
      name: 'Debug Test User',
      email: `debug${Date.now()}@test.com`,
      password: 'password123'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
      console.log('✅ Registration successful!');
      console.log('   Response structure:', Object.keys(registerResponse.data));
      console.log('   Has token:', !!registerResponse.data.token);
      console.log('   Has _id:', !!registerResponse.data._id);
      console.log('   Has name:', !!registerResponse.data.name);
      
      const authToken = registerResponse.data.token;
      
      // Test 4: Test login with registered user
      console.log('\n4️⃣ Testing login...');
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      console.log('✅ Login successful!');
      console.log('   Response structure:', Object.keys(loginResponse.data));
      
      // Test 5: Test protected endpoint
      console.log('\n5️⃣ Testing protected endpoint...');
      try {
        const meResponse = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Protected endpoint working');
        console.log('   Current user:', meResponse.data.name);
      } catch (error) {
        console.log('❌ Protected endpoint failed:', error.response?.data?.message);
      }
      
      // Test 6: Test users sharing endpoint
      console.log('\n6️⃣ Testing users sharing endpoint...');
      try {
        const usersResponse = await axios.get(`${API_BASE}/users/sharing`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ Users sharing endpoint working');
        console.log(`   Found ${usersResponse.data.length} users for sharing`);
      } catch (error) {
        console.log('❌ Users sharing endpoint failed:', error.response?.data?.message);
        console.log('   Status:', error.response?.status);
      }
      
    } catch (error) {
      console.log('❌ Registration failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message);
      console.log('   Error:', error.message);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAuth(); 
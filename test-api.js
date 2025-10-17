const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing HATS API...\n');

  try {
    // Test 1: Login as Applicant
    console.log('1. Testing Applicant Login...');
    const applicantLogin = await axios.post(`${API_BASE}/users/login`, {
      email: 'applicant@demo.com',
      password: 'password123'
    });
    console.log('✅ Applicant login successful');
    console.log('   Token:', applicantLogin.data.token.substring(0, 20) + '...');

    // Test 2: Login as Admin
    console.log('\n2. Testing Admin Login...');
    const adminLogin = await axios.post(`${API_BASE}/users/login`, {
      email: 'admin@demo.com',
      password: 'password123'
    });
    console.log('✅ Admin login successful');
    console.log('   Token:', adminLogin.data.token.substring(0, 20) + '...');

    // Test 3: Login as Bot Mimic
    console.log('\n3. Testing Bot Mimic Login...');
    const botLogin = await axios.post(`${API_BASE}/users/login`, {
      email: 'bot@demo.com',
      password: 'password123'
    });
    console.log('✅ Bot Mimic login successful');
    console.log('   Token:', botLogin.data.token.substring(0, 20) + '...');

    // Test 4: Get Jobs
    console.log('\n4. Testing Jobs API...');
    const jobs = await axios.get(`${API_BASE}/jobs`);
    console.log(`✅ Jobs retrieved: ${jobs.data.length} jobs found`);

    // Test 5: Get Applications (as Admin)
    console.log('\n5. Testing Applications API...');
    const applications = await axios.get(`${API_BASE}/applications`, {
      headers: { Authorization: `Bearer ${adminLogin.data.token}` }
    });
    console.log(`✅ Applications retrieved: ${applications.data.length} applications found`);

    // Test 6: Get Dashboard Data (as Admin)
    console.log('\n6. Testing Dashboard API...');
    const dashboard = await axios.get(`${API_BASE}/dashboard`, {
      headers: { Authorization: `Bearer ${adminLogin.data.token}` }
    });
    console.log('✅ Dashboard data retrieved');
    console.log('   Total Applications:', dashboard.data.totalApplications);
    console.log('   Total Jobs:', dashboard.data.totalJobs);
    console.log('   Total Users:', dashboard.data.totalUsers);

    // Test 7: Test Bot Mimic Process
    console.log('\n7. Testing Bot Mimic Process...');
    const botProcess = await axios.post(`${API_BASE}/bot-mimic/process`, {}, {
      headers: { Authorization: `Bearer ${botLogin.data.token}` }
    });
    console.log('✅ Bot Mimic process completed');
    console.log('   Processed:', botProcess.data.results.length, 'applications');

    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('   Applicant: applicant@demo.com / password123');
    console.log('   Admin: admin@demo.com / password123');
    console.log('   Bot Mimic: bot@demo.com / password123');
    console.log('\n🌐 Application URLs:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:5000');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

testAPI();


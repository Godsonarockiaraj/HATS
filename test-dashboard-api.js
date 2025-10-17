const mongoose = require('mongoose');
const Application = require('./server/models/Application');
const Job = require('./server/models/Job');
const User = require('./server/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mernapp';

const testDashboardAPI = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Simulate admin dashboard logic
    const totalApplications = await Application.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalUsers = await User.countDocuments();
    
    const statusCountsAggregation = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusCounts = {};
    statusCountsAggregation.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    const stats = {
      totalApplications,
      pendingApplications: statusCounts.pending || 0,
      shortlistedApplications: statusCounts.shortlisted || 0,
      rejectedApplications: statusCounts.rejected || 0,
      successRate: totalApplications > 0 ? Math.round(((statusCounts.shortlisted || 0) / totalApplications) * 100) : 0
    };

    const dashboardData = {
      stats,
      totalJobs,
      totalUsers,
      statusCounts,
      user: { role: 'admin' }
    };

    console.log('\n=== DASHBOARD API RESPONSE ===');
    console.log(JSON.stringify(dashboardData, null, 2));

    console.log('\n=== EXPECTED FRONTEND VALUES ===');
    console.log('HeroSection should display:');
    console.log(`- Total Applications: ${stats.totalApplications}`);
    console.log(`- Pending: ${stats.pendingApplications}`);
    console.log(`- Shortlisted: ${stats.shortlistedApplications}`);
    console.log(`- Rejected: ${stats.rejectedApplications}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
};

testDashboardAPI();

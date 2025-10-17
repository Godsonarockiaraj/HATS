const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get dashboard data based on user role
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    let dashboardData = {};

    if (user.role === 'applicant') {
      // Applicant dashboard
      const myApplications = await Application.find({ applicantId: user._id })
        .populate('jobId', 'title department isTechnical')
        .sort({ createdAt: -1 });

      // Filter out applications with null job references
      const validApplications = myApplications.filter(app => app.jobId !== null);

      const statusCounts = {
        pending: 0,
        shortlisted: 0,
        rejected: 0,
        interview_scheduled: 0,
        offer: 0,
        withdrawn: 0
      };

      validApplications.forEach(app => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      });

      console.log('[DEBUG] Applicant dashboard data:', {
        totalApplications: validApplications.length,
        statusCounts,
        applicationsFound: validApplications.length
      });

      dashboardData = {
        totalApplications: validApplications.length,
        statusCounts,
        recentApplications: validApplications.slice(0, 5),
        user: user
      };

    } else if (user.role === 'admin') {
      // Admin dashboard
      const totalApplications = await Application.countDocuments();
      const totalJobs = await Job.countDocuments();
      const totalUsers = await User.countDocuments();
      
      const statusCountsAggregation = await Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      // Convert aggregation result to object
      const statusCounts = {};
      statusCountsAggregation.forEach(item => {
        statusCounts[item._id] = item.count;
      });

      // Calculate stats with explicit values
      const stats = {
        totalApplications,
        pendingApplications: statusCounts.pending || 0,
        shortlistedApplications: statusCounts.shortlisted || 0,
        rejectedApplications: statusCounts.rejected || 0,
        successRate: totalApplications > 0 ? Math.round(((statusCounts.shortlisted || 0) / totalApplications) * 100) : 0
      };

      const technicalVsNonTechnical = await Application.aggregate([
        { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'jobData' } },
        { $unwind: '$jobData' },
        { $group: { _id: '$jobData.isTechnical', count: { $sum: 1 } } }
      ]);

      const recentActivity = await ActivityLog.find()
        .populate('application', 'applicantId')
        .populate('performedBy', 'name role')
        .sort({ createdAt: -1 })
        .limit(10);

      const recentApplications = await Application.find()
        .populate('applicantId', 'name email')
        .populate('jobId', 'title department')
        .sort({ createdAt: -1 })
        .limit(5);

      dashboardData = {
        stats,
        totalJobs,
        totalUsers,
        statusCounts,
        technicalVsNonTechnical,
        recentActivity,
        recentApplications,
        user: user
      };

      console.log('[DEBUG] Admin dashboard data:', {
        totalApplications,
        statusCounts,
        stats,
        statusCountsAggregation,
        recentApplicationsCount: recentApplications.length,
        applicationsFound: await Application.countDocuments()
      });
      
      console.log('[DEBUG] Sending response:', JSON.stringify(dashboardData, null, 2));

    } else if (user.role === 'bot_mimic') {
      // Bot mimic dashboard - Show ALL applications like admin
      const totalApplications = await Application.countDocuments();
      const totalJobs = await Job.countDocuments();
      
      const statusCountsAggregation = await Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      // Convert aggregation result to object
      const statusCounts = {};
      statusCountsAggregation.forEach(item => {
        statusCounts[item._id] = item.count;
      });

      // Calculate stats with explicit values
      const stats = {
        totalApplications,
        pendingApplications: statusCounts.pending || 0,
        shortlistedApplications: statusCounts.shortlisted || 0,
        rejectedApplications: statusCounts.rejected || 0,
        successRate: totalApplications > 0 ? Math.round(((statusCounts.shortlisted || 0) / totalApplications) * 100) : 0
      };

      const automatedActions = await ActivityLog.countDocuments({
        performedByRole: 'bot_mimic',
        isAutomated: true
      });

      const todayActions = await ActivityLog.countDocuments({
        performedByRole: 'bot_mimic',
        isAutomated: true,
        createdAt: {
          $gte: new Date().setHours(0, 0, 0, 0)
        }
      });

      const recentApplications = await Application.find()
        .populate('applicantId', 'name email')
        .populate('jobId', 'title department')
        .sort({ createdAt: -1 })
        .limit(5);

      dashboardData = {
        stats,
        totalJobs,
        automatedActions,
        todayActions,
        statusCounts,
        recentApplications,
        user: user
      };

      console.log('[DEBUG] Bot mimic dashboard data (ALL APPLICATIONS):', {
        totalApplications,
        statusCounts,
        stats,
        recentApplicationsCount: recentApplications.length
      });
    }

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

module.exports = router;

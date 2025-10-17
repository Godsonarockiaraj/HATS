const mongoose = require('mongoose');
const Application = require('./models/Application');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mernapp';

const testDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all applications
    const applications = await Application.find({})
      .populate('applicant', 'name email')
      .populate('job', 'title department isTechnical');

    console.log('Total applications found:', applications.length);
    
    applications.forEach((app, index) => {
      console.log(`\n--- Application ${index + 1} ---`);
      console.log('ID:', app._id);
      console.log('Applicant:', app.applicant?.name);
      console.log('Job:', app.job?.title);
      console.log('Has additionalInfo:', !!app.additionalInfo);
      if (app.additionalInfo) {
        console.log('Additional Info Keys:', Object.keys(app.additionalInfo));
        console.log('Additional Info Content:', JSON.stringify(app.additionalInfo, null, 2));
      } else {
        console.log('No additionalInfo field found');
      }
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
};

testDatabase();

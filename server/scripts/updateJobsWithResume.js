const mongoose = require('mongoose');
const Job = require('../models/Job');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hats', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Update existing jobs to include resume section
const updateJobsWithResume = async () => {
  try {
    console.log('🔄 Updating existing jobs to include resume section...');
    
    // Find all jobs that don't have resume section in customFields
    const jobsToUpdate = await Job.find({
      $or: [
        { 'customFields.resume': { $exists: false } },
        { 'customFields.resume': null }
      ]
    });

    console.log(`Found ${jobsToUpdate.length} jobs to update`);

    // Update each job to include resume section
    for (const job of jobsToUpdate) {
      console.log(`Updating job: ${job.title}`);
      
      // Add resume section with default configuration
      const updatedCustomFields = {
        ...job.customFields,
        resume: {
          enabled: false,
          required: false,
          fields: []
        }
      };

      await Job.findByIdAndUpdate(
        job._id,
        { customFields: updatedCustomFields },
        { new: true }
      );
      
      console.log(`✅ Updated job: ${job.title}`);
    }

    console.log('🎉 All jobs updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating jobs:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the update
const runUpdate = async () => {
  await connectDB();
  await updateJobsWithResume();
};

runUpdate();

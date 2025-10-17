const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import your models
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Keyword = require('../models/Keyword');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// Database connections
const localDB = 'mongodb://localhost:27017/mernapp';
const atlasDB = process.env.MONGODB_URI || 'mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/mernapp?retryWrites=true&w=majority';

async function migrateData() {
  try {
    console.log('🚀 Starting MongoDB Atlas Migration...\n');

    // Connect to local MongoDB
    console.log('📡 Connecting to local MongoDB...');
    await mongoose.connect(localDB);
    console.log('✅ Connected to local MongoDB\n');

    // Export data from local database
    console.log('📤 Exporting data from local database...');
    
    const users = await User.find({});
    const jobs = await Job.find({});
    const applications = await Application.find({});
    const keywords = await Keyword.find({});
    const notifications = await Notification.find({});
    const activityLogs = await ActivityLog.find({});

    console.log(`📊 Data exported:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Jobs: ${jobs.length}`);
    console.log(`   - Applications: ${applications.length}`);
    console.log(`   - Keywords: ${keywords.length}`);
    console.log(`   - Notifications: ${notifications.length}`);
    console.log(`   - Activity Logs: ${activityLogs.length}\n`);

    // Save data to JSON files as backup
    const backupDir = path.join(__dirname, '..', 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    fs.writeFileSync(path.join(backupDir, 'users.json'), JSON.stringify(users, null, 2));
    fs.writeFileSync(path.join(backupDir, 'jobs.json'), JSON.stringify(jobs, null, 2));
    fs.writeFileSync(path.join(backupDir, 'applications.json'), JSON.stringify(applications, null, 2));
    fs.writeFileSync(path.join(backupDir, 'keywords.json'), JSON.stringify(keywords, null, 2));
    fs.writeFileSync(path.join(backupDir, 'notifications.json'), JSON.stringify(notifications, null, 2));
    fs.writeFileSync(path.join(backupDir, 'activityLogs.json'), JSON.stringify(activityLogs, null, 2));

    console.log('💾 Backup files created in server/backup/\n');

    // Disconnect from local
    await mongoose.disconnect();
    console.log('📡 Disconnected from local MongoDB\n');

    // Connect to Atlas
    console.log('☁️ Connecting to MongoDB Atlas...');
    await mongoose.connect(atlasDB);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Clear existing data in Atlas (optional - remove if you want to keep existing data)
    console.log('🧹 Clearing existing data in Atlas...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Keyword.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('✅ Atlas database cleared\n');

    // Import data to Atlas
    console.log('📥 Importing data to Atlas...');
    
    if (users.length > 0) {
      await User.insertMany(users);
      console.log(`✅ ${users.length} users imported`);
    }
    
    if (jobs.length > 0) {
      await Job.insertMany(jobs);
      console.log(`✅ ${jobs.length} jobs imported`);
    }
    
    if (applications.length > 0) {
      await Application.insertMany(applications);
      console.log(`✅ ${applications.length} applications imported`);
    }
    
    if (keywords.length > 0) {
      await Keyword.insertMany(keywords);
      console.log(`✅ ${keywords.length} keywords imported`);
    }
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`✅ ${notifications.length} notifications imported`);
    }
    
    if (activityLogs.length > 0) {
      await ActivityLog.insertMany(activityLogs);
      console.log(`✅ ${activityLogs.length} activity logs imported`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with the correct Atlas connection string');
    console.log('2. Test your application with Atlas');
    console.log('3. Keep the backup files in server/backup/ as a safety measure');
    console.log('4. Once confirmed working, you can stop your local MongoDB service');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run migration
migrateData();

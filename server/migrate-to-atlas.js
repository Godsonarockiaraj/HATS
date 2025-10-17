const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Connection strings
const LOCAL_MONGO_URI = 'mongodb://localhost:27017/mernapp';
const ATLAS_MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://godsonarockiaraj26csa_db_user:YzFgv7PnWCycHxq0@cluster0.s1d0t7k.mongodb.net/mernapp?retryWrites=true&w=majority';

console.log('🚀 Starting MongoDB Migration to Atlas...');
console.log('📡 Local URI:', LOCAL_MONGO_URI);
console.log('☁️  Atlas URI:', ATLAS_MONGO_URI ? ATLAS_MONGO_URI.replace(/\/\/.*@/, '//***:***@') : 'NOT SET');

if (!ATLAS_MONGO_URI || ATLAS_MONGO_URI.includes('<db_password>')) {
  console.error('❌ Please set your MONGODB_URI in server/.env with the actual password!');
  process.exit(1);
}

const collectionsToMigrate = [
  'users', 
  'jobs', 
  'applications', 
  'keywords', 
  'activitylogs', 
  'applicationfeedbacks', 
  'notifications'
];

async function migrateData() {
  try {
    console.log('\n🔗 Step 1: Connecting to local MongoDB...');
    await mongoose.connect(LOCAL_MONGO_URI);
    console.log('✅ Connected to local MongoDB');

    console.log('\n📊 Step 2: Checking collections in local database...');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📁 Found collections:', collections.map(c => c.name));

    console.log('\n📤 Step 3: Exporting data from local MongoDB...');
    const exportData = {};
    
    for (const collectionName of collectionsToMigrate) {
      console.log(`📋 Exporting ${collectionName}...`);
      try {
        const data = await db.collection(collectionName).find({}).toArray();
        exportData[collectionName] = data;
        console.log(`✅ Exported ${data.length} documents from ${collectionName}`);
      } catch (error) {
        console.log(`⚠️  Collection ${collectionName} not found or empty`);
        exportData[collectionName] = [];
      }
    }

    console.log('\n🔗 Step 4: Connecting to MongoDB Atlas...');
    await mongoose.disconnect(); // Disconnect from local
    await mongoose.connect(ATLAS_MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    console.log('\n📥 Step 5: Importing data to MongoDB Atlas...');
    const atlasDb = mongoose.connection.db;
    
    for (const collectionName of collectionsToMigrate) {
      const data = exportData[collectionName];
      if (data && data.length > 0) {
        console.log(`📋 Importing ${data.length} documents to ${collectionName}...`);
        
        // Clear existing data (optional - remove this line if you want to keep existing data)
        await atlasDb.collection(collectionName).deleteMany({});
        
        // Insert new data
        await atlasDb.collection(collectionName).insertMany(data);
        console.log(`✅ Imported ${data.length} documents to ${collectionName}`);
      } else {
        console.log(`⚠️  No data to import for ${collectionName}`);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Final verification:');
    
    for (const collectionName of collectionsToMigrate) {
      try {
        const count = await atlasDb.collection(collectionName).countDocuments();
        console.log(`📋 ${collectionName}: ${count} documents`);
      } catch (error) {
        console.log(`📋 ${collectionName}: 0 documents`);
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    console.log('\n🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
    console.log('\n🎯 Your app is now using MongoDB Atlas!');
  }
}

migrateData();

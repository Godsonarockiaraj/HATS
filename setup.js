const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up HATS - Hybrid Application Tracking System...\n');

// Create .env file for server
const envContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/mernapp
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
NODE_ENV=development`;

const envPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created server/.env file');
} else {
  console.log('⚠️  server/.env already exists');
}

// Install server dependencies
console.log('\n📦 Installing server dependencies...');
try {
  execSync('cd server && npm install', { stdio: 'inherit' });
  console.log('✅ Server dependencies installed');
} catch (error) {
  console.error('❌ Error installing server dependencies:', error.message);
}

// Install client dependencies
console.log('\n📦 Installing client dependencies...');
try {
  execSync('cd client && npm install', { stdio: 'inherit' });
  console.log('✅ Client dependencies installed');
} catch (error) {
  console.error('❌ Error installing client dependencies:', error.message);
}

// Install root dependencies
console.log('\n📦 Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
} catch (error) {
  console.error('❌ Error installing root dependencies:', error.message);
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Run: npm run seed (to populate database with sample data)');
console.log('3. Run: npm run dev (to start both frontend and backend)');
console.log('\n🔑 Demo credentials:');
console.log('   Applicant: applicant@demo.com / password123');
console.log('   Admin: admin@demo.com / password123');
console.log('   Bot Mimic: bot@demo.com / password123');
console.log('\n🌐 The app will be available at:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend: http://localhost:5000');

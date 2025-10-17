const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 HATS Deployment Script');
console.log('========================\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file...');
  const envContent = `MONGODB_URI=mongodb://localhost:27017/hats
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development`;
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created');
} else {
  console.log('✅ .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm run install-all', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Seed database
console.log('\n🌱 Seeding database...');
try {
  execSync('npm run seed', { stdio: 'inherit' });
  console.log('✅ Database seeded');
} catch (error) {
  console.error('❌ Error seeding database:', error.message);
  process.exit(1);
}

// Run tests
console.log('\n🧪 Running API tests...');
try {
  execSync('node test-api.js', { stdio: 'inherit' });
  console.log('✅ All tests passed');
} catch (error) {
  console.error('❌ Tests failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 Deployment completed successfully!');
console.log('\n📋 Next Steps:');
console.log('1. Start the application: npm run dev');
console.log('2. Open http://localhost:3000 in your browser');
console.log('3. Use the demo credentials to test different roles');
console.log('\n👥 Demo Credentials:');
console.log('   Applicant: applicant@demo.com / password123');
console.log('   Admin: admin@demo.com / password123');
console.log('   Bot Mimic: bot@demo.com / password123');
console.log('\n🌐 URLs:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend: http://localhost:5000');


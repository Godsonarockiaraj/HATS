# 🔧 Environment Variables Setup Guide

This guide shows you how to set up environment variables for the HATS Application Tracking System in different environments.

## 📋 Required Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/hats` | ✅ |
| `JWT_SECRET` | Secret key for JWT authentication | `your_super_secret_jwt_key_here` | ✅ |
| `NODE_ENV` | Environment mode | `development` or `production` | ✅ |
| `PORT` | Server port number | `5000` | ❌ (Optional) |
| `MAX_FILE_SIZE` | Maximum file upload size | `5242880` (5MB) | ❌ (Optional) |

## 🏠 Local Development Setup

### Method 1: Create .env File (Recommended)

1. **Create a `.env` file** in your project root directory:
   ```bash
   # Navigate to your project root
   cd C:\Users\goldg\Desktop\cursor-ATS
   
   # Create .env file
   echo. > .env
   ```

2. **Add environment variables** to the `.env` file:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/hats
   # For MongoDB Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hats
   
   # Authentication
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # File Upload
   MAX_FILE_SIZE=5242880
   ```

3. **Install dotenv** (if not already installed):
   ```bash
   cd server
   npm install dotenv
   ```

### Method 2: Command Line (Temporary)

Set variables in your terminal session:

**Windows PowerShell:**
```powershell
$env:MONGODB_URI="mongodb://localhost:27017/hats"
$env:JWT_SECRET="your_super_secret_jwt_key_here"
$env:NODE_ENV="development"
$env:PORT="5000"
```

**Windows Command Prompt:**
```cmd
set MONGODB_URI=mongodb://localhost:27017/hats
set JWT_SECRET=your_super_secret_jwt_key_here
set NODE_ENV=development
set PORT=5000
```

**Linux/Mac:**
```bash
export MONGODB_URI="mongodb://localhost:27017/hats"
export JWT_SECRET="your_super_secret_jwt_key_here"
export NODE_ENV="development"
export PORT="5000"
```

## ☁️ Production Deployment Setup

### Vercel Deployment

1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add each variable**:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/hats` | Production |
   | `JWT_SECRET` | `your_production_jwt_secret_key` | Production |
   | `NODE_ENV` | `production` | Production |

5. **Redeploy** your application

### Heroku Deployment

1. **Install Heroku CLI**
2. **Login to Heroku**: `heroku login`
3. **Set environment variables**:
   ```bash
   heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/hats"
   heroku config:set JWT_SECRET="your_production_jwt_secret"
   heroku config:set NODE_ENV="production"
   ```

### Railway Deployment

1. **Go to Railway dashboard**
2. **Select your project**
3. **Go to Variables tab**
4. **Add environment variables**:
   - Click "New Variable"
   - Add name and value
   - Select environment (Production)

### Netlify Deployment

1. **Go to Netlify dashboard**
2. **Select your site**
3. **Go to Site Settings → Environment Variables**
4. **Add variables** and click "Save"

## 🔐 MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create a new cluster (choose M0 - Free tier)

### Step 2: Database User Setup
1. **Go to Database Access**
2. **Add New Database User**:
   - Username: `hats-user` (or your choice)
   - Password: Generate a strong password
   - Database User Privileges: "Read and write to any database"

### Step 3: Network Access
1. **Go to Network Access**
2. **Add IP Address**:
   - For development: Add your current IP
   - For production: Add `0.0.0.0/0` (allows all IPs)

### Step 4: Get Connection String
1. **Go to Clusters**
2. **Click "Connect"**
3. **Choose "Connect your application"**
4. **Copy the connection string**:
   ```
   mongodb+srv://hats-user:<password>@cluster0.xxxxx.mongodb.net/hats?retryWrites=true&w=majority
   ```
5. **Replace `<password>`** with your actual password

## 🛠️ JWT Secret Generation

### Generate a Strong JWT Secret

**Option 1: Online Generator**
- Visit [randomkeygen.com](https://randomkeygen.com/)
- Copy a "CodeIgniter Encryption Keys" or "Symmetric Encryption Keys"

**Option 2: Node.js Command**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option 3: Manual Creation**
Create a long, random string:
```
your_super_secret_jwt_key_here_make_it_very_long_and_random_123456789
```

## ✅ Verification

### Check if Environment Variables are Loaded

Add this to your server.js file temporarily:
```javascript
console.log('Environment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT || 5000);
```

### Test Database Connection

Create a test file `test-env.js`:
```javascript
require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing environment variables...');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');

// Test database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection failed:', err));
```

Run the test:
```bash
node test-env.js
```

## 🚨 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different secrets** for development and production
3. **Rotate JWT secrets** periodically
4. **Use strong, unique passwords** for database users
5. **Limit network access** to specific IPs when possible

## 🔧 Troubleshooting

### Common Issues

1. **"MONGODB_URI is not defined"**
   - Check if `.env` file exists in project root
   - Verify dotenv is installed and configured
   - Restart your server after adding variables

2. **Database Connection Failed**
   - Verify MongoDB URI format
   - Check if database user has correct permissions
   - Ensure network access allows your IP

3. **JWT Secret Issues**
   - Make sure JWT_SECRET is set
   - Use a long, random string
   - Don't use default or simple passwords

4. **Variables Not Loading in Production**
   - Check platform-specific environment variable settings
   - Redeploy after adding variables
   - Verify variable names match exactly

## 📝 Example .env File

Create a `.env` file in your project root with this content:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://hats-user:your_password@cluster0.xxxxx.mongodb.net/hats?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random_123456789abcdef

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=5242880
```

---

**Need Help?** Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for more deployment-specific instructions.

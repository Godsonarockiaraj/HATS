# 🚀 Vercel Deployment Guide - Step by Step

Follow these exact steps to deploy your HATS Application Tracking System to Vercel.

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] GitHub repository with your code (✅ Already done)
- [ ] MongoDB Atlas account (free tier is fine)
- [ ] Vercel account (we'll create this)

## 🎯 Step-by-Step Deployment

### Step 1: Set Up MongoDB Atlas Database

1. **Go to MongoDB Atlas**
   - Visit: https://www.mongodb.com/atlas
   - Click "Try Free" or "Start Free"

2. **Create Account**
   - Sign up with email or Google account
   - Verify your email

3. **Create Cluster**
   - Choose "Build a Database"
   - Select "FREE" (M0 Sandbox)
   - Choose a cloud provider (AWS recommended)
   - Select region closest to you
   - Name your cluster: `HATS-Cluster`
   - Click "Create Cluster" (takes 3-5 minutes)

4. **Create Database User**
   - Click "Database Access" in left menu
   - Click "Add New Database User"
   - Authentication Method: "Password"
   - Username: `hats-user`
   - Password: Click "Autogenerate Secure Password" and **SAVE THIS PASSWORD**
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

5. **Set Network Access**
   - Click "Network Access" in left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. **Get Connection String**
   - Click "Clusters" in left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Driver: "Node.js"
   - Version: "4.1 or later"
   - Copy the connection string
   - **IMPORTANT**: Replace `<password>` with your actual password

### Step 2: Create Vercel Account

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Click "Sign Up"

2. **Sign Up with GitHub**
   - Click "Continue with GitHub"
   - Authorize Vercel to access your repositories

### Step 3: Deploy to Vercel

1. **Import Project**
   - In Vercel dashboard, click "New Project"
   - Find your repository: `Application_Tracking_System`
   - Click "Import"

2. **Configure Project**
   - Framework Preset: "Other" (Vercel will auto-detect)
   - Root Directory: `./` (leave default)
   - Build Command: Leave empty (auto-detected)
   - Output Directory: Leave empty (auto-detected)
   - Install Command: Leave empty (auto-detected)

3. **Set Environment Variables**
   - Click "Environment Variables" section
   - Add these variables one by one:

   **Variable 1:**
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://hats-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hats?retryWrites=true&w=majority`
   - Environment: Production, Preview, Development

   **Variable 2:**
   - Name: `JWT_SECRET`
   - Value: `hats_super_secret_jwt_key_2025_very_long_and_secure_random_string`
   - Environment: Production, Preview, Development

   **Variable 3:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Environment: Production, Preview, Development

   **Variable 4:**
   - Name: `PORT`
   - Value: `5000`
   - Environment: Production, Preview, Development

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (5-10 minutes)
   - You'll see a success message with your app URL

### Step 4: Seed Your Database

After deployment, you need to add some initial data:

1. **Visit your deployed app URL**
2. **Try to register a new user** or use the API endpoints
3. **Create some sample jobs** through the admin panel

### Step 5: Test Your Deployment

1. **Open your deployed app URL**
2. **Test the following features:**
   - [ ] User registration works
   - [ ] User login works
   - [ ] Dashboard loads
   - [ ] Jobs can be created (admin)
   - [ ] Applications can be submitted
   - [ ] File upload works

## 🔧 Troubleshooting Common Issues

### Issue 1: Build Failed
**Solution:**
- Check if all dependencies are in package.json
- Ensure Node.js version compatibility
- Check Vercel build logs for specific errors

### Issue 2: Database Connection Failed
**Solution:**
- Verify MongoDB URI format
- Check if password is correct
- Ensure network access allows all IPs (0.0.0.0/0)
- Verify database user has correct permissions

### Issue 3: Environment Variables Not Working
**Solution:**
- Redeploy after adding environment variables
- Check variable names match exactly
- Ensure variables are set for all environments

### Issue 4: CORS Errors
**Solution:**
- This is handled by the vercel.json configuration
- If issues persist, check the server CORS settings

## 📱 Your App URLs

After successful deployment:
- **Frontend**: `https://your-app-name.vercel.app`
- **API**: `https://your-app-name.vercel.app/api`

## 🎉 Success Checklist

- [ ] MongoDB Atlas cluster created and running
- [ ] Database user created with proper permissions
- [ ] Network access configured (0.0.0.0/0)
- [ ] Vercel account created and connected to GitHub
- [ ] Project imported and configured
- [ ] Environment variables set correctly
- [ ] Deployment completed successfully
- [ ] App loads and functions correctly
- [ ] Database connection working
- [ ] User registration/login working

## 🔄 Future Updates

To update your app:
1. Make changes to your code
2. Commit and push to GitHub
3. Vercel automatically redeploys

## 📞 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test MongoDB connection separately
4. Check the [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) guide

---

**Your HATS Application will be live at:** `https://your-app-name.vercel.app`

**Estimated total time:** 15-20 minutes

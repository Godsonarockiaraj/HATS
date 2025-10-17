# 🔧 Vercel Name Fix - Correct Naming Rules

## 🚨 Problem
Vercel project names have specific requirements that must be followed.

## ✅ Solution

### Vercel Project Naming Rules (Updated)

1. **Must be lowercase** ✅
2. **Up to 100 characters long** ✅
3. **Allowed characters**: letters, digits, '.', '_', '-'
4. **Cannot contain '---' sequence** ✅

### Option 1: Change Vercel Project Name (Recommended)

When importing your project to Vercel:

1. **In Vercel Dashboard**:
   - Project Name: `hats-application-tracking-system` ✅
   - Or: `hats_application_tracking_system` ✅
   - Or: `application-tracking-system` ✅
   - Or: `hats-ats` ✅

2. **Follow these rules**:
   - ✅ Lowercase only: `hats-app`
   - ✅ Use hyphens or underscores: `hats_app`
   - ✅ Max 100 characters
   - ❌ No triple dashes: `hats---app`
   - ❌ No uppercase: `HATS-App`
   - ❌ No spaces: `hats app`

### Option 2: Rename Your GitHub Repository

If you want to rename your GitHub repository:

1. **Go to GitHub**: https://github.com/Godsonarockiaraj/Application_Tracking_System
2. **Click Settings** (repository settings)
3. **Scroll down to "Repository name"**
4. **Change to**: `Application_Tracking_System` (already correct) or `HATSApplicationTrackingSystem`
5. **Click "Rename"**

### Option 3: Create New Vercel Project

1. **Delete the current Vercel project** (if created)
2. **Create new project** with valid name:
   - `HATSApplicationTrackingSystem`
   - `ApplicationTrackingSystem` 
   - `HATS_ATS`
   - `JobTrackingSystem`

## 🎯 Valid Project Names Examples

✅ **Good Names:**
- `hats-application-tracking-system`
- `hats_application_tracking_system`
- `application-tracking-system`
- `hats-ats`
- `job-tracking-system`
- `mern-ats`
- `hats2025`

❌ **Bad Names:**
- `HATSApplicationTrackingSystem` (uppercase)
- `hats application system` (spaces)
- `hats@application` (special chars)
- `hats---application` (triple dashes)
- `HATS-ATS` (uppercase)

## 🔄 Quick Fix Steps

1. **Go to Vercel Dashboard**
2. **Click "New Project"**
3. **Import your repository**
4. **Set Project Name**: `hats-application-tracking-system`
5. **Add Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://hats-user:password@cluster.mongodb.net/hats
   JWT_SECRET=hats_super_secret_jwt_key_2025_very_long_and_secure
   NODE_ENV=production
   PORT=5000
   ```
6. **Click "Deploy"**

## 📱 Your App Will Be At:
`https://hats-application-tracking-system.vercel.app`

## ✅ Success!
Your deployment should work without the name error.

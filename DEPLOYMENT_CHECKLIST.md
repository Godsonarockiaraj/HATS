# ✅ Vercel Deployment Checklist

## 🗂️ Pre-Deployment Setup

### MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account at https://www.mongodb.com/atlas
- [ ] Create free cluster (M0 Sandbox)
- [ ] Create database user: `hats-user` with password
- [ ] Set network access to allow all IPs (0.0.0.0/0)
- [ ] Copy connection string and replace `<password>`

### Vercel Account
- [ ] Create Vercel account at https://vercel.com
- [ ] Sign up with GitHub account
- [ ] Authorize Vercel to access repositories

## 🚀 Deployment Steps

### Import Project
- [ ] Click "New Project" in Vercel
- [ ] Find and import `Application_Tracking_System` repository
- [ ] Keep default settings (auto-detected)

### Environment Variables
- [ ] Add `MONGODB_URI` with your Atlas connection string
- [ ] Add `JWT_SECRET` with a long random string
- [ ] Add `NODE_ENV` = `production`
- [ ] Add `PORT` = `5000`

### Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Note your app URL

## 🧪 Testing

### Basic Functionality
- [ ] App loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard displays
- [ ] Jobs can be created (admin)
- [ ] Applications can be submitted
- [ ] File upload works

### Demo Credentials (After Seeding)
- [ ] Test applicant login: `applicant@demo.com` / `password123`
- [ ] Test admin login: `admin@demo.com` / `password123`
- [ ] Test bot mimic login: `bot@demo.com` / `password123`

## 📝 Final Steps

### Documentation Update
- [ ] Update README.md with your live demo URL
- [ ] Test all links in documentation
- [ ] Verify Postman collection works with live API

### Optional Enhancements
- [ ] Set up custom domain (optional)
- [ ] Configure analytics (optional)
- [ ] Set up monitoring (optional)

---

**Total Estimated Time:** 15-20 minutes
**Your Live App:** `https://your-app-name.vercel.app`

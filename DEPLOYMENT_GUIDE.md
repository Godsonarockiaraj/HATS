# 🚀 Deployment Guide

This guide will help you deploy the HATS Application Tracking System to various platforms.

## 📋 Prerequisites

- GitHub account
- MongoDB Atlas account (for database)
- Vercel account (for hosting)

## 🎯 Quick Deployment to Vercel

### Step 1: Prepare Your Repository

1. **Fork** this repository to your GitHub account
2. **Clone** your forked repository locally
3. **Ensure** all files are committed and pushed

### Step 2: Set Up MongoDB Atlas

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: 
   - Choose "Free Tier" (M0)
   - Select your preferred region
   - Create cluster
3. **Database Access**:
   - Go to "Database Access"
   - Add new database user
   - Set username and password
   - Grant "Read and write to any database" permission
4. **Network Access**:
   - Go to "Network Access"
   - Add IP Address: `0.0.0.0/0` (allows all IPs)
5. **Get Connection String**:
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

### Step 3: Deploy to Vercel

1. **Go to Vercel**: Visit [vercel.com](https://vercel.com)
2. **Sign Up/Login**: Use your GitHub account
3. **Import Project**:
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration
4. **Configure Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hats
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=production
   ```
5. **Deploy**: Click "Deploy"

### Step 4: Seed the Database

After deployment, you need to seed the database with initial data:

1. **Access your deployed app**
2. **Use the API endpoints** to create users and jobs
3. **Or run the seed script** locally with your production database

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/hats` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_super_secret_key` |
| `NODE_ENV` | Environment mode | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MAX_FILE_SIZE` | Max file upload size | `5242880` (5MB) |

## 🌐 Alternative Deployment Platforms

### Netlify

1. **Connect Repository**: Import your GitHub repository
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `client/build`
3. **Environment Variables**: Set the same variables as Vercel
4. **Deploy**

### Heroku

1. **Create Heroku App**: `heroku create your-app-name`
2. **Set Environment Variables**:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   ```
3. **Deploy**: `git push heroku main`

### Railway

1. **Connect GitHub**: Link your repository
2. **Set Environment Variables** in Railway dashboard
3. **Deploy**: Automatic deployment on push

## 🔍 Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] Database connection established
- [ ] User registration works
- [ ] Login functionality works
- [ ] File upload works
- [ ] API endpoints respond correctly
- [ ] Mobile responsiveness verified

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB URI format
   - Verify network access settings
   - Ensure database user has correct permissions

2. **Build Failed**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

3. **CORS Issues**
   - Verify CORS settings in server configuration
   - Check if API endpoints are accessible

4. **File Upload Issues**
   - Check file size limits
   - Verify multer configuration
   - Ensure upload directory exists

### Getting Help

- Check the [GitHub Issues](https://github.com/Godsonarockiaraj/Application_Tracking_System/issues)
- Review the API documentation
- Test with the provided Postman collection

## 📊 Monitoring & Analytics

After deployment, consider setting up:

- **Error Tracking**: Sentry or LogRocket
- **Performance Monitoring**: Vercel Analytics or Google Analytics
- **Database Monitoring**: MongoDB Atlas monitoring
- **Uptime Monitoring**: UptimeRobot or Pingdom

## 🔄 Continuous Deployment

Once deployed, every push to your main branch will automatically trigger a new deployment on Vercel.

To disable auto-deployment:
1. Go to your Vercel project settings
2. Navigate to "Git"
3. Disable automatic deployments

## 📝 Custom Domain (Optional)

1. **Purchase Domain**: From any domain registrar
2. **Add to Vercel**: In project settings > Domains
3. **Configure DNS**: Point your domain to Vercel
4. **SSL Certificate**: Automatically provided by Vercel

---

**Need Help?** Open an issue on GitHub or contact the maintainer.

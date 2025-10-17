# MongoDB Atlas Migration Guide

## 🚀 Quick Migration Steps

### 1. **Create MongoDB Atlas Account**
- Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
- Sign up for free account
- Create M0 (free tier) cluster

### 2. **Configure Atlas Cluster**
- **Database Access**: Create user with read/write permissions
- **Network Access**: Allow access from anywhere (0.0.0.0/0) for development
- **Get Connection String**: Copy the connection string from "Connect your application"

### 3. **Update Environment Variables**
Edit `server/.env` file:
```env
# Replace with your actual Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mernapp?retryWrites=true&w=majority

# Keep your existing values
JWT_SECRET=your-jwt-secret-key-here
PORT=5000
NODE_ENV=development
```

### 4. **Run Migration Script**
```bash
cd server
node scripts/migrateToAtlas.js
```

### 5. **Test Your Application**
```bash
npm run dev
```

## 🔧 Manual Migration (Alternative)

If you prefer to do it manually:

### Export from Local MongoDB
```bash
# Export collections
mongodump --db mernapp --out ./backup

# Or export specific collections
mongoexport --db mernapp --collection users --out users.json
mongoexport --db mernapp --collection jobs --out jobs.json
mongoexport --db mernapp --collection applications --out applications.json
mongoexport --db mernapp --collection keywords --out keywords.json
mongoexport --db mernapp --collection notifications --out notifications.json
mongoexport --db mernapp --collection activitylogs --out activitylogs.json
```

### Import to Atlas
```bash
# Import collections
mongorestore --uri "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mernapp" ./backup/mernapp

# Or import specific collections
mongoimport --uri "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mernapp" --collection users --file users.json
mongoimport --uri "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mernapp" --collection jobs --file jobs.json
mongoimport --uri "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mernapp" --collection applications --file applications.json
mongoimport --uri "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mernapp" --collection keywords --file keywords.json
mongoimport --uri "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mernapp" --collection notifications --file notifications.json
mongoimport --uri "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mernapp" --collection activitylogs --file activitylogs.json
```

## 🎯 Benefits of MongoDB Atlas

- **Cloud Hosting**: No need to run local MongoDB
- **Automatic Backups**: Built-in backup and recovery
- **Scalability**: Easy to scale as your app grows
- **Security**: Built-in security features
- **Monitoring**: Built-in monitoring and alerts
- **Global**: Deploy closer to your users

## 🔒 Security Best Practices

1. **Use Strong Passwords**: Generate secure passwords for database users
2. **IP Whitelisting**: Restrict access to specific IP addresses in production
3. **Enable Encryption**: Use TLS/SSL connections
4. **Regular Backups**: Set up automated backups
5. **Monitor Access**: Use Atlas monitoring to track database usage

## 🚨 Important Notes

- **Free Tier Limits**: M0 cluster has 512MB storage limit
- **Connection Limits**: Free tier supports up to 100 connections
- **Backup**: Always backup your data before migration
- **Testing**: Test thoroughly before switching to production
- **Local MongoDB**: You can keep local MongoDB running for development

## 📞 Support

If you encounter issues:
1. Check Atlas cluster status
2. Verify connection string format
3. Ensure network access is configured
4. Check user permissions
5. Review Atlas logs for errors

## ✅ Verification Checklist

- [ ] Atlas cluster created and running
- [ ] Database user created with proper permissions
- [ ] Network access configured
- [ ] Connection string updated in .env
- [ ] Migration script run successfully
- [ ] Application tested with Atlas
- [ ] Local data backed up
- [ ] Local MongoDB can be stopped (optional)

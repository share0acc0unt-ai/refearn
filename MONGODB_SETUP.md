# Environment Variables

## Required Variables

### MongoDB Connection
```
MONGODB_URI=mongodb://localhost:27017/paypulse
```

**For MongoDB Atlas (Cloud):**
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/paypulse?retryWrites=true&w=majority
```

### JWT Secret (if not already set)
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Setup Instructions

1. **Local MongoDB:**
   - Install MongoDB locally
   - Start MongoDB service
   - Use: `MONGODB_URI=mongodb://localhost:27017/paypulse`

2. **MongoDB Atlas (Recommended for Production):**
   - Create a free cluster at https://www.mongodb.com/cloud/atlas
   - Get your connection string
   - Replace `<username>` and `<password>` with your credentials
   - Add your IP address to the whitelist

3. **After setting up .env.local:**
   - Run the seed script to populate initial data:
     ```bash
     # Make a POST request to /api/seed
     curl -X POST http://localhost:3000/api/seed
     ```
   - Or visit http://localhost:3000/api/seed in your browser (POST request)

## Seeded Data

The seed script will create:
- 3 subscription plans (Lite, Pro, Premium)
- 1 superadmin user (username: superadmin, password: superadmin123)
- 1 test OTP token (TESTOTP123)
- 6 guiders for payment assistance
- 2 payment configurations (USDT wallet address and network)
- 10 credit codes for testing

## Migration Complete

✅ All data is now stored in MongoDB
✅ Prisma has been removed
✅ File-based database has been removed
✅ All API routes updated to use MongoDB

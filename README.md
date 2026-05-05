# Paypulse

A comprehensive referral and task-based earning platform built with Next.js, MongoDB, and Mongoose.

## Overview

Paypulse is a multi-tier subscription platform where users can:
- **Earn 50% commission** on every successful referral
- **Complete tasks** (watch videos, social media actions) to earn rewards up to ₦1,000 per task
- **Create advertising campaigns** to reach target audiences
- **Purchase subscription plans** (Lite, Pro, Premium) with increasing benefits
- **Manage credits** and withdrawal requests

## Features

### User Features
- ✅ **Multi-Tier Subscriptions** - Lite (₦12,000), Pro (₦21,000), Premium (₦50,000)
- ✅ **Referral System** - Earn 50% commission on direct signups with unique referral codes
- ✅ **Task & Rewards** - Complete social media tasks and earn up to ₦1,000 per task
- ✅ **Advertising Platform** - Create campaigns and pay via credit codes or balance
- ✅ **Wallet System** - Track referral balance, task balance, and credits separately
- ✅ **Withdrawal System** - Request withdrawals via bank transfer or cryptocurrency (min ₦5,000)
- ✅ **Transaction History** - View all earnings, withdrawals, and purchases with filtering

### Guider Features
- ✅ **Credit Code Generation** - Generate codes for signups and AD payments
- ✅ **Commission Tracking** - Earn 10% on signup codes and 5% on AD codes
- ✅ **Credit Purchase** - Buy credits in bulk via USDT
- ✅ **Code Management** - Track all generated codes and their usage

### Admin Features (In Progress)
- 🚧 **User Management** - Suspend/activate users
- 🚧 **Task Management** - Create, edit, and approve tasks
- 🚧 **Withdrawal Approval** - Approve/reject withdrawal requests
- 🚧 **Platform Statistics** - View key metrics and analytics

### SuperAdmin Features (Planned)
- 📋 **Admin Management** - Create and manage admin accounts
- 📋 **System Configuration** - Manage platform settings and commission rates

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **Password Hashing**: bcryptjs
- **Icons**: Material Symbols

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd paypulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/paypulse
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

   For MongoDB Atlas (recommended for production):
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/paypulse?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

4. **Seed the database**
   ```bash
   # Make a POST request to the seed endpoint
   curl -X POST http://localhost:3000/api/seed
   ```

   This will create:
   - 3 subscription plans (Lite, Pro, Premium)
   - 1 superadmin user (username: `superadmin`, password: `superadmin123`)
   - 6 sample guiders
   - 10 credit codes
   - 2 payment configurations

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Models

- **User** - User accounts with role-based access (lite, pro, premium, guider, admin, superadmin)
- **Plan** - Subscription plans with pricing and features
- **Campaign** - Advertising campaigns created by users
- **Payment** - Payment records for campaigns
- **Guider** - Payment assistance guides
- **CreditCode** - Credit codes for signups and AD payments
- **Transaction** - Financial transaction history
- **Withdrawal** - Withdrawal requests with admin approval
- **Task** - Tasks available for users to complete
- **UserTask** - User task submissions and approvals
- **OTPToken** - OTP tokens for verification
- **Analytics** - Campaign performance tracking
- **PaymentConfig** - Platform payment configuration

## Project Structure

```
paypulse/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── user/         # User endpoints (wallet, transactions, tasks, referrals)
│   │   │   ├── campaigns/    # Campaign management
│   │   │   ├── guiders/      # Guider information
│   │   │   └── plans/        # Subscription plans
│   │   ├── dashboard/        # Dashboard pages
│   │   │   ├── wallet/       # Wallet & balance management
│   │   │   ├── transactions/ # Transaction history
│   │   │   ├── campaigns/    # Campaign management
│   │   │   ├── tasks/        # Task browsing & submission
│   │   │   ├── referrals/    # Referral network
│   │   │   └── settings/     # User settings
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   └── page.tsx          # Landing page
│   ├── components/           # Reusable components
│   ├── lib/                  # Utilities and helpers
│   │   ├── db.ts            # MongoDB connection
│   │   ├── mongodb.ts       # Alternative MongoDB connection
│   │   ├── models.ts        # Mongoose models (User, Plan, etc.)
│   │   └── auth.ts          # JWT utilities
│   └── models/              # Additional Mongoose models
│       ├── Campaign.ts
│       ├── Payment.ts
│       ├── Guider.ts
│       ├── CreditCode.ts
│       ├── Transaction.ts
│       ├── Withdrawal.ts
│       └── Analytics.ts
├── scripts/                 # Utility scripts
│   └── create-guider.js    # Create guider account
└── public/                 # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration with credit code validation
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/auth/check-availability` - Check username/phone availability
- `GET /api/auth/validate-credit-code` - Validate credit code

### User
- `GET /api/user/wallet` - Get wallet balances
- `POST /api/user/wallet` - Request withdrawal
- `GET /api/user/transactions` - Get transaction history
- `GET /api/user/tasks` - Get available tasks
- `POST /api/user/tasks/submit` - Submit task completion
- `GET /api/user/referrals` - Get referral network
- `GET /api/user/ads` - Get user's ad campaigns

### Platform
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/guiders` - Get all guiders
- `GET /api/plans` - Get subscription plans
- `GET /api/payment-config` - Get payment configuration
- `POST /api/seed` - Seed initial data

## Default Accounts

After seeding, you can log in with:

**SuperAdmin:**
- Username: `superadmin`
- Password: `superadmin123`

**Guider:**
- Username: `guider1`
- Password: `guider123`
- Credits: 100,000

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, contact the development team or open an issue in the repository.

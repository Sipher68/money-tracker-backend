# Money Tracker Backend API

A robust Node.js Express backend API for the Money Tracker application with Firebase authentication and Supabase PostgreSQL database integration.

## 🚀 Features

- **RESTful API** - Clean REST endpoints for all financial resources
- **Firebase Authentication** - Secure user authentication with JWT tokens and custom token support
- **Supabase PostgreSQL** - Scalable database with real-time capabilities
- **TypeScript** - Full type safety and better developer experience
- **Express.js** - Fast and minimal web framework
- **Security Middleware** - Helmet with CSP, CORS, rate limiting
- **Error Handling** - Comprehensive error handling and logging
- **Development Tools** - Built-in API testing interface
- **Database Testing** - Automated database connection and schema validation

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js with TypeScript
- **Authentication:** Firebase Admin SDK with custom token support
- **Database:** Supabase PostgreSQL with Firebase UID compatibility
- **Security:** Helmet (CSP configured), CORS, Express Rate Limit
- **Development:** Nodemon, ts-node, comprehensive testing scripts

## 📁 Project Structure

```
src/
├── middleware/          # Express middleware
│   ├── auth.ts         # Firebase authentication with custom token support
│   ├── errorHandler.ts # Comprehensive error handling
│   └── requestLogger.ts # Request logging and debugging
├── routes/             # API route handlers
│   ├── transactions.ts # Financial transaction CRUD
│   ├── budgets.ts      # Budget management
│   ├── savings.ts      # Savings goals tracking
│   └── users.ts        # User profile management
├── services/           # External service integrations
│   └── supabase.ts     # Supabase client with environment debugging
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared interfaces and types
├── utils/              # Utility functions
├── server.ts           # Main application entry point
└── server-simple.ts    # Simplified server for basic testing

database/
├── 01_create_tables.sql    # Database schema creation
├── 02_row_level_security.sql # RLS policies
├── 03_functions_triggers.sql # Database functions
├── 04_sample_data.sql      # Sample data for testing
├── 05_firebase_uid_fix.sql # Firebase UID compatibility fix
└── README.md               # Database documentation

scripts/
├── test-database.js        # Database connection testing
├── create-supabase-user.js # User creation utility
├── test-firebase.js        # Firebase authentication testing
├── create-test-user.js     # Firebase test user creation
├── generate-token.js       # Custom token generation
└── get-token.js           # Token retrieval utility
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Firebase project with Admin SDK credentials
- Supabase project with PostgreSQL database

### Installation

1. **Clone and setup:**

   ```bash
   git clone <repository-url>
   cd money-tracker-backend
   npm install
   ```

2. **Environment Configuration:**
   Create `.env` file with your credentials:

   ```bash
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
   ```

3. **Database Setup:**

   ```bash
   # Run database schema setup in Supabase SQL Editor
   # Execute files in order: 01_create_tables.sql through 05_firebase_uid_fix.sql

   # Test database connection
   npm run db:test
   ```

4. **Firebase Setup:**

   ```bash
   # Test Firebase authentication
   npm run firebase:test

   # Create test user and generate token
   npm run firebase:generate-token
   ```

5. **Start Development Server:**

   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:5000` with testing interface at `/test`

## 📚 API Documentation

### Authentication

All API endpoints require Firebase JWT token in Authorization header:

```
Authorization: Bearer <firebase-jwt-token>
```

**Development Mode:** Supports custom tokens for testing (see `/test` interface)

### Core Endpoints

#### Health & Testing

- `GET /health` - Server health status
- `GET /test` - Interactive API testing interface
- `GET /api/debug` - Environment configuration debug

#### User Management

- `GET /api/users/profile` - Get authenticated user profile
- `POST /api/users/profile` - Create/update user profile

#### Transactions

- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
  ```json
  {
    "amount": 50.0,
    "description": "Grocery shopping",
    "category": "Food",
    "type": "expense"
  }
  ```
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

#### Budget Categories

- `GET /api/budget-categories` - Get user budget categories
- `POST /api/budget-categories` - Create budget category
- `PUT /api/budget-categories/:id` - Update category
- `DELETE /api/budget-categories/:id` - Delete category

#### Budgets

- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

#### Savings Goals

- `GET /api/savings` - Get savings goals
- `POST /api/savings` - Create savings goal
- `PUT /api/savings/:id` - Update savings goal
- `DELETE /api/savings/:id` - Delete savings goal

### Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error information"
}
```

## 🗄️ Database Schema

### Tables Overview

**users** - User profiles with Firebase UID integration

- `id` (TEXT) - Firebase UID
- `email` (VARCHAR) - User email
- `name` (VARCHAR) - Display name
- `created_at` (TIMESTAMP) - Account creation

**transactions** - Financial transactions

- `id` (UUID) - Transaction ID
- `user_id` (TEXT) - Firebase UID reference
- `amount` (DECIMAL) - Transaction amount
- `description` (TEXT) - Transaction description
- `category` (VARCHAR) - Transaction category
- `type` (VARCHAR) - 'income' or 'expense'
- `date` (TIMESTAMP) - Transaction date

**budget_categories** - Budget categories

- `id` (UUID) - Category ID
- `user_id` (TEXT) - Firebase UID reference
- `name` (VARCHAR) - Category name
- `color` (VARCHAR) - UI color code

**budgets** - Budget management

- `id` (UUID) - Budget ID
- `user_id` (TEXT) - Firebase UID reference
- `category_id` (UUID) - Category reference
- `amount` (DECIMAL) - Budget amount
- `period` (VARCHAR) - Budget period
- `start_date` (DATE) - Budget start
- `end_date` (DATE) - Budget end

**savings_goals** - Savings goal tracking

- `id` (UUID) - Goal ID
- `user_id` (TEXT) - Firebase UID reference
- `name` (VARCHAR) - Goal name
- `target_amount` (DECIMAL) - Target amount
- `current_amount` (DECIMAL) - Current progress
- `target_date` (DATE) - Target completion date

### Firebase UID Compatibility

The database schema has been updated to support Firebase UIDs (TEXT format) instead of PostgreSQL UUIDs for user identification, ensuring seamless integration between Firebase Authentication and Supabase database.

## 🔒 Security Features

### Authentication

- Firebase JWT token validation for all protected routes
- Custom token support for development and testing
- Automatic user ID extraction from validated tokens

### Security Middleware

- **Helmet** - Security headers with configured CSP for development
- **CORS** - Cross-origin resource sharing configuration
- **Rate Limiting** - Request throttling to prevent abuse
- **Error Handling** - Secure error responses without sensitive data exposure

### Database Security

- Row Level Security (RLS) disabled in favor of application-level authorization
- Firebase UID-based data isolation
- Cascade deletion for data integrity

## 🧪 Testing & Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build           # Build TypeScript to JavaScript
npm run start           # Start production server

# Testing & Utilities
npm run db:test         # Test database connection and schema
npm run firebase:test   # Test Firebase authentication
npm run firebase:generate-token # Generate development token
npm run firebase:get-token      # Get existing token
npm run firebase:create-user    # Create Firebase test user

# Code Quality
npm run lint            # ESLint code checking
npm run lint:fix        # Fix ESLint issues automatically
```

### Testing Interface

Access the built-in testing interface at `http://localhost:5000/test` for:

- Token generation and validation
- API endpoint testing
- Database operation verification
- Real-time response inspection

## 🚀 Deployment

### Environment Variables for Production

```bash
NODE_ENV=production
PORT=5000
SUPABASE_URL=your-production-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-production-private-key
```

### Deployment Platforms

- **Railway** - Recommended for automatic Git deployments
- **Heroku** - Container or buildpack deployment
- **Vercel** - Serverless functions (requires serverless adaptation)
- **AWS EC2/ECS** - Full server deployment
- **Google Cloud Run** - Container-based deployment

### Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema applied in production
- [ ] Firebase project configured for production
- [ ] CORS settings updated for frontend domain
- [ ] Rate limiting configured appropriately
- [ ] Health check endpoint responding
- [ ] Database connection verified

## 📊 API Performance

- **Response Time** - Typically <100ms for database operations
- **Rate Limiting** - Configurable per endpoint (default: 100 requests/15min)
- **Error Handling** - Comprehensive logging and graceful error responses
- **Database Pooling** - Supabase manages connection pooling automatically

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TypeScript and ESLint guidelines
4. Add tests for new functionality
5. Update documentation as needed
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Create Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For questions or issues:

- Check the `/test` interface for API testing
- Review logs in development mode for debugging
- Verify environment variables with `/api/debug` endpoint
- Test database connectivity with `npm run db:test`

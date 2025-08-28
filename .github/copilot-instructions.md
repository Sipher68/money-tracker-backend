# Money Tracker Backend - GitHub Copilot Instructions

This file provides workspace-specific custom instructions to Copilot for the Money Tracker Backend project.

## Project Overview

**Project Type:** Node.js Express API Backend  
**Language:** TypeScript  
**Authentication:** Firebase Admin SDK with custom token support  
**Database:** Supabase PostgreSQL with Firebase UID compatibility  
**Architecture:** RESTful API with comprehensive middleware stack

## ✅ Completed Setup Steps

- [x] **Verify Copilot Instructions** - This file created and maintained
- [x] **Clarify Project Requirements** - Node.js Express API backend with TypeScript, Firebase Auth middleware, Supabase PostgreSQL integration, RESTful endpoints
- [x] **Scaffold the Project** - Express.js TypeScript backend scaffolded with routes, middleware, services, and types. Project structure created successfully with all necessary files and dependencies.
- [x] **Customize the Project** - Backend customized with Firebase auth middleware, Supabase integration, transaction routes, and comprehensive API structure
- [x] **Install Required Extensions** - No specific VS Code extensions required for Node.js backend development
- [x] **Compile the Project** - Dependencies installed and TypeScript compiled successfully to dist/ directory
- [x] **Create and Run Task** - Development server task created and configured for hot-reload development
- [x] **Launch the Project** - Development server running successfully on port 5000 with comprehensive testing interface
- [x] **Database Integration** - Database schema applied, Firebase UID compatibility implemented, user creation verified
- [x] **Authentication System** - Firebase authentication fully functional with custom token support for development
- [x] **API Testing** - Complete API testing interface available at /test endpoint
- [x] **Documentation Complete** - README.md, API_DOCUMENTATION.md, and DEPLOYMENT.md created with comprehensive project information

## 🏗️ Project Architecture

### Core Components

**Server Configuration (`src/server.ts`)**

- Express.js application with comprehensive middleware stack
- Firebase authentication integration with custom token support
- Supabase database connection with environment debugging
- Security middleware: Helmet with CSP configuration, CORS, rate limiting
- Built-in API testing interface served at `/test` endpoint
- Comprehensive error handling and request logging

**Authentication Middleware (`src/middleware/auth.ts`)**

- Firebase Admin SDK integration for JWT token verification
- Custom token support for development with jsonwebtoken library
- Automatic user ID extraction from validated tokens
- Enhanced error handling for authentication failures

**Database Service (`src/services/supabase.ts`)**

- Supabase client configuration with service role access
- Environment variable loading and debugging
- Connection verification and error handling

**API Routes**

- `src/routes/users.ts` - User profile management
- `src/routes/transactions.ts` - Financial transaction CRUD operations
- `src/routes/budgets.ts` - Budget management and tracking
- `src/routes/savings.ts` - Savings goal management
- All routes include user authentication and data isolation

### Database Schema

**Firebase UID Compatibility:** Database schema converted from PostgreSQL UUID to TEXT format to support Firebase UIDs

- `users` table with Firebase UID as primary key
- All related tables updated with TEXT user_id references
- Foreign key constraints maintained with CASCADE deletion
- Row Level Security disabled in favor of application-level authorization

### Development Tools

**Testing Infrastructure**

- Interactive API testing interface at `http://localhost:5000/test`
- Comprehensive database testing scripts in `scripts/` directory
- Firebase authentication testing and token generation utilities
- Automated user creation and verification scripts

**Available Scripts**

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run db:test` - Test database connectivity and schema
- `npm run firebase:test` - Test Firebase authentication
- `npm run firebase:generate-token` - Generate development tokens

## 🔧 Technical Implementation Details

### Environment Configuration

```typescript
// Required environment variables
NODE_ENV=development
PORT=5000
SUPABASE_URL=https://project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_role_key
FIREBASE_PROJECT_ID=project_id
FIREBASE_CLIENT_EMAIL=service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Security Implementation

- **Helmet Configuration:** CSP configured to allow inline scripts for development testing interface
- **CORS Policy:** Configured for cross-origin requests with credentials support
- **Rate Limiting:** 100 requests per 15 minutes per IP address
- **Authentication:** Firebase JWT verification with fallback to custom tokens in development
- **Data Isolation:** All database queries filtered by authenticated user ID

### API Response Format

```typescript
// Success response
{
  success: true,
  data: {...},
  message: "Operation completed successfully"
}

// Error response
{
  success: false,
  error: "Error type",
  message: "Human-readable message",
  details: "Additional information"
}
```

## 🎯 Development Guidelines for Copilot

### Code Style and Patterns

- **TypeScript:** Use strict type checking and explicit type definitions
- **Async/Await:** Prefer async/await over Promises for better readability
- **Error Handling:** Always use try-catch blocks with comprehensive error responses
- **Database Queries:** Use parameterized queries and include user ID filtering
- **Authentication:** Always verify user authentication before data operations
- **Logging:** Include descriptive console.log statements for debugging

### API Development Standards

- **RESTful Design:** Follow REST conventions for endpoint naming and HTTP methods
- **User Data Isolation:** Always filter queries by authenticated user ID
- **Input Validation:** Validate all input parameters and request bodies
- **Error Responses:** Provide consistent error response format with meaningful messages
- **Documentation:** Update API_DOCUMENTATION.md for new endpoints

### Database Interaction Patterns

```typescript
// Example user-scoped query pattern
const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', user.uid)
  .order('date', { ascending: false });
```

### Testing and Debugging

- **Use Testing Interface:** Leverage the built-in `/test` interface for API testing
- **Database Scripts:** Use `scripts/test-database.js` for database connectivity testing
- **Token Generation:** Use `scripts/generate-token.js` for authentication testing
- **Environment Debugging:** Use `/api/debug` endpoint to verify environment configuration

## 📚 Documentation and Resources

**Comprehensive Documentation Available:**

- `README.md` - Complete project setup and usage guide
- `API_DOCUMENTATION.md` - Detailed API endpoint documentation with examples
- `DEPLOYMENT.md` - Production deployment guide for multiple platforms
- `database/README.md` - Database schema and setup instructions

**Key Integration Points:**

- Firebase Authentication with custom token support
- Supabase PostgreSQL with Firebase UID compatibility
- Express.js middleware stack with comprehensive security
- TypeScript with path aliases and strict type checking

## 🚀 Current Status

**Backend Status:** ✅ FULLY FUNCTIONAL

- Express.js server running successfully
- Firebase authentication working with custom tokens
- Supabase database connected with compatible schema
- All API endpoints operational and tested
- Comprehensive testing interface available
- Complete documentation provided

**Next Steps:** Ready for frontend integration or deployment to production environment

**Testing Access:**

- Server: `http://localhost:5000`
- API Testing Interface: `http://localhost:5000/test`
- Health Check: `http://localhost:5000/health`

This backend is production-ready and fully documented for seamless development and deployment.

# Money Tracker Backend - API Documentation

## Overview

This document provides detailed information about the Money Tracker Backend API endpoints, request/response formats, authentication, and usage examples.

**Base URL:** `http://localhost:5000` (development)  
**API Prefix:** `/api`  
**Authentication:** Firebase JWT tokens required for all authenticated endpoints

## Authentication

### Token Format

```
Authorization: Bearer <firebase-jwt-token>
```

### Custom Tokens (Development)

For development and testing, custom tokens are supported:

```javascript
// Custom token payload
{
  uid: "V9CA1ElEk6fmqTInjqImxeTylbz1",
  email: "test@moneytracker.com",
  name: "Test User"
}
```

### Getting Tokens

- **Development:** Use `/test` interface to generate tokens
- **Production:** Obtain from Firebase Client SDK after user login

## Endpoints

### Health & Utility

#### GET /health

Check server status and uptime.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2025-08-28T14:06:08.986Z",
  "uptime": 3600
}
```

#### GET /test

Interactive API testing interface with token generation and endpoint testing.

#### GET /api/debug

Environment configuration debugging (development only).

---

### User Management

#### GET /api/users/profile

Get the authenticated user's profile information.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "V9CA1ElEk6fmqTInjqImxeTylbz1",
    "email": "test@moneytracker.com",
    "name": "Test User",
    "created_at": "2025-08-28T14:06:08.986469+00:00"
  }
}
```

#### POST /api/users/profile

Create or update user profile.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "firebase-uid",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-08-28T14:06:08.986469+00:00"
  },
  "message": "Profile updated successfully"
}
```

---

### Transactions

#### GET /api/transactions

Get all transactions for the authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `category` (optional) - Filter by category
- `type` (optional) - Filter by type ('income' or 'expense')
- `limit` (optional) - Number of results (default: 50)
- `offset` (optional) - Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "firebase-uid",
      "amount": -50.0,
      "description": "Grocery shopping",
      "category": "Food",
      "type": "expense",
      "date": "2025-08-28T10:00:00.000Z",
      "created_at": "2025-08-28T14:06:08.986Z"
    }
  ],
  "message": "Transactions retrieved successfully"
}
```

#### POST /api/transactions

Create a new transaction.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 50.0,
  "description": "Grocery shopping",
  "category": "Food",
  "type": "expense",
  "date": "2025-08-28T10:00:00.000Z"
}
```

**Validation Rules:**

- `amount`: Required, positive number
- `description`: Required, string (max 500 chars)
- `category`: Required, string (max 100 chars)
- `type`: Required, either 'income' or 'expense'
- `date`: Optional, ISO date string (defaults to now)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "firebase-uid",
    "amount": -50.0,
    "description": "Grocery shopping",
    "category": "Food",
    "type": "expense",
    "date": "2025-08-28T10:00:00.000Z",
    "created_at": "2025-08-28T14:06:08.986Z"
  },
  "message": "Transaction created successfully"
}
```

#### PUT /api/transactions/:id

Update an existing transaction.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 75.0,
  "description": "Updated grocery shopping",
  "category": "Food",
  "type": "expense"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "amount": -75.0,
    "description": "Updated grocery shopping",
    "category": "Food",
    "type": "expense",
    "updated_at": "2025-08-28T15:00:00.000Z"
  },
  "message": "Transaction updated successfully"
}
```

#### DELETE /api/transactions/:id

Delete a transaction.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

---

### Budget Categories

#### GET /api/budget-categories

Get all budget categories for the authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "firebase-uid",
      "name": "Food & Dining",
      "color": "#FF6B6B",
      "created_at": "2025-08-28T14:06:08.986Z"
    }
  ]
}
```

#### POST /api/budget-categories

Create a new budget category.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Entertainment",
  "color": "#4ECDC4"
}
```

**Validation Rules:**

- `name`: Required, string (max 100 chars)
- `color`: Required, hex color code

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "firebase-uid",
    "name": "Entertainment",
    "color": "#4ECDC4",
    "created_at": "2025-08-28T14:06:08.986Z"
  },
  "message": "Category created successfully"
}
```

---

### Budgets

#### GET /api/budgets

Get all budgets for the authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "firebase-uid",
      "category_id": "456e7890-e89b-12d3-a456-426614174000",
      "amount": 500.0,
      "period": "monthly",
      "start_date": "2025-08-01",
      "end_date": "2025-08-31",
      "created_at": "2025-08-28T14:06:08.986Z"
    }
  ]
}
```

#### POST /api/budgets

Create a new budget.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "category_id": "456e7890-e89b-12d3-a456-426614174000",
  "amount": 500.0,
  "period": "monthly",
  "start_date": "2025-08-01",
  "end_date": "2025-08-31"
}
```

**Validation Rules:**

- `category_id`: Required, valid UUID of existing category
- `amount`: Required, positive number
- `period`: Required, one of: 'weekly', 'monthly', 'yearly'
- `start_date`: Required, date string
- `end_date`: Required, date string (must be after start_date)

---

### Savings Goals

#### GET /api/savings

Get all savings goals for the authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "firebase-uid",
      "name": "Emergency Fund",
      "target_amount": 10000.0,
      "current_amount": 2500.0,
      "target_date": "2025-12-31",
      "created_at": "2025-08-28T14:06:08.986Z"
    }
  ]
}
```

#### POST /api/savings

Create a new savings goal.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Vacation Fund",
  "target_amount": 5000.0,
  "current_amount": 0.0,
  "target_date": "2025-12-31"
}
```

**Validation Rules:**

- `name`: Required, string (max 200 chars)
- `target_amount`: Required, positive number
- `current_amount`: Optional, non-negative number (default: 0)
- `target_date`: Optional, date string

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": "Additional error information"
}
```

### Common Error Codes

- **400 Bad Request** - Invalid request data or parameters
- **401 Unauthorized** - Missing or invalid authentication token
- **403 Forbidden** - User doesn't have permission for the resource
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Resource already exists or conflict with current state
- **422 Unprocessable Entity** - Validation errors
- **500 Internal Server Error** - Server error

### Example Error Responses

**Authentication Error:**

```json
{
  "success": false,
  "error": "Authentication failed",
  "message": "Invalid or expired token",
  "details": "Token verification failed"
}
```

**Validation Error:**

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Invalid request data",
  "details": {
    "amount": "Amount must be a positive number",
    "category": "Category is required"
  }
}
```

**Resource Not Found:**

```json
{
  "success": false,
  "error": "Not found",
  "message": "Transaction not found",
  "details": "Transaction with ID 123 doesn't exist or doesn't belong to user"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Default:** 100 requests per 15 minutes per IP
- **Authentication endpoints:** 20 requests per 15 minutes per IP
- **Headers included in response:**
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

When rate limit is exceeded:

```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Rate limit exceeded. Try again in 15 minutes.",
  "details": "100 requests per 15 minutes limit reached"
}
```

---

## Development Testing

### Using the Test Interface

1. Navigate to `http://localhost:5000/test`
2. Generate a test token
3. Use the interactive interface to test endpoints
4. Monitor responses in real-time

### Using cURL Examples

**Generate Token:**

```bash
curl -X GET http://localhost:5000/test
# Copy token from response
```

**Get User Profile:**

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create Transaction:**

```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "description": "Test transaction",
    "category": "Food",
    "type": "expense"
  }'
```

### Database Testing Scripts

```bash
# Test database connectivity
npm run db:test

# Create test user in database
node scripts/create-supabase-user.js

# Test Firebase authentication
npm run firebase:test

# Generate development token
npm run firebase:generate-token
```

---

## Security Considerations

### Authentication

- Always use HTTPS in production
- Tokens should be stored securely on client-side
- Implement proper token refresh logic
- Validate tokens on every request

### Data Access

- Users can only access their own data
- All database queries include user ID filtering
- Foreign key constraints ensure data integrity

### Input Validation

- All input is validated before processing
- SQL injection protection through parameterized queries
- XSS protection through output encoding

### Rate Limiting

- Prevents brute force attacks
- Configurable per endpoint
- IP-based tracking

---

## Frontend Integration

### Token Management

```javascript
// Store token after Firebase login
const token = await firebase.auth().currentUser.getIdToken();
localStorage.setItem('authToken', token);

// Include in API requests
const response = await fetch('/api/transactions', {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

### API Client Example

```javascript
class MoneyTrackerAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    return await response.json();
  }

  // Transactions
  async getTransactions(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/transactions?${params}`);
  }

  async createTransaction(data) {
    return this.request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
```

---

This documentation covers all available endpoints and their usage. For additional help, refer to the interactive testing interface at `/test` or check the server logs for debugging information.

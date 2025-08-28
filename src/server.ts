import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Import routes
import transactionRoutes from './routes/transactions';
import budgetRoutes from './routes/budgets';
import savingsRoutes from './routes/savings';
import userRoutes from './routes/users';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('🔧 Environment Variables Debug:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        'script-src': ["'self'", "'unsafe-inline'"], // Allow inline scripts for development
        'script-src-attr': ["'unsafe-inline'"], // Allow inline event handlers
      },
    },
  })
);
app.use(
  cors({
    origin: true, // Allow all origins for testing
    credentials: true,
  })
);
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Serve test page
app.get('/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Money Tracker API Test</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            button { padding: 10px 20px; margin: 10px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #005a8b; }
            .result { background: #f0f0f0; padding: 15px; margin: 10px 0; border-radius: 4px; white-space: pre-wrap; font-family: monospace; }
            .success { background: #d4edda; border-left: 4px solid #28a745; }
            .error { background: #f8d7da; border-left: 4px solid #dc3545; }
            input, textarea { width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏦 Money Tracker API Test</h1>
            
            <h2>Authentication Token</h2>
            <textarea id="token" rows="3">eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTc1NjA1NDYxMywiZXhwIjoxNzU2MDU4MjEzLCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1mYnN2Y0Btb25leS10cmFja2VyLWRhZmMyLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiZmlyZWJhc2UtYWRtaW5zZGstZmJzdmNAbW9uZXktdHJhY2tlci1kYWZjMi5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVpZCI6IlY5Q0ExRWxFazZmbXFUSW5qcUlteGVUeWxiejEiLCJjbGFpbXMiOnsiZW1haWwiOiJ0ZXN0QG1vbmV5dHJhY2tlci5jb20iLCJyb2xlIjoidXNlciJ9fQ.tUeMFgJ3R2LKhqIzWy7G49LBmofxOmZrpTtZNDSfdKYAIS_M-iG6QNXFTYcfB4BDs2f7QRqx8f9rKZoQaIOFVtGYn48QFRYguMhJrqUlMpTWlW4Dq23B5eoYn9ba1qU6ONmaQxd-csPTBX5lLVUpy9lkB1ZWAXZk1s7KAQBuoxINATPvGwWRxrrWOWc_8m_yHXwxR8_sLX4ZPkTM2ZV3fdB2Ikwkq1lrPyGqF_JfcLgHLwi8GkTrIVBi5LyUkArKViArnf_xzMSYFp-MsMEcPtWs9WvrWBnkFgO88v3oOe2K-0DvN4zoZ9EO7N-tJtVZ15KzyLTVfNCW9e_4Nz4XgA</textarea>
            
            <h2>Quick Tests</h2>
            <button onclick="testHealth()">Test Health Check</button>
            <button onclick="testTransactions()">Test Transactions (Protected)</button>
            <button onclick="testBudgets()">Test Budgets (Protected)</button>
            
            <h2>Create Test Data</h2>
            <button onclick="createTransaction()">Create Sample Transaction</button>
            
            <div id="results" class="result" style="display:none;">Results will appear here...</div>
        </div>

        <script>
            console.log('Test page JavaScript loaded');
            
            function showResult(data, isSuccess = true) {
                console.log('showResult called with:', { data, isSuccess });
                const results = document.getElementById('results');
                if (!results) {
                    console.error('Results element not found!');
                    return;
                }
                results.style.display = 'block';
                results.className = isSuccess ? 'result success' : 'result error';
                results.textContent = JSON.stringify(data, null, 2);
            }

            async function makeRequest(url, options = {}) {
                console.log('Making request to:', url, 'with options:', options);
                try {
                    const token = document.getElementById('token').value.trim();
                    const headers = { 'Content-Type': 'application/json' };
                    
                    if (token && !url.includes('/health')) {
                        headers['Authorization'] = \`Bearer \${token}\`;
                        console.log('Added authorization header');
                    }
                    
                    console.log('Fetch request:', { url, options, headers });
                    
                    const response = await fetch(url, {
                        ...options,
                        headers: { ...headers, ...options.headers }
                    });
                    
                    console.log('Response received:', { status: response.status, ok: response.ok });
                    
                    const data = await response.json();
                    console.log('Response data:', data);
                    
                    showResult({ status: response.status, data }, response.ok);
                } catch (error) {
                    console.error('Request failed:', error);
                    showResult({ error: error.message }, false);
                }
            }

            function testHealth() {
                console.log('Testing health endpoint');
                makeRequest('/health');
            }

            function testTransactions() {
                console.log('Testing transactions endpoint');
                makeRequest('/api/transactions');
            }

            function testBudgets() {
                console.log('Testing budgets endpoint');
                makeRequest('/api/budgets');
            }

            function createTransaction() {
                console.log('Creating sample transaction');
                makeRequest('/api/transactions', {
                    method: 'POST',
                    body: JSON.stringify({
                        type: 'expense',
                        amount: 25.50,
                        description: 'Test coffee purchase',
                        date: new Date().toISOString().split('T')[0]
                    })
                });
            }
            
            // Test if DOM is ready
            document.addEventListener('DOMContentLoaded', function() {
                console.log('DOM fully loaded');
                const tokenElement = document.getElementById('token');
                const resultsElement = document.getElementById('results');
                console.log('Token element found:', !!tokenElement);
                console.log('Results element found:', !!resultsElement);
            });
        </script>
    </body>
    </html>
  `);
});

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// API routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Money Tracker Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

import express from 'express';

const app = express();
const PORT = 5001; // Different port to avoid conflicts

console.log('Starting server setup...');

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Server is running!',
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server successfully started on port ${PORT}`);
  console.log(`📡 Test it: curl http://localhost:${PORT}/health`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

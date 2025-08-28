const http = require('http');

console.log('Starting robust server...');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  const response = {
    success: true,
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    headers: req.headers,
  };

  res.end(JSON.stringify(response, null, 2));
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.log('Port is already in use. Trying different port...');
    server.listen(5003);
  }
});

// Start server on multiple attempts
const startServer = (port = 5002) => {
  server.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on ALL interfaces:`);
    console.log(`   🌐 http://localhost:${port}`);
    console.log(`   🌐 http://127.0.0.1:${port}`);
    console.log(`   🌐 http://0.0.0.0:${port}`);
    console.log(`📡 Test with: curl http://localhost:${port}/health`);
    console.log('🔄 Server is running... Press Ctrl+C to stop');

    // Keep alive
    setInterval(() => {
      console.log(`💓 Server heartbeat - ${new Date().toISOString()}`);
    }, 30000);
  });
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('💀 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('💀 Server closed');
    process.exit(0);
  });
});

// Prevent crash on uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.log('🔄 Server continuing to run...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('🔄 Server continuing to run...');
});

console.log('🎯 Server setup complete. Waiting for connections...');

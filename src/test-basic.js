console.log('Node.js is working!');
console.log('Process version:', process.version);
console.log('Current working directory:', process.cwd());

// Test basic HTTP server
const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Request received:', req.url);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      message: 'Basic HTTP server is working!',
      url: req.url,
      timestamp: new Date().toISOString(),
    })
  );
});

server.listen(5002, '127.0.0.1', (err) => {
  if (err) {
    console.error('Server error:', err);
  } else {
    console.log('🚀 HTTP server running on http://127.0.0.1:5002');
    console.log('   Also try: http://localhost:5002');
    console.log('   Keep this terminal open!');
  }
});

server.on('error', (error) => {
  console.error('Server error event:', error);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

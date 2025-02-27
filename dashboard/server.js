const express = require('express');
require('dotenv').config();
const path = require('path');
const httpProxy = require('http-proxy');

const app = express();
const PORT = process.env.PORT || 3001;

// Determine which API mode to use based on environment variables
const useInternalApi = process.env.VITE_USE_INTERNAL_API === 'true';
const externalApiBase = process.env.VITE_EXTERNAL_API_BASE;
const internalApiBase = process.env.VITE_INTERNAL_API_BASE;
const targetUrl = useInternalApi ? internalApiBase : externalApiBase;
// Create a proxy server instance
const apiProxy = httpProxy.createProxyServer();

// Proxy all requests starting with /api to the appropriate backend
app.use('/api', (req, res) => {
  apiProxy.web(req, res, { target: targetUrl }, (error) => {
    console.error('Proxy error:', error);
    res.status(500).send('Proxy error');
  });
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// For all other routes, serve the index.html (useful for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`api url : ${targetUrl}`)
});

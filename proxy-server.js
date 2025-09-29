const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PROXY_PORT ? parseInt(process.env.PROXY_PORT, 10) : 3001;
const TARGET = process.env.OPENSEARCH_URL || 'http://localhost:9200';
const ALLOW_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const BASIC_AUTH_USER = process.env.OPENSEARCH_USERNAME;
const BASIC_AUTH_PASS = process.env.OPENSEARCH_PASSWORD;

// Enable CORS for all routes
app.use(cors({
  origin: ALLOW_ORIGIN,
  credentials: true
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Proxy all requests to OpenSearch
app.use('/', createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    if (BASIC_AUTH_USER && BASIC_AUTH_PASS) {
      const auth = Buffer.from(`${BASIC_AUTH_USER}:${BASIC_AUTH_PASS}`).toString('base64');
      proxyReq.setHeader('Authorization', `Basic ${auth}`);
    }
    console.log(`Proxying ${req.method} ${req.url} to ${TARGET}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error: ' + err.message });
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`OpenSearch responded with status: ${proxyRes.statusCode}`);
  }
}));

app.listen(PORT, () => {
  console.log(`🚀 OpenSearch proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to OpenSearch at ${TARGET}`);
  console.log(`🌐 CORS enabled for ${ALLOW_ORIGIN}`);
  console.log(`\n✅ Ready to handle requests!`);
});
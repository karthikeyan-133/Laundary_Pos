const express = require("express");
const cors = require("cors");

const app = express();

// Allow your frontend domain
app.use(
  cors({
    origin: "https://pos-laundry-tau.vercel.app", // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Example test route
app.get("/api/test", (req, res) => {
  res.json({ message: "CORS is working!" });
});

module.exports = app;

const port = 3001;

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    console.log('Origin:', origin);
    // Allow all origins for testing
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Explicit CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  next();
});

app.options('*', (req, res) => {
  console.log('OPTIONS request received');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.sendStatus(200);
});

app.get('/test', (req, res) => {
  console.log('GET /test request received');
  res.json({ message: 'CORS test successful' });
});

app.listen(port, () => {
  console.log(`CORS test server running at http://localhost:${port}`);
});
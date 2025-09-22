const express = require('express');
const { router: authRouter } = require('./auth');

const app = express();
const PORT = 3006; // Changed from 3005 to 3006

app.use(express.json());
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Test server for authentication' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
});
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const morgan = require('morgan');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-prod';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// In-memory user store (replace with DB in production)
const users = [];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service', hostname: os.hostname() });
});

/**
 * POST /register
 * Register a new user
 * Body: { username, password }
 */
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    console.log(`[AUTH] New user registered: ${username}`);

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, username: newUser.username },
      served_by: os.hostname(),
    });
  } catch (err) {
    console.error('[AUTH] Register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /login
 * Authenticate a user and return a JWT
 * Body: { username, password }
 */
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find the user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password with hash
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Sign a JWT token valid for 24 hours
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`[AUTH] User logged in: ${username}`);

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username },
      served_by: os.hostname(),
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`[AUTH] Auth Service running on port ${PORT} | Hostname: ${os.hostname()}`);
});

// backend/index.js

require('dotenv').config();                // Load .env variables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');          // For hashing passwords
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// --- Middleware Setup ---
app.use(cors());                           // Enable CORS (cross-origin requests)
app.use(bodyParser.json());                // Parse JSON bodies

// --- Health Check Route ---
app.get('/', (req, res) => {
  res.json({ status: 'Connect Fitness API is running' });
});

// --- Registration Endpoint ---
// Creates a new Coach account
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Validate inputs
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  try {
    // 2. Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the coach in the database
    const coach = await prisma.coach.create({
      data: { name, email, password: hashedPassword },
    });

    // 4. Respond with the new coach ID
    res.status(201).json({ coachId: coach.id, email: coach.email });
  } catch (err) {
    // Handle unique email violation
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Login Endpoint ---
// Authenticates a coach and returns a JWT
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate inputs
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    // 2. Find the coach by email
    const coach = await prisma.coach.findUnique({ where: { email } });
    if (!coach) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Compare hashed password
    const valid = await bcrypt.compare(password, coach.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 4. Generate a JWT (valid for 2 hours)
    const token = jwt.sign({ coachId: coach.id, email: coach.email }, JWT_SECRET, {
      expiresIn: '2h',
    });

    // 5. Send token back to client
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

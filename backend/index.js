// backend/index.js

require('dotenv').config();                // 1. Load .env variables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

// <<< NEW >>>  — import the AI Workout router
const aiWorkout = require('./routes/aiWorkout');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- Mount AI routes (must come before auth middleware that might block them if public) ---
app.use('/api/ai/workouts', aiWorkout);

// --- Auth Middleware ---
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.coach = { id: payload.coachId, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// --- Health Check ---
app.get('/', (req, res) => {
  res.json({ status: 'Connect Fitness API is running' });
});

// --- Registration Endpoint ---
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const coach = await prisma.coach.create({
      data: { name, email, password: hashedPassword },
    });
    res.status(201).json({ coachId: coach.id, email: coach.email });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Login Endpoint ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  try {
    const coach = await prisma.coach.findUnique({ where: { email } });
    if (!coach) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, coach.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { coachId: coach.id, email: coach.email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Create Client Endpoint ---
app.post('/api/clients', authenticate, async (req, res) => {
  const { id: coachId } = req.coach;
  const { name, email, phone } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' });
  }
  try {
    const client = await prisma.client.create({
      data: { coachId, name, email, phone }
    });
    res.status(201).json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// --- Get All Clients Endpoint ---
app.get('/api/clients', authenticate, async (req, res) => {
  const { id: coachId } = req.coach;
  try {
    const clients = await prisma.client.findMany({
      where: { coachId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// --- Create WorkoutPlan Endpoint ---
app.post('/api/workout-plans', authenticate, async (req, res) => {
  const { id: coachId } = req.coach;
  const { clientId, day, planName, exercises } = req.body;
  if (!clientId || !day || !planName || !exercises) {
    return res.status(400).json({
      error: 'clientId, day, planName, and exercises are required'
    });
  }
  try {
    const newPlan = await prisma.workoutPlan.create({
      data: {
        coachId,
        clientId,
        day: new Date(day),
        planName,
        exercises
      },
    });
    res.status(201).json(newPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create workout plan' });
  }
});

// --- Get All WorkoutPlans Endpoint ---
app.get('/api/workout-plans', authenticate, async (req, res) => {
  const { id: coachId } = req.coach;
  try {
    const plans = await prisma.workoutPlan.findMany({
      where: { coachId },
      orderBy: { day: 'asc' },
    });
    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch workout plans' });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

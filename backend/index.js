// backend/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-here';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health-check route
app.get('/', (req, res) => {
  res.json({ status: 'Connect Fitness API is running' });
});

// TODO: we’ll add auth and other routes here soon

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

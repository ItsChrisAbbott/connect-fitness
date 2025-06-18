// backend/ai/openai.js  (CommonJS)

require('dotenv').config();          // load .env variables
const OpenAI = require('openai');    // use require, not import

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = { openai };         // export for require()

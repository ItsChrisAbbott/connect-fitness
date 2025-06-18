// backend/routes/aiWorkout.js  (CommonJS)

const express = require('express');
const { openai } = require('../ai/openai');
const { PrismaClient } = require('@prisma/client');
const JSON5 = require('json5');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/ai/workouts/generate
 * Body: { goal, equipment, daysPerWeek, clientId, coachId }
 */
router.post('/generate', async (req, res) => {
  const { goal, equipment, daysPerWeek, clientId, coachId } = req.body;

  // Basic validation
  if (!goal || !equipment || !daysPerWeek || !clientId || !coachId) {
    return res.status(400).json({ error: 'missing fields' });
  }

  try {
    // ---------- GPT prompt ----------
    const prompt = `
You are an elite strength coach.
Create a ${daysPerWeek}-day workout program for a client whose goal is "${goal}".
Equipment: ${equipment}.
Return ONLY valid JSON5 — no markdown fences.

{
  "days": [
    {
      "title": "Day 1 – Upper Push",
      "exercises": [
        { "name": "Dumbbell Bench Press", "sets": 4, "reps": 8-10, "rest": 90 }
      ]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',         // fallback to 'gpt-4o' if needed
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    // ---------- Safe JSON5 parsing ----------
    const raw      = completion.choices[0].message.content.trim();
    const jsonSlice = raw.substring(raw.indexOf('{'), raw.lastIndexOf('}') + 1);

    // Replace curly quotes with straight quotes
    const cleaned = jsonSlice
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'");

    let plan;
    try {
      plan = JSON5.parse(cleaned);
    } catch (e) {
      console.error('JSON5 parse error. GPT output:\n', raw);
      return res.status(500).json({ error: 'Bad JSON from GPT' });
    }

    // ---------- Persist each day ----------
    const savedPlans = await Promise.all(
      plan.days.map((d, idx) =>
        prisma.workoutPlan.create({
          data: {
            coachId,
            clientId,
            day: new Date(Date.now() + idx * 86_400_000), // idx days ahead
            planName: d.title,
            exercises: d.exercises,
          },
        })
      )
    );

    res.json({ ok: true, plans: savedPlans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

module.exports = router;

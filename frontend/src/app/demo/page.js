'use client';

import { useState } from 'react';

export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans]   = useState([]);

  const generate = async () => {
    setLoading(true);
    const res = await fetch('/apiProxy/ai/workouts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal: 'hypertrophy',
        equipment: 'dumbbells',
        daysPerWeek: 3,
        coachId: 1,
        clientId: 1,
      }),
    });
    const data = await res.json();
    setPlans(data.plans || []);
    setLoading(false);
  };

  return (
    <main className="p-8 max-w-xl mx-auto space-y-6">
      <button
        onClick={generate}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Generating…' : 'Generate Workout'}
      </button>

      {plans.map((p) => (
        <div key={p.id} className="border rounded p-4">
          <h3 className="font-bold mb-2">{p.planName}</h3>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(p.exercises, null, 2)}
          </pre>
        </div>
      ))}
    </main>
  );
}

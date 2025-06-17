"use client";

import { useState, useEffect } from "react";
import api from "../../utils/api";

export default function WorkoutPlansPage() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    clientId: "",
    day: "",
    planName: "",
    exercises: [{ name: "", sets: 1, reps: 1, rest: 60, videoUrl: "", notes: "" }],
  });
  const [loading, setLoading] = useState(false);

  // Fetch existing plans
  useEffect(() => {
    api.get("/workout-plans")
      .then(res => setPlans(res.data))
      .catch(err => console.error("Failed to fetch plans", err));
  }, []);

  // Handle form input changes
  const handleChange = (e, idx, field) => {
    if (["name", "sets", "reps", "rest", "videoUrl", "notes"].includes(field)) {
      const exercises = [...form.exercises];
      exercises[idx][field] = e.target.value;
      setForm({ ...form, exercises });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // Add another exercise row
  const addExercise = () => {
    setForm({
      ...form,
      exercises: [
        ...form.exercises,
        { name: "", sets: 1, reps: 1, rest: 60, videoUrl: "", notes: "" },
      ],
    });
  };

  // Submit new plan
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { clientId, day, planName, exercises } = form;
    if (!clientId || !day || !planName) return alert("Client, date, and name required");
    setLoading(true);
    try {
      const { data } = await api.post("/workout-plans", {
        clientId: Number(clientId),
        day,
        planName,
        exercises,
      });
      setPlans([data, ...plans]);
      // reset form
      setForm({
        clientId: "",
        day: "",
        planName: "",
        exercises: [{ name: "", sets: 1, reps: 1, rest: 60, videoUrl: "", notes: "" }],
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data.error || "Failed to add plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Workout Plans</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="block mb-1">Client ID*</label>
          <input
            name="clientId"
            value={form.clientId}
            onChange={handleChange}
            className="border p-2 rounded w-32"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Date*</label>
          <input
            name="day"
            type="date"
            value={form.day}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Plan Name*</label>
          <input
            name="planName"
            value={form.planName}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <h2 className="text-xl font-semibold mt-4">Exercises</h2>
        {form.exercises.map((ex, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-4 border p-4 rounded">
            <input
              placeholder="Name"
              value={ex.name}
              onChange={(e) => handleChange(e, idx, "name")}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="Sets"
              value={ex.sets}
              onChange={(e) => handleChange(e, idx, "sets")}
              className="border p-2 rounded"
              min={1}
            />
            <input
              type="number"
              placeholder="Reps"
              value={ex.reps}
              onChange={(e) => handleChange(e, idx, "reps")}
              className="border p-2 rounded"
              min={1}
            />
            <input
              type="number"
              placeholder="Rest (sec)"
              value={ex.rest}
              onChange={(e) => handleChange(e, idx, "rest")}
              className="border p-2 rounded"
              min={0}
            />
            <input
              placeholder="Video URL"
              value={ex.videoUrl}
              onChange={(e) => handleChange(e, idx, "videoUrl")}
              className="border p-2 rounded"
            />
            <input
              placeholder="Notes"
              value={ex.notes}
              onChange={(e) => handleChange(e, idx, "notes")}
              className="border p-2 rounded"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addExercise}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          + Add Exercise
        </button>

        <br />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Adding..." : "Create Plan"}
        </button>
      </form>

      {plans.length === 0 ? (
        <p>No workout plans yet. Use the form above to add one.</p>
      ) : (
        <ul className="space-y-2">
          {plans.map((p) => (
            <li key={p.id} className="border p-4 rounded shadow-sm">
              <div className="font-semibold">{p.planName}</div>
              <div className="text-sm text-gray-600">
                Client #{p.clientId} — {new Date(p.day).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

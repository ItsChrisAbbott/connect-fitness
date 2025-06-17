// src/app/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import api from "../../utils/api";
import Link from "next/link";

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    // Fetch clients and workout plans when the component mounts
    api.get("/clients")
      .then(res => setClients(res.data))
      .catch(err => console.error("Failed to fetch clients", err));
    api.get("/workout-plans")
      .then(res => setPlans(res.data))
      .catch(err => console.error("Failed to fetch plans", err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Coach Dashboard</h1>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl">Your Clients</h2>
          <Link href="/clients">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Manage Clients
            </button>
          </Link>
        </div>
        {clients.length === 0 ? (
          <p>No clients yet. Go add your first client!</p>
        ) : (
          <ul className="space-y-2">
            {clients.map(client => (
              <li
                key={client.id}
                className="border p-4 rounded hover:shadow"
              >
                {client.name} (ID: {client.id})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl">Workout Plans</h2>
          <Link href="/workout-plans">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Manage Plans
            </button>
          </Link>
        </div>
        {plans.length === 0 ? (
          <p>No workout plans created yet.</p>
        ) : (
          <ul className="space-y-2">
            {plans.map(plan => (
              <li
                key={plan.id}
                className="border p-4 rounded hover:shadow"
              >
                <strong>{plan.planName}</strong> — Client #{plan.clientId} on{" "}
                {new Date(plan.day).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

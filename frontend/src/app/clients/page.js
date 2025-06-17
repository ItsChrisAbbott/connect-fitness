"use client";

import { useState, useEffect } from "react";
import api from "../../utils/api";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);

  // Fetch clients on mount
  useEffect(() => {
    api.get("/clients")
      .then(res => setClients(res.data))
      .catch(err => console.error("Failed to fetch clients", err));
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create a new client
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, phone } = form;
    if (!name || !phone) return alert("Name and phone are required");

    setLoading(true);
    try {
      const { data } = await api.post("/clients", form);
      setClients([data, ...clients]);  // Prepend new client
      setForm({ name: "", email: "", phone: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data.error || "Failed to add client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Your Clients</h1>

      <form onSubmit={handleSubmit} className="mb-6 space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Name*</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Phone*</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Client"}
        </button>
      </form>

      {clients.length === 0 ? (
        <p>No clients yet. Use the form above to add one.</p>
      ) : (
        <ul className="space-y-2">
          {clients.map((c) => (
            <li key={c.id} className="border p-4 rounded shadow-sm">
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-gray-600">{c.email}</div>
              <div className="text-sm text-gray-600">{c.phone}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

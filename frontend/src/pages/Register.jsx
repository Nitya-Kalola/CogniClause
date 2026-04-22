// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";

let supabase;
try {
  supabase = require("../supabaseClient").default;
} catch (e) {
  supabase = null;
}

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (supabase && supabase.auth) {
        const { error } = await supabase.auth.signUp({ email, password: pw });
        if (error) throw error;
      } else {
        console.warn("supabase not found — demo mode");
      }
      navigate("/login");
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <GlassCard className="max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2">Create your account</h2>
        <p className="text-sm text-slate-600 mb-4">Start analyzing contracts with your team.</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
            className="w-full p-3 rounded-lg bg-white/8 border border-white/8"
          />
          <input
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            type="password"
            required
            className="w-full p-3 rounded-lg bg-white/8 border border-white/8"
          />
          {error && <div className="text-rose-600 text-sm">{error}</div>}
          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-lg bg-indigo-600 text-white" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </button>
            <button type="button" onClick={() => navigate("/login")} className="px-4 py-3 border rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

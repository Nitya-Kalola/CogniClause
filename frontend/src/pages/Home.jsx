// src/pages/Home.jsx
import React from "react";
import { useNavigate, } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import useSupabaseSession from "../hooks/useSupabaseSession";
import AISphere from "../components/AISphere";
import FloatingCategories from "../components/FloatingCategories";
import ParticleBackground from "../components/ParticleBackground";
import BackgroundLayer from "../components/BackgroundLayer";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion"; 
import { useState, useEffect } from "react";
import { useRef } from "react";


export default function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlight, setHighlight] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const loginRef = useRef(null);

  useEffect(() => {
  if (window.location.hash === "#login") {
    loginRef.current?.scrollIntoView({ behavior: "smooth" });
    setHighlight(true);

    setTimeout(() => setHighlight(false), 2000);
  }
}, []);

  const handleEmailLogin = async () => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      return;
    }
    navigate("/evaluate");
  };
  const session = useSupabaseSession();
  const user = session?.user ?? null;

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const handleGithubLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "github",
  });
};

const focusLogin = () => {
  if (loginRef.current) {
    loginRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    // add glow class temporarily
    loginRef.current.classList.add("login-highlight");

    setTimeout(() => {
      loginRef.current.classList.remove("login-highlight");
    }, 2000);
  }
};

  return (
    // The single source of truth for the background color
    <main
      className="select-none relative min-h-screen w-full overflow-hidden "
    >
      
      <div className="fixed inset-0 z-0">
        <ParticleBackground />
      </div>
      
      {/* 1. THE 3D WORLD (Fixed and Fullscreen) */}
      <div className="fixed inset-0 z-0">
        {!isMobile && (
          <div className="fixed inset-0 z-0">
            <AISphere />
          </div>
        )}
      </div>

      {/* 2. THE DECORATIVE NODES */}
      <div className="fixed inset-0 z-[5] pointer-events-none">
        <FloatingCategories />
      </div>

      {/* 3. THE INTERACTIVE UI (The 'Ghost' Layer) */}
      {/* pointer-events-none here allows the 3D square to be 'grabbable' anywhere */}
        <div className="relative z-10 min-h-screen w-full flex items-center pointer-events-none">
        <div className="w-full h-full px-5 sm:px-8 md:px-12 lg:px-24 
        grid grid-cols-1 lg:grid-cols-2 
        gap-8 lg:gap-20 items-center">          
          {/* Content (pointer-events-auto restores clicks for buttons) */}
          <section className="space-y-10 pointer-events-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[120px] leading-tight font-black text-[var(--text-primary)] tracking-tight">
                Cogni<span className="text-blue-600">Clause</span>
            </h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-sm font-light leading-relaxed">
              Neural contract decomposition. <br/>
              <span className="text-[var(--text-secondary)]">Built for the next era of legal intelligence.</span>
            </p>
            {/* --------- FEATURE STRIP --------- */}

            <button 
              onClick={() => {
                if (!user) {
                  focusLogin();
                } else {
                  navigate("/evaluate");
                }
              }}
              className="group relative px-6 py-3 md:px-10 md:py-5 bg-blue-600 text-white font-bold rounded-full 
              transition-all duration-300 hover:scale-105 active:scale-95 
              shadow-[0_0_40px_rgba(37,99,235,0.35)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)]"
            >
              Start Analysis
            </button>
            
          </section>

          {/* Login Card */}
          <aside className="flex justify-center lg:justify-end pointer-events-auto">
            {!user && (

              

              <div
                  ref={loginRef}
                  className="w-full max-w-[420px] p-7 rounded-3xl backdrop-blur-2xl relative overflow-hidden
                  transition-all duration-500 md:hover:-translate-y-2 md:hover:scale-[1.01]"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "var(--card-shadow)"
                  }}
                >
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back</h2>
                      <p className="text-sm text-[var(--text-secondary)] ">Log in to view history & evaluations</p>

                      <div className="space-y-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full rounded-xl p-3 bg-white/10 backdrop-blur-md
                              border border-[var(--border-subtle)]
                              hover:border-blue-500 focus:border-blue-500 outline-none
                              text-[var(--text-primary)]"
                          />

                        <div className="relative mb-6">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Password"
                    className="w-full rounded-xl p-3 bg-white/10 backdrop-blur-md
                  border border-[var(--border-subtle)]
                  hover:border-blue-500 focus:border-blue-500 outline-none
                  text-[var(--text-primary)]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    className="absolute right-4 top-3 cursor-pointer select-none text-[var(--text-secondary)]"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? "Hide" : "Show"}
                  </span>
                </div>

                </div>

                <div className="flex gap-3">
                  <button
                      onClick={handleEmailLogin}
                      className="glass-card flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 hover:text-white text-[var(--text-primary)] rounded-lg"
                    >
                      Sign in
                    </button>

                  <button
                    onClick={() => navigate("/register")}
                    className="glass-card  bg-indigo-500 hover:bg-indigo-600 hover:text-white text-[var(--text-primary)] px-4 py-2 border rounded-lg"
                  >
                    Register
                  </button>
                </div>

                <div className="pt-2 text-sm text-slate-500">Or try social sign in</div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={handleGoogleLogin}
                    className="glass-card flex-1 py-2 rounded-lg border  bg-indigo-500 hover:bg-indigo-600 hover:text-white flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaGoogle className="text-sm hover:text-[var(--text-primary)]" />
                    <span className="text-[var(--text-primary) hover:text-[var(--text-primary)]">Google</span>
                  </button>

                  <button
                    onClick={handleGithubLogin}
                    className="glass-card flex-1 py-2 rounded-lg border bg-indigo-500 hover:bg-indigo-600 hover:text-white flex items-center justify-center gap-2 transition-colors"
                  >
                    <FaGithub className="text-lg hover:text-[var(--text-primary)" />
                    <span className="text-[var(--text-primary) hover:text-[var(--text-primary)]">GitHub</span>
                  </button>
                </div>
              </div>

            </div>


)}
          </aside>
        </div>

      </div>
              <section className="relative z-10 px-10 lg:px-24 py-24 pointer-events-auto">
  <h2 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] mb-10">
    How It Works
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
    {[
      "Upload or paste contract",
      "AI decomposes into clauses",
      "Risk & similarity scoring",
      "Receive optimization insights"
    ].map((step, i) => (
      <div
        key={i}
        className="p-5 rounded-xl bg-white/5 border border-[var(--border-subtle)]"
      >
        <div className="text-blue-500 font-bold text-lg mb-2">
          0{i + 1}
        </div>
        <p className="text-[var(--text-secondary)] text-sm">{step}</p>
      </div>
    ))}
  </div>
</section>

<section className="relative z-10 px-10 lg:px-24 pb-24 pointer-events-auto text-center">
  <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
    Understand Contracts. Make Better Decisions.
  </h2>

  <p className="text-[var(--text-secondary)] mb-8">
    Move beyond reading contracts — start interpreting them.
  </p>

  <div className="flex justify-center gap-4">
    
    <button
      onClick={() => navigate("/about")}
      className="px-6 py-3 border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)]"
    >
      About System
    </button>
  </div>
</section>
    </main>
  );
}

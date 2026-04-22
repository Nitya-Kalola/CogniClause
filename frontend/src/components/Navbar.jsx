// Navbar.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { LogOut, FileText, Clock, Home as HomeIcon } from "lucide-react";
import { Wand2 } from "lucide-react"; // optional icon (clean)

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);      
    navigate("/login");
  };
  const handleLoginClick = () => {
  if (!user) {
    navigate("/#login");
  }
};

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

const [theme, setTheme] = useState("dark");

useEffect(() => {
  const saved = localStorage.getItem("theme") || "dark";
  setTheme(saved);
}, []);

useEffect(() => {
  document.documentElement.classList.toggle("light", theme === "light");
  localStorage.setItem("theme", theme);
}, [theme]);

useEffect(() => {
  document.body.style.overflow = open ? "hidden" : "auto";
}, [open]);

  return (

    
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 w-full z-[50] px-6 py-4 " 
    >
        <div
          className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-2xl backdrop-blur-xl transition-all select-none"
         style={{
  background: "transparent",
  backdropFilter: "blur(20px)",
  border: "1px solid var(--border-subtle)",
  boxShadow: "var(--card-shadow)"
}}
        >        
        <button
          className="md:hidden text-white text-2xl mr-2"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
        <Link to="/" className="text-xl font-black tracking-tighter text-[var(--text-primary)] hover:text-blue-600">
          COGNICLAUSE<span className="text-blue-600">.AI</span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">

        <div className="flex items-center gap-8">
                  
        <div className="hidden md:flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]"
        >

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="px-3 py-1 rounded-lg border border-[var(--border-subtle)] text-[var(--text-primary)]" 
            
          >
            {theme === "dark" ? "☀️ LIGHT" : "🌙 DARK"}
          </button>

          <Link to="/" className="flex items-center gap-2 hover:text-white transition">
            <HomeIcon size={14} /> Home
          </Link>

          <Link to="/evaluate" className="flex items-center gap-2 hover:text-white transition">
            <Wand2 size={14} /> Evaluate
          </Link>

          <Link to="/dashboard" className="flex items-center gap-2 hover:text-white transition">
            <FileText size={14} /> Dashboard
          </Link>

          <Link to="/history" className="flex items-center gap-2 hover:text-white transition">
            <Clock size={14} /> History
          </Link>

        </div>

          {user ? (
            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              <img
                src={user.user_metadata?.avatar_url || "https://via.placeholder.com/40"}
                className="w-8 h-8 rounded-full border border-blue-500/50"
              />
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              onClick={handleLoginClick}
              to="/login"
              className="px-5 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
            >
              Login
            </Link>
          )}

          

        </div>
      </div>
      </div>
      {/* MOBILE MENU */}
{open && (
  <div className="md:hidden fixed top-20 left-0 w-full flex justify-center z-[60]">
    
    <div
      className="w-[90%] max-w-sm p-6 rounded-2xl backdrop-blur-xl border border-[var(--border-subtle)]"
            style={
        theme === "light"
          ? {
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              border: "1px solid rgba(0,0,0,0.08)"
            }
          : {
              background: "rgba(10,15,30,0.85)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
            }
      }
    >
      
      <div className={`flex flex-col gap-4 text-sm font-semibold ${
  theme === "light" ? "text-gray-800" : "text-[var(--text-primary)]"
}`}>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`py-2 rounded-lg border transition ${
            theme === "light"
              ? "border-black/10 bg-white/40"
              : "border-[var(--border-subtle)]"
          }`}        
          >
          {theme === "dark" ? "☀️ LIGHT MODE" : "🌙 DARK MODE"}
        </button>

        <Link
          to="/"
          onClick={() => setOpen(false)}
          className={`px-3 py-2 rounded-lg transition ${
            theme === "light"
              ? "hover:bg-black/5"
              : "hover:bg-white/5"
          }`}
        >
          Home
        </Link>
        <Link
          to="/evaluate"
          onClick={() => setOpen(false)}
          className={`px-3 py-2 rounded-lg transition ${
            theme === "light"
              ? "hover:bg-black/5"
              : "hover:bg-white/5"
          }`}
        >
          Evaluate
        </Link>

        <Link
          to="/dashboard"
          onClick={() => setOpen(false)}
          className={`px-3 py-2 rounded-lg transition ${
            theme === "light"
              ? "hover:bg-black/5"
              : "hover:bg-white/5"
          }`}
        >
          Dashboard
        </Link>
        
        <Link
          to="/history"
          onClick={() => setOpen(false)}
          className={`px-3 py-2 rounded-lg transition ${
            theme === "light"
              ? "hover:bg-black/5"
              : "hover:bg-white/5"
          }`}
        >
          History
        </Link>

        <div className="border-t border-white/10 pt-3">
          {user ? (
            <button onClick={handleLogout} className="text-red-400 px-3 py-2">
              Logout
            </button>
          ) : (
            <button onClick={handleLoginClick} className="text-blue-400">
              Login
            </button>
          )}
        </div>

      </div>
    </div>
  </div>
)}
    </motion.nav>
    
  );
}
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import ParticleBackground from "../components/ParticleBackground";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const signInEmail = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      navigate("/");  
    }
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin }
    });

    if (error) alert(error.message);
  };

  const signInWithGithub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin }
    });

    if (error) alert(error.message);
  };

  return (
    
    <div className="min-h-screen w-full flex items-center justify-center px-3 sm:px-4 md:px-6">
      {/* --- login card --- */}

      <div className="fixed inset-0 z-0">
              <ParticleBackground />
       </div>
      <div
        className="
          w-full
          max-w-sm md:max-w-xl   
          p-6 md:p-10            
          rounded-2xl md:rounded-3xl
        "
        style={{
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 8px 35px rgba(0,0,0,0.15)",
        }}
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-200 tracking-wide">
          Welcome Back
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          className="
            w-full
            px-4 py-2.5 md:py-3  
            text-sm md:text-base
            rounded-lg
            bg-white/5
            text-white
            border border-white/10
            focus:ring-2 focus:ring-blue-400
            outline-none
            mb-4
          "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <div className="relative mb-6">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            className="
              w-full
              px-4 py-2.5 md:py-3   
              text-sm md:text-base
              rounded-lg
              bg-white/5
              text-white
              border border-white/10
              focus:ring-2 focus:ring-blue-400
              outline-none
              mb-4
            "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="absolute right-3 top-2.5 md:top-3 text-xs md:text-sm cursor-pointer text-blue-400"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? "Hide" : "Show"}
          </span>
        </div>  

        {/* Login button */}
        <button
          onClick={signInEmail}
          className="
            w-full
            py-2.5 md:py-3   /* 🔥 tighter mobile */
            text-sm md:text-base
            rounded-lg
            bg-blue-600
            text-white
            font-semibold
            hover:bg-blue-700
            transition-all duration-200
          "
        >
          Login
        </button>

        <div className="text-center text-slate-400 my-4 md:my-5 text-sm">or</div>

        {/* Google OAuth */}
        <button
          onClick={signInWithGoogle}
          className="
            w-full
            py-2.5 md:py-3
            text-sm md:text-base
            rounded-lg
            border border-white/10
            bg-white/5
            text-slate-200
            font-medium
            hover:bg-blue-600 hover:text-white
            transition-all duration-300
            flex items-center justify-center gap-2
          "
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
          Continue with Google
        </button>

        {/* GitHub OAuth */}
        <button
          onClick={signInWithGithub}  
          className="
            w-full
            py-2.5 mt-3 md:mt-4 md:py-3 
            text-sm md:text-base
            rounded-lg
            border border-white/10
            bg-white/5
            text-slate-200
            font-medium
            hover:bg-blue-600 hover:text-white
            transition-all duration-300
            flex items-center justify-center gap-2
          "
        >
          <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-5 h-5" />
          Continue with GitHub
        </button> 

        <p className="text-center mt-5 md:mt-6 text-sm text-gray-400">
          Don't have an account?
          <Link to="/register" className="ml-2 text-blue-700 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

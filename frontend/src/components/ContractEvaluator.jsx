// src/components/ContractEvaluator.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import ParticleBackground from "./ParticleBackground";
import { SAMPLE_TEMPLATES } from "../data/sampleContract";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph } from "docx";
import { BASE_URL } from "../config";
import shield from "../assets/shield2.png";


/**
 * ContractEvaluator.jsx (fixed)
 * - Avoids useSupabaseClient / useUser imports (prevents bundler errors if package versions mismatch)
 * - Uses supabase.auth.getSession() to try to attach user_id to requests
 * - Keeps drag/drop + file upload + text evaluate flows
 */

const RISK_COLORS = {
  Low: "bg-green-500 text-white",
  Medium: "bg-yellow-500 text-black",
  High: "bg-red-500 text-white",
  Unknown: "bg-black/40 border border-white/10 backdrop-blur-xl text-white",
};

function RiskBadge({ level = "Unknown" }) {
  const cls = RISK_COLORS[level] || RISK_COLORS.Unknown;
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={`px-4 py-2 rounded-full font-semibold ${cls}`}
    >
      {level} Risk
    </motion.div>
  );
}

function LoadingBar({ active }) {
  if (!active) return null;
  return (
    <div className="mt-3">
      <div className="h-2 w-full bg-slate-100 rounded overflow-hidden border">
        <motion.div
          className="h-full bg-indigo-400"
          initial={{ width: "0%" }}
          animate={{ width: ["0%", "65%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}

const completedAnimations = new Set(); // ✅ global set to track which clauses have completed typewriter  

const formatSuggestion = (text) => {
  if (!text) return { issues: "", optimized: "" };

  // Normalize text
  const clean = text.replace(/\r/g, "").trim();

  // Extract ISSUES
  const issuesMatch = clean.match(/ISSUES FOUND:\s*([\s\S]*?)(?:---|OPTIMIZED CLAUSE:)/i);

  // Extract OPTIMIZED CLAUSE
  const optimizedMatch = clean.match(/OPTIMIZED CLAUSE:\s*([\s\S]*)/i);

  return {
    issues: issuesMatch ? issuesMatch[1].trim() : "",
    optimized: optimizedMatch ? optimizedMatch[1].trim() : ""
  };
};



export default function ContractEvaluator() {

  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [aiDetails, setAiDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [activeMode, setActiveMode] = useState(null); 
  const [visibleCount, setVisibleCount] = useState(10);
  const dropRef = useRef();

  const [streamedDetails, setStreamedDetails] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showSample, setShowSample] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("nda");
  const templateText = SAMPLE_TEMPLATES[selectedTemplate];

  useEffect(() => {
  const stored = localStorage.getItem("selectedContract");
  if (!stored) return;

  try {
    const data = JSON.parse(stored);

    console.log("Loaded from history:", data);

    setResult({
      details: data.details || [],
      overall_risk: data.level,
      average_risk_score: data.risk_score
    });

    // ✅ FIX: correct state setter
    setText(data.text || "");

    // ✅ CRITICAL: prevent auto reload forever
    localStorage.removeItem("selectedContract");

  } catch (e) {
    console.error("Failed to load stored contract", e);
  }
}, []);
  
  const jobId = result?.job_id;

  const safeDetails = aiDetails || result?.details || [];

  const aiClauses = safeDetails.filter(c => c.source === "llm");
  const aiCount = aiClauses.length;

  useEffect(() => {
  if (!jobId) return;

  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${BASE_URL}/contracts/ai-status/${jobId}`);
      const data = await res.json();

      if (data.status === "completed") {
        setResult(prev => ({
          ...prev,
          details: data.details,
        }));

        clearInterval(interval); // ✅ STOP polling
      }

    } catch (err) {
      console.error(err);
      clearInterval(interval); // stop on error
    }
  }, 1500);

  return () => clearInterval(interval);
}, [jobId]);

useEffect(() => {
    if (!result?.job_id) return;

    const eventSource = new EventSource(
  `${BASE_URL}/contracts/stream-ai/${result.job_id}`
);

    eventSource.onmessage = (event) => {
      if (event.data === "DONE") {
        eventSource.close();
        return;
      }

      const { index, text } = JSON.parse(event.data);

      setStreamedDetails((prev) => {
        const updated = [...prev];
        updated[index] = text;
        return updated;
      });
      
    };

    return () => eventSource.close();
  }, [result]);

useEffect(() => {
  if (result) {
    sessionStorage.setItem(
      "contractEvaluation",
      JSON.stringify({
        result,
        text,
        streamedDetails,
        activeMode,
        fileName
      })
    );
  }
}, [result, text, streamedDetails, activeMode, fileName]);

useEffect(() => {
  const stored = sessionStorage.getItem("contractEvaluation");
  if (!stored) return;

  try {
    const data = JSON.parse(stored);

    setResult(data.result || null);
    setText(data.text || "");
    setStreamedDetails(data.streamedDetails || []);
    setActiveMode(data.activeMode || null);
    setFileName(data.fileName || null);

  } catch (e) {
    console.error("Failed to restore session", e);
  }
}, []);

useEffect(() => {
  const storedJobId = sessionStorage.getItem("jobId");
  if (!storedJobId) return;

  const fetchExisting = async () => {
    try {
      const res = await fetch(`${BASE_URL}/contracts/ai-status/${storedJobId}`);
      const data = await res.json();

      setResult(prev => ({
        ...(prev || {}),
        job_id: storedJobId,
        details: data.details || [],
      }));

    } catch (err) {
      console.error("Resume failed", err);
    }
  };

  fetchExisting();
}, []);

function Typewriter({ text, clauseId }) {
  const [displayed, setDisplayed] = React.useState("");

  React.useEffect(() => {
    if (!text) return;

    // ✅ Already animated → show instantly
    if (completedAnimations.has(clauseId)) {
      setDisplayed(text);
      return;
    }

    let i = 0;

    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;

      if (i > text.length) {
        clearInterval(interval);
        completedAnimations.add(clauseId);
      }
    }, 12); // smooth

    return () => clearInterval(interval);
  }, [text, clauseId]);

  return <span>{displayed}</span>;
}



// "text" | "file" | null


  

  const avgToLabel = (avg) => {
    if (typeof avg !== "number") return "Unknown";
    if (avg <= 1.5) return "Low";
    if (avg <= 2.3) return "Medium";
    return "High";
  };


  const getCurrentUserId = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (session?.user?.id) return session.user.id;
    } catch (e) {
      console.warn("Could not read session:", e);
    }
    return null;
  };

  const handleTextEvaluate = async (e) => {
  e?.preventDefault();
  
  if (loading) return; 

  setError(null);

  if (!text || !text.trim()) {
    setError("Please paste some contract text.");
    return;
  }

  setActiveMode("text");
  setLoading(true);

  // 🔥 FULL RESET
  setResult(null);
  setAiDetails(null);
  setStreamedDetails([]);
  setVisibleCount(10);

  try {
    const user_id = await getCurrentUserId();
    const res = await fetch(`${BASE_URL}/contracts/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, user_id, name: "manual evaluation" }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Server ${res.status}: ${errText}`);
    }

    const data = await res.json();
    setResult(data);
    sessionStorage.setItem("jobId", data.job_id);
  } catch (err) {
    setError(String(err.message || err));
  } finally {
    setLoading(false);
  }
};


  // drag & drop handlers
  const onDrop = useCallback(async (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const files = ev.dataTransfer?.files || ev.target?.files;
    if (!files || files.length === 0) return;
    await uploadFile(files[0]);
  }, []);

  const onDragOver = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (dropRef.current) dropRef.current.classList.add("ring-4", "ring-indigo-200");
  };
  const onDragLeave = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (dropRef.current) dropRef.current.classList.remove("ring-4", "ring-indigo-200");
  };

  const uploadFile = async (file) => {
  setError(null);
  setActiveMode("file");
  setFileLoading(true);
  setFileName(file.name);

  // 🔥 FULL RESET
  setResult(null);
  setAiDetails(null);
  setStreamedDetails([]);
  setVisibleCount(10);

  try {
    const user_id = await getCurrentUserId();
    const form = new FormData();
    form.append("file", file);
    if (user_id) form.append("user_id", user_id);
    form.append("name", file.name || "uploaded");

    const res = await fetch(`${BASE_URL}/contracts/upload`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Upload failed ${res.status}: ${txt}`);
    }

    const data = await res.json();
    setResult(data.analysis ?? data);
    sessionStorage.setItem("jobId", data.job_id);
  } catch (err) {
    setError(String(err.message || err));
  } finally {
    setFileLoading(false);
  }
};


  const handleFileInput = (ev) => {
    const f = ev.target.files?.[0];
    if (f) uploadFile(f);
  };

  const clearFile = () => {
  setFileName(null);
  setResult(null);
  setActiveMode(null);
  setFileLoading(false);  
  setError(null); 
  if (dropRef.current) dropRef.current.value = "";
};

const downloadFile = async (type) => {
  const templateText = SAMPLE_TEMPLATES[selectedTemplate];

  if (!templateText) return;

  if (type === "pdf") {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(templateText, 180);
    doc.text(lines, 10, 10);
    doc.save(`${selectedTemplate}.pdf`);
  }

  if (type === "docx") {
    const doc = new Document({
      sections: [
        {
          children: templateText.split("\n").map(
            (line) => new Paragraph({ text: line })
          ),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${selectedTemplate}.docx`);
  }
};


  const SummaryBlock = ({ data , counts}) => {
    if (!data) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="p-6 rounded-xl  border-white/10 backdrop-blur-xl text-white shadow-lg border" 
          style={{
    background: "var(--card-bg)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--card-shadow)"
  }}>
          <div className="text-sm text-gray-500">No results yet — evaluate a contract to see a summary here.</div>
        </motion.div>
      );
    }
    const avg = data.average_risk_score ?? null;
    const level = data.risk_level ?? avgToLabel(avg);
  
    return (
      
      
        <motion.div
  initial={{ opacity: 0, y: 6 }}
  animate={{ opacity: 1, y: 0 }}
 className="p-6 rounded-2xl"
  style={{
    background: "var(--card-bg)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--card-shadow)"
  }}
>
  {/* HEADER */}
  <div className="flex items-center justify-between" >
    <div>
      <p className="text-xs uppercase text-[var(--text-secondary)] tracking-wide">
        Summary
      </p>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-1">
        {level} overall
      </h2>
      <p className="text-sm text-[var(--text-secondary)] mt-1">
        Avg score: <span className="font-semibold">{avg ?? "-"}</span>
      </p>
    </div>
  </div>

  {/* METRICS */}
  <div className="grid grid-cols-3 gap-4 mt-6">
    <div className="text-center">
      <p className="text-xs text-[var(--text-secondary)]">High</p>
      <p className="text-xl font-bold text-red-500">{counts.High}</p>
    </div>
    <div className="text-center">
      <p className="text-xs text-[var(--text-secondary)]">Medium</p>
      <p className="text-xl font-bold text-yellow-500">{counts.Medium}</p>
    </div>
    <div className="text-center">
      <p className="text-xs text-[var(--text-secondary)]">Low</p>
      <p className="text-xl font-bold text-green-500">{counts.Low}</p>
    </div>
  </div>

  {/* ADVICE */}
  <div className="mt-6 text-sm text-[var(--text-secondary)]">
    {level === "High" && <span className="text-red-500">Multiple high-risk clauses detected.</span>}
    {level === "Medium" && <span className="text-yellow-500">Some clauses need attention.</span>}
    {level === "Low" && <span className="text-green-500">Low overall contract risk.</span>}
  </div>
</motion.div>
      
    );
  };

let lastMoveTime = 0;

const handleGlowMove = (e) => {
  const now = performance.now();
  const delta = now - lastMoveTime;
  lastMoveTime = now;

  const speed = Math.min(1, 50 / delta); // fast movement = brighter glow

  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  e.currentTarget.style.setProperty("--x", `${x}px`);
  e.currentTarget.style.setProperty("--y", `${y}px`);
  e.currentTarget.style.setProperty("--glow-strength", 0.15 + speed * 0.6);
};

// ---------- RISK INTELLIGENCE (DYNAMIC) ----------

const counts = { High: 0, Medium: 0, Low: 0 };

(result?.details || []).forEach(d => {
  if (d.risk_level === "High") counts.High++
  else if (d.risk_level === "Medium") counts.Medium++
  else counts.Low++
})

const total = counts.High + counts.Medium + counts.Low

const highPercentage = total > 0
  ? Math.round((counts.High / total) * 100)
  : 0

// Top drivers
const driverMap = {};

(result?.details || []).forEach(d => {
  if (d.risk_level === "High") {
    driverMap[d.matched_category] =
      (driverMap[d.matched_category] || 0) + 1
  }
})

const topDrivers = Object.entries(driverMap)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([key]) => key)

// Impact
const impactText =
  highPercentage > 60
    ? "High financial and legal exposure risk"
    : highPercentage > 30
    ? "Moderate contract risk concentration"
    : "Low structural risk"

// Confidence
const avgSim =
  (result?.details || []).reduce(
    (acc, d) => acc + (d.similarity_score || 0),
    0
  ) / (total || 1)

const confidence = Math.round(avgSim * 100)

const isMobile = window.innerWidth < 768;
  return (

    
    
    <div className="relative min-h-screen ">

      
        <button
  onClick={() => setShowSample(true)}
  className="
  fixed z-50
  bottom-4 right-4
  md:bottom-6 md:right-6

  px-3 py-1.5 md:px-4 md:py-2   /* 🔥 smaller on mobile */
  text-xs md:text-sm            /* 🔥 smaller text */

  rounded-full
  bg-gradient-to-r from-indigo-500 to-blue-500
  text-white font-semibold

  shadow-lg shadow-indigo-500/30
  hover:scale-105 transition
"
>
  
  Sample Contract
</button>
        <div className="fixed inset-0 z-0">
  {/* 1. THE DEEP BASE: Pure Obsidian */}
  <div className="absolute inset-0 " />

  {/* 2. THE TOP-LEFT GLOW: Neural Cyan (Deepened) */}
  <div className="
    absolute inset-0 
    bg-[radial-gradient(circle_at_20%_30%,rgba(12,45,115,0.15),transparent_50%)]
  " />

  {/* 3. THE BOTTOM-RIGHT GLOW: Abyssal Violet */}
  <div className="
    absolute inset-0 
    bg-[radial-gradient(circle_at_80%_70%,rgba(40,15,100,0.1),transparent_50%)]
  " />

  {/* 4. THE PRECISION GRID: Fading into the Void */}
  <div className="
    absolute inset-0 
    bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]
    bg-[size:60px_60px]
    [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_20%,transparent_100%)]
  " />
  
  {/* 5. HORIZON LINE: A subtle 1px line for depth */}
  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent shadow-[0_0_20px_rgba(255,255,255,0.02)]" />


    <ParticleBackground />
  

    </div>
    <div className="
      relative z-10
      w-full
      px-3 sm:px-4 md:px-6   /* 🔥 less padding on mobile */
      md:max-w-6xl md:mx-auto
      py-8 md:py-10
      space-y-6
    ">
    <div className="w-full p-6">
      
      <motion.h2
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2"
    >
  <img src={shield}  alt="shield icon" className="mt-2 ml-1 w-10 h-9" />
  Contract Risk Analyzer
</motion.h2>
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* TEXT CARD — FIXED */}

<motion.div
  whileHover={{ scale: 1.02 }}
  className="p-5 rounded-2xl border transition-all"
  style={{
    background: "var(--card-bg)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--card-shadow)"
  }}
>
  <div className="flex justify-between items-center mb-3">
    <div>
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        Paste contract text
      </p>
      <p className="text-xs text-[var(--text-secondary)]">
        You can also upload a PDF in the right panel.
      </p>
    </div>
    <span className="text-xs text-gray-400">Text mode</span>
  </div>

  <textarea
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="Paste contract text here..."
    className="w-full h-52 p-4 rounded-lg bg-blue-500/5 border border-indigo-500/20 focus:outline-none focus:border-indigo-400"
  />

  <div className="flex gap-3 mt-4 items-center">
    <button
      onClick={handleTextEvaluate}
      className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold"
    >
      Evaluate Contract
    </button>

    <button
      onClick={() => {
        setText("");
        setResult(null);
        setError(null);
        setAiDetails(null);
        setStreamedDetails([]);
        setVisibleCount(10);
        setLoading(false);             
        setActiveMode(null); 
        sessionStorage.removeItem("contractEvaluation");
      }}
      className="px-4 py-2 rounded-lg border border-indigo-500/20"
    >
      Clear
    </button>

    {loading && (
      <span className="text-sm text-indigo-400">Evaluating...</span>
    )}
  </div>

  <LoadingBar active={loading} />
</motion.div>



<motion.div
  whileHover={{ scale: 1.02 }}
  className="p-5 rounded-2xl border transition-all flex flex-col"
  style={{
    background: "var(--card-bg)",
    border: "1px solid var(--border-subtle)",
    boxShadow: "var(--card-shadow)"
  }}
>
  {/* HEADER */}
  <div className="flex justify-between items-center mb-3">
    <div>
      <p className="text-sm font-semibold text-[var(--text-primary)]">
        Upload PDF (drag & drop)
      </p>
      <p className="text-xs text-[var(--text-secondary)]">
        Drop a PDF or DOCX file here.
      </p>
    </div>
    <span className="text-xs text-gray-400">File mode</span>
  </div>

  {/* 🔥 FULL HEIGHT DROP ZONE */}
  <div
    ref={dropRef}
    onDrop={onDrop}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onClick={() => document.getElementById("fileinput")?.click()}
    className="
      h-48              
      border-2 border-dashed
      border-indigo-400/40
      rounded-xl

      flex flex-col items-center justify-center gap-3
      cursor-pointer

      bg-blue-500/5
      hover:border-indigo-400
      hover:bg-indigo-500/5

      transition-all
    "
  >
    <svg className="w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v12" stroke="currentColor" strokeWidth="2" />
      <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="2" />
      <path d="M20 21H4a2 2 0 01-2-2V7a2 2 0 012-2h5" stroke="currentColor" strokeWidth="2" />
    </svg>

    <div className="text-sm text-[var(--text-primary)]">
      Drop PDF here or click to upload
    </div>

    <div className="text-xs text-[var(--text-secondary)]">
      Supported: PDF, DOCX
    </div>

    <input
      id="fileinput"
      type="file"
      accept=".pdf,.doc,.docx"
      onChange={handleFileInput}
      className="hidden"
    />
  </div>

  {/* FOOTER */}
  <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
    <span>{fileName ?? "No file selected"}</span>

    {fileName && (
      <button
        onClick={clearFile}
        className="px-4 py-2 rounded-lg border border-indigo-500/20"
      >
        Clear
      </button>
    )}
  </div>

  <LoadingBar active={fileLoading} />
</motion.div>

        
        <div className="md:col-span-2">
          
          <div className=" w-full mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6" >
            
              <SummaryBlock data={result} counts={counts}  />

              <div
                className="p-6 rounded-2xl"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--card-shadow)"
                }}
              >

                  {/* TITLE */}
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]mb-4">
                    Risk Intelligence
                  </h3>

                  {/* TOP DRIVERS */}
                  
                  <div className="mb-4">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">Top Risk Drivers</p>
                    <ul className="text-sm text-[var(--text-primary)] space-y-1">
                      {topDrivers.length > 0 ? (
                        topDrivers.map((d, i) => (
                          <li key={i}>• {d}</li>
                        ))
                      ) : (
                        <li>• No major risk drivers</li>
                      )}
                    </ul>
                  </div>

                  {/* DISTRIBUTION */}
                  <div className="mb-4">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">Risk Distribution</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 bg-red-500/70 rounded"
                          style={{ width: `${(counts.High / total) * 100 || 0}%` }}
                        ></div>
                        <span className="text-[var(--text-primary)]">High</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                        className="h-2 bg-yellow-400/70 rounded"
                        style={{ width: `${(counts.Medium / total) * 100 || 0}%` }}
                      ></div>
                        <span className="text-[var(--text-primary)]">Medium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 bg-green-400/70 rounded"
                          style={{ width: `${(counts.Low / total) * 100 || 0}%` }}
                        ></div>
                        <span className="text-[var(--text-primary)]">Low</span>
                      </div>
                    </div>
                  </div>

                  {/* IMPACT */}
                  <div className="mb-4">
                    <p className="text-sm text-[var(--text-secondary)] mb-2">Impact</p>
                    <p className="text-sm text-red-400">
                      {impactText}
                    </p>
                  </div>

                  {/* CONFIDENCE */}
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">AI Confidence</p>
                    <p className="text-sm text-blue-400">{confidence}% reliable analysis</p>
                  </div>

                </div>
            
 
          </div>
          

          

          <div className="mt-4 space-y-3">
            
{/* ---------- CLAUSE ANALYSIS CARD (DARK , NO TRANSPARENCY) ---------- */}

{safeDetails.length > 0 && (
  <div className="mt-12 w-full mx-auto">

    <h2 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">
      Clause Analysis
    </h2>

    <div className="space-y-6 ">

      {safeDetails.slice(0, visibleCount).map((item, index) => {

        const streamedText = streamedDetails[index] || "" ;
        const firstNonLLMIndex = safeDetails.findIndex(c => c.source !== "llm");
        const showSeparator = index === firstNonLLMIndex;
        const formatted = formatSuggestion(streamedDetails[index] || "");
        
        return (

          <React.Fragment key={index}>

          {/* 🔥 SEPARATOR (only once) */}
          {showSeparator && (
            <div className="mt-10 mb-4 text-lg text-[var(--text-primary)] font-semibold border-t pt-4">
              Other Clauses (Standard Recommendations)
            </div>
          )}



        <div
        key={index}
        className="
          w-full
          p-4 md:p-6              /* 🔥 less padding mobile */
          rounded-xl
          border border-white/10
          backdrop-blur-xl
          shadow-md
          transition-all duration-300
          hover:-translate-y-1
          hover:shadow-blue-50/10
          hover:border-blue-700
        "
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--card-shadow)"
        }}
      >
          <p className="text-[var(--text-primary)] font-semibold">
            <span className="font-bold">Sentence:</span> {item.sentence}
          </p>

          <div className="flex flex-wrap gap-3 mt-3">

            <span
              className="px-3 py-1 rounded-lg text-sm font-medium"
              style={{
                background: "rgba(100, 116, 139, 0.15)", // neutral glass tint
                color: "var(--text-primary)",
                border: "1px solid var(--border-subtle)",
                backdropFilter: "blur(6px)"
              }}
            >
              {item.matched_category}
            </span>

            <span className={`
              px-3 py-1 rounded-lg text-sm font-medium
              ${
                item.risk_level === "High"
                  ? "bg-red-500/10 text-red-600 border border-red-500/20"
                  : item.risk_level === "Medium"
                  ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                  : "bg-green-500/10 text-green-600 border border-green-500/20"
              }
            `}>
              {item.risk_level}
            </span>

            <span
              className="px-3 py-1 rounded-lg text-sm font-medium"
              style={{
                background: "rgba(59, 130, 246, 0.12)", // subtle blue for sim
                color: "var(--text-primary)",
                border: "1px solid rgba(59,130,246,0.25)",
                backdropFilter: "blur(6px)"
              }}
            >
              sim: {item.similarity_score?.toFixed(3)}
            </span>

            

          </div>
          {/* ---------- OPTIMIZATION SUGGESTION ---------- */}
            {/* ✅ SEPARATE SECTION BELOW */}
            {item.suggested_optimization && (
              <div className="mt-4 md:mt-6 w-full">
                <div
                  className={`
                    p-4 rounded-lg border-l-4 text-sm leading-relaxed transition-all duration-500 bg-gradient-to-br from-blue-950/10 to-blue-500/10
                    ${
                      item.risk_level === "High"
                        ? "border-red-500 text-red-800"
                        : item.risk_level === "Medium"
                        ? "border-yellow-500 text-yellow-800"
                        : "border-green-500 text-green-800"
                    }
                  `}
                >

                  {/* HEADER */}
                  <div className="font-semibold mb-2 flex items-center gap-2 text-[var(--text-primary)]">
                    {item.source === "llm"
                      ? "✨ AI Suggestion"
                      : "💡 Suggested Improvement"}
                  </div>

                  {/* ---------- CONTENT ---------- */}
                  {item.source === "llm" ? (

                    <>  

                      <>
                        {/* Issues */}
                        <p className="font-semibold text-[var(--text-secondary)]">Issues:</p>
                  
                        {formatted.issues ? (
                          <div className="whitespace-pre-line text-[var(--text-secondary)]">{formatted.issues}</div>
                        ) : (
                          <div className="loader-bar w-3/4 mt-2"></div>
                        )}

                        <hr className="my-3 border-gray-300" />

                        {/* Optimization */}
                        <p className="font-semibold text-[var(--text-primary)]">Optimization:</p>

                        {formatted.optimized ? (
                          <div className="whitespace-pre-line text-[var(--text-primary)]">{formatted.optimized}</div>
                        ) : (
                          <div className="loader-bar w-3/4 mt-2"></div>
                        )}
                      </>
                    </>

                  ) : (

                    <p className="text-[var(--text-primary)]">{item.suggested_optimization}</p>

                  )}

                </div>
              </div>
            )}
                 
        </div>

      </React.Fragment>
      )})}
    {visibleCount < safeDetails.length && (
          <div className="text-center mt-4">
            <button
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Load More ({safeDetails.length - visibleCount} remaining)
            </button>
          </div>
        )}

       

    </div>
  </div>

  
)}




          </div>
        </div>
      </div>
      
      
    </div>
    
    </div>
     {showSample && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">

        <div
          className="w-[90%] max-w-2xl p-6 rounded-2xl"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--card-shadow)"
          }}
        >

          {/* HEADER */}
          <div className="flex flex-col gap-3 mb-4">

      {/* Top row: title + close */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          Sample Contract
        </h2>

        <button
          onClick={() => setShowSample(false)}
          className="text-[var(--text-secondary)] hover:text-red-400"
        >
          ✕
        </button>
      </div>

      {/* 🔥 TEMPLATE SWITCHER (MOVED HERE) */}
      <div className="flex gap-2 flex-wrap">
        {Object.keys(SAMPLE_TEMPLATES).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedTemplate(key)}
            className={`
              px-3 py-1 rounded-md text-xs font-medium transition
              ${
                selectedTemplate === key
                  ? "bg-indigo-500 text-white shadow"
                  : "bg-white/5 text-[var(--text-secondary)] border border-indigo-500/20 hover:bg-indigo-500/10"
              }
            `}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>

    </div>

      {/* TEXT */}
      <div className="h-64 overflow-y-auto text-sm whitespace-pre-line text-[var(--text-primary)] bg-blue-500/5 border border-indigo-500/20 p-4 rounded-lg">
        {templateText}
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col md:flex-row gap-3 md:justify-between mt-4">

        {/* USE TEXT */}
        <button
          onClick={() => {
            setText(templateText);
            setShowSample(false);
          }}
          className="
            w-full md:w-auto
            px-3 py-2 md:px-4
            text-sm
            rounded-lg
            bg-indigo-500 text-white
            hover:bg-indigo-400 transition
          "
        >
          Use this text
        </button>

        {/* DOWNLOAD */}
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => downloadFile("pdf")}
            className="
              flex-1 md:flex-none   
              px-3 py-2
              text-xs md:text-sm    
              rounded
              bg-white/5
              border border-indigo-500/20
              text-[var(--text-primary)]
            "
          >
            Download PDF
          </button>

          <button
            onClick={() => downloadFile("docx")}
            className="
              flex-1 md:flex-none   
              px-3 py-2
              text-xs md:text-sm   
              rounded
              bg-white/5
              border border-indigo-500/20
              text-[var(--text-primary)]
            "
          >
            Download DOCX
          </button>
        </div>

      </div>
    </div>
  </div>
)}
    
    </div>
    
    

    
    
  );
}

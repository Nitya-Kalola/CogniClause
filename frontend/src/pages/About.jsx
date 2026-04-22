import React, { useRef, useState, useEffect, forwardRef} from "react";
import { motion } from "framer-motion";

export default function About() {

  const refs = {
  input: useRef(),
  parsing: useRef(),
  embedding: useRef(),
  llm: useRef(),
  risk: useRef(),
  optimization: useRef(),
};

const containerRef = useRef();
const [activeNode, setActiveNode] = useState(null);

const FlowBlock = forwardRef(({ title, desc, id, setActive, highlight }, ref) => {
const isLLM = id === "llm";

  return (
    <div className="transition-transform duration-300 group-hover:-translate-y-1">
    <div
      ref={ref}
      onMouseEnter={() => setActive(id)}
      onMouseLeave={() => setActive(null)}
      className={`
        relative z-20 p-3 sm:p-5 w-28 sm:w-44 text-center rounded-xl border streaming-border
        backdrop-blur-md cursor-pointer
        transition-transform duration-300

        ${highlight ? "animate-illuminate border-blue-400" : "border-[var(--border-subtle)]"}
      `}
      style={{
  background: isLLM 
    ? "radial-gradient(circle at center, rgba(37, 99, 235, 0.25), var(--card-bg))" 
    : "var(--card-bg)",
  willChange: "transform",
  boxShadow: activeNode === id
  ? "0 10px 30px rgba(59,130,246,0.25)"
  : "0 0 0 rgba(0,0,0,0)"
}}
    >
      <h3 className={`text-[10px] sm:text-sm font-bold tracking-wide uppercase ${isLLM ? "text-blue-400" : "text-[var(--text-primary)]"}`}>
        {title}
      </h3>
      <p className="hidden sm:block text-[10px] text-[var(--text-secondary)] mt-1 uppercase tracking-tighter">
        {desc}
      </p>
    </div>
    </div>
  );
});

const pathsRef = useRef([]);
const [, forceRender] = useState(0);

const connections = [
  ["input", "parsing"],
  ["parsing", "embedding"],
  ["embedding", "llm"],
  ["llm", "risk"],
  ["risk", "optimization"],
];

useEffect(() => {
  function updatePaths() {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newPaths = [];

    connections.forEach(([a, b]) => {
      const from = refs[a]?.current;
      const to = refs[b]?.current;

      if (!from || !to) return;

      const r1 = from.getBoundingClientRect();
      const r2 = to.getBoundingClientRect();

      newPaths.push({
        x1: r1.left + r1.width / 2 - containerRect.left,
        y1: r1.top + r1.height / 2 - containerRect.top,
        x2: r2.left + r2.width / 2 - containerRect.left,
        y2: r2.top + r2.height / 2 - containerRect.top,
      });
    });

    pathsRef.current = newPaths;
    forceRender(n => n + 1); // only trigger paint, not remount
  }

  // 🔥 FIX: run multiple times initially
  updatePaths();
  setTimeout(updatePaths, 100);
  setTimeout(updatePaths, 300);

  // 🔥 FIX: listen to scroll + resize
  window.addEventListener("resize", updatePaths);
 
  return () => {
    window.removeEventListener("resize", updatePaths);
    window.removeEventListener("scroll", updatePaths);
  };
}, []);

  return (
    <main className="min-h-screen px-10 lg:px-32 py-20 text-[var(--text-primary)]">

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-7xl font-bold mb-10"
      >
        About CogniClause
      </motion.h1>

      {/* SYSTEM OVERVIEW */}
      <section className="mb-20 grid md:grid-cols-2 gap-10 items-center">

  <div className="max-w-4xl mx-auto"> {/* Centered container for neatness */}
  <h2 className="text-4xl font-bold mb-6 tracking-tight text-[var(--text-secondary)]">
    System Overview
  </h2>
  
  <div className="space-y-6">
    <p className="
      text-[var(--text-secondary)] 
      leading-relaxed 
      text-justify          /* Forces straight edges on both sides */
      [hyphens:auto]        /* Prevents large gaps between words */
      [text-underline-offset:4px]
      selection:bg-blue-500/30
    ">
      CogniClause is an AI-powered contract intelligence system designed to transform complex legal documents into structured, interpretable insights. Traditional contract review relies heavily on manual reading, which is time-consuming, error-prone, and often limited by human cognitive load. CogniClause addresses this by leveraging modern natural language processing techniques to decompose contracts into meaningful units, analyze their semantic intent, and evaluate potential risks in a systematic and scalable way.
    </p>

    <p className="text-[var(--text-secondary)] leading-relaxed text-justify [hyphens:auto]">
      The system operates by first breaking down contracts into clauses, preserving their contextual relationships, and then encoding them into semantic representations using advanced embedding models. These representations allow the system to understand not just the wording, but the underlying legal intent and implications. Each clause is then evaluated against risk frameworks derived from common legal standards and patterns, enabling the identification of ambiguous, imbalanced, or potentially harmful terms.
    </p>

    <p className="text-[var(--text-secondary)] leading-relaxed text-justify [hyphens:auto]">
      Beyond analysis, CogniClause provides optimization suggestions, helping users improve clarity, reduce ambiguity, and strengthen contractual fairness. The result is a shift from passive contract reading to active contract intelligence — where users can quickly identify risks, understand obligations, and make informed decisions with confidence.
    </p>
  </div>
</div>

<div ref={containerRef} className="w-full mt-10 relative select-none ">

  <div className="relative w-full h-[220px] sm:h-[420px] z-50 md:ml-8">

  {/* TOP ROW */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-6 sm:gap-20">
    <FlowBlock ref={refs.input} id="input" title="Input" desc="Upload and submit legal documents for analysis" setActive={setActiveNode}/>
    <FlowBlock ref={refs.parsing} id="parsing" title="Parsing" desc="Break down contracts into structured clauses" setActive={setActiveNode}/>
    <FlowBlock ref={refs.embedding} id="embedding" title="Embedding" desc="Convert clauses into semantic representations" setActive={setActiveNode}/>
  </div>

  {/* CENTER */}
  <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2">
    <FlowBlock ref={refs.llm} id="llm" title="LLM Processing" highlight desc="Process clauses using large language models" setActive={setActiveNode}/>
  </div>

  {/* BOTTOM */}
  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-10 sm:gap-32">
    <FlowBlock ref={refs.risk} id="risk" title="Risk Engine" desc="Evaluate potential risks in the contract" setActive={setActiveNode}/>
    <FlowBlock ref={refs.optimization} id="optimization" title="Optimization" desc="Provide optimization suggestions for improved clarity and fairness" setActive={setActiveNode}/>
  </div>

</div>

  {/* SVG FLOW LINES */}
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ minHeight: '600px', willChange: "transform" }}>
      <defs>
       <linearGradient id="streamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
        <stop offset="40%" stopColor="#3b82f6" stopOpacity="1" />
        <stop offset="60%" stopColor="#93c5fd" stopOpacity="1" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
      </linearGradient>
        <filter id="neonGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {pathsRef.current.map((p, i) => {
  const dx = (p.x2 - p.x1) * 0.4;

const d = `
  M ${p.x1} ${p.y1}
  C ${p.x1 + dx} ${p.y1},
    ${p.x2 - dx} ${p.y2},
    ${p.x2} ${p.y2}
`;

  return (
    <g key={`${connections[i][0]}-${connections[i][1]}`}>
      {/* Base faint line */}
<>
  {/* glow base */}
  <path
    d={d}
    stroke="#3b82f6"
    strokeWidth="6"
    opacity="0.12"
    fill="none"
  />

  {/* sharp saber beam */}
  <path
  d={d}
  className="saber-line"
/>
</> 
    </g>
  );
})}
    </svg>
</div>

</section>

      {/* LLM LOGIC */}
      <div className="grid md:grid-cols-3 gap-6">
  {[
    {
      title: "Parsing",
      desc: "The system begins by decomposing raw contract text into structured clauses using a hybrid parsing approach. This includes rule-based segmentation (detecting headings, numbering patterns, and legal delimiters) combined with AI-assisted understanding of sentence boundaries and intent. Unlike naive splitting, the parser preserves semantic integrity — ensuring that multi-line obligations, conditions, and exceptions remain contextually grouped. This step transforms unstructured legal documents into analyzable units, forming the foundation for all downstream intelligence."
    },
    {
      title: "Embedding",
      desc: "Each extracted clause is transformed into a high-dimensional semantic vector using state-of-the-art embedding models. This enables the system to understand meaning beyond keywords — capturing intent, obligation strength, and contextual nuance. These embeddings allow clauses to be compared against known legal patterns, industry standards, and risk templates. By operating in vector space, CogniClause can identify subtle similarities and deviations that would be difficult to detect through traditional rule-based systems."
    },
    {
      title: "Risk Analysis",
      desc: "Risk evaluation is performed by combining semantic similarity with domain-specific heuristics. Each clause is assessed against predefined risk frameworks that consider ambiguity, imbalance of obligations, enforceability concerns, and deviation from standard legal language. The system assigns both a quantitative risk score and a qualitative category, enabling users to quickly identify high-impact clauses. This approach ensures that risk detection is not only statistically informed but also aligned with real-world legal reasoning."
    }
  ].map((step, i) => (
    <div 
      key={i} 
      className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.05] transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-4">
    {/* Step indicator */}
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-black border border-blue-500/20">
          0{i + 1}
        </span>
        <h3 className="font-bold text-[var(--text-primary)] tracking-tight uppercase text-sm">{step.title}</h3>
      </div>
      
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
        {step.desc}
      </p>
    </div>  
  ))}
</div>

  {/* TOP 15 CLAUSES */}
      <section className="mb-16 mt-16">
        <h2 className="text-3xl font-semibold mb-4">Why Top 15 Clauses?</h2>
        <p className="text-[var(--text-secondary)] max-w-3xl">
          CogniClause prioritizes the most legally impactful clauses — such as indemnity, liability, termination, confidentiality, and payment terms — because these directly influence financial exposure and dispute outcomes. Rather than overwhelming users with every clause, the system focuses on the top 15 categories that consistently carry the highest legal and business risk. This targeted approach balances depth with usability, ensuring users can make informed decisions without unnecessary cognitive overload.
        </p>
      </section>

  {/* USER VALUE */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-4">User Benefit</h2>
        <p className="text-[var(--text-secondary)] max-w-3xl">
          CogniClause transforms dense legal text into structured, actionable intelligence. By highlighting risk, clarifying obligations, and suggesting optimizations, it enables users to move beyond passive reading toward active decision-making. Whether reviewing contracts, negotiating terms, or assessing compliance, users gain clarity, speed, and confidence — reducing legal uncertainty and improving overall contract quality.
        </p>
      </section>

  {/* CREATOR */}
<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 items-center p-6 md:p-8 rounded-2xl bg-white/5 border border-[var(--border-subtle)] backdrop-blur-xl">
  {/* LEFT: IMAGE */}
  {/* <div className="flex justify-center">
    <div className="w-40 h-40 rounded-full overflow-hidden border border-white/20 shadow-lg">
      <img
        src="/your-photo.jpg"   // 🔥 replace with your image path
        alt="Creator"
        className="w-full h-full object-cover"
      />
    </div>
  </div> */}

  {/* RIGHT: CONTENT */}
  <div className="md:col-span-3">

    <h2 className="text-3xl font-bold mb-4 pointer-events-none">About the Creator</h2>

    <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-6">
      CogniClause was designed and developed by an AI & Data Science engineering student focused on building practical intelligence systems at the intersection of machine learning and real-world problem solving. The system reflects a strong emphasis on applied AI, combining large language models, semantic embeddings, and intuitive interfaces to tackle the complexity of legal documents.

      Rather than treating contracts as static text, this platform approaches them as structured data that can be analyzed, compared, and optimized. The goal is to bridge the gap between advanced AI capabilities and real-world usability - enabling faster, smarter, and more informed decision-making in legal workflows.

      This project represents both technical depth and product thinking, focusing not just on models, but on building complete, user-centric systems that solve meaningful problems.
    </p>

    {/* SOCIAL ICONS */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">

  {/* ICONS */}
  <div className="flex gap-5">
    <a
      href="https://www.linkedin.com/in/nitykalola2004"
      target="_blank"
      className="p-3 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/10 transition"
    >
      <i className="fab fa-linkedin text-xl"></i>
    </a>

    <a
      href="https://github.com/Nitya-Kalola"
      target="_blank"
      className="p-3 rounded-lg bg-white/5 hover:bg-gray-400/20 border border-white/10 transition"
    >
      <i className="fab fa-github text-xl"></i>
    </a>
  </div>

  {/* EMAIL */}
  <p className="text-xs sm:text-sm text-[var(--text-secondary)] break-all">
    kalolanitya@gmail.com
  </p>

</div>

  </div>
</div>

    </main>
  );
}
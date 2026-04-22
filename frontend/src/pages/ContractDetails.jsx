import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import { supabase } from "../lib/supabaseClient";
import ParticleBackground from "../components/ParticleBackground";

function ContractDetails() {
  const { id } = useParams(); // ✅ FIRST define this

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJson, setShowJson] = useState(false);

  // ✅ Fetch from DB (NOT localStorage)
  useEffect(() => {
  async function fetchContract() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
    } else {
      setData(data);
    }

    setLoading(false);
  }

  if (id) fetchContract();
}, [id]);

if (loading || !data) {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <div className="h-8 w-40 bg-white/30 rounded animate-pulse" />
      <div className="h-4 w-60 bg-white/30 rounded animate-pulse" />

      <div className="grid grid-cols-3 gap-4 mt-6">
        {[1,2,3].map(i => (
          <div key={i} className="h-20 bg-white/30 rounded-xl animate-pulse" />
        ))}
      </div>

      {[1,2,3].map(i => (
        <div key={i} className="h-32 bg-white/30 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
  return (
    <div className="max-w-5xl mx-auto p-6 transition-opacity duration-500 opacity-100">
      <div className="fixed inset-0 z-0">
                  <ParticleBackground />
                </div>

      <h2 className="text-2xl font-bold mt-4 text-[var(--text-primary)]">{data.name}</h2>

      <div className="text-sm text-gray-500 mt-1">
        Evaluated on: {new Date(data.created_at).toLocaleString()}
      </div>

      <div className="mt-4 text-lg font-semibold text-[var(--text-secondary)]">
        Risk Level:
        <span className={`ml-2 ${
          data.level === "High" ? "text-red-600" :
          data.level === "Medium" ? "text-yellow-600" :
          "text-green-600"
        }`}>
          {data.level}
        </span>
      </div>

      {/* RISK COUNTS */}
      {loading ? (
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[1,2,3].map(i => (
          <div
            key={i}
            className="h-20 rounded-xl bg-white/30 animate-pulse"
          />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-3 gap-4 mt-6 transition-opacity duration-500 text-[var(--text-primary)]">
        {["High", "Medium", "Low"].map(level => {
          const count = data.details?.filter(d => d.risk_level === level).length || 0;
          return (
            <GlassCard key={level} className="p-4">
              <div className="text-sm text-gray-500">{level}</div>
              <div className="text-xl font-bold">{count}</div>
            </GlassCard>
          );
        })}
      </div>
    )}

      {/* TOP ISSUES */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2 text-[var(--text-primary)]">Top Issues</h3>

        {data.details?.slice(0, 5).map((d, i) => (
          <GlassCard key={i} className="p-5 mb-5">
  
            {/* Clause */}
            <div className="text-sm text-[var(--text-primary)] mb-2">
              {d.sentence}
            </div>

            {/* Tags */}
            <div className="flex gap-2 mb-2 text-xs">
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                {d.matched_category}
              </span>

              <span className={`px-2 py-1 rounded ${
                d.risk_level === "High" ? "bg-red-500/20 text-red-400" :
                d.risk_level === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-green-500/20 text-green-400"
              }`}>
                {d.risk_level}
              </span>

              <span className="bg-white/10 text-[var(--text-primary)] px-2 py-1 rounded">
                sim: {d.similarity_score?.toFixed(2)}
              </span>
            </div>

            {/* Issue */}
            <div className="text-red-600 text-sm mb-2">
              ⚠ {d.issue}
            </div>

            {/* Suggestion */}
            <div className="text-[var(--text-primary)] text-sm">
              💡 {d.suggested_optimization}
            </div>

          </GlassCard>
        ))}
      </div>

       {/* 🔥 VIEW FULL JSON
    <div className="mt-6">
      <button
        onClick={() => setShowJson(prev => !prev)}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        {showJson ? "Hide Details" : "View Full Details"}
      </button>

      {showJson && (
        <pre className="mt-4 p-4 bg-gray-900 text-green-400 text-xs rounded overflow-auto max-h-[400px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div> */}

    </div>
  );
}

export default ContractDetails;
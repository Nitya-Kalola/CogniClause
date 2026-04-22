import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Legend,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../lib/supabaseClient";
import GlassCard from "../components/GlassCard";
import ParticleBackground from "../components/ParticleBackground";  

import * as d3 from "d3";


const COLORS = [
  "#FF4D4F", // red
  "#FAAD14", // orange
  "#1890FF", // blue
  "#52C41A", // green
  "#722ED1", // purple
  "#13C2C2", // teal
];

export default function Dashboard() {
  // ============================
  // 1. STATE (STATIC MOCK DATA)
  // ============================
  const [avgSimilarity] = useState(83);

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  


 

  const safeContracts = Array.isArray(contracts) ? contracts : [];

  const [timeFilter, setTimeFilter] = useState("7d");

  const filteredContracts = safeContracts.filter(c => {
    if (timeFilter === "all") return true;

    const days = parseInt(timeFilter);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return new Date(c.created_at) >= cutoff;
  });

  const total = filteredContracts.length;

  const high = filteredContracts.filter(c => c?.level === "High").length;
  const medium = filteredContracts.filter(c => c?.level === "Medium").length;
  const low = filteredContracts.filter(c => c?.level === "Low").length;

  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedHigh, setAnimatedHigh] = useState(0);
  const [animatedMedium, setAnimatedMedium] = useState(0); 
  const [animatedLow, setAnimatedLow] = useState(0);
  const [summary, setSummary] = useState(null); 
  


  useEffect(() => {
    const duration = 800;
    const steps = 30;

    let i = 0;
    const interval = setInterval(() => {
      i++;

      setAnimatedTotal(Math.floor((total * i) / steps));
      setAnimatedHigh(Math.floor((high * i) / steps));
      setAnimatedMedium(Math.floor((medium * i) / steps));
      setAnimatedLow(Math.floor((low * i) / steps));

      if (i >= steps) clearInterval(interval);
    }, duration / steps);

    return () => clearInterval(interval);
  }, [total, high, medium, low]);

  useEffect(() => {
    async function loadData() {
  setLoading(true);

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  if (!user) {
    setLoading(false);
    return;
  }

  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });



  if (!error) {
    setContracts(data || []);
  }

  setLoading(false);
}

    loadData();
  }, []);
  // TEMP MOCK (until we compute real data)
const trendMap = {};

filteredContracts.forEach(c => {
  if (!c.created_at) return;

  const date = new Date(c.created_at).toISOString().split("T")[0]; // ✅ FIXED

  if (!trendMap[date]) {
    trendMap[date] = { date, high: 0, medium: 0, low: 0 };
  }

  if (c.level === "High") trendMap[date].high++;
  if (c.level === "Medium") trendMap[date].medium++;
  if (c.level === "Low") trendMap[date].low++;
});

const data = contracts;


const riskTrend = React.useMemo(() => {
  return Object.values(trendMap)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}, [filteredContracts]);



  const categoryMap = {};

  filteredContracts.forEach(c => {
    if (!Array.isArray(c.details)) return;

    c.details.forEach(d => {
      const cat = d?.matched_category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
  });

const isMobile = window.innerWidth < 768;

const categoryFreq = Object.entries(categoryMap)
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value)
  .slice(0, isMobile ? 5 : 10);

  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // top 6 only

  const categoryFrequency = Object.keys(categoryMap).map(k => ({
    category: k,
    count: categoryMap[k]
  }));
  
  const pieData = [
    { name: "High", value: high, color: "#FF4747" },
    { name: "Medium", value: medium, color: "#F6A100" },
    { name: "Low", value: low, color: "#00AEEF" },
  ];



const uniqueCategories = [...new Set(
  filteredContracts.flatMap(c =>
    Array.isArray(c.details)
      ? c.details.map(d => d?.matched_category)
      : []
  )
)].slice(0, 8); // limit to 8 rows
const heatmapRows = uniqueCategories;
const heatmapCols = ["High", "Medium", "Low"];


const heatmapData = heatmapRows.map(row => {
  return heatmapCols.map(col => {
    let count = 0;

    filteredContracts.forEach(c => {
      if (!Array.isArray(c.details)) return;

      c.details.forEach(d => {
        if (
          d?.matched_category === row &&
          c.level === col
        ) {
          count++;
        }
      });
    });

    return count;
  });
});

const maxValue = Math.max(...heatmapData.flat(), 1);

const colorScale = d3
  .scaleLinear()
  .domain([0, maxValue])
  .range(["#FFE5E5", "#C62828"]);

  // ============================
  // CARD WRAPPER STYLE
  // ============================



  return (
    <div
      className="min-h-screen bg-gradient-to-br ... select-none"
      style={{ opacity: 1 }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
              <ParticleBackground />
            </div>
    <div className="p-6 max-w-[1400px] mx-auto transition-opacity duration-500">
      {contracts.length === 0 && !loading && (
        <div className="text-[var(--text-primary)] text-lg mb-4">
          No contracts yet — upload one to see analytics.
        </div>
      )}

      {/* ======================== */}
      {/* DASHBOARD HEADING */}
      {/* ======================== */}
      <h1 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">Dashboard</h1>

      {/* ======================== */}
      {/* METRIC CARDS */}
      {/* ======================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white/30 rounded-xl animate-pulse " />  
            ))
          : (
            <>
              <GlassCard><p className="text-[var(--text-secondary)]">Total Evaluations</p><h2 className="text-xl md:text-3xl font-bold text-[var(--text-primary)]">{animatedTotal}</h2></GlassCard>
              <GlassCard><p className="text-[var(--text-secondary)]">High Risk</p><h2 className="text-xl md:text-3xl font-bold text-[var(--text-primary)]">{animatedHigh}</h2></GlassCard>
              <GlassCard><p className="text-[var(--text-secondary)]">Medium Risk</p><h2 className="text-xl md:text-3xl font-bold text-[var(--text-primary)]">{animatedMedium}</h2></GlassCard>
              <GlassCard><p className="text-[var(--text-secondary)]">Low Risk</p><h2 className="text-xl md:text-3xl font-bold text-[var(--text-primary)]">{animatedLow}</h2></GlassCard>
            </>
          )
        }
      </div>

      {/* ======================== */}
      {/* RISK TREND + GAUGE */}
      {/* ======================== */}
      <div className="flex gap-2 mb-4">
        {["7d", "30d", "90d", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setTimeFilter(f)}
            className={`px-3 py-1 rounded ${
              timeFilter === f ? "bg-blue-600 text-white" : "bg-white/10 text-[var(--text-primary)] hover:bg-white/20"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        
        {/* RISK TREND (big card) */}
        <GlassCard className="col-span-4">
          <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">Risk trend</h3>
          {riskTrend.length > 0 && (
          <ResponsiveContainer width="100%" height={280} className="md:h-[320px] mr-4">
            <LineChart key={timeFilter} data={riskTrend} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />

            <YAxis
              label={{
                value: "Number of Risks",
                angle: -90,
                position: "insideLeft",
                // Negative offset pushes it further left away from the numbers
                offset: 10, 
                style: { 
                  textAnchor: 'middle', // This centers it vertically     // Optional: matches standard gray text
                  fontWeight: 350       // Optional: makes it more readable
                }
              }}
            />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  border: "none",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  backdropFilter: "blur(8px)" 
                }}
                cursor={{ fill: "transparent" }}
              />
              <Line type="monotone" dataKey="low" stroke="#00AEEF" strokeWidth={3} dot={false} isAnimationActive={true} animationDuration={1200} />
              <Line type="monotone" dataKey="medium" stroke="#F6A100" strokeWidth={3} dot={false} isAnimationActive={true} animationDuration={1200} />
              <Line type="monotone" dataKey="high" stroke="#FF4747" strokeWidth={3} dot={false} isAnimationActive={true} animationDuration={1200} />
            </LineChart>
          </ResponsiveContainer>
          )}
        </GlassCard>

        

      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* GAUGE */}
        <GlassCard className="col-span-1 md:col-span-2 flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">Risk Distribution</h3>

          <ResponsiveContainer
            width="100%"
            height={window.innerWidth < 768 ? 260 : 450}
          >
            <BarChart
              data={[
                { type: "High", value: high },
                { type: "Medium", value: medium },
                { type: "Low", value: low }
              ]}
            >
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  border: "none",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  backdropFilter: "blur(8px)" 
                }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar
                dataKey="value"
                fill="#6A00FF"
                radius={[8,8,0,0]}
                activeBar={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="col-span-1 md:col-span-2 flex flex-col">
          <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)] text-center">Category share</h3>
          <div className="flex-1 flex items-center justify-center -mt-4 md:mt-0">
          <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 260 : 360}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                outerRadius="80%"
                innerRadius="55%"
                paddingAngle={2}
                label={false}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  backdropFilter: "blur(8px)"   
                }}
                itemStyle={{ color: "var(--text-primary)" }}
                cursor={false}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{
                  fontSize: "10px",
                  paddingTop: "10px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </GlassCard>


      </div>

      {/* ======================== */}
      {/* CATEGORY FREQUENCY + PIE CHART */}
      {/* ======================== */}
      <div className="grid grid-cols-4 gap-6 mb-6">

        {/* BIG CATEGORY FREQUENCY BAR CHART */}
        <GlassCard className="col-span-4">
          <h3 className="text-xl font-semibold mb-6 text-[var(--text-primary)]">Category frequency</h3>
          {categoryFrequency.length > 0 && (
          <ResponsiveContainer width="100%" height={450}>
            <BarChart 
              data={categoryFreq} 
              margin={{ top: 10, right: 30, left: 20, bottom: 80 }} // Increase bottom here
            >
              <XAxis 
                dataKey="name" 
                interval={0} 
                angle={-35} // -45 degrees is usually easier to read than -20
                textAnchor="end" 
                height={80} // Explicitly set height for the XAxis area
                tick={{ fontSize: 10 }} 
              />
              <YAxis />
              <Tooltip
                wrapperStyle={{ zIndex: 1000 }}
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  border: "none",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  backdropFilter: "blur(8px)"
                }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="value" fill="#6A00FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </GlassCard>

        {/* PIE CHART (small card) */}
        

      </div>

      {/* ======================== */}
      {/* TRUE HEATMAP */}
      {/* ======================== */}
      

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="col-span-1 md:col-span-2 mb-6 height-[420px] flex flex-col">
          <h3 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">High-risk heatmap</h3>
          
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="p-2"></th>
                {heatmapCols.map((col) => (
                  <th key={col} className="p-2 text-[var(--text-secondary)] text-sm">{col}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {heatmapRows.map((row, i) => (
                <tr key={row}>
                  <td className="p-2 pr-4 text-[var(--text-primary)] text-sm">{row}</td>

                  {heatmapCols.map((_, j) => (
                    <td
                      key={j}
                      className="w-20 h-14 border"
                      style={{
                        background: colorScale(heatmapData[i][j]),
                        transition: "0.3s",
                      }}
                    ></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 mt-3">
          Rows = categories, Columns = severity (High / Medium / Low), Color intensity = frequency.
        </p>
          </GlassCard>

           <GlassCard className="col-span-1 md:col-span-2  mb-6 h-[420px] md:h-[420px] flex flex-col">
            <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">Top Risk Categories</h3>

            {categoryFreq.slice(0, 5).map((item, i) => (
              <div key={i} className="flex justify-between mb-2 ">
                <span className="text-[var(--text-primary)]">{item.name}</span>
                <span className="font-semibold text-[var(--text-primary)]">{item.value}</span>
              </div>
            ))}
          </GlassCard>
            </div>

        
     

     



      {/* ======================== */}
      {/* RECENT EVALUATIONS */}
      {/* ======================== */}
        <GlassCard>
          <h3 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Recent evaluations</h3>
          {(filteredContracts || []).slice(0, 5).map((item, i) => (
            <div key={item.id} className="
    p-3 border-b
    grid grid-cols-1 gap-1
    md:grid-cols-3 md:items-center
  ">
              <p className="font-medium text-sm md:text-base text-[var(--text-primary)] truncate">{item.name || "Untitled"}</p>
              <span className="text-left md:text-center text-sm text-[var(--text-primary)]">{item.level}</span>
              <span className="text-left md:text-right text-xs text-gray-500">
                {item.created_at
                  ? new Date(item.created_at).toLocaleString()
                  : "Unknown"}
              </span>
            </div>
          ))}
        </GlassCard>

    </div>

  </div>

);

}

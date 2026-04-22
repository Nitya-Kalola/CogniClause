import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";
import ParticleBackground from "../components/ParticleBackground";  

export default function History() {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  

  useEffect(() => {
  setPage(1);
}, [search, filter]);

  async function loadHistory() {
    setLoading(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setRecords(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  // ------ Filtering ------
  const filtered = records.filter((rec) => {
    const matchesSearch =
      rec.name?.toLowerCase().includes(search.toLowerCase()) ||
      rec.text?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
    filter === "All"
      ? true
      : rec.level?.toLowerCase().trim() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const [open, setOpen] = useState(false);

  const options = ["All", "Low", "Medium", "High"];

  return (
    <div className="pt-24 px-6 min-h-screen w-100% max-w-6xl mx-auto">  
 
    <div className="fixed inset-0 z-0 pointer-events-none">
            <ParticleBackground />
          </div>

      <h1 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">History</h1>

      {/* Search + Filter */}
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 pb-1 text-gray-400" />
          <input
            className="w-full pl-10 p-2 border rounded-lg bg-white/30 border-white/40 text-gray-800 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Search contracts..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative w-28">
  {/* Button */}
  <button
    onClick={() => setOpen(!open)}
    className="w-full px-3 py-2 rounded-xl border border-white/20 
               bg-white/10 backdrop-blur-md text-white flex justify-between items-center
               hover:bg-white/20 transition-all"
  >
    {filter}
    <span className="text-xs">▼</span>
  </button>

  {/* Dropdown */}
  {open && (
    <div className="absolute top-12 w-full rounded-2xl 
                    bg-[#0b1220]/90 backdrop-blur-xl border border-white/10 
                    shadow-2xl overflow-hidden z-50">
      {options.map((opt) => (
        <div
          key={opt}
          onClick={() => {
            setFilter(opt);
            setOpen(false);
          }}
          className={`px-3 py-2 cursor-pointer text-sm transition-all
            ${
              filter === opt
                ? "bg-blue-500 text-white"
                : "text-white/70 hover:bg-white/10"
            }`}
        >
          {opt}
        </div>
      ))}
    </div>
  )}
</div>
      </div>
      {paginated.length === 0 && !loading && (
  <div className="text-center text-[var(--text-secondary)] mt-10">
    No matching contracts found.
  </div>
)}

              {/* Records Section */}
<div className="flex flex-col min-h-[60vh] justify-between">


        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-white/30 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="transition-opacity duration-500">
           {paginated.map((row) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl mb-4 shadow-md border border-white/30 
                        bg-white/20 backdrop-blur-xl hover:bg-white/30 transition-all"
            >
              <div className="font-semibold text-lg text-[var(--text-primary)] drop-shadow">  
                {row.name || "Untitled Contract"}
              </div>

              <div className="text-sm mt-1 text-[var(--text-secondary)]">
                Risk Level:{" "}
                <span
                  className={`font-bold ${
                    row.level === "Low"
                      ? "text-green-600"
                      : row.level === "Medium"
                      ? "text-yellow-500"
                      : "text-red-600"
                  }`}
                >
                  {row.level}
                </span>
              </div>

              <div className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2">
                {row.text?.slice(0, 120)}...
              </div>

              <div className="text-xs text-[var(--text-secondary)] mt-1">
                {new Date(row.created_at).toLocaleString()}
              </div>
              {/* VIEW DETAILS BUTTON */}
              <button
                className="mt-2 text-blue-600 text-sm hover:underline"
                onClick={() => {
                  window.location.href = `/contract/${row.id}`;
                }}
              >
                View details →
              </button>
            </motion.div>
          ))
        }  
      </div>)
      }

        {/* Pagination */}
        <div className="flex justify-center mt-2 mb-24 md:mb-10 gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-white/20
                      hover:bg-white/40 disabled:opacity-40"
          >
            Prev
          </button>

          <button
            disabled={page * PAGE_SIZE >= filtered.length}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl bg-white/30 backdrop-blur-md border border-white/20
                      hover:bg-white/40 disabled:opacity-40"
          >
            Next
          </button>
        </div>


      
      </div>

      </div>
   
  );
}

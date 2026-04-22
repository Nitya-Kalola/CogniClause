// src/components/FloatingCategories.jsx
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const categories = ["Liability", "Indemnity", "Payment Terms", "IP Rights", "Compliance"];

export default function FloatingCategories() {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    setNodes(categories.map((label, i) => ({
      id: i,
      label,
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
      delay: Math.random() * 5,
      duration: 20 + Math.random() * 20
    })));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute flex items-center gap-3 opacity-25 light:opacity-60"
          initial={{ x: 0, y: 0 }}
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            rotate: [0, 5, 0] 
          }}
          transition={{ 
            duration: node.duration, 
            repeat: Infinity, 
            ease: "linear",
            delay: node.delay 
          }}
          style={{ top: node.top, left: node.left }}
        >
          <div className="w-12 h-[1px] bg-gradient-to-r from-blue-500/40 to-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)]">
            {node.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
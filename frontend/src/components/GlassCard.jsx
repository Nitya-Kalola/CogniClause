// src/components/GlassCard.jsx
import React from "react";

export default function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`relative rounded-2xl p-6 ${className}`}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--card-shadow)",
        backdropFilter: "blur(16px)"
      }}
    >
      {children}
    </div>
  );
}

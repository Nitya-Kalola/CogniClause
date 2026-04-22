// src/components/ParallaxCard.jsx
import React, { useRef, useEffect } from "react";

export default function ParallaxCard({ children, className = "" }) {
  const cardRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const move = (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      card.style.transform =
        `perspective(900px) rotateX(${dy * -10}deg) rotateY(${dx * 10}deg) scale(1.03)`;

      // speed-based glow
      const now = performance.now();
      const dt = Math.max(16, now - lastPos.current.t);
      const vx = (e.clientX - lastPos.current.x) / dt;
      const vy = (e.clientY - lastPos.current.y) / dt;
      const speed = Math.min(1.2, Math.sqrt(vx * vx + vy * vy) * 14);

      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      card.style.setProperty("--glow", 0.08 + speed * 0.25);

      lastPos.current = { x: e.clientX, y: e.clientY, t: now };
    };

    const leave = () => {
      card.style.transform = `perspective(900px) rotateX(0) rotateY(0) scale(1)`;
      card.style.setProperty("--glow", 0);
      card.style.setProperty("--mx", `-9999px`);
      card.style.setProperty("--my", `-9999px`);
    };

    card.addEventListener("mousemove", move);
    card.addEventListener("mouseleave", leave);

    return () => {
      card.removeEventListener("mousemove", move);
      card.removeEventListener("mouseleave", leave);
    };
  }, []);

return (
  <div
    ref={cardRef}
    className={`relative rounded-2xl overflow-hidden ${className}`}
    style={{
      "--mx": "-9999px",
      "--my": "-9999px",
      "--glow": 0,
    }}
  >
    {/* SOFT GLOW (reduced intensity) */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(
            circle at var(--mx) var(--my),
            rgba(59,130,246,calc(var(--glow) * 0.6)),
            transparent 50%
          )`,
        filter: "blur(30px)",
      }}
    />

    {/* 🔥 GLASS SURFACE (NEW — VERY IMPORTANT) */}
    <div
      className="relative z-10 p-6 rounded-2xl"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--card-shadow)",
        backdropFilter: "blur(20px)"
      }}
    >
      {children}
    </div>
  </div>
);
}

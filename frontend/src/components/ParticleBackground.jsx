import React, { useEffect, useRef } from "react";

/**
 * ParticleBackground.jsx
 * - lightweight canvas particles (floating points + subtle connecting lines)
 * - no external deps
 */

export default function ParticleBackground({
  colorPrimary = "12, 45, 115", // base color (r,g,b)
  colorAccent = "40, 15, 100",
  density = 0.0008 // particles per px^2 (tweak)
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef();
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, vx: 0, vy: 0, last: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let particleCount = Math.max(25, Math.floor(w * h * density));

    function initParticles() {
      const arr = [];
      for (let i = 0; i < particleCount; i++) {
        arr.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: 0.8 + Math.random() * 1.8,
          hueOffset: Math.random()
        });
      }
      particlesRef.current = arr;
    }

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      particleCount = Math.max(25, Math.floor(w * h * density));
      initParticles();
    }

    function onMove(e) {
      const now = performance.now();
      const last = mouseRef.current.last || now;
      const dt = Math.max(8, now - last);
      const vx = (e.clientX - (mouseRef.current.x || e.clientX)) / dt;
      const vy = (e.clientY - (mouseRef.current.y || e.clientY)) / dt;
      mouseRef.current = { x: e.clientX, y: e.clientY, vx, vy, last: now };
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);

      // gentle gradient background overlay (very subtle)
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "rgba(245,250,255,0.02)");
      g.addColorStop(1, "rgba(200,230,255,0.02)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const particles = particlesRef.current;
      // update
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // slight wandering
        p.x += p.vx + Math.sin((performance.now() / 1000) + p.hueOffset) * 0.08;
        p.y += p.vy + Math.cos((performance.now() / 1200) + p.hueOffset) * 0.08;

        // wrap
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      // draw connections + particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // draw particle
        ctx.beginPath();
        ctx.fillStyle = `rgba(${colorPrimary}, ${0.22 + (p.r * 0.03)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // connections (only near mouse or near each other)
        for (let j = i + 1; j < i + 6 && j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 1200) {
            const alpha = 0.14 * (1 - d2 / 1200);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${colorPrimary}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // mouse-linked glow (soft)
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx && mx > -9000) {
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 160);
        const speedFactor = Math.min(1.6, Math.hypot(mouseRef.current.vx || 0, mouseRef.current.vy || 0) * 10);
        glow.addColorStop(0, `rgba(${colorAccent}, ${0.08 + speedFactor * 0.04})`);
        glow.addColorStop(1, `rgba(${colorPrimary}, 0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(mx - 160, my - 160, 320, 320);
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    initParticles();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [colorPrimary, colorAccent, density]);

  return (
    <>
      <canvas ref={canvasRef} className="particle-canvas" />
      <div className="particle-overlay" style={{ zIndex: 0 }} />
    </>
  );
}

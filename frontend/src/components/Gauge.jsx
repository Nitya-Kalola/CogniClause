// Gauge.jsx
import React, { useEffect, useRef } from 'react';

export default function Gauge({ value = 75, size = 260, strokeWidth = 22, color = '#5B21B6' }) {
  // value: 0..100
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const circleRef = useRef(null);

  useEffect(() => {
    const pct = Math.max(0, Math.min(100, value));
    const offset = circumference * (1 - pct / 100);
    const circle = circleRef.current;
    if (!circle) return;
    // animate via transition
    circle.style.transition = 'stroke-dashoffset 900ms cubic-bezier(.2,.9,.3,1)';
    circle.style.strokeDashoffset = offset;
  }, [value, circumference]);

  const center = size / 2;

  return (
    <div style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#eee"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* colored ring */}
        <circle
          ref={circleRef}
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          transform={`rotate(-90 ${center} ${center})`}
        />
        <text x={center} y={center - 6} fontSize="18" textAnchor="middle" fill="#6B7280">Avg similarity</text>
        <text x={center} y={center + 30} fontSize="40" fontWeight="700" textAnchor="middle" fill="#111827">
          {Math.round(value)}%
        </text>
      </svg>
    </div>
  );
}

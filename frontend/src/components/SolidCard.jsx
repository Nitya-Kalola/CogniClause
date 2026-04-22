// SolidCard.jsx
import React from 'react';

export default function SolidCard({ children, className = '' }) {
  return (
    <div className={`solid-card ${className}`}>
      {children}
    </div>
  );
}

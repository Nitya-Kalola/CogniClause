// Heatmap.jsx
import React from 'react';

/**
 * props:
 *  rows: array of row labels (categories)
 *  cols: array of col labels (severities)
 *  data: 2D array of numbers matching rows x cols
 */
function colorForValue(v, min, max) {
  // using red ramp: low -> light salmon, high -> deep red
  const ratio = (v - min) / (max - min || 1);
  // interpolate between light (#FDEDEC) and dark (#8B0000)
  const r1 = 253, g1 = 237, b1 = 236;
  const r2 = 139, g2 = 0, b2 = 0;
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return `rgb(${r},${g},${b})`;
}

export default function Heatmap({ rows = [], cols = [], data = [[]] }) {
  const paddingLeft = 120;
  const width = 420;
  const gridW = width - paddingLeft - 20;
  const cellW = gridW / cols.length;
  const cellH = 60;
  const height = rows.length * cellH + 40;

  // compute min/max
  let min = Infinity, max = -Infinity;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < cols.length; c++) {
      const v = data[r] && data[r][c] != null ? data[r][c] : 0;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  if (min === Infinity) min = 0;
  if (max === -Infinity) max = 0;

  return (
    <div>
      <svg className="heatmap-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMinYMin meet">
        {/* column labels */}
        {cols.map((col, i) => (
          <text
            key={i}
            x={paddingLeft + i * cellW + cellW / 2}
            y={18}
            fontSize="12"
            textAnchor="middle"
            fill="#374151">
            {col}
          </text>
        ))}

        {/* row labels and cells */}
        {rows.map((row, r) => (
          <g key={r}>
            <text
              x={paddingLeft - 12}
              y={40 + r * cellH + cellH / 2}
              fontSize="14"
              textAnchor="end"
              alignmentBaseline="middle"
              fill="#1f2937">
              {row}
            </text>

            {cols.map((col, c) => {
              const v = (data[r] && data[r][c] != null) ? data[r][c] : 0;
              const fill = colorForValue(v, min, max);
              return (
                <rect
                  key={c}
                  x={paddingLeft + c * cellW}
                  y={24 + r * cellH}
                  width={cellW - 6}
                  height={cellH - 12}
                  rx="6"
                  ry="6"
                  fill={fill}
                  stroke="rgba(0,0,0,0.03)"
                />
              );
            })}
          </g>
        ))}
      </svg>

      <div className="heatmap-legend">
        <small>Rows = categories, Cols = severity (High/Med/Low). Intensity = count</small>
      </div>
    </div>
  );
}

import React, { useMemo } from "react";

type Datum = { label: string; value: number };

interface Props {
  data: Datum[];
  height?: number;
  stroke?: string;
  fill?: string;
  showDots?: boolean;
}

export default function SimpleAreaChart({
  data,
  height = 200,
  stroke = "#1b2a41",
  fill = "rgba(27,42,65,0.2)",
  showDots = true,
}: Props) {
  const viewW = 600;
  const viewH = 200;
  const pad = 24;
  const chartW = viewW - pad * 2;
  const chartH = viewH - pad * 2;

  const { path, areaPath, points, ticks, maxVal } = useMemo(() => {
    if (!data || data.length === 0) {
      return { path: "", areaPath: "", points: [] as { x: number; y: number }[], ticks: [0, 0, 0, 0], maxVal: 0 };
    }
    const maxVal = Math.max(1, ...data.map(d => d.value));
    const n = data.length;
    const stepX = n > 1 ? chartW / (n - 1) : 0;

    const points = data.map((d, i) => {
      const x = pad + stepX * i;
      const y = pad + (1 - d.value / maxVal) * chartH;
      return { x, y };
    });

    const path = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" ");

    const areaPath = `${path} L${pad + stepX * (n - 1)},${pad + chartH} L${pad},${pad + chartH} Z`;

    const ticks = [0, 0.25, 0.5, 0.75].map(t => pad + chartH * t);

    return { path, areaPath, points, ticks, maxVal };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-full">
        <defs>
          <linearGradient id="simpleAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity={0.9} />
            <stop offset="100%" stopColor={fill} stopOpacity={0.1} />
          </linearGradient>
        </defs>

        {/* Grid */}
        {ticks.map((y, i) => (
          <line key={i} x1={pad} y1={y} x2={viewW - pad} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" />
        ))}

        {/* Axis */}
        <line x1={pad} y1={pad + chartH} x2={viewW - pad} y2={pad + chartH} stroke="#9ca3af" />
        <line x1={pad} y1={pad} x2={pad} y2={pad + chartH} stroke="#9ca3af" />

        {/* Area */}
        <path d={areaPath} fill="url(#simpleAreaFill)" />

        {/* Line */}
        <path d={path} fill="none" stroke={stroke} strokeWidth={2} />

        {/* Dots */}
        {showDots && points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={stroke} />
        ))}

        {/* X labels: show first, middle, last to avoid crowding */}
        {data.map((d, i) => {
          const show = i === 0 || i === data.length - 1 || i === Math.floor((data.length - 1) / 2);
          if (!show) return null;
          const x = pad + (data.length > 1 ? (chartW / (data.length - 1)) * i : 0);
          const y = pad + chartH + 16;
          return (
            <text key={`lbl-${i}`} x={x} y={y} textAnchor="middle" fontSize={12} fill="#6b7280">
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

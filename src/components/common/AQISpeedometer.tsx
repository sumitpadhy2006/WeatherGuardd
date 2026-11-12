import React from 'react';

interface AQISpeedometerProps {
  aqi: number;
  size?: 'sm' | 'md' | 'lg';
  showCategory?: boolean;
}

export const AQISpeedometer: React.FC<AQISpeedometerProps> = ({
  aqi,
  size = 'md',
  showCategory = true,
}) => {
  // Clamped AQI between 0 and 500
  const clampedAqi = Math.max(0, Math.min(500, aqi));

  // AQI Breakpoint ranges standard US EPA:
  // 0-50: Good (Green: #10B981)
  // 51-100: Moderate (Yellow: #FBBF24)
  // 101-150: Sensitive (Orange: #F97316)
  // 151-200: Unhealthy (Red: #EF4444)
  // 201-300: Very Unhealthy (Purple: #A855F7)
  // 301-500: Hazardous (Maroon: #881337 / #991B1B)

  // We map AQI 0..500 to angle in semi-circle or 200° arc (from 180° to 0°, or 195° to -15°)
  // Let's use a 180° semi-circle arc: from angle 180° (left) to 0° (right).
  // Angle for 0 is 180° (left), angle for 500 is 0° (right).
  // Custom non-linear or piecewise linear mapping gives better visual readability:
  // 0 -> 180°
  // 50 -> 150° (30° span for 0-50)
  // 100 -> 120° (30° span for 50-100)
  // 150 -> 90° (30° span for 100-150)
  // 200 -> 60° (30° span for 150-200)
  // 300 -> 30° (30° span for 200-300)
  // 500 -> 0° (30° span for 300-500)
  
  const getAngleForAqi = (val: number): number => {
    if (val <= 50) return 180 - (val / 50) * 30;
    if (val <= 100) return 150 - ((val - 50) / 50) * 30;
    if (val <= 150) return 120 - ((val - 100) / 50) * 30;
    if (val <= 200) return 90 - ((val - 150) / 50) * 30;
    if (val <= 300) return 60 - ((val - 200) / 100) * 30;
    return 30 - ((val - 300) / 200) * 30;
  };

  const angleDeg = getAngleForAqi(clampedAqi);
  const angleRad = (angleDeg * Math.PI) / 180;

  // Geometry definition
  const cx = 100;
  const cy = 90;
  const r = 68;
  const strokeWidth = 10;

  // Function to describe SVG arc path for a given start and end angle (in degrees)
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = x + radius * Math.cos(startRad);
    const y1 = y - radius * Math.sin(startRad);
    const x2 = x + radius * Math.cos(endRad);
    const y2 = y - radius * Math.sin(endRad);
    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  // Color segments: [startAngle, endAngle, color, labelNumber]
  const segments = [
    { start: 180, end: 150, color: '#10B981', label: '0', labelVal: 0 },
    { start: 150, end: 120, color: '#FBBF24', label: '50', labelVal: 50 },
    { start: 120, end: 90, color: '#F97316', label: '100', labelVal: 100 },
    { start: 90, end: 60, color: '#EF4444', label: '150', labelVal: 150 },
    { start: 60, end: 30, color: '#A855F7', label: '200', labelVal: 200 },
    { start: 30, end: 0, color: '#881337', label: '300', labelVal: 300 },
  ];

  // Dot position along the arc
  const dotX = cx + r * Math.cos(angleRad);
  const dotY = cy - r * Math.sin(angleRad);

  // Category determination
  let category = 'Good';
  let categoryColor = 'text-emerald-400';
  let dotGlowColor = 'rgba(16, 185, 129, 0.7)';
  if (clampedAqi > 300) {
    category = 'Hazardous';
    categoryColor = 'text-rose-900 text-red-400';
    dotGlowColor = 'rgba(136, 19, 55, 0.9)';
  } else if (clampedAqi > 200) {
    category = 'Very Unhealthy';
    categoryColor = 'text-purple-400';
    dotGlowColor = 'rgba(168, 85, 247, 0.8)';
  } else if (clampedAqi > 150) {
    category = 'Unhealthy';
    categoryColor = 'text-red-400';
    dotGlowColor = 'rgba(239, 68, 68, 0.8)';
  } else if (clampedAqi > 100) {
    category = 'Unhealthy for Sensitive';
    categoryColor = 'text-orange-400';
    dotGlowColor = 'rgba(249, 115, 22, 0.8)';
  } else if (clampedAqi > 50) {
    category = 'Moderate';
    categoryColor = 'text-amber-400';
    dotGlowColor = 'rgba(251, 191, 36, 0.8)';
  }

  // Ticks and numbers around the speedometer outer rim
  const tickLabels = [
    { aqi: 0, text: '0', angle: 180 },
    { aqi: 50, text: '50', angle: 150 },
    { aqi: 100, text: '100', angle: 120 },
    { aqi: 150, text: '150', angle: 90 },
    { aqi: 200, text: '200', angle: 60 },
    { aqi: 300, text: '300', angle: 30 },
    { aqi: 500, text: '500', angle: 0 },
  ];

  return (
    <div className="flex flex-col items-center justify-center select-none w-full">
      <div className="relative w-full max-w-[180px] aspect-[200/115] flex items-center justify-center">
        <svg
          viewBox="0 0 200 115"
          className="w-full h-full overflow-visible"
          aria-label={`AQI Speedometer showing ${aqi}`}
        >
          {/* Background Track Glow */}
          <path
            d={describeArc(cx, cy, r, 180, 0)}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth + 4}
            strokeLinecap="round"
          />

          {/* Colored Segments */}
          {segments.map((seg, idx) => (
            <path
              key={idx}
              d={describeArc(cx, cy, r, seg.start - 1, seg.end + 1)}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              className="transition-all duration-300"
            />
          ))}

          {/* Tick numbers written on the speedometer */}
          {tickLabels.map((tick) => {
            const rad = (tick.angle * Math.PI) / 180;
            const textR = r - 16;
            const tx = cx + textR * Math.cos(rad);
            const ty = cy - textR * Math.sin(rad) + 3;
            return (
              <text
                key={tick.aqi}
                x={tx}
                y={ty}
                textAnchor="middle"
                fontSize="7.5"
                fontFamily="monospace"
                fontWeight="600"
                fill="rgba(203, 213, 225, 0.7)"
              >
                {tick.text}
              </text>
            );
          })}

          {/* Speedometer Center Dial Hub */}
          <circle
            cx={cx}
            cy={cy}
            r={5}
            fill="#0f172a"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1.5}
          />

          {/* Needle / Indicator line to the dot */}
          <line
            x1={cx}
            y1={cy}
            x2={dotX}
            y2={dotY}
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Current AQI Indicator Dot on the dial */}
          <g>
            {/* Outer Glow Halo */}
            <circle
              cx={dotX}
              cy={dotY}
              r={9}
              fill={dotGlowColor}
              className="animate-pulse opacity-70"
            />
            {/* White Ring */}
            <circle
              cx={dotX}
              cy={dotY}
              r={5.5}
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth={1.5}
              className="drop-shadow-md"
            />
            {/* Inner Core Dot */}
            <circle
              cx={dotX}
              cy={dotY}
              r={2.5}
              fill="#0f172a"
            />
          </g>

          {/* Center Digital AQI readout inside the gauge */}
          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            fontSize="26"
            fontWeight="bold"
            fontFamily="monospace"
            fill="#ffffff"
          >
            {aqi}
          </text>
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="500"
            fill="rgba(148, 163, 184, 0.9)"
            letterSpacing="1"
          >
            AQI
          </text>
        </svg>
      </div>

      {/* Dynamic Category Tag underneath */}
      {showCategory && (
        <div className="text-center mt-1">
          <span className={`text-[11px] font-semibold ${categoryColor} uppercase tracking-wider`}>
            {category}
          </span>
        </div>
      )}
    </div>
  );
};

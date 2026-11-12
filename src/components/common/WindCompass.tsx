import React from 'react';

interface WindCompassProps {
  speed: number;
  speedUnit: string;
  windDeg: number;
  size?: number;
}

export const WindCompass: React.FC<WindCompassProps> = ({
  speed,
  speedUnit,
  windDeg,
  size = 140,
}) => {
  const cx = 70;
  const cy = 70;
  const outerR = 58;
  const innerR = 50;
  const labelR = 53;

  // Generate 60 tick marks around the compass ring
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const deg = i * 6; // 0 to 354 deg
    // Skip ticks where N (0), E (90), S (180), W (270) are placed
    const isNearCardinal =
      (deg >= 348 || deg <= 12) || // North
      (deg >= 78 && deg <= 102) || // East
      (deg >= 168 && deg <= 192) || // South
      (deg >= 258 && deg <= 282); // West

    if (!isNearCardinal) {
      const rad = ((deg - 90) * Math.PI) / 180;
      const x1 = cx + innerR * Math.cos(rad);
      const y1 = cy + innerR * Math.sin(rad);
      const x2 = cx + outerR * Math.cos(rad);
      const y2 = cy + outerR * Math.sin(rad);
      ticks.push({ x1, y1, x2, y2, deg });
    }
  }

  // In Apple Weather compass:
  // The arrow stem does not draw through the center text.
  // Instead, the arrow passes BEHIND the center disk, OR has two segmented stems:
  // 1) From the origin dot (at radius arrowOuterR) to the edge of the center text disc (radius centerDiscR)
  // 2) From the other edge of the center text disc to the arrow tip (at radius arrowOuterR)
  // Plus: The center text disc and numbers are rendered on top with a clean backdrop so they are never obscured.

  const arrowOuterR = 55;
  const centerCutoutR = 27; // Radius of the center circle containing speed and unit

  // Coordinates along the vertical (0 deg, pointing North/South before rotation)
  // Origin Dot is at South (or North). In standard meteorological vector:
  // windDeg is the direction the wind is blowing FROM.
  // The dot is at the origin (from) and the arrow points to the destination (where wind is going).
  // Dot at top (N): y = cy - arrowOuterR
  // Stem segment 1: from dot (cy - arrowOuterR) to top edge of center disc (cy - centerCutoutR)
  // Stem segment 2: from bottom edge of center disc (cy + centerCutoutR) to arrow tip (cy + arrowOuterR)
  
  const dotY = cy - arrowOuterR;
  const stem1EndY = cy - centerCutoutR;
  const stem2StartY = cy + centerCutoutR;
  const tipY = cy + arrowOuterR;

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 140 140"
        className="w-full h-full overflow-visible"
        aria-label={`Wind Compass at ${windDeg}°`}
      >
        {/* Subtle inner dial circle */}
        <circle
          cx={cx}
          cy={cy}
          r={38}
          fill="rgba(255, 255, 255, 0.05)"
        />

        {/* Ticks around the ring */}
        {ticks.map((t, idx) => (
          <line
            key={idx}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        ))}

        {/* Cardinal Letters */}
        {/* North */}
        <text
          x={cx}
          y={cy - labelR + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="rgba(255, 255, 255, 0.9)"
        >
          N
        </text>
        {/* East */}
        <text
          x={cx + labelR - 2}
          y={cy + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="rgba(255, 255, 255, 0.9)"
        >
          E
        </text>
        {/* South */}
        <text
          x={cx}
          y={cy + labelR + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="rgba(255, 255, 255, 0.9)"
        >
          S
        </text>
        {/* West */}
        <text
          x={cx - labelR + 2}
          y={cy + 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="rgba(255, 255, 255, 0.9)"
        >
          W
        </text>

        {/* Animated Wind Vector Arrow (rendered UNDER the center speed disc) */}
        <g
          style={{
            transform: `rotate(${windDeg}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Top Stem (Origin Dot to Disc edge) */}
          <line
            x1={cx}
            y1={dotY}
            x2={cx}
            y2={stem1EndY}
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Bottom Stem (Disc edge to Arrowhead) */}
          <line
            x1={cx}
            y1={stem2StartY}
            x2={cx}
            y2={tipY - 3}
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Source Dot */}
          <circle
            cx={cx}
            cy={dotY}
            r={4.5}
            fill="#ffffff"
            stroke="rgba(15, 23, 42, 0.5)"
            strokeWidth="1"
          />

          {/* Destination Arrowhead */}
          <path
            d={`M ${cx - 5} ${tipY - 9} L ${cx} ${tipY} L ${cx + 5} ${tipY - 9}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Center Protected Readout Disc (Always clean & un-occluded on top) */}
        <circle
          cx={cx}
          cy={cy}
          r={26}
          fill="#1e293b"
          className="fill-slate-900/90"
        />

        {/* Center Digital Speed and Unit */}
        <g className="pointer-events-none">
          <text
            x={cx}
            y={cy - 1}
            textAnchor="middle"
            fontSize="21"
            fontWeight="bold"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="#ffffff"
          >
            {speed}
          </text>
          <text
            x={cx}
            y={cy + 13}
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="500"
            fontFamily="system-ui, -apple-system, sans-serif"
            fill="rgba(226, 232, 240, 0.9)"
          >
            {speedUnit}
          </text>
        </g>
      </svg>
    </div>
  );
};

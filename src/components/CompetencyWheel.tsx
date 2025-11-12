import { CompetencyProgress } from "@/types";

interface CompetencyWheelProps {
  progress: CompetencyProgress;
  size?: number;
}

const COMPETENCIES = ["Research", "Create", "Organize", "Communicate", "Learn"];
const COLORS = [
  "hsl(265 55% 75%)", // Vibrant Lavender
  "hsl(160 65% 70%)", // Bright Mint
  "hsl(195 70% 72%)", // Vivid Sky
  "hsl(280 60% 70%)", // Rich Purple
  "hsl(150 70% 68%)", // Lush Green
];
const GLOW_COLORS = [
  "hsl(265 55% 75% / 0.6)",
  "hsl(160 65% 70% / 0.6)",
  "hsl(195 70% 72% / 0.6)",
  "hsl(280 60% 70% / 0.6)",
  "hsl(150 70% 68% / 0.6)",
];

export const CompetencyWheel = ({ progress, size = 300 }: CompetencyWheelProps) => {
  const center = size / 2;
  const radius = size / 2 - 40;

  const getCoordinates = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const adjustedRadius = (radius * value) / 100;
    return {
      x: center + adjustedRadius * Math.cos(angle),
      y: center + adjustedRadius * Math.sin(angle),
    };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const labelRadius = radius + 25;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
    };
  };

  const points = COMPETENCIES.map((comp, i) => {
    const value = progress[comp] || 0;
    const coords = getCoordinates(i, value);
    return `${coords.x},${coords.y}`;
  }).join(" ");

  const maxPoints = COMPETENCIES.map((_, i) => {
    const coords = getCoordinates(i, 100);
    return `${coords.x},${coords.y}`;
  }).join(" ");

  return (
    <div className="relative flex items-center justify-center wheel-float">
      <svg width={size} height={size} className="transform transition-all duration-500 wheel-glow hover:scale-105" style={{ transformOrigin: 'center' }}>
        {/* Background circles - minimal */}
        {[50, 100].map((percent) => (
          <circle
            key={percent}
            cx={center}
            cy={center}
            r={(radius * percent) / 100}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="0.5"
            opacity="0.2"
          />
        ))}

        {/* Maximum area - minimal */}
        <polygon
          points={maxPoints}
          fill="hsl(var(--muted) / 0.05)"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Progress area */}
        <polygon
          points={points}
          fill="url(#competency-gradient)"
          stroke="none"
        />
        <polygon
          points={points}
          fill="none"
          stroke="hsl(280 70% 65%)"
          strokeWidth="2"
          filter="url(#neon-trace)"
        >
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="3s"
            repeatCount="indefinite"
          />
        </polygon>

        {/* Gradient definitions - simplified */}
        <defs>
          <radialGradient id="competency-gradient">
            <stop offset="0%" stopColor="hsl(265 55% 75% / 0.5)" />
            <stop offset="100%" stopColor="hsl(280 60% 70% / 0.2)" />
          </radialGradient>
          
          {/* Neon trace glow */}
          <filter id="neon-trace" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2"/>
            <feMerge>
              <feMergeNode in="blur2"/>
              <feMergeNode in="blur1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="dot-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Axis lines and labels */}
        {COMPETENCIES.map((comp, i) => {
          const endCoords = getCoordinates(i, 100);
          const labelCoords = getLabelCoordinates(i);
          const value = progress[comp] || 0;

          return (
            <g key={comp}>
              {/* Axis line - minimal */}
              <line
                x1={center}
                y1={center}
                x2={endCoords.x}
                y2={endCoords.y}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                opacity="0.3"
              />
              
              {/* Value dot - clean */}
              <circle
                cx={getCoordinates(i, value).x}
                cy={getCoordinates(i, value).y}
                r="5"
                fill={COLORS[i]}
                filter="url(#dot-glow)"
                className="transition-all duration-300 hover:r-7 cursor-pointer"
              >
                <animate
                  attributeName="r"
                  values="5;6;5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Label */}
              <text
                x={labelCoords.x}
                y={labelCoords.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-xs font-medium"
              >
                {comp}
              </text>

              {/* Value percentage */}
              <text
                x={labelCoords.x}
                y={labelCoords.y + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {value}%
              </text>
            </g>
          );
        })}

        {/* Center dot - clean minimal */}
        <circle cx={center} cy={center} r="4" fill="hsl(280 70% 65%)" />
      </svg>
    </div>
  );
};

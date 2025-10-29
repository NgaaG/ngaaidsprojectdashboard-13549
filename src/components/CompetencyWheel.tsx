import { CompetencyProgress } from "@/types";

interface CompetencyWheelProps {
  progress: CompetencyProgress;
  size?: number;
}

const COMPETENCIES = ["Research", "Create", "Organize", "Communicate", "Learn"];
const COLORS = [
  "hsl(265 45% 80%)", // Lavender
  "hsl(160 55% 80%)", // Mint
  "hsl(195 60% 76%)", // Sky
  "hsl(280 50% 75%)", // Purple
  "hsl(150 60% 75%)", // Green
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
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform rotate-0 transition-all duration-500">
        {/* Background circles */}
        {[25, 50, 75, 100].map((percent) => (
          <circle
            key={percent}
            cx={center}
            cy={center}
            r={(radius * percent) / 100}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}

        {/* Maximum area (reference) */}
        <polygon
          points={maxPoints}
          fill="hsl(var(--muted) / 0.1)"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* Progress area */}
        <polygon
          points={points}
          fill="url(#competency-gradient)"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          className="animate-pulse-glow"
        />

        {/* Gradient definition */}
        <defs>
          <radialGradient id="competency-gradient">
            <stop offset="0%" stopColor="hsl(265 45% 80% / 0.6)" />
            <stop offset="100%" stopColor="hsl(160 55% 80% / 0.4)" />
          </radialGradient>
        </defs>

        {/* Axis lines and labels */}
        {COMPETENCIES.map((comp, i) => {
          const endCoords = getCoordinates(i, 100);
          const labelCoords = getLabelCoordinates(i);
          const value = progress[comp] || 0;

          return (
            <g key={comp}>
              {/* Axis line */}
              <line
                x1={center}
                y1={center}
                x2={endCoords.x}
                y2={endCoords.y}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                opacity="0.5"
              />
              
              {/* Value dot */}
              <circle
                cx={getCoordinates(i, value).x}
                cy={getCoordinates(i, value).y}
                r="6"
                fill={COLORS[i]}
                stroke="white"
                strokeWidth="2"
                className="transition-all duration-500"
              />

              {/* Label */}
              <text
                x={labelCoords.x}
                y={labelCoords.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-xs font-semibold"
              >
                {comp}
              </text>

              {/* Value percentage */}
              <text
                x={labelCoords.x}
                y={labelCoords.y + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-xs"
              >
                {value}%
              </text>
            </g>
          );
        })}

        {/* Center circle */}
        <circle cx={center} cy={center} r="8" fill="hsl(var(--primary))" />
      </svg>
    </div>
  );
};

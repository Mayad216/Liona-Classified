import type { CategoryAggregateScore } from "@/lib/matchmaking/types";

interface Props {
  categoryScores: CategoryAggregateScore[];
  size?: number;
}

/**
 * Pure-SVG radar chart — aggregates per-dimension scores into categories.
 * Categories where either user picked "Any" show as a full match.
 */
export function CompatibilityRadar({ categoryScores, size = 260 }: Props) {
  const n = Math.max(categoryScores.length, 3);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const rings = [0.25, 0.5, 0.75, 1];

  const pointOnAxis = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const radius = r * value;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)] as const;
  };

  const polygon = categoryScores
    .map((s, i) => pointOnAxis(i, s.value).join(","))
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="mx-auto block">
        <defs>
          <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgb(99,102,241)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="rgb(245,158,11)" stopOpacity="0.18" />
          </radialGradient>
        </defs>

        {rings.map((ring) => (
          <circle
            key={ring}
            cx={cx}
            cy={cy}
            r={r * ring}
            fill="none"
            stroke="rgb(226,232,240)"
            strokeWidth={1}
          />
        ))}

        {categoryScores.map((s, i) => {
          const [x, y] = pointOnAxis(i, 1);
          const [lx, ly] = pointOnAxis(i, 1.22);
          return (
            <g key={s.key}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="rgb(226,232,240)" strokeWidth={1} />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-500 text-[9px] font-semibold uppercase tracking-widest"
              >
                {s.label}
              </text>
              {s.openMatch && (
                <text
                  x={lx}
                  y={ly + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-emerald-600 text-[8px] font-bold uppercase tracking-widest"
                >
                  Match
                </text>
              )}
            </g>
          );
        })}

        <polygon
          points={polygon}
          fill="url(#radar-fill)"
          stroke="rgb(99,102,241)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {categoryScores.map((s, i) => {
          const [x, y] = pointOnAxis(i, s.value);
          return (
            <circle
              key={`${s.key}-dot`}
              cx={x}
              cy={y}
              r={3.5}
              fill={s.openMatch ? "rgb(16,185,129)" : "rgb(99,102,241)"}
            />
          );
        })}
      </svg>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {categoryScores.map((s) => (
          <li
            key={s.key}
            className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs"
          >
            <span className="font-medium text-slate-700">{s.label}</span>
            {s.openMatch ? (
              <span className="font-bold uppercase tracking-wider text-emerald-600">Match</span>
            ) : (
              <span className="font-semibold tabular-nums text-slate-900">
                {Math.round(s.value * 100)}%
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

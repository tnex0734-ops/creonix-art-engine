type Variant = "mark" | "full";
type Size = "sm" | "md" | "lg" | "xl";

const HEIGHTS: Record<Size, number> = { sm: 28, md: 40, lg: 56, xl: 80 };

/**
 * CREONIX — Minimal Bauhaus wordmark v4.
 *
 * One bold geometric mark + clean Archivo-style wordmark. Three primaries only:
 * red, blue, yellow + ink. The mark is a circle (yellow) cut by a red
 * quarter-disc and a blue square — the holy trinity of Bauhaus.
 */

export const Logo = ({
  size = "md",
  variant = "full",
  onDark = false,
}: {
  size?: Size;
  variant?: Variant;
  onDark?: boolean;
}) => {
  const h = HEIGHTS[size];
  const ink = onDark ? "hsl(var(--ink-foreground))" : "hsl(var(--ink))";
  const red = "hsl(var(--primary))";
  const blue = "hsl(var(--secondary))";
  const yellow = "hsl(var(--accent))";

  // --- The mark: yellow circle + red quarter + blue square
  const Mark = ({ s = 100 }: { s?: number }) => (
    <g>
      {/* yellow circle */}
      <circle cx={s / 2} cy={s / 2} r={s / 2} fill={yellow} />
      {/* red quarter (bottom-left wedge) */}
      <path
        d={`M 0 ${s / 2} A ${s / 2} ${s / 2} 0 0 0 ${s / 2} ${s} L ${s / 2} ${s / 2} Z`}
        fill={red}
      />
      {/* blue square — top-right overlay */}
      <rect x={s / 2} y={0} width={s / 2} height={s / 2} fill={blue} />
      {/* ink dot at center for tension */}
      <circle cx={s / 2} cy={s / 2} r={s * 0.06} fill={ink} />
    </g>
  );

  if (variant === "mark") {
    return (
      <svg
        height={h}
        width={h}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Creonix"
        role="img"
      >
        <Mark />
      </svg>
    );
  }

  // Full lockup: mark + "CREONIX" wordmark
  const VB_H = 100;
  const VB_W = 460;
  const w = (h * VB_W) / VB_H;

  return (
    <svg
      height={h}
      width={w}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Creonix"
      role="img"
    >
      <Mark s={100} />
      <text
        x={120}
        y={72}
        fill={ink}
        style={{
          fontFamily: "'Archivo Black', 'Inter', sans-serif",
          fontSize: 64,
          letterSpacing: 2,
        }}
      >
        CREONIX
      </text>
    </svg>
  );
};

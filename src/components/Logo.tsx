type Variant = "mark" | "full";
type Size = "sm" | "md" | "lg" | "xl";

const HEIGHTS: Record<Size, number> = { sm: 28, md: 40, lg: 56, xl: 80 };

/**
 * CREONIX — Minimal Bauhaus wordmark v5.
 *
 * Mark: yellow circle + red quarter + blue square, with a black pencil/nib
 * cutting diagonally across — signalling illustration/creation.
 * Wordmark: Bebas Neue (tall, narrow display) for clear brand presence.
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
  const bg = onDark ? "hsl(var(--ink))" : "hsl(var(--background))";
  const red = "hsl(var(--primary))";
  const blue = "hsl(var(--secondary))";
  const yellow = "hsl(var(--accent))";

  // The mark — Bauhaus shapes + diagonal pencil
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

      {/* PENCIL — diagonal from top-left to bottom-right */}
      <g transform={`rotate(45 ${s / 2} ${s / 2})`}>
        {/* pencil body (ink) */}
        <rect
          x={s * 0.18}
          y={s * 0.46}
          width={s * 0.5}
          height={s * 0.08}
          fill={ink}
        />
        {/* yellow ferrule band */}
        <rect
          x={s * 0.62}
          y={s * 0.46}
          width={s * 0.06}
          height={s * 0.08}
          fill={yellow}
          stroke={ink}
          strokeWidth={s * 0.012}
        />
        {/* pink eraser */}
        <rect
          x={s * 0.68}
          y={s * 0.46}
          width={s * 0.08}
          height={s * 0.08}
          fill={red}
          stroke={ink}
          strokeWidth={s * 0.012}
        />
        {/* sharpened tip — triangle pointing left */}
        <polygon
          points={`${s * 0.18},${s * 0.46} ${s * 0.18},${s * 0.54} ${s * 0.08},${s * 0.5}`}
          fill={bg}
          stroke={ink}
          strokeWidth={s * 0.012}
        />
        {/* graphite point */}
        <polygon
          points={`${s * 0.12},${s * 0.485} ${s * 0.12},${s * 0.515} ${s * 0.08},${s * 0.5}`}
          fill={ink}
        />
      </g>
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

  // Full lockup: mark + multicolor "CREONIX" wordmark in hero display style
  const VB_H = 100;
  const VB_W = 540;
  const w = (h * VB_W) / VB_H;

  // Per-letter color palette matching hero (ink, primary red, secondary blue, accent yellow)
  const letters: Array<{ ch: string; fill: string; italic?: boolean }> = [
    { ch: "C", fill: ink },
    { ch: "R", fill: red },
    { ch: "E", fill: ink },
    { ch: "O", fill: blue },
    { ch: "N", fill: ink },
    { ch: "I", fill: red, italic: true },
    { ch: "X", fill: ink },
  ];

  // Layout letters with the "O" wrapped in a yellow Bauhaus block (rotated, bordered)
  const startX = 120;
  const letterW = 52;
  const baselineY = 76;

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

      {/* Yellow rotated block behind the "O" — echoes hero SPEED chip */}
      <g transform={`rotate(-4 ${startX + letterW * 3 + letterW / 2} ${baselineY - 30})`}>
        <rect
          x={startX + letterW * 3 - 6}
          y={baselineY - 60}
          width={letterW + 12}
          height={72}
          fill={yellow}
          stroke={ink}
          strokeWidth={4}
        />
      </g>

      <g
        style={{
          fontFamily: "'Archivo Black', 'Inter', sans-serif",
          fontWeight: 900,
          fontSize: 72,
          letterSpacing: -1,
        }}
      >
        {letters.map((l, i) => (
          <text
            key={i}
            x={startX + i * letterW}
            y={baselineY}
            fill={l.fill}
            fontStyle={l.italic ? "italic" : "normal"}
          >
            {l.ch}
          </text>
        ))}
      </g>
    </svg>
  );
};

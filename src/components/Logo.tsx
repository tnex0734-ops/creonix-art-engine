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

  // Full lockup: SVG mark + HTML wordmark (mirrors Footer styling exactly)
  const fontSize = h * 0.85;

  return (
    <span
      className="inline-flex items-center gap-2"
      aria-label="Creonix"
      role="img"
    >
      <svg
        height={h}
        width={h}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <Mark />
      </svg>
      <span
        className="heading-display inline-flex items-center gap-0.5 leading-none"
        style={{ fontSize }}
      >
        <span className="text-ink">C</span>
        <span className="text-primary">R</span>
        <span className="text-ink">E</span>
        <span
          className="relative inline-flex items-center justify-center -rotate-2 bg-accent bauhaus-border-thick bauhaus-shadow"
          style={{ padding: `${h * 0.04}px ${h * 0.12}px` }}
        >
          <span className="text-secondary">O</span>
        </span>
        <span className="text-ink">N</span>
        <span className="text-primary italic">I</span>
        <span className="text-ink">X</span>
      </span>
    </span>
  );
};

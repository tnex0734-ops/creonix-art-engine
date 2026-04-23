type Variant = "mark" | "full";
type Size = "sm" | "md" | "lg" | "xl";

const HEIGHTS: Record<Size, number> = { sm: 22, md: 30, lg: 44, xl: 60 };

/**
 * CREONIX — Bauhaus geometric wordmark.
 * Each letter is built from primitive shapes (circles, semicircles, rects, triangles)
 * in a high-contrast Bauhaus palette (Red / Blue / Yellow / Ink). No purple.
 *
 * variant="mark" → CX monogram (square-ish, great for favicons / nav on mobile)
 * variant="full" → full CREONIX wordmark
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
  const ink = "hsl(var(--ink))";
  const stroke = onDark ? "hsl(var(--ink-foreground))" : ink;
  const sw = 3; // stroke width in viewBox units

  if (variant === "mark") {
    // CX monogram, viewBox 80 x 60
    const w = (h * 80) / 60;
    return (
      <svg
        height={h}
        width={w}
        viewBox="0 0 80 60"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Creonix"
        role="img"
      >
        {/* C — open ring (blue) */}
        <g>
          <circle cx="22" cy="30" r="20" fill="hsl(var(--secondary))" stroke={stroke} strokeWidth={sw} />
          {/* Mouth opening on the right */}
          <path
            d="M 22 30 L 44 14 L 44 46 Z"
            fill={onDark ? "hsl(var(--ink))" : "hsl(var(--background))"}
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="miter"
          />
          {/* Inner red dot */}
          <circle cx="22" cy="30" r="5" fill="hsl(var(--primary))" stroke={stroke} strokeWidth={sw} />
        </g>
        {/* X — two crossing bars (red + yellow) */}
        <g transform="translate(58 30)">
          <rect
            x="-5" y="-22" width="10" height="44" rx="1"
            fill="hsl(var(--primary))" stroke={stroke} strokeWidth={sw}
            transform="rotate(45)"
          />
          <rect
            x="-5" y="-22" width="10" height="44" rx="1"
            fill="hsl(var(--accent))" stroke={stroke} strokeWidth={sw}
            transform="rotate(-45)"
          />
        </g>
      </svg>
    );
  }

  // FULL wordmark — viewBox 380 x 60. Each letter ~46 wide, gap ~6.
  const w = (h * 380) / 60;
  return (
    <svg
      height={h}
      width={w}
      viewBox="0 0 380 60"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Creonix"
      role="img"
    >
      {/* C — blue open circle, x-center 22 */}
      <g>
        <circle cx="22" cy="30" r="20" fill="hsl(var(--secondary))" stroke={stroke} strokeWidth={sw} />
        <path
          d="M 22 30 L 44 16 L 44 44 Z"
          fill={onDark ? "hsl(var(--ink))" : "hsl(var(--background))"}
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="miter"
        />
        <circle cx="22" cy="30" r="4.5" fill="hsl(var(--primary))" stroke={stroke} strokeWidth={sw} />
      </g>

      {/* R — red stem + blue half-circle bowl + red diagonal leg, x-start 52 */}
      <g transform="translate(52 10)">
        <rect x="0" y="0" width="10" height="40" fill="hsl(var(--primary))" stroke={stroke} strokeWidth={sw} />
        <path
          d="M 10 0 L 24 0 A 10 10 0 0 1 24 20 L 10 20 Z"
          fill="hsl(var(--secondary))"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="miter"
        />
        <polygon
          points="10,20 24,20 32,40 18,40"
          fill="hsl(var(--primary))"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="miter"
        />
      </g>

      {/* E — yellow block with two ink negative bars, x-start 92 */}
      <g transform="translate(92 10)">
        <rect x="0" y="0" width="30" height="40" fill="hsl(var(--accent))" stroke={stroke} strokeWidth={sw} />
        <rect x="10" y="11" width="20" height="6" fill={stroke} />
        <rect x="10" y="23" width="20" height="6" fill={stroke} />
      </g>

      {/* O — bold donut (ink ring + red core), x-center 145 */}
      <g>
        <circle cx="145" cy="30" r="20" fill={stroke} stroke={stroke} strokeWidth={sw} />
        <circle cx="145" cy="30" r="11" fill="hsl(var(--primary))" stroke={stroke} strokeWidth={sw} />
      </g>

      {/* N — two blue posts + red diagonal, x-start 175 */}
      <g transform="translate(175 10)">
        <rect x="0" y="0" width="10" height="40" fill="hsl(var(--secondary))" stroke={stroke} strokeWidth={sw} />
        <rect x="30" y="0" width="10" height="40" fill="hsl(var(--secondary))" stroke={stroke} strokeWidth={sw} />
        <polygon
          points="10,0 22,0 40,40 28,40"
          fill="hsl(var(--primary))"
          stroke={stroke}
          strokeWidth={sw}
          strokeLinejoin="miter"
        />
      </g>

      {/* I — yellow stem with red caps, x-start 225 */}
      <g transform="translate(225 10)">
        <rect x="6" y="8" width="10" height="24" fill="hsl(var(--accent))" stroke={stroke} strokeWidth={sw} />
        <rect x="0" y="0" width="22" height="9" fill="hsl(var(--primary))" stroke={stroke} strokeWidth={sw} />
        <rect x="0" y="31" width="22" height="9" fill="hsl(var(--primary))" stroke={stroke} strokeWidth={sw} />
      </g>

      {/* X — crossing bars (red + yellow), x-center 270 */}
      <g transform="translate(270 30)">
        <rect
          x="-5" y="-22" width="10" height="44" rx="1"
          fill="hsl(var(--primary))" stroke={stroke} strokeWidth={sw}
          transform="rotate(45)"
        />
        <rect
          x="-5" y="-22" width="10" height="44" rx="1"
          fill="hsl(var(--accent))" stroke={stroke} strokeWidth={sw}
          transform="rotate(-45)"
        />
      </g>
    </svg>
  );
};

type Variant = "mark" | "full";
type Size = "sm" | "md" | "lg" | "xl";

const HEIGHTS: Record<Size, number> = { sm: 28, md: 40, lg: 56, xl: 80 };

/**
 * CREONIX — Bauhaus geometric wordmark v3.
 *
 * Inspired by playful Bauhaus reinterpretations of famous wordmarks (think the
 * geometric "Google" study): each letter is built from overlapping circles,
 * semi-circles, rectangles, and triangles in a primary palette. Shapes are
 * allowed to bleed into each other — that overlap is the personality.
 *
 * Palette: cobalt blue, crimson red, sun yellow, deep teal, warm orange,
 * indigo. Flat, no outlines, no gradients.
 */

// --- Palette ----------------------------------------------------------------
const C = {
  blue: "#1F3FB0",      // cobalt
  red: "#D43A2F",       // crimson
  yellow: "#F4C518",    // sun
  teal: "#114B45",      // deep teal
  orange: "#E8632A",    // warm orange
  indigo: "#3B3F9E",    // muted indigo
  lilac: "#7E7BB8",     // dusty lilac (overlap accent)
};

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
  const BG = onDark ? "hsl(var(--ink))" : "hsl(var(--background))";

  if (variant === "mark") {
    // Compact monogram: overlapping C (blue ring) + O (red disc with yellow overlap)
    const W = 100;
    const w = (h * W) / 100;
    return (
      <svg
        height={h}
        width={w}
        viewBox={`0 0 ${W} 100`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Creonix"
        role="img"
      >
        {/* C — blue ring with mouth */}
        <circle cx={38} cy={50} r={32} fill={C.blue} />
        <circle cx={38} cy={50} r={18} fill={BG} />
        <rect x={38} y={38} width={36} height={24} fill={BG} />
        {/* lilac inner accent (the overlap dot) */}
        <circle cx={42} cy={50} r={8} fill={C.lilac} />
        {/* O — red disc */}
        <circle cx={66} cy={50} r={28} fill={C.red} />
        {/* yellow overlap wedge */}
        <path
          d="M 55 30 A 28 28 0 0 1 55 70 A 32 32 0 0 0 55 30 Z"
          fill={C.yellow}
        />
      </svg>
    );
  }

  // Full wordmark CREONIX — 7 letters, each its own glyph block.
  // Layout uses variable widths and intentional overlaps.
  const VB_W = 720;
  const VB_H = 100;
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
      {/* C — Blue ring + lilac inner overlap (Pac-man opening right) */}
      <g>
        <circle cx={50} cy={50} r={42} fill={C.blue} />
        <circle cx={50} cy={50} r={26} fill={BG} />
        <rect x={50} y={36} width={48} height={28} fill={BG} />
        <circle cx={56} cy={50} r={12} fill={C.lilac} />
      </g>

      {/* R — Red disc + yellow striped half-disc overlap (the "bowl"),
              indigo rectangle leg drops below baseline. */}
      <g transform="translate(110 0)">
        {/* bowl: red full disc */}
        <circle cx={45} cy={45} r={40} fill={C.red} />
        {/* yellow striped overlap on the right half */}
        <defs>
          <pattern id="stripes-y" patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(0)">
            <rect width={6} height={6} fill={C.yellow} />
            <rect width={6} height={2} y={2} fill={C.red} />
          </pattern>
        </defs>
        <path
          d="M 45 5 A 40 40 0 0 1 45 85 Z"
          fill="url(#stripes-y)"
        />
        {/* leg — indigo rectangle */}
        <rect x={38} y={60} width={20} height={40} fill={C.indigo} />
      </g>

      {/* E — Yellow disc with red horizontal bar overlap (an abstract "e") */}
      <g transform="translate(210 0)">
        <circle cx={45} cy={50} r={40} fill={C.yellow} />
        <rect x={5} y={44} width={80} height={14} fill={C.red} />
        {/* small teal bite */}
        <circle cx={78} cy={50} r={10} fill={C.teal} />
      </g>

      {/* O — Teal disc + orange semi-circle overlap on the right */}
      <g transform="translate(310 0)">
        <circle cx={45} cy={50} r={42} fill={C.teal} />
        <path
          d="M 45 8 A 42 42 0 0 1 45 92 Z"
          fill={C.orange}
        />
        {/* yellow wedge slice at bottom-right */}
        <path
          d="M 45 50 L 87 50 A 42 42 0 0 1 45 92 Z"
          fill={C.yellow}
        />
      </g>

      {/* N — Two indigo rectangles + red diagonal slab between them */}
      <g transform="translate(410 0)">
        <rect x={5} y={8} width={20} height={84} fill={C.indigo} />
        <rect x={65} y={8} width={20} height={84} fill={C.indigo} />
        <polygon points="25,8 39,8 85,92 71,92" fill={C.red} />
        {/* yellow square overlap at center */}
        <rect x={40} y={42} width={16} height={16} fill={C.yellow} />
      </g>

      {/* I — Yellow tall rectangle with blue circle dot on top, red base */}
      <g transform="translate(510 0)">
        <rect x={20} y={20} width={24} height={62} fill={C.yellow} />
        <circle cx={32} cy={14} r={12} fill={C.blue} />
        <rect x={6} y={82} width={52} height={10} fill={C.red} />
      </g>

      {/* X — Two crossing rectangles (red + blue) with orange center dot */}
      <g transform="translate(580 0)">
        <rect
          x={30}
          y={5}
          width={20}
          height={90}
          fill={C.red}
          transform="rotate(28 40 50)"
        />
        <rect
          x={30}
          y={5}
          width={20}
          height={90}
          fill={C.blue}
          transform="rotate(-28 40 50)"
        />
        <circle cx={40} cy={50} r={10} fill={C.orange} />
        {/* yellow corner accent */}
        <rect x={68} y={70} width={16} height={16} fill={C.yellow} />
      </g>
    </svg>
  );
};

type Variant = "mark" | "full";
type Size = "sm" | "md" | "lg" | "xl";

const HEIGHTS: Record<Size, number> = { sm: 26, md: 36, lg: 52, xl: 72 };

/**
 * CREONIX — Bauhaus geometric wordmark.
 *
 * Inspired by Snack Video / Google Bauhaus / Adidas geometric studies:
 * every letter is built from FLAT primitive shapes (circles, semicircles,
 * quarter-circles, rectangles, triangles) with NO outline strokes.
 * Shapes touch and overlap to form readable letterforms.
 *
 * Palette (pulled from semantic tokens, never hard-coded hex):
 *   primary   = red
 *   secondary = blue
 *   accent    = yellow
 *   ink       = near-black (used sparingly for grounding)
 *
 * variant="mark" → CX monogram
 * variant="full" → full CREONIX wordmark
 */
export const Logo = ({
  size = "md",
  variant = "full",
  onDark = false,
}: {
  size?: Size;
  variant?: Variant;
  /** When true, use ink-foreground for shapes that would otherwise be ink */
  onDark?: boolean;
}) => {
  const h = HEIGHTS[size];

  // Color tokens
  const RED = "hsl(var(--primary))";
  const BLUE = "hsl(var(--secondary))";
  const YEL = "hsl(var(--accent))";
  const INK = onDark ? "hsl(var(--ink-foreground))" : "hsl(var(--ink))";

  // Each letter occupies an 80-unit-wide cell on a 100-unit-tall canvas.
  // Cap height = 80 (y: 10 → 90), baseline = 90.
  const TOP = 10;
  const BOT = 90;
  const CAP = BOT - TOP; // 80

  if (variant === "mark") {
    // CX monogram
    const W = 200;
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
        <Letter_C x={10} red={RED} blue={BLUE} yel={YEL} ink={INK} top={TOP} bot={BOT} />
        <Letter_X x={110} red={RED} blue={BLUE} yel={YEL} ink={INK} top={TOP} bot={BOT} />
      </svg>
    );
  }

  // Full wordmark — 7 letters, 80 wide each + 10 gap, plus 10 padding either side
  // total = 10 + 7*80 + 6*10 + 10 = 640
  const W = 640;
  const w = (h * W) / 100;
  const gap = 10;
  const cell = 80;
  const xs = [0, 1, 2, 3, 4, 5, 6].map((i) => 10 + i * (cell + gap));
  void CAP;

  return (
    <svg
      height={h}
      width={w}
      viewBox={`0 0 ${W} 100`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Creonix"
      role="img"
    >
      <Letter_C x={xs[0]} red={RED} blue={BLUE} yel={YEL} ink={INK} top={TOP} bot={BOT} />
      <Letter_R x={xs[1]} red={RED} blue={BLUE} yel={YEL} ink={INK} top={TOP} bot={BOT} />
      <Letter_E x={xs[2]} red={RED} blue={BLUE} yel={YEL} ink={INK} top={TOP} bot={BOT} />
      <Letter_O x={xs[3]} red={RED} blue={BLUE} yel={YEL} ink={INK} top={TOP} bot={BOT} />
      <Letter_N x={xs[4]} red={RED} blue={BLUE} yel={YEL} ink={INK} top={TOP} bot={BOT} />
      <Letter_I x={xs[5]} red={RED} blue={BLUE} yel={YEL} ink={INK} top={TOP} bot={BOT} />
      <Letter_X x={xs[6]} red={RED} blue={BLUE} yel={YEL} ink={INK} top={TOP} bot={BOT} />
    </svg>
  );
};

// ─── Letter primitives ───────────────────────────────────────────────────
// Each receives (x, top, bot) — bounding box top/bottom (y), x = left edge.
// All draw inside an 80×80 cell. No strokes — pure flat shapes.

type LP = {
  x: number;
  top: number;
  bot: number;
  red: string;
  blue: string;
  yel: string;
  ink: string;
};

// C — Pac-man circle, blue, with a red dot inside the mouth
const Letter_C = ({ x, top, bot, red, blue }: LP) => {
  const cx = x + 40;
  const cy = (top + bot) / 2;
  const r = (bot - top) / 2;
  // Pie slice opening to the right (between -35° and +35°)
  const a1 = (-35 * Math.PI) / 180;
  const a2 = (35 * Math.PI) / 180;
  const p1x = cx + r * Math.cos(a1);
  const p1y = cy + r * Math.sin(a1);
  const p2x = cx + r * Math.cos(a2);
  const p2y = cy + r * Math.sin(a2);
  // Use a single arc that goes the long way around (large-arc = 1)
  const d = `M ${p1x} ${p1y} A ${r} ${r} 0 1 0 ${p2x} ${p2y} L ${cx} ${cy} Z`;
  return (
    <g>
      <path d={d} fill={blue} />
      <circle cx={cx + r * 0.45} cy={cy} r={r * 0.18} fill={red} />
    </g>
  );
};

// R — red rectangle stem + blue half-circle bowl + yellow triangular leg
const Letter_R = ({ x, top, bot, red, blue, yel }: LP) => {
  const h = bot - top;
  const stemW = h * 0.28;
  const bowlH = h * 0.55;
  return (
    <g>
      {/* stem */}
      <rect x={x} y={top} width={stemW} height={h} fill={red} />
      {/* bowl: half circle (right semicircle) */}
      <path
        d={`M ${x + stemW} ${top} A ${bowlH / 2} ${bowlH / 2} 0 0 1 ${x + stemW} ${top + bowlH} Z`}
        fill={blue}
      />
      {/* leg: triangle from bowl bottom to bottom-right */}
      <polygon
        points={`${x + stemW},${top + bowlH} ${x + stemW + bowlH * 0.55},${top + bowlH} ${x + h * 0.85},${bot} ${x + stemW * 1.5},${bot}`}
        fill={yel}
      />
    </g>
  );
};

// E — yellow block with two negative bars cut out (bars are background colour holes)
// To work on any bg, we draw the E as 4 yellow rects (top bar, bottom bar, middle bar, left stem)
const Letter_E = ({ x, top, bot, yel, red }: LP) => {
  const h = bot - top;
  const w = h * 0.78;
  const stemW = h * 0.26;
  const barH = h * 0.18;
  return (
    <g>
      {/* left stem */}
      <rect x={x} y={top} width={stemW} height={h} fill={yel} />
      {/* top bar */}
      <rect x={x} y={top} width={w} height={barH} fill={yel} />
      {/* middle bar — a bit shorter, accent red for personality */}
      <rect x={x} y={top + (h - barH) / 2} width={w * 0.78} height={barH} fill={red} />
      {/* bottom bar */}
      <rect x={x} y={bot - barH} width={w} height={barH} fill={yel} />
    </g>
  );
};

// O — full red circle with a blue dot inside (Adidas/Snack-style)
const Letter_O = ({ x, top, bot, red, blue }: LP) => {
  const cx = x + 40;
  const cy = (top + bot) / 2;
  const r = (bot - top) / 2;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={red} />
      <circle cx={cx} cy={cy} r={r * 0.32} fill={blue} />
    </g>
  );
};

// N — two blue posts joined by a yellow diagonal parallelogram
const Letter_N = ({ x, top, bot, blue, yel }: LP) => {
  const h = bot - top;
  const stemW = h * 0.26;
  const rightX = x + h * 0.85 - stemW;
  return (
    <g>
      {/* left post */}
      <rect x={x} y={top} width={stemW} height={h} fill={blue} />
      {/* right post */}
      <rect x={rightX} y={top} width={stemW} height={h} fill={blue} />
      {/* diagonal connector — parallelogram from top-left-stem-right to bottom-right-stem-left */}
      <polygon
        points={`${x + stemW},${top} ${x + stemW * 1.9},${top} ${rightX + stemW},${bot} ${rightX + stemW * 0.1},${bot}`}
        fill={yel}
      />
    </g>
  );
};

// I — slim yellow stem with red square caps
const Letter_I = ({ x, top, bot, yel, red }: LP) => {
  const h = bot - top;
  const w = h * 0.5;
  const stemW = h * 0.22;
  const capH = h * 0.18;
  const stemX = x + (w - stemW) / 2;
  return (
    <g>
      <rect x={x} y={top} width={w} height={capH} fill={red} />
      <rect x={stemX} y={top} width={stemW} height={h} fill={yel} />
      <rect x={x} y={bot - capH} width={w} height={capH} fill={red} />
    </g>
  );
};

// X — two crossing bars, red over yellow
const Letter_X = ({ x, top, bot, red, yel }: LP) => {
  const h = bot - top;
  const cx = x + 40;
  const cy = (top + bot) / 2;
  const barW = h * 0.26;
  const barH = h * 1.08;
  return (
    <g>
      <rect
        x={cx - barW / 2}
        y={cy - barH / 2}
        width={barW}
        height={barH}
        fill={yel}
        transform={`rotate(-45 ${cx} ${cy})`}
      />
      <rect
        x={cx - barW / 2}
        y={cy - barH / 2}
        width={barW}
        height={barH}
        fill={red}
        transform={`rotate(45 ${cx} ${cy})`}
      />
    </g>
  );
};

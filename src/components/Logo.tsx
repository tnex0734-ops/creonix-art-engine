type Variant = "mark" | "full";
type Size = "sm" | "md" | "lg" | "xl";

const HEIGHTS: Record<Size, number> = { sm: 28, md: 40, lg: 56, xl: 80 };

/**
 * CREONIX — Bauhaus geometric wordmark v2.
 *
 * A bolder, more confident take. Built on a strict 100-unit grid where every
 * letter is composed from pure circles, rectangles, and triangles — no
 * outlines. Inspired by Herbert Bayer's Universal alphabet and the Bauhaus
 * Dessau signage, with a modern, sticker-flat finish.
 *
 * Highlights:
 *  • The "O" is a chunky red ring with a yellow dot — the brand "eye".
 *  • The "C" mirrors the O as an open ring, in blue.
 *  • The "X" is two solid bars, red + blue, crossing through a yellow square.
 *  • Negative-space cuts replace painted bars where possible (true Bauhaus).
 *  • Mark variant = the iconic O + X stacked into a compact monogram badge.
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

  const RED = "hsl(var(--primary))";
  const BLUE = "hsl(var(--secondary))";
  const YEL = "hsl(var(--accent))";
  const INK = onDark ? "hsl(var(--ink-foreground))" : "hsl(var(--ink))";
  const BG = onDark ? "hsl(var(--ink))" : "hsl(var(--background))";

  const TOP = 8;
  const BOT = 92;

  if (variant === "mark") {
    // Compact badge: O (red ring + yellow dot) overlapped by X cross.
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
        {/* Yellow square anchor */}
        <rect x={18} y={18} width={64} height={64} fill={YEL} />
        {/* Red ring (O) */}
        <circle cx={50} cy={50} r={34} fill={RED} />
        <circle cx={50} cy={50} r={16} fill={BG} />
        {/* Blue diagonal bar (X stroke 1) */}
        <rect
          x={44}
          y={6}
          width={12}
          height={88}
          fill={BLUE}
          transform="rotate(45 50 50)"
        />
        {/* Ink dot — the "eye" */}
        <circle cx={50} cy={50} r={6} fill={INK} />
      </svg>
    );
  }

  // Full wordmark — 7 letters laid out on a strict grid.
  // Cell width 70, gap 14, side padding 10. Total = 10 + 7*70 + 6*14 + 10 = 594.
  const cell = 70;
  const gap = 14;
  const W = 10 + 7 * cell + 6 * gap + 10;
  const w = (h * W) / 100;
  const xs = [0, 1, 2, 3, 4, 5, 6].map((i) => 10 + i * (cell + gap));

  return (
    <svg
      height={h}
      width={w}
      viewBox={`0 0 ${W} 100`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Creonix"
      role="img"
    >
      <Letter_C x={xs[0]} top={TOP} bot={BOT} red={RED} blue={BLUE} yel={YEL} ink={INK} bg={BG} />
      <Letter_R x={xs[1]} top={TOP} bot={BOT} red={RED} blue={BLUE} yel={YEL} ink={INK} bg={BG} />
      <Letter_E x={xs[2]} top={TOP} bot={BOT} red={RED} blue={BLUE} yel={YEL} ink={INK} bg={BG} />
      <Letter_O x={xs[3]} top={TOP} bot={BOT} red={RED} blue={BLUE} yel={YEL} ink={INK} bg={BG} />
      <Letter_N x={xs[4]} top={TOP} bot={BOT} red={RED} blue={BLUE} yel={YEL} ink={INK} bg={BG} />
      <Letter_I x={xs[5]} top={TOP} bot={BOT} red={RED} blue={BLUE} yel={YEL} ink={INK} bg={BG} />
      <Letter_X x={xs[6]} top={TOP} bot={BOT} red={RED} blue={BLUE} yel={YEL} ink={INK} bg={BG} />
    </svg>
  );
};

type LP = {
  x: number;
  top: number;
  bot: number;
  red: string;
  blue: string;
  yel: string;
  ink: string;
  bg: string;
};

// C — Open blue ring, mouth right. Bold, geometric.
const Letter_C = ({ x, top, bot, blue, bg, yel }: LP) => {
  const cx = x + 35;
  const cy = (top + bot) / 2;
  const r = (bot - top) / 2;
  const inner = r - 13;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={blue} />
      <circle cx={cx} cy={cy} r={inner} fill={bg} />
      {/* mouth cut */}
      <rect x={cx} y={cy - 11} width={r + 2} height={22} fill={bg} />
      {/* yellow accent tab */}
      <rect x={cx + r - 8} y={cy - 11} width={8} height={6} fill={yel} />
      <rect x={cx + r - 8} y={cy + 5} width={8} height={6} fill={yel} />
    </g>
  );
};

// R — Solid red stem, blue half-disc bowl, yellow leg triangle.
const Letter_R = ({ x, top, bot, red, blue, yel }: LP) => {
  const h = bot - top;
  const stemW = 18;
  const bowlH = h * 0.52;
  return (
    <g>
      <rect x={x} y={top} width={stemW} height={h} fill={red} />
      {/* bowl */}
      <path
        d={`M ${x + stemW} ${top} A ${bowlH / 2} ${bowlH / 2} 0 0 1 ${x + stemW} ${top + bowlH} Z`}
        fill={blue}
      />
      {/* leg */}
      <polygon
        points={`${x + stemW},${top + bowlH - 4} ${x + stemW + 22},${top + bowlH - 4} ${x + 60},${bot} ${x + stemW + 4},${bot}`}
        fill={yel}
      />
    </g>
  );
};

// E — Three yellow horizontal bars + red stem. Crisp, blocky.
const Letter_E = ({ x, top, bot, yel, red }: LP) => {
  const h = bot - top;
  const w = 60;
  const stemW = 18;
  const barH = 16;
  return (
    <g>
      <rect x={x} y={top} width={stemW} height={h} fill={red} />
      <rect x={x} y={top} width={w} height={barH} fill={yel} />
      <rect x={x} y={top + (h - barH) / 2} width={w * 0.78} height={barH} fill={yel} />
      <rect x={x} y={bot - barH} width={w} height={barH} fill={yel} />
    </g>
  );
};

// O — The hero. Red ring + yellow dot. The "Creonix eye."
const Letter_O = ({ x, top, bot, red, yel, bg }: LP) => {
  const cx = x + 35;
  const cy = (top + bot) / 2;
  const r = (bot - top) / 2;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={red} />
      <circle cx={cx} cy={cy} r={r - 14} fill={bg} />
      <circle cx={cx} cy={cy} r={r - 26} fill={yel} />
    </g>
  );
};

// N — Two blue posts joined by a yellow diagonal slab.
const Letter_N = ({ x, top, bot, blue, yel }: LP) => {
  const h = bot - top;
  const stemW = 18;
  const rightX = x + 70 - stemW;
  return (
    <g>
      <rect x={x} y={top} width={stemW} height={h} fill={blue} />
      <rect x={rightX} y={top} width={stemW} height={h} fill={blue} />
      <polygon
        points={`${x + stemW},${top} ${x + stemW + 14},${top} ${rightX + stemW},${bot} ${rightX - 14 + stemW},${bot}`}
        fill={yel}
      />
    </g>
  );
};

// I — Yellow stem with red square caps. Mini totem.
const Letter_I = ({ x, top, bot, yel, red }: LP) => {
  const h = bot - top;
  const w = 40;
  const stemW = 18;
  const capH = 16;
  const stemX = x + (w - stemW) / 2;
  return (
    <g>
      <rect x={x} y={top} width={w} height={capH} fill={red} />
      <rect x={stemX} y={top} width={stemW} height={h} fill={yel} />
      <rect x={x} y={bot - capH} width={w} height={capH} fill={red} />
    </g>
  );
};

// X — Two crossing bars, red over blue, with a yellow square at the heart.
const Letter_X = ({ x, top, bot, red, blue, yel }: LP) => {
  const h = bot - top;
  const cx = x + 35;
  const cy = (top + bot) / 2;
  const barW = 18;
  const barH = h * 1.12;
  return (
    <g>
      <rect
        x={cx - barW / 2}
        y={cy - barH / 2}
        width={barW}
        height={barH}
        fill={blue}
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
      <rect x={cx - 6} y={cy - 6} width={12} height={12} fill={yel} />
    </g>
  );
};

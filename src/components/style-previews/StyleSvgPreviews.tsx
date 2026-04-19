// Hand-crafted SVG previews for each illustration style.
// All SVGs use viewBox="0 0 280 210". No text inside SVGs.
// Bold black outlines (stroke 2.5px, #111) on shapes.

const STROKE = "#111";
const SW = 2.5;

const DotPattern = ({ id, color = "#111", opacity = 0.15, size = 14, r = 1.4 }: { id: string; color?: string; opacity?: number; size?: number; r?: number }) => (
  <defs>
    <pattern id={id} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
      <circle cx={size / 2} cy={size / 2} r={r} fill={color} opacity={opacity} />
    </pattern>
  </defs>
);

const Frame: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...rest }) => (
  <svg viewBox="0 0 280 210" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" {...rest}>
    {children}
  </svg>
);

export const FlatTwoPreview = () => (
  <Frame>
    <DotPattern id="flat-dots" />
    <rect width="280" height="210" fill="#1A4BDB" />
    <rect width="280" height="210" fill="url(#flat-dots)" />
    <circle cx="40" cy="160" r="80" fill="#F5C400" stroke={STROKE} strokeWidth={SW} />
    <circle cx="40" cy="40" r="22" fill="#E63030" stroke={STROKE} strokeWidth={SW} />
  </Frame>
);

export const IsometricPreview = () => (
  <Frame>
    <DotPattern id="iso-dots" color="#fff" opacity={0.18} />
    <rect width="280" height="210" fill="#1A3A8A" />
    <rect width="280" height="210" fill="url(#iso-dots)" />
    <circle cx="46" cy="48" r="22" fill="#F5C400" stroke={STROKE} strokeWidth={SW} />
    <g transform="translate(140 110) rotate(20)">
      <rect x="-55" y="-55" width="110" height="110" fill="#4A7FE8" stroke={STROKE} strokeWidth={SW} />
      <line x1="-55" y1="-55" x2="55" y2="55" stroke={STROKE} strokeWidth={SW} opacity="0.4" />
    </g>
  </Frame>
);

export const ClayPreview = () => (
  <Frame>
    <rect width="280" height="210" fill="#F2A0A0" />
    <circle cx="160" cy="180" r="80" fill="#F5D98A" stroke={STROKE} strokeWidth={SW} />
    <circle cx="46" cy="48" r="22" fill="#A8D8EA" stroke={STROKE} strokeWidth={SW} />
  </Frame>
);

export const GlassmorphismPreview = () => (
  <Frame>
    <rect width="280" height="210" fill="#C5B8F0" />
    <circle cx="200" cy="105" r="90" fill="#A99ED4" stroke={STROKE} strokeWidth={SW} opacity="0.95" />
    <circle cx="46" cy="48" r="22" fill="#F5B8D0" stroke={STROKE} strokeWidth={SW} />
  </Frame>
);

export const RetroPreview = () => (
  <Frame>
    <DotPattern id="retro-dots" color="#2A1A0E" opacity={0.18} />
    <rect width="280" height="210" fill="#C85A1E" />
    <rect width="280" height="210" fill="url(#retro-dots)" />
    <circle cx="48" cy="50" r="26" fill="#2A1A0E" stroke={STROKE} strokeWidth={SW} />
    <g>
      <rect x="150" y="70" width="110" height="18" fill="#2A1A0E" stroke={STROKE} strokeWidth={SW} />
      <rect x="150" y="96" width="110" height="18" fill="#E8B85E" stroke={STROKE} strokeWidth={SW} />
      <rect x="150" y="122" width="110" height="18" fill="#F5C400" stroke={STROKE} strokeWidth={SW} />
    </g>
  </Frame>
);

export const PsychedelicPreview = () => (
  <Frame>
    <DotPattern id="psy-dots" color="#fff" opacity={0.18} />
    <rect width="280" height="210" fill="#F020B0" />
    <rect width="280" height="210" fill="url(#psy-dots)" />
    <circle cx="48" cy="52" r="24" fill="#00E5D4" stroke={STROKE} strokeWidth={SW} />
    <polygon points="140,40 210,180 70,180" fill="#F5C400" stroke={STROKE} strokeWidth={SW} />
  </Frame>
);

export const CartoonPreview = () => (
  <Frame>
    <DotPattern id="cartoon-dots" color="#111" opacity={0.15} />
    <rect width="280" height="210" fill="#F5C400" />
    <rect width="280" height="210" fill="url(#cartoon-dots)" />
    <circle cx="48" cy="50" r="24" fill="#E63030" stroke={STROKE} strokeWidth={SW} />
    <polygon points="140,30 220,185 60,185" fill="#1A1A2E" stroke={STROKE} strokeWidth={SW} />
  </Frame>
);

export const CollagePreview = () => (
  <Frame>
    <rect width="280" height="210" fill="#2A1A0E" />
    <g>
      <rect x="30" y="40" width="110" height="80" fill="#E63030" stroke={STROKE} strokeWidth={SW} transform="rotate(-8 85 80)" />
      <rect x="120" y="70" width="120" height="90" fill="#1A4BDB" stroke={STROKE} strokeWidth={SW} transform="rotate(6 180 115)" />
      <rect x="80" y="120" width="90" height="60" fill="#F5C400" stroke={STROKE} strokeWidth={SW} transform="rotate(-4 125 150)" />
    </g>
  </Frame>
);

export const NaturePreview = () => (
  <Frame>
    <rect width="280" height="210" fill="#4A9E5C" />
    <circle cx="200" cy="180" r="90" fill="#F5F0E0" stroke={STROKE} strokeWidth={SW} />
    <circle cx="46" cy="48" r="18" fill="#FFFFFF" stroke={STROKE} strokeWidth={SW} />
  </Frame>
);

export const SketchPreview = () => (
  <Frame>
    <rect width="280" height="210" fill="#FAFAF5" />
    {/* slightly imperfect circle path */}
    <path
      d="M140 40 C 200 38, 248 88, 244 128 C 240 168, 188 192, 138 188 C 88 184, 44 156, 44 110 C 46 70, 92 42, 140 40 Z"
      fill="none"
      stroke={STROKE}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <g stroke={STROKE} strokeWidth={2} strokeLinecap="round" opacity="0.85">
      <line x1="20" y1="180" x2="60" y2="200" />
      <line x1="40" y1="170" x2="80" y2="195" />
      <line x1="220" y1="20" x2="260" y2="45" />
      <line x1="200" y1="14" x2="245" y2="34" />
    </g>
  </Frame>
);

export const DoodlePreview = () => (
  <Frame>
    <DotPattern id="doodle-dots" color="#111" opacity={0.15} />
    <rect width="280" height="210" fill="#B0E8FF" />
    <rect width="280" height="210" fill="url(#doodle-dots)" />
    <circle cx="50" cy="50" r="22" fill="#FF6EB4" stroke={STROKE} strokeWidth={SW} />
    {/* squiggly line */}
    <path d="M100 130 C 120 100, 140 160, 160 130 S 200 100, 230 130" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" />
    {/* stars */}
    <polygon points="180,50 186,68 205,68 190,80 196,98 180,86 164,98 170,80 155,68 174,68" fill="#F5C400" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
    <polygon points="90,170 94,180 104,180 96,186 100,196 90,190 80,196 84,186 76,180 86,180" fill="#F5C400" stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
  </Frame>
);

export const FolkPreview = () => (
  <Frame>
    <rect width="280" height="210" fill="#E8302A" />
    {/* central flower */}
    <g transform="translate(140 105)">
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="0" cy="-34" rx="14" ry="26" fill="#F5C400" stroke={STROKE} strokeWidth={SW} transform={`rotate(${a})`} />
      ))}
      <circle r="16" fill="#FFFFFF" stroke={STROKE} strokeWidth={SW} />
      <circle r="6" fill="#E8302A" stroke={STROKE} strokeWidth={SW} />
    </g>
    {/* corner motifs */}
    {[
      { x: 36, y: 36 }, { x: 244, y: 36 }, { x: 36, y: 174 }, { x: 244, y: 174 },
    ].map((p, i) => (
      <g key={i} transform={`translate(${p.x} ${p.y})`}>
        <circle r="10" fill="#F5C400" stroke={STROKE} strokeWidth={SW} />
        <circle r="3" fill="#FFFFFF" />
      </g>
    ))}
  </Frame>
);

export const STYLE_PREVIEWS: Record<string, React.FC> = {
  "Flat 2.0": FlatTwoPreview,
  "Isometric": IsometricPreview,
  "3D Clay": ClayPreview,
  "Glassmorphism": GlassmorphismPreview,
  "Retro Revival": RetroPreview,
  "Psychedelic": PsychedelicPreview,
  "Cartoon / Character": CartoonPreview,
  "Digital Collage": CollagePreview,
  "Nature / Eco": NaturePreview,
  "Hand-drawn / Sketch": SketchPreview,
  "Doodle / Whimsical": DoodlePreview,
  "Folk / Cultural Art": FolkPreview,
};

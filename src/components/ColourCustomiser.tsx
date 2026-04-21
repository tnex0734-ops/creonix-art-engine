import { useCallback, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { PALETTE_PRESETS } from "@/lib/styles";

export type ElementColors = {
  background: string;
  primary: string;
  accent: string;
  outline: string;
};

export const DEFAULT_COLORS: ElementColors = {
  background: "#FAF7F0",
  primary: "#E63030",
  accent: "#F5C400",
  outline: "#111111",
};

const ELEMENT_LABELS: Array<{ key: keyof ElementColors; label: string }> = [
  { key: "background", label: "Background" },
  { key: "primary", label: "Primary Shape" },
  { key: "accent", label: "Accent" },
  { key: "outline", label: "Outline" },
];

/* ── tiny hex helpers ── */
const isValidHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

/* ── Colour swatch + native picker + hex input ── */
const ColourRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const pickerRef = useRef<HTMLInputElement>(null);
  const [hex, setHex] = useState(value);

  // sync external changes
  if (value !== hex && isValidHex(value)) {
    setHex(value);
  }

  const handleHexChange = (raw: string) => {
    let v = raw.startsWith("#") ? raw : `#${raw}`;
    v = v.slice(0, 7);
    setHex(v);
    if (isValidHex(v)) onChange(v);
  };

  return (
    <div className="flex items-center gap-3 p-2.5 bauhaus-border bg-background rounded-xl">
      <span className="text-xs font-extrabold uppercase flex-shrink-0 w-28">
        {label}
      </span>

      {/* Clickable swatch → opens native colour picker */}
      <button
        type="button"
        onClick={() => pickerRef.current?.click()}
        className="h-8 w-8 flex-shrink-0 border-[2px] border-ink rounded-lg relative overflow-hidden group"
        style={{ background: value }}
        aria-label={`Pick ${label} colour`}
      >
        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </button>

      {/* Hidden native colour picker */}
      <input
        ref={pickerRef}
        type="color"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setHex(e.target.value);
        }}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        tabIndex={-1}
      />

      {/* Hex input */}
      <input
        type="text"
        value={hex}
        onChange={(e) => handleHexChange(e.target.value)}
        onBlur={() => {
          if (!isValidHex(hex)) setHex(value);
        }}
        maxLength={7}
        className="w-[5.5rem] px-2 py-1.5 text-xs font-mono font-bold uppercase bg-muted border-[2px] border-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
        placeholder="#000000"
      />
    </div>
  );
};

/* ── Colour wheel (HSL ring + brightness) ── */
const ColourWheel = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 160;
  const center = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR - 22;

  const drawWheel = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, size, size);
      // Draw hue ring
      for (let angle = 0; angle < 360; angle++) {
        const startAngle = ((angle - 1) * Math.PI) / 180;
        const endAngle = ((angle + 1) * Math.PI) / 180;
        ctx.beginPath();
        ctx.arc(center, center, (outerR + innerR) / 2, startAngle, endAngle);
        ctx.lineWidth = outerR - innerR;
        ctx.strokeStyle = `hsl(${angle}, 100%, 50%)`;
        ctx.stroke();
      }
    },
    [center, outerR, innerR]
  );

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;
    const dist = Math.sqrt(x * x + y * y);

    if (dist >= innerR && dist <= outerR) {
      let angle = (Math.atan2(y, x) * 180) / Math.PI;
      if (angle < 0) angle += 360;
      const hue = Math.round(angle);
      // Convert HSL to hex
      const hex = hslToHex(hue, 100, 50);
      onChange(hex);
    }
  };

  // Draw on mount
  const canvasCallback = useCallback(
    (node: HTMLCanvasElement | null) => {
      if (!node) return;
      (canvasRef as any).current = node;
      const ctx = node.getContext("2d");
      if (ctx) drawWheel(ctx);
    },
    [drawWheel]
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasCallback}
        width={size}
        height={size}
        onClick={handleCanvasClick}
        className="cursor-crosshair"
        style={{ width: size, height: size }}
      />
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-extrabold uppercase text-muted-foreground">
          Click ring to pick hue
        </span>
        <span
          className="h-5 w-5 border-[2px] border-ink rounded"
          style={{ background: value }}
        />
      </div>
    </div>
  );
};

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/* ── Main component ── */
export const ColourCustomiser = ({
  colors,
  setColors,
  onClose,
  onReset,
}: {
  colors: ElementColors;
  setColors: React.Dispatch<React.SetStateAction<ElementColors>>;
  onClose: () => void;
  onReset: () => void;
}) => {
  const [activeKey, setActiveKey] = useState<keyof ElementColors>("primary");

  const applyPreset = (p: string[]) => {
    setColors({
      background: p[4] ?? colors.background,
      primary: p[0] ?? colors.primary,
      accent: p[2] ?? colors.accent,
      outline: p[3] ?? colors.outline,
    });
  };

  return (
    <div className="bg-card border-t-[3px] border-ink p-5 max-h-[60%] overflow-y-auto rounded-t-2xl">
      <div className="flex items-center justify-between mb-4">
        <h4 className="heading-display text-lg">Customise colours</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="text-xs font-extrabold uppercase inline-flex items-center gap-1 hover:text-primary"
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1 bauhaus-border bg-background text-xs font-extrabold uppercase rounded-lg"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: Presets + custom rows */}
        <div className="flex-1 min-w-0">
          {/* Preset palettes */}
          <div className="mb-4">
            <div className="text-[10px] font-extrabold uppercase mb-2 text-muted-foreground">
              Preset palettes
            </div>
            <div className="flex flex-wrap gap-2">
              {PALETTE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p.colors)}
                  className="bauhaus-border hover-lift overflow-hidden rounded-lg"
                  title={p.name}
                  aria-label={`Apply ${p.name} palette`}
                >
                  <div className="flex">
                    {p.colors.slice(0, 4).map((c, i) => (
                      <div key={i} style={{ background: c, width: 20, height: 28 }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom colour rows */}
          <div>
            <div className="text-[10px] font-extrabold uppercase mb-2 text-muted-foreground">
              Custom colours
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {ELEMENT_LABELS.map(({ key, label }) => (
                <div key={key} onClick={() => setActiveKey(key)}>
                  <ColourRow
                    label={label}
                    value={colors[key]}
                    onChange={(v) => setColors((c) => ({ ...c, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Colour wheel */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className="text-[10px] font-extrabold uppercase mb-1 text-muted-foreground">
            Colour wheel — {ELEMENT_LABELS.find((e) => e.key === activeKey)?.label}
          </div>
          <ColourWheel
            value={colors[activeKey]}
            onChange={(v) => setColors((c) => ({ ...c, [activeKey]: v }))}
          />
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-3">
        Click a swatch or use the colour wheel. Type hex values directly. Background recolours instantly.
      </p>
    </div>
  );
};

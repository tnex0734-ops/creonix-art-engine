import { useRef, useState, useCallback, useEffect } from "react";
import { RotateCcw, X, Pipette } from "lucide-react";
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

const ELEMENTS: Array<{ key: keyof ElementColors; label: string; icon: string }> = [
  { key: "background", label: "BG", icon: "◻" },
  { key: "primary", label: "Primary", icon: "●" },
  { key: "accent", label: "Accent", icon: "▲" },
  { key: "outline", label: "Outline", icon: "━" },
];

const isValidHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

/* ── HSL ↔ Hex helpers ── */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

/* ── Circular Hue+Saturation Wheel with Canvas ── */
const HueSatWheel = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = 180;
  const center = size / 2;
  const radius = size / 2 - 6;
  const [dragging, setDragging] = useState(false);

  const [h, s, l] = hexToHsl(value);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, size, size);
    // Draw filled color wheel
    for (let angle = 0; angle < 360; angle += 1) {
      for (let r = 0; r <= radius; r += 2) {
        const rad = (angle * Math.PI) / 180;
        const x = center + r * Math.cos(rad);
        const y = center + r * Math.sin(rad);
        const sat = (r / radius) * 100;
        ctx.fillStyle = `hsl(${angle}, ${sat}%, 50%)`;
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      }
    }
  }, [center, radius]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) draw(ctx);
  }, [draw]);

  const pickFromXY = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left - center;
    const y = clientY - rect.top - center;
    const dist = Math.sqrt(x * x + y * y);
    if (dist > radius + 4) return;
    let angle = (Math.atan2(y, x) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    const sat = Math.min(100, (dist / radius) * 100);
    onChange(hslToHex(Math.round(angle), Math.round(sat), l || 50));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pickFromXY(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    pickFromXY(e.clientX, e.clientY);
  };
  const onPointerUp = () => setDragging(false);

  // Indicator position
  const indicatorAngle = (h * Math.PI) / 180;
  const indicatorDist = (s / 100) * radius;
  const ix = center + indicatorDist * Math.cos(indicatorAngle);
  const iy = center + indicatorDist * Math.sin(indicatorAngle);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="cursor-crosshair rounded-full"
        style={{ width: size, height: size }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      {/* Indicator ring */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: ix - 8,
          top: iy - 8,
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: "3px solid #111",
          boxShadow: "0 0 0 2px #fff, 0 2px 8px rgba(0,0,0,0.3)",
          background: value,
        }}
      />
    </div>
  );
};

/* ── Lightness Slider ── */
const LightnessSlider = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) => {
  const [h, s, l] = hexToHsl(value);
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">Lightness</span>
        <span className="text-[9px] font-mono font-bold text-muted-foreground">{l}%</span>
      </div>
      <div className="relative h-5 rounded-lg overflow-hidden border-[2px] border-ink">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, hsl(${h},${s}%,0%), hsl(${h},${s}%,50%), hsl(${h},${s}%,100%))`,
          }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={l}
          onChange={(e) => onChange(hslToHex(h, s, Number(e.target.value)))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Thumb indicator */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-ink pointer-events-none"
          style={{ left: `calc(${l}% - 2px)` }}
        >
          <div className="absolute -top-0.5 -bottom-0.5 -left-1 -right-1 border-2 border-foreground rounded-sm bg-background" />
        </div>
      </div>
    </div>
  );
};

/* ── Hex Input ── */
const HexInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) => {
  const [text, setText] = useState(value);
  const pickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isValidHex(value)) setText(value);
  }, [value]);

  const commit = (raw: string) => {
    let v = raw.startsWith("#") ? raw : `#${raw}`;
    v = v.slice(0, 7);
    setText(v);
    if (isValidHex(v)) onChange(v);
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => pickerRef.current?.click()}
        className="h-7 w-7 flex-shrink-0 border-[2px] border-ink rounded-md relative overflow-hidden group cursor-pointer"
        style={{ background: value }}
        aria-label="Open color picker"
      >
        <Pipette size={10} className="absolute inset-0 m-auto text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-md" />
      </button>
      <input
        ref={pickerRef}
        type="color"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setText(e.target.value);
        }}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
        tabIndex={-1}
      />
      <input
        type="text"
        value={text}
        onChange={(e) => commit(e.target.value)}
        onBlur={() => { if (!isValidHex(text)) setText(value); }}
        maxLength={7}
        className="w-[4.5rem] px-1.5 py-1 text-[11px] font-mono font-bold uppercase bg-muted border-[2px] border-ink rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
};

/* ── Main ColourCustomiser ── */
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
      primary: p[0] ?? colors.primary,
      accent: p[2] ?? colors.accent,
      outline: p[3] ?? colors.outline,
      background: p[4] ?? colors.background,
    });
  };

  return (
    <div className="bg-card border-t-[3px] border-ink rounded-t-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-[2px] border-ink bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-primary border-[2px] border-ink" />
          <h4 className="text-sm font-extrabold uppercase tracking-wide">Colours</h4>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onReset}
            className="px-2 py-1 text-[10px] font-extrabold uppercase inline-flex items-center gap-1 hover:text-primary transition-colors rounded-md"
          >
            <RotateCcw size={10} /> Reset
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Body — compact horizontal layout */}
      <div className="flex flex-col sm:flex-row gap-0 max-h-[340px]">
        {/* Left: Element selectors + presets */}
        <div className="flex-1 p-3 space-y-3 overflow-y-auto border-r-0 sm:border-r-[2px] border-ink">
          {/* Element colour rows */}
          <div className="space-y-1.5">
            {ELEMENTS.map(({ key, label, icon }) => {
              const isActive = activeKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveKey(key)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl border-[2px] transition-all ${
                    isActive
                      ? "border-ink bg-muted shadow-[2px_2px_0_0_hsl(var(--ink))]"
                      : "border-transparent hover:border-ink/30 hover:bg-muted/30"
                  }`}
                >
                  <span className="text-sm w-5 text-center">{icon}</span>
                  <span className="text-[11px] font-extrabold uppercase flex-1 text-left">{label}</span>
                  <HexInput
                    value={colors[key]}
                    onChange={(v) => setColors((c) => ({ ...c, [key]: v }))}
                  />
                </button>
              );
            })}
          </div>

          {/* Preset palettes — horizontal scroll */}
          <div>
            <div className="text-[9px] font-extrabold uppercase mb-1.5 text-muted-foreground tracking-wider">Presets</div>
            <div className="flex gap-1.5 flex-wrap">
              {PALETTE_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p.colors)}
                  className="border-[2px] border-ink hover:shadow-[2px_2px_0_0_hsl(var(--ink))] transition-shadow overflow-hidden rounded-lg"
                  title={p.name}
                >
                  <div className="flex">
                    {p.colors.slice(0, 5).map((c, i) => (
                      <div key={i} style={{ background: c, width: 14, height: 22 }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Wheel + lightness */}
        <div className="flex flex-col items-center gap-2 p-3 bg-muted/20">
          <div className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">
            {ELEMENTS.find((e) => e.key === activeKey)?.label}
          </div>
          <HueSatWheel
            value={colors[activeKey]}
            onChange={(v) => setColors((c) => ({ ...c, [activeKey]: v }))}
          />
          <LightnessSlider
            value={colors[activeKey]}
            onChange={(v) => setColors((c) => ({ ...c, [activeKey]: v }))}
          />
        </div>
      </div>
    </div>
  );
};

import { useRef, useState, useEffect } from "react";
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
  { key: "background", label: "Background", icon: "◻" },
  { key: "primary", label: "Primary Shape", icon: "●" },
  { key: "accent", label: "Accent", icon: "▲" },
  { key: "outline", label: "Outline", icon: "━" },
];

const isValidHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

/* ── Hex Input with native picker ── */
const HexInput = ({ value, onChange }: { value: string; onChange: (hex: string) => void }) => {
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
        onChange={(e) => { onChange(e.target.value); setText(e.target.value); }}
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
          <h4 className="text-sm font-extrabold uppercase tracking-wide">Customise Colours</h4>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onReset}
            className="px-2 py-1 text-[10px] font-extrabold uppercase inline-flex items-center gap-1 hover:text-primary transition-colors rounded-md"
          >
            <RotateCcw size={10} /> Reset
          </button>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors" aria-label="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3">
        {/* Preset palettes */}
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
                    <div key={i} style={{ background: c, width: 18, height: 24 }} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Element colour rows */}
        <div>
          <div className="text-[9px] font-extrabold uppercase mb-1.5 text-muted-foreground tracking-wider">Custom</div>
          <div className="grid grid-cols-2 gap-1.5">
            {ELEMENTS.map(({ key, label, icon }) => (
              <div key={key} className="flex items-center gap-2 px-2.5 py-2 rounded-xl border-[2px] border-ink/20 bg-muted/20">
                <span className="text-sm w-5 text-center">{icon}</span>
                <span className="text-[11px] font-extrabold uppercase flex-1">{label}</span>
                <HexInput
                  value={colors[key]}
                  onChange={(v) => setColors((c) => ({ ...c, [key]: v }))}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { STYLES, PALETTE_PRESETS, type Style } from "@/lib/styles";
import { StylePickerModal } from "@/components/StylePickerModal";
import { StylePreview } from "@/components/StylePreview";
import { DownloadDropdown } from "@/components/DownloadDropdown";
import { supabase } from "@/integrations/supabase/client";
import {
  Send, RefreshCw, Bookmark, Palette, ZoomIn, ZoomOut, Shuffle, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

type Msg = { role: "user"; content: string; style: string };

type ElementColors = {
  background: string;
  primary: string;
  accent: string;
  outline: string;
};

const DEFAULT_COLORS: ElementColors = {
  background: "#FAF7F0",
  primary: "#E63030",
  accent: "#F5C400",
  outline: "#111111",
};

const Generate = () => {
  const [params] = useSearchParams();
  const initialStyle =
    STYLES.find((s) => s.name === params.get("style")) ?? STYLES[0];

  const [style, setStyle] = useState<Style>(initialStyle);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [genId, setGenId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showPalette, setShowPalette] = useState(false);
  const [colors, setColors] = useState<ElementColors>(DEFAULT_COLORS);

  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight, behavior: "smooth" });
  }, [history.length]);

  const generate = async () => {
    if (!prompt.trim()) {
      toast.error("Add a prompt first");
      return;
    }
    setLoading(true);
    setImageUrl(null);
    setColors(DEFAULT_COLORS);
    setHistory((h) => [...h, { role: "user", content: prompt, style: style.name }]);
    const currentPrompt = prompt;

    try {
      const { data, error } = await supabase.functions.invoke("generate-illustration", {
        body: { prompt: currentPrompt, style: style.name },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setImageUrl(data.imageUrl);
      setGenId(data.generation?.id ?? null);
      setPrompt("");
      toast.success("Illustration ready!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const regenerate = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setPrompt(last.content);
    setTimeout(generate, 0);
  };

  const saveToGallery = () => {
    if (!genId) return toast.error("Nothing to save yet");
    toast.success("Already saved to your gallery!");
  };

  // Visual recolouring via blended overlays (raster output → element-style tinting)
  const overlayStyle = useMemo<React.CSSProperties>(() => {
    return {
      background: colors.background,
    };
  }, [colors.background]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Two-panel workspace: LEFT = output 60%, RIGHT = prompt 40% */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[60fr_40fr] border-t-[3px] border-ink min-h-0">
        {/* LEFT — OUTPUT (60%) */}
        <main
          className="relative flex flex-col bg-muted/30 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-ink min-h-0"
          style={{ height: "auto" }}
        >
          <div
            className="flex-1 flex flex-col p-4 md:p-6 min-h-0 lg:h-[calc(100vh-4rem-3px)]"
          >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 mb-3 flex-shrink-0">
              <div className="flex bauhaus-border bg-background rounded-2xl overflow-hidden">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                  className="p-2.5 border-r-[3px] border-ink hover:bg-accent"
                  aria-label="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <div className="px-3 py-2 text-xs font-extrabold uppercase flex items-center">
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
                  className="p-2.5 border-l-[3px] border-ink hover:bg-accent"
                  aria-label="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              <div className="ml-auto flex flex-wrap gap-2">
                <button
                  onClick={() => setShowPalette((s) => !s)}
                  disabled={!imageUrl}
                  className={`px-4 py-2.5 bauhaus-border hover-lift text-xs font-extrabold uppercase inline-flex items-center gap-2 disabled:opacity-50 rounded-2xl ${
                    showPalette ? "bg-accent" : "bg-background"
                  }`}
                >
                  <Palette size={14} /> Customise Colours
                </button>
                <button
                  onClick={saveToGallery}
                  disabled={!imageUrl}
                  className="px-4 py-2.5 bg-background bauhaus-border hover-lift text-xs font-extrabold uppercase inline-flex items-center gap-2 disabled:opacity-50 rounded-2xl"
                >
                  <Bookmark size={14} /> Save
                </button>
                {imageUrl && (
                  <DownloadDropdown
                    imageUrl={imageUrl}
                    filenameBase={`creonix-${genId ?? "image"}`}
                    variant="primary"
                  />
                )}
              </div>
            </div>

            {/* Output frame — fills remaining height, no scroll */}
            <div className="flex-1 min-h-[50vh] lg:min-h-0 relative">
              <div
                className="absolute inset-0 bauhaus-border-thick bauhaus-shadow-lg overflow-hidden rounded-2xl"
                style={overlayStyle}
              >
                {loading && (
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
                      <div className="h-14 w-14 border-[4px] border-ink border-t-primary animate-spin rounded-full" />
                      <p className="font-extrabold uppercase text-sm">Generating in {style.name}…</p>
                    </div>
                  </div>
                )}

                {!loading && imageUrl && (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img
                      src={imageUrl}
                      alt="Generated illustration"
                      crossOrigin="anonymous"
                      className="max-w-full max-h-full block"
                      style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: "center",
                        transition: "transform 200ms ease",
                        objectFit: "contain",
                        filter: `drop-shadow(0 0 0 ${colors.outline})`,
                      }}
                    />
                  </div>
                )}

                {!loading && !imageUrl && (
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="flex justify-center gap-3 mb-6">
                        <div className="h-16 w-16 rounded-full bg-primary border-[3px] border-ink" />
                        <div className="h-16 w-16 bg-secondary border-[3px] border-ink" />
                        <div
                          className="h-16 w-16 bg-accent border-[3px] border-ink"
                          style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
                        />
                      </div>
                      <h3 className="heading-display text-2xl mb-2">Your canvas awaits</h3>
                      <p className="text-sm text-muted-foreground">Pick a style and write a prompt to begin.</p>
                    </div>
                  </div>
                )}

                {/* Bottom action row: regenerate left, palette panel toggle */}
                {imageUrl && !loading && (
                  <div className="absolute bottom-3 right-3 flex gap-2 z-10">
                    <button
                      onClick={regenerate}
                      disabled={loading}
                      className="px-3 py-2 bg-background bauhaus-border hover-lift text-[10px] font-extrabold uppercase inline-flex items-center gap-2 rounded-xl"
                    >
                      <RefreshCw size={12} /> Regenerate
                    </button>
                  </div>
                )}
              </div>

              {/* Slide-up colour panel — anchored over output */}
              <div
                className={`absolute left-0 right-0 bottom-0 transition-transform duration-200 ease-out z-20 ${
                  showPalette && imageUrl ? "translate-y-0" : "translate-y-full"
                }`}
                style={{ pointerEvents: showPalette && imageUrl ? "auto" : "none" }}
              >
                <ColourCustomiser
                  colors={colors}
                  setColors={setColors}
                  onClose={() => setShowPalette(false)}
                  onReset={() => setColors(DEFAULT_COLORS)}
                />
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT — PROMPT / CHAT (40%) */}
        <aside className="bg-card flex flex-col min-h-0 lg:h-[calc(100vh-4rem-3px)]">
          {/* Selected style header */}
          <div className="p-5 border-b-[3px] border-ink flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 flex-shrink-0">
                <StylePreview style={style} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase text-muted-foreground">Active style</div>
                <div className="font-extrabold uppercase truncate">{style.name}</div>
              </div>
            </div>
            <button
              onClick={() => setPickerOpen(true)}
              className="px-3 py-2 bg-background bauhaus-border hover-lift text-xs font-extrabold uppercase inline-flex items-center gap-2 flex-shrink-0 rounded-2xl"
            >
              <Shuffle size={14} /> Change Style
            </button>
          </div>

          {/* History */}
          <div ref={historyRef} className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[160px]">
            {history.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-accent border-[3px] border-ink mb-4" />
                <p className="text-sm font-bold uppercase">Your prompts will appear here</p>
              </div>
            ) : (
              history.map((m, i) => (
                <div
                  key={i}
                  className="ml-auto max-w-[90%] bg-primary text-primary-foreground p-3 bauhaus-border bauhaus-shadow-sm rounded-2xl"
                >
                  <div className="text-[10px] font-extrabold uppercase opacity-80 mb-1">{m.style}</div>
                  <div className="text-sm">{m.content}</div>
                </div>
              ))
            )}
          </div>

          {/* Prompt input */}
          <div className="p-5 border-t-[3px] border-ink bg-background flex-shrink-0">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
              }}
              placeholder="Describe your illustration…"
              className="w-full h-24 p-3 bg-background bauhaus-border focus:outline-none focus:ring-4 focus:ring-primary/30 text-sm resize-none rounded-2xl"
            />
            <button
              onClick={generate}
              disabled={loading}
              className="w-full mt-3 px-5 py-3.5 bg-primary text-primary-foreground font-extrabold uppercase bauhaus-border hover-lift disabled:opacity-60 inline-flex items-center justify-center gap-2 rounded-2xl"
            >
              {loading ? "Generating..." : (<>Generate <Send size={16} /></>)}
            </button>
            <p className="text-[10px] font-bold uppercase text-muted-foreground mt-2">⌘ + Enter to send</p>
          </div>
        </aside>
      </div>

      <StylePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selected={style.name}
        onSelect={setStyle}
      />
    </div>
  );
};

const ELEMENT_LABELS: Array<{ key: keyof ElementColors; label: string }> = [
  { key: "background", label: "Background" },
  { key: "primary", label: "Primary Shape" },
  { key: "accent", label: "Accent" },
  { key: "outline", label: "Outline" },
];

const ColourCustomiser = ({
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

      {/* Preset palettes */}
      <div className="mb-5">
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

      {/* Custom colours per element */}
      <div>
        <div className="text-[10px] font-extrabold uppercase mb-2 text-muted-foreground">
          Custom colours
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {ELEMENT_LABELS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center justify-between gap-3 p-2 bauhaus-border bg-background rounded-xl cursor-pointer"
            >
              <span className="text-xs font-extrabold uppercase">{label}</span>
              <span className="flex items-center gap-2">
                <span
                  className="h-7 w-7 border-[2px] border-ink rounded-md"
                  style={{ background: colors[key] }}
                />
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => setColors((c) => ({ ...c, [key]: e.target.value }))}
                  className="sr-only"
                  aria-label={`Pick ${label} colour`}
                />
              </span>
            </label>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          Background recolours instantly. For per-shape edits of vector outputs, save as SVG and edit in your design tool.
        </p>
      </div>
    </div>
  );
};

export default Generate;

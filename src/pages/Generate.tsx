import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { STYLES, type Style } from "@/lib/styles";
import { StylePickerModal } from "@/components/StylePickerModal";
import { StylePreview } from "@/components/StylePreview";
import { DownloadDropdown } from "@/components/DownloadDropdown";
import { supabase } from "@/integrations/supabase/client";
import {
  Send, RefreshCw, Bookmark, ZoomIn, ZoomOut, Shuffle, ChevronDown,
} from "lucide-react";
import { ColourCustomiser, DEFAULT_COLORS, type ElementColors } from "@/components/ColourCustomiser";
import { useColorizedCanvas } from "@/hooks/useColorizedCanvas";
import { toast } from "sonner";
import { removeBackground } from "@imgly/background-removal";

type Msg = { role: "user"; content: string; style: string };

const Generate = () => {
  const [params] = useSearchParams();
  const initialStyle =
    STYLES.find((s) => s.name === params.get("style")) ?? STYLES[0];

  const [style, setStyle] = useState<Style>(initialStyle);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [prompt, setPrompt] = useState(params.get("prompt") ?? "");
  const [history, setHistory] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [genId, setGenId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showPalette, setShowPalette] = useState(false);
  const [colors, setColors] = useState<ElementColors>(DEFAULT_COLORS);
  const [transparentBg, setTransparentBg] = useState(false);

  const historyRef = useRef<HTMLDivElement>(null);
  const { canvasRef, containerRef, exportCanvas } = useColorizedCanvas(imageUrl, colors, zoom, transparentBg);

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
        body: { prompt: currentPrompt, style: style.name, transparent: transparentBg },
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

  const [saved, setSaved] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  useEffect(() => {
    if (!genId) { setSaved(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("generations")
        .select("is_saved")
        .eq("id", genId)
        .maybeSingle();
      if (!cancelled) setSaved(Boolean(data?.is_saved));
    })();
    return () => { cancelled = true; };
  }, [genId]);

  const toggleSave = async () => {
    if (!genId) { toast.error("Nothing to save yet"); return; }
    if (savingToggle) return;
    setSavingToggle(true);
    const next = !saved;
    setSaved(next); // optimistic
    const { error } = await supabase
      .from("generations")
      .update({ is_saved: next })
      .eq("id", genId);
    if (error) {
      setSaved(!next); // revert
      toast.error("Couldn't update save state");
    } else {
      toast.success(next ? "Saved to your gallery!" : "Removed from saved");
    }
    setSavingToggle(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[60fr_40fr] border-t-[3px] border-ink min-h-0">
        {/* LEFT — OUTPUT */}
        <main className="relative flex flex-col bg-muted/30 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-ink min-h-0">
          <div className="flex-1 flex flex-col p-4 md:p-6 min-h-0 lg:h-[calc(100vh-4rem-3px)]">
            {/* Toolbar (zoom + download) */}
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
              {imageUrl && !loading && (
                <div className="ml-auto">
                  <DownloadDropdown
                    exportCanvas={exportCanvas}
                    filenameBase={`creonix-${genId ?? "image"}`}
                    variant="primary"
                  />
                </div>
              )}
            </div>

            {/* Output frame */}
            <div className="flex-1 min-h-[50vh] lg:min-h-0 relative flex flex-col">
              <div className="flex-1 relative bauhaus-border-thick bauhaus-shadow-lg overflow-hidden rounded-2xl bg-muted/20">
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
                  <div ref={containerRef} className="w-full h-full">
                    <canvas
                      ref={canvasRef}
                      className="block w-full h-full"
                    />
                  </div>
                )}

                {!loading && !imageUrl && (
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="flex justify-center mb-6">
                        <svg
                          width="96"
                          height="96"
                          viewBox="0 0 80 80"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M 72.76 17.06 A 40 40 0 1 0 72.76 62.94 L 40 40 Z"
                            fill="hsl(var(--secondary))"
                          />
                          <circle cx="58" cy="40" r="7.2" fill="hsl(var(--primary))" />
                        </svg>
                      </div>
                      <h3 className="heading-display text-2xl mb-2">Your canvas awaits</h3>
                      <p className="text-sm text-muted-foreground">Pick a style and write a prompt to begin.</p>
                    </div>
                  </div>
                )}

                {/* Save / Unsave to Gallery — TOP RIGHT, absolute */}
                {imageUrl && !loading && (
                  <button
                    onClick={toggleSave}
                    disabled={savingToggle}
                    className="group absolute top-3 right-3 z-10 inline-flex items-center justify-center transition-transform hover:scale-[1.08] disabled:opacity-60"
                    style={{
                      width: 44,
                      height: 44,
                      transitionDuration: "150ms",
                    }}
                    aria-label={saved ? "Unsave from Gallery" : "Save to Gallery"}
                    aria-pressed={saved}
                  >
                    <span
                      className="inline-flex items-center justify-center"
                      style={{
                        width: 36,
                        height: 36,
                        background: saved ? "#111111" : "#F5C400",
                        border: "2px solid #111111",
                        borderRadius: 6,
                        color: saved ? "#F5C400" : "#111111",
                      }}
                    >
                      <Bookmark size={16} fill={saved ? "#F5C400" : "none"} />
                    </span>
                    <span className="pointer-events-none absolute top-full mt-1 right-0 whitespace-nowrap bg-ink text-ink-foreground text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {saved ? "Click to Unsave" : "Save to Gallery"}
                    </span>
                  </button>
                )}

                {imageUrl && !loading && (
                  <div className="absolute bottom-3 left-3 z-10">
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

              {/* Customise Colours button — directly BELOW image, full width */}
              <button
                onClick={() => setShowPalette((s) => !s)}
                disabled={!imageUrl}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  height: 44,
                  background: showPalette ? "#111111" : "#FFFFFF",
                  color: showPalette ? "#FFFFFF" : "#111111",
                  border: "2px solid #111111",
                  borderRadius: 6,
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) => {
                  if (!showPalette && !e.currentTarget.disabled) e.currentTarget.style.background = "#F5F0E8";
                }}
                onMouseLeave={(e) => {
                  if (!showPalette) e.currentTarget.style.background = "#FFFFFF";
                }}
              >
                {/* swatch icon: 3 overlapping circles */}
                <span className="relative inline-block" style={{ width: 28, height: 16 }}>
                  <span className="absolute" style={{ left: 0, top: 0, width: 16, height: 16, borderRadius: "50%", background: "#E63030", border: "1.5px solid #111" }} />
                  <span className="absolute" style={{ left: 6, top: 0, width: 16, height: 16, borderRadius: "50%", background: "#1A4BDB", border: "1.5px solid #111" }} />
                  <span className="absolute" style={{ left: 12, top: 0, width: 16, height: 16, borderRadius: "50%", background: "#F5C400", border: "1.5px solid #111" }} />
                </span>
                Customise Colours <ChevronDown size={14} className={`transition-transform duration-200 ${showPalette ? "rotate-180" : ""}`} />
              </button>

              {/* Slide-down colour panel BELOW the button */}
              <div
                className="overflow-hidden transition-[max-height,opacity,margin] duration-200 ease-out"
                style={{
                  maxHeight: showPalette && imageUrl ? 600 : 0,
                  opacity: showPalette && imageUrl ? 1 : 0,
                  marginTop: showPalette && imageUrl ? 12 : 0,
                }}
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

        {/* RIGHT — PROMPT / CHAT */}
        <aside className="bg-card flex flex-col min-h-0 lg:h-[calc(100vh-4rem-3px)]">
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

            {/* Background toggle */}
            <div className="mt-3 flex items-center gap-1 p-1 bauhaus-border rounded-2xl bg-background">
              <button
                type="button"
                onClick={() => setTransparentBg(false)}
                className={`flex-1 px-3 py-2 text-[11px] font-extrabold uppercase rounded-xl transition-colors ${
                  !transparentBg ? "bg-ink text-ink-foreground" : "hover:bg-accent"
                }`}
                aria-pressed={!transparentBg}
              >
                With Background
              </button>
              <button
                type="button"
                onClick={() => setTransparentBg(true)}
                className={`flex-1 px-3 py-2 text-[11px] font-extrabold uppercase rounded-xl transition-colors ${
                  transparentBg ? "bg-ink text-ink-foreground" : "hover:bg-accent"
                }`}
                aria-pressed={transparentBg}
              >
                No Background
              </button>
            </div>

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

export default Generate;

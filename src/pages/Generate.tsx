import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { STYLES, type Style } from "@/lib/styles";
import { StylePickerModal } from "@/components/StylePickerModal";
import { StylePreview } from "@/components/StylePreview";
import { DownloadDropdown } from "@/components/DownloadDropdown";
import { supabase } from "@/integrations/supabase/client";
import {
  Send, RefreshCw, Bookmark, Palette, ZoomIn, ZoomOut, Shuffle,
} from "lucide-react";
import { ColourCustomiser, DEFAULT_COLORS, type ElementColors } from "@/components/ColourCustomiser";
import { useColorizedCanvas } from "@/hooks/useColorizedCanvas";
import { toast } from "sonner";

type Msg = { role: "user"; content: string; style: string };

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
  const { canvasRef, containerRef, exportCanvas } = useColorizedCanvas(imageUrl, colors, zoom);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[60fr_40fr] border-t-[3px] border-ink min-h-0">
        {/* LEFT — OUTPUT */}
        <main className="relative flex flex-col bg-muted/30 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-ink min-h-0">
          <div className="flex-1 flex flex-col p-4 md:p-6 min-h-0 lg:h-[calc(100vh-4rem-3px)]">
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
                    exportCanvas={exportCanvas}
                    filenameBase={`creonix-${genId ?? "image"}`}
                    variant="primary"
                  />
                )}
              </div>
            </div>

            {/* Output frame — canvas-based preview */}
            <div className="flex-1 min-h-[50vh] lg:min-h-0 relative">
              <div className="absolute inset-0 bauhaus-border-thick bauhaus-shadow-lg overflow-hidden rounded-2xl bg-muted/20">
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

              {/* Slide-up colour panel */}
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

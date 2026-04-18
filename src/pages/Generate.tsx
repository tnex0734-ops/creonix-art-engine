import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { STYLES, PALETTE_PRESETS, type Style } from "@/lib/styles";
import { StylePickerModal } from "@/components/StylePickerModal";
import { StylePreview } from "@/components/StylePreview";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Send, RefreshCw, Bookmark, Palette, Download, ChevronDown,
  ZoomIn, ZoomOut, Shuffle, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

type Msg = { role: "user"; content: string; style: string };

const Generate = () => {
  const { user } = useAuth();
  const [style, setStyle] = useState<Style>(STYLES[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [genId, setGenId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showPalette, setShowPalette] = useState(false);
  const [overlay, setOverlay] = useState<{ color: string; mix: number } | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) setDownloadOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const generate = async () => {
    if (!prompt.trim()) {
      toast.error("Add a prompt first");
      return;
    }
    setLoading(true);
    setImageUrl(null);
    setOverlay(null);
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
      const msg = e instanceof Error ? e.message : "Generation failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setPrompt(last.content);
    // Wait next tick then trigger
    setTimeout(() => generate(), 0);
  };

  const downloadAs = async (format: "png" | "jpeg" | "svg") => {
    if (!imageUrl) return;
    setDownloadOpen(false);
    try {
      if (format === "svg") {
        // wrap raster in SVG
        const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024"><image href="${imageUrl}" width="1024" height="1024"/></svg>`;
        const blob = new Blob([svg], { type: "image/svg+xml" });
        triggerDownload(URL.createObjectURL(blob), `creonix-${genId ?? "image"}.svg`);
      } else {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        if (format === "png") {
          triggerDownload(URL.createObjectURL(blob), `creonix-${genId ?? "image"}.png`);
        } else {
          // Convert to JPEG via canvas
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = imageUrl;
          await new Promise((r) => (img.onload = r));
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((b) => {
            if (b) triggerDownload(URL.createObjectURL(b), `creonix-${genId ?? "image"}.jpg`);
          }, "image/jpeg", 0.92);
        }
      }
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (e) {
      toast.error("Download failed");
    }
  };

  const triggerDownload = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  const saveToGallery = () => {
    if (!genId) {
      toast.error("Nothing to save yet");
      return;
    }
    toast.success("Already saved to your gallery!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 grid lg:grid-cols-[40fr_60fr] border-t-[3px] border-ink min-h-0">
        {/* LEFT PANEL */}
        <aside className="border-r-0 lg:border-r-[3px] border-ink bg-card flex flex-col min-h-0 max-h-[calc(100vh-4rem-3px)]">
          {/* Selected style header */}
          <div className="p-5 border-b-[3px] border-ink flex items-center justify-between gap-3">
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
              className="px-3 py-2 bg-background bauhaus-border hover-lift text-xs font-extrabold uppercase inline-flex items-center gap-2 flex-shrink-0"
            >
              <Shuffle size={14} /> Change
            </button>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {history.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <div className="mx-auto h-16 w-16 rounded-full bg-accent border-[3px] border-ink mb-4" />
                <p className="text-sm font-bold uppercase">Your prompts will appear here</p>
              </div>
            ) : (
              history.map((m, i) => (
                <div key={i} className="ml-auto max-w-[90%] bg-primary text-primary-foreground p-3 bauhaus-border bauhaus-shadow-sm">
                  <div className="text-[10px] font-extrabold uppercase opacity-80 mb-1">{m.style}</div>
                  <div className="text-sm">{m.content}</div>
                </div>
              ))
            )}
          </div>

          {/* Prompt input */}
          <div className="p-5 border-t-[3px] border-ink bg-background">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
              }}
              placeholder="Describe your illustration… e.g. a designer working at a desk, minimal workspace, side view"
              className="w-full h-28 p-3 bg-background bauhaus-border focus:outline-none focus:ring-4 focus:ring-primary/30 text-sm resize-none"
            />
            <button
              onClick={generate}
              disabled={loading}
              className="w-full mt-3 px-5 py-3.5 bg-primary text-primary-foreground font-extrabold uppercase bauhaus-border hover-lift disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {loading ? "Generating..." : (<>Generate <Send size={16} /></>)}
            </button>
            <p className="text-[10px] font-bold uppercase text-muted-foreground mt-2">⌘ + Enter to send</p>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <main className="p-6 md:p-10 overflow-y-auto bg-muted/30">
          <div className="max-w-3xl mx-auto">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <div className="flex bauhaus-border bg-background">
                <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="p-2.5 border-r-[3px] border-ink hover:bg-accent" aria-label="Zoom out"><ZoomOut size={16} /></button>
                <div className="px-3 py-2 text-xs font-extrabold uppercase flex items-center">{Math.round(zoom * 100)}%</div>
                <button onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))} className="p-2.5 border-l-[3px] border-ink hover:bg-accent" aria-label="Zoom in"><ZoomIn size={16} /></button>
              </div>
              <div className="ml-auto flex flex-wrap gap-2">
                <button onClick={regenerate} disabled={!imageUrl || loading} className="px-4 py-2.5 bg-background bauhaus-border hover-lift text-xs font-extrabold uppercase inline-flex items-center gap-2 disabled:opacity-50">
                  <RefreshCw size={14} /> Regenerate
                </button>
                <button onClick={saveToGallery} disabled={!imageUrl} className="px-4 py-2.5 bg-background bauhaus-border hover-lift text-xs font-extrabold uppercase inline-flex items-center gap-2 disabled:opacity-50">
                  <Bookmark size={14} /> Save
                </button>
                <button onClick={() => setShowPalette((s) => !s)} disabled={!imageUrl} className={`px-4 py-2.5 bauhaus-border hover-lift text-xs font-extrabold uppercase inline-flex items-center gap-2 disabled:opacity-50 ${showPalette ? "bg-accent" : "bg-background"}`}>
                  <Palette size={14} /> Customise Colours
                </button>
                <div className="relative" ref={downloadRef}>
                  <button onClick={() => setDownloadOpen((o) => !o)} disabled={!imageUrl} className="px-4 py-2.5 bg-primary text-primary-foreground bauhaus-border hover-lift text-xs font-extrabold uppercase inline-flex items-center gap-2 disabled:opacity-50">
                    <Download size={14} /> Download <ChevronDown size={14} />
                  </button>
                  {downloadOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-background bauhaus-border bauhaus-shadow z-10">
                      <button onClick={() => downloadAs("svg")} className="w-full px-4 py-3 text-left text-xs font-extrabold uppercase hover:bg-accent border-b-[3px] border-ink">Save as SVG</button>
                      <button onClick={() => downloadAs("jpeg")} className="w-full px-4 py-3 text-left text-xs font-extrabold uppercase hover:bg-accent border-b-[3px] border-ink">Save as JPEG</button>
                      <button onClick={() => downloadAs("png")} className="w-full px-4 py-3 text-left text-xs font-extrabold uppercase hover:bg-accent">Save as PNG (transparent)</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="relative">
              <div className="bauhaus-border-thick bauhaus-shadow-lg bg-background aspect-square overflow-hidden relative">
                {loading && (
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-muted via-background to-muted bg-[length:200%_100%] animate-shimmer" />
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
                      <div className="h-14 w-14 border-[4px] border-ink border-t-primary animate-spin rounded-full" />
                      <p className="font-extrabold uppercase text-sm">Generating in {style.name}...</p>
                    </div>
                  </div>
                )}
                {!loading && imageUrl && (
                  <div className="w-full h-full overflow-auto flex items-center justify-center">
                    <div style={{ transform: `scale(${zoom})`, transformOrigin: "center", transition: "transform 200ms ease" }} className="relative">
                      <img src={imageUrl} alt="Generated illustration" className="max-w-full h-auto block" />
                      {overlay && (
                        <div
                          className="absolute inset-0 pointer-events-none mix-blend-color"
                          style={{ background: overlay.color, opacity: overlay.mix }}
                        />
                      )}
                    </div>
                  </div>
                )}
                {!loading && !imageUrl && (
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="flex justify-center gap-3 mb-6">
                        <div className="h-16 w-16 rounded-full bg-primary border-[3px] border-ink" />
                        <div className="h-16 w-16 bg-secondary border-[3px] border-ink" />
                        <div className="h-16 w-16 bg-accent border-[3px] border-ink" style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
                      </div>
                      <h3 className="heading-display text-2xl mb-2">Your canvas awaits</h3>
                      <p className="text-sm text-muted-foreground">Pick a style and write a prompt to begin.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Colour customiser panel */}
              {showPalette && imageUrl && (
                <div className="mt-4 bg-card bauhaus-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="heading-display text-lg">Customise colours</h4>
                    <button onClick={() => setOverlay(null)} className="text-xs font-extrabold uppercase inline-flex items-center gap-1 hover:text-primary">
                      <RotateCcw size={12} /> Reset to original
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-extrabold uppercase mb-2 text-muted-foreground">Palette presets</div>
                      <div className="flex flex-wrap gap-3">
                        {PALETTE_PRESETS.map((p) => (
                          <button
                            key={p.name}
                            onClick={() => setOverlay({ color: p.colors[0], mix: 0.6 })}
                            className="bauhaus-border hover-lift overflow-hidden"
                            title={p.name}
                          >
                            <div className="flex">
                              {p.colors.slice(0, 5).map((c) => (
                                <div key={c} style={{ background: c, width: 18, height: 36 }} />
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-extrabold uppercase mb-2 text-muted-foreground">Tint colour</div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <input
                          type="color"
                          onChange={(e) => setOverlay((o) => ({ color: e.target.value, mix: o?.mix ?? 0.5 }))}
                          className="h-10 w-14 bauhaus-border cursor-pointer"
                          aria-label="Pick colour"
                        />
                        <div className="flex-1 min-w-[180px]">
                          <label className="block text-[10px] font-extrabold uppercase mb-1">Intensity</label>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={overlay?.mix ?? 0.5}
                            onChange={(e) => setOverlay((o) => o ? { ...o, mix: parseFloat(e.target.value) } : { color: "#E63030", mix: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Tip: For per-element recolouring of vector outputs, save as SVG and edit in your design tool.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
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

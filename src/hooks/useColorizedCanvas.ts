import { useEffect, useRef, useCallback } from "react";
import type { ElementColors } from "@/components/ColourCustomiser";

/**
 * Draws the source image onto a canvas with color customisations applied.
 * - Background colour fills behind the image
 * - Primary colour tints via "color" composite (replaces hue/sat, keeps luminosity)
 * - Accent colour adds a subtle screen overlay on highlights
 * - Outline darkens edges via "multiply"
 */
export function useColorizedCanvas(
  imageUrl: string | null,
  colors: ElementColors,
  zoom: number
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load image once URL changes
  useEffect(() => {
    if (!imageUrl) {
      imgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      draw();
    };
    img.onerror = () => {
      // Retry via proxy
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      if (!img.src.includes("proxy-image")) {
        img.src = `https://${projectId}.supabase.co/functions/v1/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const container = containerRef.current;
    const dpr = window.devicePixelRatio || 1;

    // Size canvas to container
    const cw = container ? container.clientWidth : img.naturalWidth;
    const ch = container ? container.clientHeight : img.naturalHeight;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    // 1. Fill background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, cw, ch);

    // Calculate image draw rect (fit & center with zoom)
    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    // 2. Draw original image
    ctx.drawImage(img, dx, dy, dw, dh);

    // 3. Apply primary colour tint (color blend — replaces hue/sat, keeps luminosity)
    ctx.globalCompositeOperation = "color";
    ctx.fillStyle = colors.primary;
    ctx.fillRect(dx, dy, dw, dh);

    // 4. Restore luminosity from original to avoid washing out
    // Re-draw original with luminosity composite
    ctx.globalCompositeOperation = "luminosity";
    ctx.drawImage(img, dx, dy, dw, dh);

    // 5. Accent highlight via "screen" at low opacity
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = colors.accent;
    ctx.fillRect(dx, dy, dw, dh);
    ctx.globalAlpha = 1;

    // 6. Outline/shadow tint via "multiply" at low opacity
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = colors.outline;
    ctx.fillRect(dx, dy, dw, dh);
    ctx.globalAlpha = 1;

    // Reset composite
    ctx.globalCompositeOperation = "source-over";
  }, [colors, zoom]);

  // Re-draw whenever colors or zoom change
  useEffect(() => {
    draw();
  }, [draw]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(() => draw());
    obs.observe(container);
    return () => obs.disconnect();
  }, [draw]);

  /** Export the colorized image as a standalone canvas (full resolution) */
  const exportCanvas = useCallback(
    (bgWhite = false): HTMLCanvasElement | null => {
      const img = imgRef.current;
      if (!img) return null;

      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d")!;

      // Background
      ctx.fillStyle = bgWhite ? "#ffffff" : colors.background;
      ctx.fillRect(0, 0, w, h);

      // Image
      ctx.drawImage(img, 0, 0, w, h);

      // Primary tint
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = colors.primary;
      ctx.fillRect(0, 0, w, h);

      // Luminosity restore
      ctx.globalCompositeOperation = "luminosity";
      ctx.drawImage(img, 0, 0, w, h);

      // Accent screen
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      // Outline multiply
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = colors.outline;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      ctx.globalCompositeOperation = "source-over";
      return c;
    },
    [colors]
  );

  return { canvasRef, containerRef, exportCanvas };
}

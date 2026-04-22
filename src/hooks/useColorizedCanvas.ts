import { useEffect, useRef, useCallback, useState } from "react";
import type { ElementColors } from "@/components/ColourCustomiser";

/**
 * Draws the source image onto a canvas with STRONG, visible color customisations.
 *
 * Pipeline (in order, all on one canvas):
 *  1. Fill entire canvas with background colour.
 *  2. Draw image.
 *  3. "saturation" blend with full white to neutralise original saturation (keeps luminance).
 *  4. "color" blend with primary → recolours mid-tones to primary hue/sat.
 *  5. "overlay" with accent at ~0.45 → pushes highlights toward accent.
 *  6. "multiply" with outline at ~0.35 → deepens shadows/outlines toward chosen outline color.
 *  7. Reset compositing.
 *
 * Result: moving any slider produces an immediately visible change in the preview,
 * and exportCanvas() bakes the same pipeline at the image's native resolution for download.
 */
export function useColorizedCanvas(
  imageUrl: string | null,
  colors: ElementColors,
  zoom: number
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgReady, setImgReady] = useState(0); // bump to trigger redraw

  // Load image when URL changes
  useEffect(() => {
    if (!imageUrl) {
      imgRef.current = null;
      setImgReady((n) => n + 1);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    let tryProxy = false;

    img.onload = () => {
      imgRef.current = img;
      setImgReady((n) => n + 1);
    };
    img.onerror = () => {
      if (!tryProxy) {
        tryProxy = true;
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        img.src = `https://${projectId}.supabase.co/functions/v1/proxy-image?url=${encodeURIComponent(
          imageUrl
        )}`;
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  /** Core paint routine — works on any ctx/rect. */
  const paint = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      img: HTMLImageElement,
      cw: number,
      ch: number,
      dx: number,
      dy: number,
      dw: number,
      dh: number,
      bg: string
    ) => {
      // 1. Background fill
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, cw, ch);

      // 2. Draw the image
      ctx.drawImage(img, dx, dy, dw, dh);

      // 3. Drop existing saturation (keep luminance only)
      ctx.globalCompositeOperation = "saturation";
      ctx.fillStyle = "#808080"; // zero-sat grey
      ctx.fillRect(dx, dy, dw, dh);

      // 4. Apply primary hue+sat across midtones
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = colors.primary;
      ctx.fillRect(dx, dy, dw, dh);

      // 5. Accent overlay — punches highlights toward accent color
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(dx, dy, dw, dh);
      ctx.globalAlpha = 1;

      // 6. Outline multiply — deepens darks toward outline color
      ctx.globalCompositeOperation = "multiply";
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = colors.outline;
      ctx.fillRect(dx, dy, dw, dh);
      ctx.globalAlpha = 1;

      // Reset
      ctx.globalCompositeOperation = "source-over";
    },
    [colors.primary, colors.accent, colors.outline]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas) return;

    const container = containerRef.current;
    const dpr = window.devicePixelRatio || 1;
    const cw = container ? container.clientWidth : img?.naturalWidth ?? 600;
    const ch = container ? container.clientHeight : img?.naturalHeight ?? 600;

    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Always at least draw background even if image not ready yet
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, cw, ch);

    if (!img) return;

    // Fit image inside canvas, centered, with zoom multiplier
    const scale =
      Math.min(cw / img.naturalWidth, ch / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    paint(ctx, img, cw, ch, dx, dy, dw, dh, colors.background);
  }, [colors.background, zoom, paint]);

  // Redraw on: colors change, zoom change, image ready, container resize
  useEffect(() => {
    draw();
  }, [draw, imgReady]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(() => draw());
    obs.observe(container);
    return () => obs.disconnect();
  }, [draw]);

  /** Full-resolution export of the colorized image. */
  const exportCanvas = useCallback(
    (bgWhite = false): HTMLCanvasElement | null => {
      const img = imgRef.current;
      if (!img) return null;

      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return null;

      // Apply paint pipeline to produce a high-res static image
      paint(ctx, img, w, h, 0, 0, w, h, bgWhite ? "#ffffff" : colors.background);
      return c;
    },
    [colors.background, paint]
  );

  return { canvasRef, containerRef, exportCanvas };
}

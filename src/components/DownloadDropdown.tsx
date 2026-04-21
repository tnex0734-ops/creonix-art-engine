import { useEffect, useRef, useState } from "react";
import { Download, ChevronDown, FileImage, FileType, ImageIcon } from "lucide-react";
import { toast } from "sonner";

type Props = {
  imageUrl: string;
  filenameBase?: string;
  variant?: "primary" | "icon";
  className?: string;
  align?: "left" | "right";
};

const triggerDownload = (url: string, name: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const loadImageToCanvas = (
  src: string,
  fillWhite: boolean
): Promise<HTMLCanvasElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      if (fillWhite) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });

/** Proxy through edge function if direct fetch is tainted by CORS */
const getProxiedUrl = (originalUrl: string): string => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  // Supabase storage URLs from same project don't need proxy
  if (originalUrl.includes(`${projectId}.supabase.co`)) return originalUrl;
  // External URLs: proxy through edge function
  return `https://${projectId}.supabase.co/functions/v1/proxy-image?url=${encodeURIComponent(originalUrl)}`;
};

export const DownloadDropdown = ({
  imageUrl,
  filenameBase = "creonix",
  variant = "primary",
  className = "",
  align = "right",
}: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const downloadAs = async (format: "png" | "jpeg" | "svg") => {
    setOpen(false);
    const src = getProxiedUrl(imageUrl);
    try {
      if (format === "svg") {
        // Fetch image and wrap in SVG
        const res = await fetch(src);
        if (!res.ok) throw new Error("Fetch failed");
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024" width="1024" height="1024">
  <image href="${dataUrl}" width="1024" height="1024"/>
</svg>`;
        const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        triggerDownload(URL.createObjectURL(svgBlob), `${filenameBase}.svg`);
      } else if (format === "png") {
        const canvas = await loadImageToCanvas(src, false);
        canvas.toBlob(
          (b) => {
            if (b) triggerDownload(URL.createObjectURL(b), `${filenameBase}.png`);
          },
          "image/png"
        );
      } else {
        const canvas = await loadImageToCanvas(src, true);
        canvas.toBlob(
          (b) => {
            if (b) triggerDownload(URL.createObjectURL(b), `${filenameBase}.jpg`);
          },
          "image/jpeg",
          0.92
        );
      }
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch {
      toast.error("Download failed — try again");
    }
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      {variant === "primary" ? (
        <button
          onClick={() => setOpen((o) => !o)}
          className="px-4 py-2.5 bg-primary text-primary-foreground bauhaus-border hover-lift text-xs font-extrabold uppercase inline-flex items-center gap-2 rounded-2xl"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <Download size={14} /> Download <ChevronDown size={14} />
        </button>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-1.5 bauhaus-border bg-background hover:bg-accent rounded-lg"
          aria-label="Download"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <Download size={14} />
        </button>
      )}

      {open && (
        <div
          role="menu"
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-2 w-52 bg-background border-[2px] border-ink shadow-[4px_4px_0_0_rgba(17,17,17,0.15)] z-50 rounded-lg overflow-hidden`}
        >
          <button
            onClick={() => downloadAs("svg")}
            className="w-full px-4 py-3 text-left text-xs font-extrabold uppercase hover:bg-accent border-b-[2px] border-ink inline-flex items-center gap-2"
          >
            <FileType size={14} /> Download SVG
          </button>
          <button
            onClick={() => downloadAs("jpeg")}
            className="w-full px-4 py-3 text-left text-xs font-extrabold uppercase hover:bg-accent border-b-[2px] border-ink inline-flex items-center gap-2"
          >
            <FileImage size={14} /> Download JPEG
          </button>
          <button
            onClick={() => downloadAs("png")}
            className="w-full px-4 py-3 text-left text-xs font-extrabold uppercase hover:bg-accent inline-flex items-center gap-2"
          >
            <ImageIcon size={14} /> Download PNG
          </button>
        </div>
      )}
    </div>
  );
};

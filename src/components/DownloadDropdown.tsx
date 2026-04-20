import { useEffect, useRef, useState } from "react";
import { Download, ChevronDown, FileImage, FileType, ImageIcon } from "lucide-react";
import { toast } from "sonner";

type Props = {
  imageUrl: string;
  filenameBase?: string;
  /** Visual variant of the trigger button */
  variant?: "primary" | "icon";
  className?: string;
  /** Anchor menu on the right edge of the trigger */
  align?: "left" | "right";
};

const triggerDownload = (url: string, name: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
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
    try {
      if (format === "svg") {
        const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024"><image href="${imageUrl}" width="1024" height="1024"/></svg>`;
        const blob = new Blob([svg], { type: "image/svg+xml" });
        triggerDownload(URL.createObjectURL(blob), `${filenameBase}.svg`);
      } else if (format === "png") {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        triggerDownload(URL.createObjectURL(blob), `${filenameBase}.png`);
      } else {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        await new Promise((r, j) => {
          img.onload = () => r(null);
          img.onerror = j;
        });
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (b) => b && triggerDownload(URL.createObjectURL(b), `${filenameBase}.jpg`),
          "image/jpeg",
          0.92
        );
      }
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      {variant === "primary" ? (
        <button
          onClick={() => setOpen((o) => !o)}
          className="px-4 py-2.5 bg-primary text-primary-foreground bauhaus-border hover-lift text-xs font-extrabold uppercase inline-flex items-center gap-2"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <Download size={14} /> Download <ChevronDown size={14} />
        </button>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-1.5 bauhaus-border bg-background hover:bg-accent"
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
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-2 w-52 bg-background bauhaus-border bauhaus-shadow z-50 rounded-2xl overflow-hidden`}
        >
          <button
            onClick={() => downloadAs("svg")}
            className="w-full px-4 py-3 text-left text-xs font-extrabold uppercase hover:bg-accent border-b-[3px] border-ink inline-flex items-center gap-2"
          >
            <FileType size={14} /> Download SVG
          </button>
          <button
            onClick={() => downloadAs("jpeg")}
            className="w-full px-4 py-3 text-left text-xs font-extrabold uppercase hover:bg-accent border-b-[3px] border-ink inline-flex items-center gap-2"
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

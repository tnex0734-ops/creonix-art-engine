import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, X, Bookmark } from "lucide-react";
import { DownloadDropdown } from "./DownloadDropdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Generation = {
  id: string;
  prompt: string;
  style: string;
  image_url: string;
  created_at: string;
};

type Props = {
  items: Generation[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  onDeleted: (id: string) => void;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const GalleryPreviewModal = ({ items, index, onClose, onIndexChange, onDeleted }: Props) => {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const item = items[index];

  useEffect(() => {
    setConfirmDelete(false);
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && index > 0) onIndexChange(index - 1);
      else if (e.key === "ArrowRight" && index < items.length - 1) onIndexChange(index + 1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, items.length, onClose, onIndexChange]);

  if (!item) return null;

  const handleRegenerate = () => {
    onClose();
    navigate(`/generate?style=${encodeURIComponent(item.style)}&prompt=${encodeURIComponent(item.prompt)}`);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("generations").delete().eq("id", item.id);
    if (error) return toast.error(error.message);
    toast.success("Illustration deleted");
    onDeleted(item.id);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-background border-[2.5px] border-ink rounded-[12px] w-[92vw] max-w-[960px] max-h-[90vh] flex flex-col overflow-hidden md:rounded-[12px] max-md:w-screen max-md:h-screen max-md:max-h-screen max-md:rounded-none max-md:border-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR */}
        <div className="h-[52px] border-b-2 border-ink flex items-center justify-between px-5 bg-background shrink-0">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-2 border-2 border-ink rounded-md bg-background hover:bg-accent text-[13px] font-semibold text-ink"
          >
            <ArrowLeft size={14} /> Back to Gallery
          </button>
          <div className="text-[12px] text-muted-foreground font-medium">
            {index + 1} of {items.length}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 border-2 border-ink rounded bg-background hover:bg-ink hover:text-ink-foreground flex items-center justify-center"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex flex-1 min-h-0 flex-col md:flex-row">
          {/* LEFT — image */}
          <div
            className="relative flex items-center justify-center p-6 md:basis-[60%] md:flex-shrink-0"
            style={{ background: "#F5F0E8" }}
          >
            <img
              src={item.image_url}
              alt={item.prompt}
              crossOrigin="anonymous"
              className="block max-w-full object-contain rounded-lg max-h-[45vh] md:max-h-[70vh]"
            />
            <div className="absolute bottom-4 left-4 bg-ink text-ink-foreground text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-[5px] rounded">
              {item.style}
            </div>

            {/* Prev/Next floating arrows (desktop) */}
            {index > 0 && (
              <button
                onClick={() => onIndexChange(index - 1)}
                className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background border-2 border-ink items-center justify-center hover:bg-ink hover:text-ink-foreground"
                aria-label="Previous"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {index < items.length - 1 && (
              <button
                onClick={() => onIndexChange(index + 1)}
                className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background border-2 border-ink items-center justify-center hover:bg-ink hover:text-ink-foreground"
                aria-label="Next"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>

          {/* RIGHT — info + actions */}
          <div className="flex-1 min-w-0 bg-background p-7 px-6 flex flex-col gap-4 border-l-2 border-ink overflow-y-auto max-md:border-l-0 max-md:border-t-2">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Prompt</div>
              <p className="text-[14px] text-ink leading-[1.5] line-clamp-4">{item.prompt}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Style</div>
              <p className="text-[14px] font-semibold text-ink">{item.style}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Created</div>
              <p className="text-[14px] text-ink">{formatDate(item.created_at)}</p>
            </div>

            <div className="h-px bg-[#E5E5E5]" />

            <div className="flex flex-col gap-3">
              <DownloadDropdown
                imageUrl={item.image_url}
                filenameBase={`creonix-${item.id}`}
                variant="primary"
                align="left"
                className="w-full [&>button]:w-full [&>button]:h-12 [&>button]:justify-center [&>button]:rounded-md [&>button]:text-[13px]"
              />

              <button
                onClick={handleRegenerate}
                className="w-full h-11 border-2 border-ink rounded-md bg-background text-ink text-[13px] font-bold uppercase hover:bg-accent"
              >
                Regenerate
              </button>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full h-10 border-[1.5px] border-[#CCCCCC] rounded-md bg-transparent text-[#888888] text-[12px] font-medium hover:border-ink hover:text-ink"
                >
                  Delete illustration
                </button>
              ) : (
                <div className="border-[1.5px] border-[#CCCCCC] rounded-md p-3 flex flex-col gap-2">
                  <p className="text-[12px] text-ink">Are you sure? This cannot be undone.</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDelete}
                      className="flex-1 h-9 bg-primary text-primary-foreground border-2 border-ink rounded-md text-[12px] font-bold uppercase"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-[12px] text-muted-foreground underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-2 inline-flex items-center gap-1.5 text-[#888888] text-[12px]">
              <Bookmark size={12} /> Saved to gallery
            </div>
          </div>
        </div>

        {/* Mobile prev/next bottom bar */}
        <div className="md:hidden flex border-t-2 border-ink shrink-0">
          <button
            onClick={() => index > 0 && onIndexChange(index - 1)}
            disabled={index === 0}
            className="flex-1 h-12 flex items-center justify-center border-r-2 border-ink disabled:opacity-30"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => index < items.length - 1 && onIndexChange(index + 1)}
            disabled={index === items.length - 1}
            className="flex-1 h-12 flex items-center justify-center disabled:opacity-30"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

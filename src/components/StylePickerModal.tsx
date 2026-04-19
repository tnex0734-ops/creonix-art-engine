import { useEffect, useRef, useState } from "react";
import { STYLES, type Style } from "@/lib/styles";
import { StyleCard } from "./StyleCard";
import { X, ArrowRight } from "lucide-react";

export const StylePickerModal = ({
  open,
  onClose,
  selected,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selected: string;
  onSelect: (s: Style) => void;
}) => {
  const initial = STYLES.find((s) => s.name === selected) ?? STYLES[0];
  const [tempSelected, setTempSelected] = useState<Style>(initial);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setTempSelected(STYLES.find((s) => s.name === selected) ?? STYLES[0]);
    }
  }, [open, selected]);

  // Lock body scroll + focus trap setup
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Focus the currently selected card
    setTimeout(() => {
      const idx = STYLES.findIndex((s) => s.name === tempSelected.name);
      cardsRef.current[idx]?.focus();
    }, 0);
    return () => {
      document.body.style.overflow = prev;
      previouslyFocused?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keyboard handlers
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      // Arrow navigation between cards
      if (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) {
        const active = document.activeElement;
        const idx = cardsRef.current.findIndex((el) => el === active);
        if (idx === -1) return;
        e.preventDefault();
        const cols = window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 3 : 2;
        let next = idx;
        if (e.key === "ArrowRight") next = Math.min(STYLES.length - 1, idx + 1);
        if (e.key === "ArrowLeft") next = Math.max(0, idx - 1);
        if (e.key === "ArrowDown") next = Math.min(STYLES.length - 1, idx + cols);
        if (e.key === "ArrowUp") next = Math.max(0, idx - cols);
        cardsRef.current[next]?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const confirm = () => {
    onSelect(tempSelected);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="style-picker-title"
        className="bg-background bauhaus-border-thick max-w-5xl w-full my-8 bauhaus-shadow-lg flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-[3px] border-ink p-5 flex-shrink-0">
          <h2 id="style-picker-title" className="heading-display text-2xl md:text-3xl">
            CHOOSE A STYLE
          </h2>
          <button
            onClick={onClose}
            className="p-2 bauhaus-border hover-lift bg-background"
            aria-label="Close style picker"
          >
            <X size={20} />
          </button>
        </div>

        {/* Grid */}
        <div
          className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto"
          style={{ background: "#F5F2EE" }}
        >
          {STYLES.map((s, i) => (
            <div key={s.name} className="w-full" style={{ minHeight: 220 }}>
              <StyleCard
                style={s}
                selected={tempSelected.name === s.name}
                onSelect={(st) => setTempSelected(st)}
                size="md"
              />
              {/* attach ref via wrapper trick: re-query by aria-label */}
              <RefBinder
                index={i}
                refs={cardsRef}
                label={`Select ${s.name} illustration style`}
              />
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="border-t-[3px] border-ink p-4 flex items-center justify-between gap-3 flex-shrink-0 bg-background">
          <div className="text-xs font-extrabold uppercase truncate">
            <span className="text-muted-foreground">Selected:</span>{" "}
            <span className="text-ink">{tempSelected.name}</span>
          </div>
          <button
            onClick={confirm}
            className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-ink-foreground font-extrabold uppercase bauhaus-border hover-lift text-sm"
          >
            Make a selection <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Tiny helper that binds a card button to a refs array by querying aria-label.
const RefBinder = ({
  index,
  refs,
  label,
}: {
  index: number;
  refs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  label: string;
}) => {
  useEffect(() => {
    const el = document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
    refs.current[index] = el;
    return () => {
      refs.current[index] = null;
    };
  }, [index, label, refs]);
  return null;
};

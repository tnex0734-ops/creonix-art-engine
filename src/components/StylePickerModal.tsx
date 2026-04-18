import { STYLES, type Style } from "@/lib/styles";
import { StylePreview } from "./StylePreview";
import { X } from "lucide-react";

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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-background bauhaus-border-thick max-w-5xl w-full my-8 bauhaus-shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-[3px] border-ink p-5">
          <h2 className="heading-display text-2xl md:text-3xl">CHOOSE A STYLE</h2>
          <button onClick={onClose} className="p-2 bauhaus-border hover-lift" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto">
          {STYLES.map((s) => {
            const isSelected = s.name === selected;
            return (
              <button
                key={s.name}
                onClick={() => { onSelect(s); onClose(); }}
                className={`text-left group ${isSelected ? "ring-4 ring-primary ring-offset-2 ring-offset-background" : ""}`}
              >
                <StylePreview style={s} className="hover-lift" />
                <div className="mt-2 font-extrabold uppercase text-sm">{s.name}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import { STYLE_PREVIEWS } from "./style-previews/StyleSvgPreviews";
import { STYLE_IMAGES } from "./style-previews/styleImages";
import type { Style } from "@/lib/styles";

type Props = {
  style: Style;
  selected?: boolean;
  onSelect?: (s: Style) => void;
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
};

export const StyleCard = ({ style, selected = false, onSelect, size = "md", rounded = false }: Props) => {
  const Preview = STYLE_PREVIEWS[style.name];
  const image = STYLE_IMAGES[style.name];
  const dims =
    size === "lg" ? "w-[280px] h-[280px]" : size === "sm" ? "w-[180px] h-[180px]" : "w-full aspect-square";
  const roundedCls = rounded || style.name === "3D Clay" ? "rounded-2xl" : "";

  return (
    <button
      type="button"
      onClick={() => onSelect?.(style)}
      aria-label={`Select ${style.name} illustration style`}
      aria-pressed={selected}
      className={`group relative flex flex-col bg-background overflow-hidden transition-all duration-200 ease-out hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40 ${dims} ${roundedCls} ${
        selected
          ? "border-[3px] border-primary"
          : "border-[2px] border-ink hover:border-ink"
      }`}
      style={{ minHeight: 44, minWidth: 44 }}
    >
      {/* Top 75%: photographic reference + SVG decorative overlay */}
      <div className={`relative w-full overflow-hidden bg-muted ${roundedCls ? "rounded-t-2xl" : ""}`} style={{ height: "75%" }}>
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            width={512}
            height={512}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : Preview ? (
          <Preview />
        ) : null}
        {selected && <div className="absolute inset-0 bg-primary/15 pointer-events-none" />}
      </div>
      {/* Label */}
      <div className="flex-1 w-full flex items-center justify-center px-2 border-t-[2px] border-ink bg-background">
        <span className="font-black uppercase text-xs sm:text-sm tracking-tight text-center leading-tight truncate w-full">
          {style.name}
        </span>
      </div>
    </button>
  );
};

import type { Style } from "@/lib/styles";
import { STYLE_IMAGES } from "./style-previews/styleImages";
import { STYLE_PREVIEWS } from "./style-previews/StyleSvgPreviews";

// Compact preview used inside chips / small thumbnails.
// Uses the bundled reference image, falls back to the hand-crafted SVG.
export const StylePreview = ({ style, className = "" }: { style: Style; className?: string }) => {
  const img = STYLE_IMAGES[style.name];
  const Svg = STYLE_PREVIEWS[style.name];
  const rounded = style.name === "3D Clay" ? "rounded-lg" : "";
  return (
    <div
      className={`relative overflow-hidden bauhaus-border bg-muted ${rounded} ${className}`}
      style={{ aspectRatio: "1 / 1" }}
      aria-label={`${style.name} preview`}
    >
      {img ? (
        <img src={img} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      ) : Svg ? (
        <Svg />
      ) : null}
    </div>
  );
};

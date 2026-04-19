import type { Style } from "@/lib/styles";
import { STYLE_PREVIEWS } from "./style-previews/StyleSvgPreviews";

// Compact preview used inside chips / small thumbnails.
// Renders the same hand-crafted SVG as the larger StyleCard.
export const StylePreview = ({ style, className = "" }: { style: Style; className?: string }) => {
  const Preview = STYLE_PREVIEWS[style.name];
  const rounded = style.name === "3D Clay" ? "rounded-lg" : "";
  return (
    <div
      className={`relative overflow-hidden bauhaus-border ${rounded} ${className}`}
      style={{ aspectRatio: "1 / 1" }}
      aria-label={`${style.name} preview`}
    >
      {Preview ? <Preview /> : null}
    </div>
  );
};

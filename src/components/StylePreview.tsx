import type { Style } from "@/lib/styles";

// A purely CSS/SVG generated preview card for each style — no external images needed.
export const StylePreview = ({ style, className = "" }: { style: Style; className?: string }) => {
  const [c1, c2, c3] = style.swatch;
  return (
    <div
      className={`relative overflow-hidden bauhaus-border ${className}`}
      style={{ background: c1, aspectRatio: "1 / 1" }}
      aria-label={`${style.name} preview`}
    >
      {/* Background dot pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(${c3} 1.4px, transparent 1.4px)`,
          backgroundSize: "14px 14px",
        }}
      />
      {/* Big shape */}
      {style.shape === "circle" && (
        <div
          className="absolute -bottom-8 -right-8 rounded-full"
          style={{ width: "75%", height: "75%", background: c2, border: "3px solid #111" }}
        />
      )}
      {style.shape === "square" && (
        <div
          className="absolute bottom-3 right-3 rotate-12"
          style={{ width: "55%", height: "55%", background: c2, border: "3px solid #111" }}
        />
      )}
      {style.shape === "triangle" && (
        <div
          className="absolute bottom-2 left-2"
          style={{
            width: "70%",
            height: "70%",
            background: c2,
            clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
            border: "0",
          }}
        />
      )}
      {style.shape === "cross" && (
        <>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: "60%", height: "14%", background: c2, border: "3px solid #111" }} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: "14%", height: "60%", background: c3, border: "3px solid #111" }} />
        </>
      )}
      {style.shape === "arc" && (
        <div
          className="absolute -bottom-12 left-1/2 -translate-x-1/2"
          style={{ width: "120%", height: "120%", background: c2, borderRadius: "50%", border: "3px solid #111" }}
        />
      )}
      {style.shape === "stripes" && (
        <div className="absolute inset-3 flex flex-col gap-2 justify-center">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ height: "10%", background: i % 2 ? c2 : c3, border: "2px solid #111" }} />
          ))}
        </div>
      )}
      {/* Small accent circle */}
      <div className="absolute top-3 left-3 rounded-full" style={{ width: 28, height: 28, background: c3, border: "3px solid #111" }} />
    </div>
  );
};

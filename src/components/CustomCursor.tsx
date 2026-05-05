import { useEffect, useRef, useState } from "react";

/**
 * Pixel-art pointing-hand cursor (Bauhaus colours).
 * - Hand follows pointer with subtle easing
 * - Switches to "click" pose when hovering interactive elements / mousedown
 * - Disabled on touch / coarse-pointer devices
 */

const HAND_POINT = `
.....11.........
....1ww1........
....1ww1........
....1ww1........
....1ww111......
....1ww1ww11....
....1ww1ww1ww1..
.11.1ww1ww1ww1..
1ww11wwwwwwwww1.
1www1wwwwwwwww1.
.1wwwwwwwwwwww1.
..1wwwwwwwwwww1.
..1wwwwwwwwwww1.
...1wwwwwwwwww1.
....1wwwwwwww1..
....1wwwwwwww1..`.trim();

const HAND_CLICK = `
................
................
....1111111.....
...1wwwwww1.....
...1wwwwww111...
...1wwwwwwww1...
...1wwwwwwww1...
.111wwwwwwww1...
1ww1wwwwwwww1...
1www1wwwwwww1...
.1wwwwwwwwww1...
..1wwwwwwwww1...
..1wwwwwwwww1...
...1wwwwwwww1...
....1wwwwww1....
....11111111....`.trim();

function buildSvg(grid: string, fill: string, outline: string) {
  const rows = grid.split("\n");
  const size = 16;
  const rects: string[] = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === "w") {
        rects.push(`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${fill}"/>`);
      } else if (ch === "1") {
        rects.push(`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${outline}"/>`);
      }
    });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="32" height="32" shape-rendering="crispEdges">${rects.join("")}</svg>`;
}

export const CustomCursor = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });
  const [pose, setPose] = useState<"point" | "click">("point");
  const hovering = useRef(false);
  const pressed = useRef(false);
  const raf = useRef<number | null>(null);

  // Pre-build SVG data URLs (memoised once)
  const pointSvg = useRef(
    `url("data:image/svg+xml;utf8,${encodeURIComponent(buildSvg(HAND_POINT, "#F5C400", "#111111"))}")`
  );
  const clickSvg = useRef(
    `url("data:image/svg+xml;utf8,${encodeURIComponent(buildSvg(HAND_CLICK, "#E63030", "#111111"))}")`
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.documentElement.classList.add("creonix-cursor-on");

    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      const el = e.target as HTMLElement | null;
      const isInteractive = !!el?.closest(
        "a, button, input, textarea, select, [role=button], [data-cursor-hover]"
      );
      if (isInteractive !== hovering.current) {
        hovering.current = isInteractive;
        setPose(pressed.current || isInteractive ? "click" : "point");
      }
    };

    const onDown = () => {
      pressed.current = true;
      setPose("click");
    };
    const onUp = () => {
      pressed.current = false;
      setPose(hovering.current ? "click" : "point");
    };

    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.45;
      pos.current.y += (target.current.y - pos.current.y) * 0.45;
      if (wrapRef.current) {
        // Anchor the hand's fingertip near top-left of the 32px sprite
        wrapRef.current.style.transform = `translate3d(${pos.current.x - 6}px, ${pos.current.y - 4}px, 0)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      if (raf.current) cancelAnimationFrame(raf.current);
      document.documentElement.classList.remove("creonix-cursor-on");
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[999999] h-8 w-8 transition-[filter] duration-100"
      style={{
        backgroundImage: pose === "click" ? clickSvg.current : pointSvg.current,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        imageRendering: "pixelated",
        willChange: "transform",
        filter: pose === "click" ? "drop-shadow(2px 2px 0 rgba(0,0,0,0.25))" : "drop-shadow(1px 1px 0 rgba(0,0,0,0.2))",
      }}
    />
  );
};

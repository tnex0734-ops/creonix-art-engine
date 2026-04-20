import { useEffect, useRef } from "react";

/**
 * Bauhaus-flavoured custom cursor:
 *  - Solid red dot follows pointer 1:1
 *  - Yellow ring trails with eased lerp
 *  - Grows on hovering interactive elements
 *  - Disabled on touch / coarse-pointer devices
 */
export const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const dot = useRef({ x: -100, y: -100 });
  const hovering = useRef(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.documentElement.classList.add("creonix-cursor-on");

    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      const el = e.target as HTMLElement | null;
      hovering.current = !!el?.closest(
        "a, button, input, textarea, select, [role=button], [data-cursor-hover]"
      );
    };

    const tick = () => {
      // dot follows immediately
      dot.current.x += (target.current.x - dot.current.x) * 0.6;
      dot.current.y += (target.current.y - dot.current.y) * 0.6;
      // ring eases
      ring.current.x += (target.current.x - ring.current.x) * 0.18;
      ring.current.y += (target.current.y - ring.current.y) * 0.18;

      const scale = hovering.current ? 1.8 : 1;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.current.x}px, ${dot.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
      document.documentElement.classList.remove("creonix-cursor-on");
    };
  }, []);

  // Hide entirely on touch
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] h-8 w-8 rounded-full border-[2.5px] border-accent transition-[border-color,background-color] duration-150 mix-blend-difference"
        style={{ willChange: "transform" }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] h-2 w-2 rounded-full bg-primary"
        style={{ willChange: "transform" }}
      />
    </>
  );
};

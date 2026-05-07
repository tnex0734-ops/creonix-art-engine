import { Link, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { STYLES } from "@/lib/styles";
import { StyleCard } from "@/components/StyleCard";
import { STYLE_IMAGES } from "@/components/style-previews/styleImages";
import { ArrowRight, Sparkles, Type, Download, Star, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";

const Landing = () => {
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const navigate = useNavigate();
  // Pick 3 featured styles for the hero collage
  const heroStyles = ["Psychedelic", "3D Clay", "Isometric"];

  // Parallax / mouse-tilt for hero card stack
  const tiltRef = useRef<HTMLDivElement>(null);
  // Each card: [baseRotateDeg, parallaxStrength (px), tiltStrength (deg)]
  const cardConfigs: Array<[number, number, number]> = [
    [-6, 14, 6],  // back
    [4, 22, 8],   // middle
    [-2, 32, 10], // front
  ];

  const handleTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // normalized -1..1
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    el.style.setProperty("--mx", nx.toFixed(3));
    el.style.setProperty("--my", ny.toFixed(3));
  };

  const handleTiltLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty("--mx", "0");
    el.style.setProperty("--my", "0");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO — asymmetric Bauhaus grid */}
      <section
        className="relative overflow-hidden border-b-[3px] border-ink bg-background flex items-center py-10 lg:py-0"
        style={{ minHeight: "560px" }}
      >
        {/* Background grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--ink)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--ink)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Floating corner shapes */}
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-accent border-[3px] border-ink hidden md:block" />
        <div className="absolute top-32 right-1/3 h-6 w-6 bg-primary border-[3px] border-ink rotate-45 hidden lg:block" />
        <div className="absolute bottom-24 left-1/4 h-4 w-4 rounded-full bg-secondary border-[2px] border-ink hidden lg:block" />

        <div className="container relative w-full">
          {/* Top row: tag + meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bauhaus-border bg-accent text-ink text-[11px] font-extrabold uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              v1.0 · AI illustration engine
            </div>
          </div>

          {/* Headline — massive, asymmetric */}
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-8 relative">
              <h1 className="heading-display text-ink text-balance" style={{ fontSize: "clamp(28px, 5.5vw, 80px)", lineHeight: 0.92, letterSpacing: "-0.02em" }}>
                <span className="block">DESIGN</span>
                <span className="block">
                  AT THE
                  <span className="inline-flex items-center mx-2 md:mx-3 align-middle">
                    <span className="relative inline-block bg-primary text-primary-foreground bauhaus-border-thick -rotate-2 bauhaus-shadow" style={{ padding: "4px 12px" }}>
                      SPEED
                    </span>
                  </span>
                </span>
                <span className="block">
                  OF <span className="text-secondary italic">THOUGHT.</span>
                </span>
              </h1>
            </div>

            {/* Right column: featured visual stack with mouse-tilt parallax */}
            <div
              ref={tiltRef}
              onMouseMove={handleTiltMove}
              onMouseLeave={handleTiltLeave}
              className="hidden lg:block lg:col-span-4 relative min-h-[220px] lg:min-h-[340px] [perspective:1200px]"
              style={{ ["--mx" as never]: 0, ["--my" as never]: 0 } as React.CSSProperties}
            >
              {/* Card 1 — back */}
              <div
                className="absolute top-0 right-8 w-[60%] aspect-square bauhaus-border-thick overflow-hidden bg-secondary transition-transform duration-200 ease-out will-change-transform [transform-style:preserve-3d]"
                style={{
                  transform: `translate3d(calc(var(--mx) * ${cardConfigs[0][1]}px), calc(var(--my) * ${cardConfigs[0][1]}px), 0) rotate(${cardConfigs[0][0]}deg) rotateY(calc(var(--mx) * ${cardConfigs[0][2]}deg)) rotateX(calc(var(--my) * ${-cardConfigs[0][2]}deg))`,
                }}
              >
                <img
                  src={STYLE_IMAGES[heroStyles[0]]}
                  alt="Psychedelic style preview"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              {/* Card 2 — middle */}
              <div
                className="absolute top-12 right-0 w-[55%] aspect-square bauhaus-border-thick overflow-hidden bg-accent transition-transform duration-200 ease-out will-change-transform [transform-style:preserve-3d]"
                style={{
                  transform: `translate3d(calc(var(--mx) * ${cardConfigs[1][1]}px), calc(var(--my) * ${cardConfigs[1][1]}px), 0) rotate(${cardConfigs[1][0]}deg) rotateY(calc(var(--mx) * ${cardConfigs[1][2]}deg)) rotateX(calc(var(--my) * ${-cardConfigs[1][2]}deg))`,
                }}
              >
                <img
                  src={STYLE_IMAGES[heroStyles[1]]}
                  alt="3D Clay style preview"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              {/* Card 3 — front */}
              <div
                className="absolute bottom-0 right-12 w-[65%] aspect-[4/5] bauhaus-border-thick bauhaus-shadow-lg overflow-hidden bg-primary transition-transform duration-200 ease-out will-change-transform [transform-style:preserve-3d]"
                style={{
                  transform: `translate3d(calc(var(--mx) * ${cardConfigs[2][1]}px), calc(var(--my) * ${cardConfigs[2][1]}px), 0) rotate(${cardConfigs[2][0]}deg) rotateY(calc(var(--mx) * ${cardConfigs[2][2]}deg)) rotateX(calc(var(--my) * ${-cardConfigs[2][2]}deg))`,
                }}
              >
                <img
                  src={STYLE_IMAGES[heroStyles[2]]}
                  alt="Isometric style preview"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-ink text-ink-foreground text-[10px] font-extrabold uppercase flex items-center justify-between">
                  <span>Isometric</span>
                  <Zap size={12} className="text-accent" />
                </div>
              </div>
              {/* Floating sparkle chip */}
              <div className="absolute -top-2 -left-2 lg:left-0 hidden md:flex items-center gap-2 px-3 py-2 bg-background bauhaus-border bauhaus-shadow text-xs font-extrabold uppercase z-10">
                <Sparkles size={14} className="text-primary" /> ~6s avg
              </div>
            </div>
          </div>

          {/* Sub copy + CTAs row */}
          <div className="grid lg:grid-cols-12 gap-4 lg:gap-6 mt-5 items-center">
            <div className="lg:col-span-5">
              <div className="flex items-start gap-3">
                <p className="text-ink/80 font-medium" style={{ fontSize: "clamp(13px, 1.2vw, 16px)", maxWidth: "480px", lineHeight: 1.6 }}>
                  Type a prompt. Pick a style. Ship in seconds.
                  <span className="block text-muted-foreground mt-1 font-normal" style={{ fontSize: "clamp(12px, 1vw, 14px)" }}>
                    Twelve hand-tuned aesthetics, infinite directions — no design degree required.
                  </span>
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-wrap gap-3 items-center">
              <a
                href="#styles"
                className="inline-flex items-center gap-2 px-6 bg-background text-ink font-extrabold uppercase border-[2px] border-ink hover-lift rounded-2xl"
                style={{ height: 48, fontSize: 13 }}
              >
                See Styles
              </a>
              <Link
                to="/generate"
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    requireAuth(() => navigate("/generate"), "create an illustration");
                  }
                }}
                className="group inline-flex items-center gap-3 px-8 bg-primary text-primary-foreground font-extrabold uppercase border-[2px] border-ink hover-lift rounded-2xl"
                style={{ height: 48, fontSize: 13 }}
              >
                Start Here
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="lg:col-span-3 lg:text-right">
              <div className="inline-block bauhaus-border bg-accent px-3 py-2">
                <div className="font-mono text-[10px] font-bold uppercase opacity-70">No card · Free tier</div>
                <div className="heading-display text-xl mt-0.5">START IN 30s</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee ticker */}
      <section className="border-b-[3px] border-ink bg-ink text-ink-foreground overflow-hidden">
        <div className="flex gap-10 py-4 whitespace-nowrap animate-marquee">
          {[...Array(2)].map((_, dup) => (
            <div key={dup} className="flex gap-10 items-center shrink-0">
              {[
                "FLAT 2.0",
                "ISOMETRIC",
                "3D CLAY",
                "GLASSMORPHISM",
                "RETRO REVIVAL",
                "PSYCHEDELIC",
                "CARTOON",
                "DIGITAL COLLAGE",
                "NATURE / ECO",
                "HAND-DRAWN",
                "DOODLE",
                "FOLK ART",
              ].map((t) => (
                <div key={t} className="flex items-center gap-10 shrink-0">
                  <span className="heading-display text-2xl md:text-3xl">{t}</span>
                  <span className="h-3 w-3 rounded-full bg-accent shrink-0" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 border-b-[3px] border-ink">
        <div className="container">
          <h2 className="heading-display text-4xl md:text-5xl mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "01", t: "Pick a Style", d: "Choose from 12 distinctive illustration styles, from flat to psychedelic.", icon: Sparkles, bg: "bg-primary", fg: "text-primary-foreground" },
              { n: "02", t: "Write a Prompt", d: "Describe your vision in plain language. Be as bold or specific as you like.", icon: Type, bg: "bg-secondary", fg: "text-secondary-foreground" },
              { n: "03", t: "Download Your Illustration", d: "Get high-quality assets ready for your projects in PNG, JPEG, or SVG.", icon: Download, bg: "bg-accent", fg: "text-accent-foreground" },
            ].map((s, i) => (
              <div key={s.n} className={`p-7 bauhaus-border bauhaus-shadow ${i === 0 ? "bg-card" : i === 1 ? "bg-card" : "bg-card"}`}>
                <div className={`inline-flex items-center justify-center h-14 w-14 ${s.bg} ${s.fg} bauhaus-border mb-5`}>
                  <s.icon size={26} />
                </div>
                <div className="font-mono text-xs font-bold mb-2">{s.n}</div>
                <h3 className="heading-display text-2xl mb-2">{s.t}</h3>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STYLES SHOWCASE */}
      <section id="styles" className="py-20 border-b-[3px] border-ink" style={{ background: "#F5F2EE" }}>
        <div className="container">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <h2 className="heading-display text-4xl md:text-5xl">12 Distinctive styles</h2>
              <p className="text-muted-foreground mt-2 max-w-lg">
                From clean flat to wild psychedelic — pick the look that fits your brief.
              </p>
            </div>
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-ink-foreground font-extrabold uppercase text-sm bauhaus-border hover-lift"
            >
              Try them all <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        {/* horizontal scroll with visible scrollbar */}
        <div className="overflow-x-auto pb-6 style-scroll">
          <div className="flex gap-5 px-[max(1.25rem,calc((100vw-1400px)/2+1.25rem))] min-w-max">
            {STYLES.map((s) => (
              <div key={s.name} className="flex-shrink-0">
                <StyleCard style={s} size="lg" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING / CTA */}
      <section id="pricing" className="py-20">
        <div className="container">
          <div className="bg-primary text-primary-foreground bauhaus-border-thick bauhaus-shadow-lg p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 dot-pattern opacity-20" />
            <h2 className="heading-display text-4xl md:text-6xl relative">Ready to create?</h2>
            <p className="relative mt-4 max-w-xl mx-auto">
              Start free. Generate your first illustration in under a minute.
            </p>
            <Link
              to="/generate"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  requireAuth(() => navigate("/generate"), "create an illustration");
                }
              }}
              className="relative inline-flex items-center gap-2 mt-8 px-6 py-4 bg-background text-ink font-extrabold uppercase bauhaus-border hover-lift rounded-2xl"
            >
              Start Creating Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;

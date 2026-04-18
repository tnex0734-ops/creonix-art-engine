import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { STYLES } from "@/lib/styles";
import { StylePreview } from "@/components/StylePreview";
import { ArrowRight, Sparkles, Type, Download } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b-[3px] border-ink">
        <div className="container grid lg:grid-cols-2 gap-10 lg:gap-16 py-14 md:py-20 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bauhaus-border bg-accent text-ink text-xs font-extrabold uppercase mb-6">
              <span className="h-2 w-2 rounded-full bg-primary" />
              AI illustration generator
            </div>
            <h1 className="heading-display text-5xl sm:text-6xl lg:text-7xl text-ink text-balance">
              Turn your <span className="text-primary">ideas</span> into stunning <span className="text-secondary">illustrations</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Creonix transforms your prompts into professional illustrations in any style.
              Built for designers who move fast.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-extrabold uppercase bauhaus-border hover-lift"
              >
                Start Creating Free <ArrowRight size={18} />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 px-6 py-4 bg-background text-ink font-extrabold uppercase bauhaus-border hover-lift"
              >
                How it works
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs font-bold uppercase text-muted-foreground">
              <span>12 styles</span>
              <span className="h-4 w-px bg-ink/30" />
              <span>SVG · PNG · JPEG</span>
              <span className="h-4 w-px bg-ink/30" />
              <span>No credit card</span>
            </div>
          </div>

          {/* Visual block */}
          <div className="relative">
            <div className="relative bg-secondary bauhaus-border-thick bauhaus-shadow-lg aspect-[5/4] overflow-hidden">
              <div className="absolute inset-0 dot-pattern opacity-20" />
              {/* geometric composition */}
              <div className="absolute top-8 left-8 h-28 w-28 rounded-full bg-accent border-[3px] border-ink" />
              <div
                className="absolute bottom-12 left-16 h-44 w-44 bg-primary border-[3px] border-ink"
              />
              <div
                className="absolute top-10 right-10 h-56 w-56 bg-background border-[3px] border-ink"
                style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
              />
              <div className="absolute bottom-8 right-8 h-20 w-20 bg-ink rotate-45 border-[3px] border-ink" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background border-[3px] border-ink" />
            </div>
            {/* Decorative floating chip */}
            <div className="hidden md:flex absolute -bottom-5 -left-5 items-center gap-2 px-3 py-2 bg-background bauhaus-border bauhaus-shadow text-xs font-extrabold uppercase">
              <Sparkles size={14} className="text-primary" /> Generated in seconds
            </div>
          </div>
        </div>

        {/* corner accents */}
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-accent border-[3px] border-ink hidden md:block" />
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
      <section id="styles" className="py-20 border-b-[3px] border-ink bg-muted/40">
        <div className="container">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <h2 className="heading-display text-4xl md:text-5xl">12 Distinctive styles</h2>
              <p className="text-muted-foreground mt-2 max-w-lg">From clean flat to wild psychedelic — pick the look that fits your brief.</p>
            </div>
            <Link to="/auth?mode=signup" className="px-5 py-3 bg-ink text-ink-foreground font-extrabold uppercase text-sm bauhaus-border hover-lift">
              Try them all →
            </Link>
          </div>
        </div>
        {/* horizontal scroll */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-5 px-[max(1.25rem,calc((100vw-1400px)/2+1.25rem))] min-w-max">
            {STYLES.map((s) => (
              <div key={s.name} className="w-56 flex-shrink-0">
                <StylePreview style={s} />
                <div className="mt-2 font-extrabold uppercase text-sm">{s.name}</div>
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
              to="/auth?mode=signup"
              className="relative inline-flex items-center gap-2 mt-8 px-6 py-4 bg-background text-ink font-extrabold uppercase bauhaus-border hover-lift"
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

import { Linkedin } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => (
  <footer className="relative overflow-hidden border-t-[3px] border-ink bg-background mt-24">
    {/* Background grid — echoes hero/logo Bauhaus surface */}
    <div
      className="absolute inset-0 opacity-[0.06] pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(hsl(var(--ink)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--ink)) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }}
    />

    {/* Floating Bauhaus shapes — same vocabulary as the logo mark */}
    <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-accent border-[3px] border-ink hidden md:block" />
    <div className="absolute top-10 right-20 h-6 w-6 bg-primary border-[3px] border-ink rotate-45 hidden lg:block" />
    <div className="absolute bottom-10 left-1/3 h-4 w-4 rounded-full bg-secondary border-[2px] border-ink hidden lg:block" />
    <div className="absolute -bottom-16 -right-16 h-56 w-56 bg-secondary border-[3px] border-ink hidden md:block" />

    <div className="container relative py-16 flex flex-col items-center gap-8 text-center">
      {/* Logo */}
      <Logo size="md" variant="mark" />

      {/* Multicolor wordmark — mirrors the logo's per-letter palette */}
      <h2
        className="heading-display flex flex-wrap items-center justify-center gap-1 text-[clamp(2.5rem,7vw,5rem)] leading-none"
        aria-label="Creonix"
      >
        <span className="text-ink">C</span>
        <span className="text-primary">R</span>
        <span className="text-ink">E</span>
        <span className="relative inline-flex items-center justify-center px-3 py-1 -rotate-2 bg-accent bauhaus-border-thick bauhaus-shadow">
          <span className="text-secondary">O</span>
        </span>
        <span className="text-ink">N</span>
        <span className="text-primary italic">I</span>
        <span className="text-ink">X</span>
      </h2>

      {/* Tagline chip — hero-style tag */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bauhaus-border bg-accent text-ink text-xs font-extrabold uppercase">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        Built by a designer · for designers
      </div>

      {/* Copyright */}
      <p className="text-xs font-extrabold uppercase tracking-wider text-ink">
        © {new Date().getFullYear()} Creonix · All rights reserved
      </p>

      {/* Designed and Developed by TAUSHIK — Bauhaus card */}
      <div className="inline-flex items-center gap-4 px-5 py-3 bg-background bauhaus-border-thick bauhaus-shadow">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-ink/60">
            Designed & Developed by
          </span>
          <span
            className="heading-display text-2xl text-ink"
            style={{ letterSpacing: "0.12em" }}
          >
            TAUSHIK
          </span>
        </div>
        <a
          href="https://www.linkedin.com/in/taushik-chandana-16ba14378/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Taushik Chandana on LinkedIn"
          className="inline-flex h-11 w-11 items-center justify-center bg-secondary text-ink-foreground bauhaus-border hover-lift"
        >
          <Linkedin size={20} strokeWidth={2.5} />
        </a>
      </div>
    </div>
  </footer>
);

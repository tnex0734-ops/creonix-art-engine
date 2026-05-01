import { Linkedin } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => (
  <footer className="border-t-[3px] border-ink bg-ink text-ink-foreground mt-24">
    <div className="container py-14 flex flex-col items-center gap-8 text-center">
      {/* Logo (CX monogram, white-friendly variant) */}
      <Logo size="md" variant="mark" onDark />

      <p className="text-xs text-ink-foreground/60 tracking-wider">
        © {new Date().getFullYear()} Creonix. All rights reserved.
      </p>

      {/* Designed and Developed by TAUSHIK — typographic credit */}
      <div className="flex flex-col items-center md:items-start gap-0.5">
        <span
          className="block uppercase"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: "11px",
            letterSpacing: "0.18em",
            color: "#888888",
          }}
        >
          Designed and Developed by
        </span>
        <div className="flex items-center gap-3">
          <span
            className="block"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontWeight: 400,
              fontSize: "26px",
              letterSpacing: "0.2em",
              color: "#FFFFFF",
              lineHeight: 1,
            }}
          >
            TAUSHIK
          </span>
          <a
            href="https://www.linkedin.com/in/taushik-chandana-16ba14378/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Taushik Chandana on LinkedIn"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white hover:text-[#0A66C2] transition-colors"
            style={{ transitionDuration: "200ms" }}
          >
            <Linkedin size={22} strokeWidth={2.5} />
          </a>
        </div>
      </div>

      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 500,
          fontSize: "11px",
          letterSpacing: "0.1em",
          color: "#555555",
        }}
      >
        Built by a designer. For designers. <span className="text-primary">♥</span>
      </p>
    </div>
  </footer>
);

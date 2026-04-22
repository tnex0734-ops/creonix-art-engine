import { Linkedin } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => (
  <footer className="border-t-[3px] border-ink bg-ink text-ink-foreground mt-24">
    <div className="container py-14 flex flex-col items-center gap-6 text-center">
      <div className="bg-background inline-block px-4 py-2.5 bauhaus-border rounded-2xl">
        <Logo size="md" />
      </div>

      <p className="text-xs text-ink-foreground/60 tracking-wider">
        © {new Date().getFullYear()} Creonix. All rights reserved.
      </p>

      <div className="flex items-center gap-3">
        <span
          className="text-ink-foreground uppercase"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "15px",
            letterSpacing: "0.16em",
          }}
        >
          Designed by taushik
        </span>
        <a
          href="https://www.linkedin.com/in/taushik-chandana-16ba14378?utm_source=share_via&utm_content=profile&utm_medium=member_android"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Taushik on LinkedIn"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-foreground hover:text-[#0A66C2] transition-colors duration-200"
        >
          <Linkedin size={20} strokeWidth={2.25} />
        </a>
      </div>

      <p
        className="text-ink-foreground/50"
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 400,
          fontSize: "12px",
          letterSpacing: "0.1em",
        }}
      >
        Built by a designer. For designers. <span className="text-primary">♥</span>
      </p>
    </div>
  </footer>
);

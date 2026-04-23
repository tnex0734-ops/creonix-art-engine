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

      <div className="flex items-center gap-4 flex-wrap justify-center">
        <span className="heading-display text-ink-foreground text-3xl md:text-4xl">
          Designed by <span className="text-primary">taushik</span>
        </span>
        <a
          href="https://www.linkedin.com/in/taushik-chandana-16ba14378?utm_source=share_via&utm_content=profile&utm_medium=member_android"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Taushik on LinkedIn"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-background text-ink hover:bg-[#0A66C2] hover:text-ink-foreground bauhaus-border hover-lift transition-colors"
        >
          <Linkedin size={22} strokeWidth={2.5} />
        </a>
      </div>

      <p className="heading-display text-ink-foreground/80 text-base md:text-lg tracking-wider">
        Built by a designer. For designers.{" "}
        <span className="text-primary">♥</span>
      </p>
    </div>
  </footer>
);

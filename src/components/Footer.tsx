import { Logo } from "./Logo";

export const Footer = () => (
  <footer className="border-t-[3px] border-ink bg-ink text-ink-foreground mt-24">
    <div className="container py-12 grid gap-10 md:grid-cols-4">
      <div className="md:col-span-2">
        <div className="bg-background inline-block px-3 py-2 bauhaus-border">
          <Logo size="md" />
        </div>
        <p className="mt-4 max-w-sm text-sm text-ink-foreground/80">
          Bauhaus-inspired AI illustration generator for designers who move fast.
        </p>
      </div>
      <div>
        <h4 className="text-sm font-extrabold uppercase mb-3 text-accent">Product</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="#styles" className="hover:text-primary">Styles</a></li>
          <li><a href="#how" className="hover:text-primary">How it works</a></li>
          <li><a href="#pricing" className="hover:text-primary">Pricing</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-extrabold uppercase mb-3 text-accent">Company</h4>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:text-primary">About</a></li>
          <li><a href="#" className="hover:text-primary">Contact</a></li>
          <li><a href="#" className="hover:text-primary">Twitter</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-ink-foreground/20">
      <div className="container py-5 flex flex-col md:flex-row gap-2 justify-between text-xs text-ink-foreground/60">
        <p>© {new Date().getFullYear()} Creonix. All rights reserved.</p>
        <p>Built for designers, by designers.</p>
      </div>
    </div>
  </footer>
);

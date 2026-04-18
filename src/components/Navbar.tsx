import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const onLanding = location.pathname === "/";

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const links = onLanding
    ? [
        { to: "#styles", label: "Styles" },
        { to: "#how", label: "How it works" },
        { to: "#pricing", label: "Pricing" },
      ]
    : [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/generate", label: "Create" },
        { to: "/gallery", label: "Gallery" },
      ];

  return (
    <header className="sticky top-0 z-40 bg-background border-b-[3px] border-ink">
      <div className="container flex h-16 items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} aria-label="Creonix home">
          <Logo size="md" />
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) =>
            l.to.startsWith("#") ? (
              <a key={l.to} href={l.to} className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
                {l.label}
              </a>
            ) : (
              <Link key={l.to} to={l.to} className={`text-sm font-bold uppercase tracking-wide transition-colors ${location.pathname === l.to ? "text-primary" : "hover:text-primary"}`}>
                {l.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/generate" className="px-5 py-2.5 bg-primary text-primary-foreground font-extrabold uppercase text-sm bauhaus-border hover-lift">
                Create
              </Link>
              <button onClick={signOut} className="px-4 py-2.5 bg-background text-ink font-extrabold uppercase text-sm bauhaus-border hover-lift">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="px-4 py-2.5 bg-background text-ink font-extrabold uppercase text-sm bauhaus-border hover-lift">
                Log in
              </Link>
              <Link to="/auth?mode=signup" className="px-5 py-2.5 bg-primary text-primary-foreground font-extrabold uppercase text-sm bauhaus-border hover-lift">
                Start Creating
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 bauhaus-border" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t-[3px] border-ink bg-background">
          <div className="container py-4 flex flex-col gap-3">
            {links.map((l) =>
              l.to.startsWith("#") ? (
                <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="font-bold uppercase">{l.label}</a>
              ) : (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="font-bold uppercase">{l.label}</Link>
              )
            )}
            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  <Link to="/generate" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2.5 bg-primary text-primary-foreground font-extrabold uppercase text-sm bauhaus-border">Create</Link>
                  <button onClick={() => { setOpen(false); signOut(); }} className="flex-1 px-4 py-2.5 bg-background font-extrabold uppercase text-sm bauhaus-border">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2.5 bg-background font-extrabold uppercase text-sm bauhaus-border">Log in</Link>
                  <Link to="/auth?mode=signup" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2.5 bg-primary text-primary-foreground font-extrabold uppercase text-sm bauhaus-border">Start</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

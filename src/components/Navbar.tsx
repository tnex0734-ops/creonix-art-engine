import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "@/hooks/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Menu, X } from "lucide-react";

type NavItem = { to: string; label: string; gated?: boolean };

export const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { requireAuth } = useAuthGate();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const links: NavItem[] = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard", gated: true },
    { to: "/generate", label: "Create Illustration", gated: true },
    { to: "/gallery", label: "Gallery", gated: true },
  ];

  const handleNav = (e: React.MouseEvent, l: NavItem) => {
    if (!l.gated || user) return;
    e.preventDefault();
    requireAuth(() => navigate(l.to), `open ${l.label}`);
    setOpen(false);
  };

  const handleCreateCta = (e: React.MouseEvent) => {
    if (user) return;
    e.preventDefault();
    requireAuth(() => navigate("/generate"), "create an illustration");
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-background border-b-[3px] border-ink">
      <div className="container flex h-16 items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} aria-label="Creonix home">
          <Logo size="md" />
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={(e) => handleNav(e, l)}
                className={`text-sm font-bold uppercase tracking-wide transition-colors ${
                  active ? "text-primary" : "hover:text-primary"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/generate"
                className="px-5 py-2.5 bg-primary text-primary-foreground font-extrabold uppercase text-sm bauhaus-border hover-lift rounded-2xl"
              >
                Create
              </Link>
              <button
                onClick={signOut}
                className="px-4 py-2.5 bg-background text-ink font-extrabold uppercase text-sm bauhaus-border hover-lift rounded-2xl"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="px-4 py-2.5 bg-background text-ink font-extrabold uppercase text-sm bauhaus-border hover-lift rounded-2xl"
              >
                Log in
              </Link>
              <Link
                to="/generate"
                onClick={handleCreateCta}
                className="px-5 py-2.5 bg-primary text-primary-foreground font-extrabold uppercase text-sm bauhaus-border hover-lift rounded-2xl"
              >
                Create
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 bauhaus-border rounded-xl"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t-[3px] border-ink bg-background">
          <div className="container py-4 flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={(e) => {
                  handleNav(e, l);
                  if (!l.gated || user) setOpen(false);
                }}
                className="font-bold uppercase"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  <Link
                    to="/generate"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center px-4 py-2.5 bg-primary text-primary-foreground font-extrabold uppercase text-sm bauhaus-border rounded-2xl"
                  >
                    Create
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      signOut();
                    }}
                    className="flex-1 px-4 py-2.5 bg-background font-extrabold uppercase text-sm bauhaus-border rounded-2xl"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center px-4 py-2.5 bg-background font-extrabold uppercase text-sm bauhaus-border rounded-2xl"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/generate"
                    onClick={handleCreateCta}
                    className="flex-1 text-center px-4 py-2.5 bg-primary text-primary-foreground font-extrabold uppercase text-sm bauhaus-border rounded-2xl"
                  >
                    Create
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

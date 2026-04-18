import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

const Auth = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(params.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Account created! You're in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container py-6">
        <Link to="/"><Logo /></Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="grid lg:grid-cols-2 gap-10 max-w-5xl w-full items-center">
          {/* Left visual */}
          <div className="hidden lg:block relative">
            <div className="bg-accent bauhaus-border-thick bauhaus-shadow-lg aspect-square relative overflow-hidden">
              <div className="absolute inset-0 dot-pattern opacity-30" />
              <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-primary border-[3px] border-ink" />
              <div className="absolute bottom-12 right-12 h-40 w-40 bg-secondary border-[3px] border-ink" />
              <div
                className="absolute bottom-10 left-12 h-36 w-36 bg-background border-[3px] border-ink"
                style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
              />
            </div>
          </div>

          {/* Form */}
          <div className="bg-card bauhaus-border-thick bauhaus-shadow-lg p-8 md:p-10">
            <h1 className="heading-display text-3xl md:text-4xl mb-1">
              {mode === "signup" ? "Create account" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground mb-7">
              {mode === "signup" ? "Start generating in seconds." : "Log in to continue creating."}
            </p>

            <button
              onClick={google}
              className="w-full px-4 py-3 bg-background text-ink font-extrabold uppercase text-sm bauhaus-border hover-lift flex items-center justify-center gap-3 mb-5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-[2px] bg-ink" />
              <span className="text-xs font-bold uppercase">or</span>
              <div className="flex-1 h-[2px] bg-ink" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-background bauhaus-border focus:outline-none focus:ring-4 focus:ring-primary/30"
                  placeholder="you@studio.com"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-background bauhaus-border focus:outline-none focus:ring-4 focus:ring-primary/30"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3.5 bg-primary text-primary-foreground font-extrabold uppercase bauhaus-border hover-lift disabled:opacity-60"
              >
                {loading ? "..." : mode === "signup" ? "Create account" : "Log in"}
              </button>
            </form>

            <p className="mt-6 text-sm text-center">
              {mode === "signup" ? "Already have an account?" : "New to Creonix?"}{" "}
              <button
                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                className="font-extrabold uppercase underline decoration-2 underline-offset-4 text-primary"
              >
                {mode === "signup" ? "Log in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { STYLES } from "@/lib/styles";
import { StyleCard } from "@/components/StyleCard";
import { ArrowRight, Plus, Download } from "lucide-react";
import { toast } from "sonner";

type Generation = {
  id: string;
  prompt: string;
  style: string;
  image_url: string;
  created_at: string;
};

const greetingFor = (date = new Date()) => {
  const h = date.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState<string>("Designer");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: gens, error }, { data: profile }] = await Promise.all([
        supabase.from("generations").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("display_name,email").eq("id", user.id).maybeSingle(),
      ]);
      if (error) toast.error(error.message);
      else setItems((gens ?? []) as Generation[]);
      const display =
        profile?.display_name ||
        (profile?.email ? profile.email.split("@")[0] : null) ||
        (user.email ? user.email.split("@")[0] : "Designer");
      setName(display);
      setLoading(false);
    })();
  }, [user]);

  const stats = useMemo(() => {
    const total = items.length;
    const uniqueStyles = new Set(items.map((i) => i.style)).size;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = items.filter((i) => new Date(i.created_at).getTime() >= weekAgo).length;
    return { total, uniqueStyles, thisWeek };
  }, [items]);

  const recent = items.slice(0, 4);

  const goToGenerator = (styleName?: string) => {
    if (styleName) {
      navigate(`/generate?style=${encodeURIComponent(styleName)}`);
    } else {
      navigate("/generate");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Navbar />
      <section className="container py-10 md:py-14">
        {/* Greeting */}
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bauhaus-border bg-accent text-ink text-xs font-extrabold uppercase mb-4 rounded-2xl">
            Studio
          </div>
          <h1 className="heading-display text-4xl md:text-6xl text-balance">
            {greetingFor().toUpperCase()}, {name.toUpperCase()}.
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">What are you creating today?</p>
        </div>

        {/* Stats */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          <StatCard
            label="Illustrations created"
            value={loading ? "…" : stats.total}
            tone="yellow"
          />
          <StatCard
            label="Styles used"
            value={loading ? "…" : stats.uniqueStyles}
            tone="blue"
          />
          <StatCard
            label="This week"
            value={loading ? "…" : stats.thisWeek}
            tone="red"
          />
        </div>

        {/* Quick create */}
        <div className="mt-14">
          <div className="flex items-end justify-between mb-4">
            <h2 className="heading-display text-2xl md:text-3xl">Quick create</h2>
            <Link
              to="/generate"
              className="text-xs font-extrabold uppercase inline-flex items-center gap-1 hover:text-primary"
            >
              All styles <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto pb-4 style-scroll">
            <div className="flex gap-4 min-w-max pr-4">
              {STYLES.map((s) => (
                <div key={s.name} className="flex-shrink-0">
                  <StyleCard style={s} size="compact" onSelect={() => goToGenerator(s.name)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent work */}
        <div className="mt-14">
          <div className="flex items-end justify-between mb-4">
            <h2 className="heading-display text-2xl md:text-3xl">Recent work</h2>
            {items.length > 4 && (
              <Link
                to="/gallery"
                className="text-xs font-extrabold uppercase inline-flex items-center gap-1 hover:text-primary"
              >
                View all <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bauhaus-border bg-muted animate-pulse rounded-2xl h-[140px] md:h-[160px] lg:h-[180px] xl:h-[200px]" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {recent.map((g) => (
                <RecentCard key={g.id} g={g} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating FAB */}
      <button
        onClick={() => goToGenerator()}
        aria-label="Create new illustration"
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground border-[3px] border-ink shadow-[6px_6px_0_0_hsl(var(--ink))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_hsl(var(--ink))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_hsl(var(--ink))] transition-all flex items-center justify-center"
      >
        <Plus size={26} />
      </button>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "yellow" | "blue" | "red";
}) => {
  const cls =
    tone === "yellow"
      ? "bg-accent text-accent-foreground"
      : tone === "blue"
      ? "bg-secondary text-secondary-foreground"
      : "bg-primary text-primary-foreground";
  return (
    <div className={`${cls} p-6 border-[3px] border-ink shadow-[6px_6px_0_0_hsl(var(--ink))] rounded-2xl`}>
      <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-90">{label}</div>
      <div className="heading-display text-5xl md:text-6xl mt-2">{value}</div>
    </div>
  );
};

const EmptyState = () => (
  <div className="bauhaus-border-thick p-10 md:p-16 bg-card text-center relative overflow-hidden rounded-2xl">
    <div className="absolute inset-0 dot-pattern opacity-10" />
    <div className="relative flex justify-center gap-3 mb-6">
      <div className="h-16 w-16 rounded-full bg-primary border-[3px] border-ink" />
      <div className="h-16 w-16 bg-secondary border-[3px] border-ink" />
      <div
        className="h-16 w-16 bg-accent border-[3px] border-ink"
        style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
      />
    </div>
    <h3 className="heading-display text-3xl md:text-4xl relative">YOUR CANVAS AWAITS.</h3>
    <p className="text-muted-foreground mt-2 relative">
      Start with a prompt and a style. Takes about 10 seconds.
    </p>
    <Link
      to="/generate"
      className="relative inline-flex items-center gap-2 mt-6 px-5 py-3 bg-primary text-primary-foreground font-extrabold uppercase bauhaus-border hover-lift rounded-2xl"
    >
      <Plus size={16} /> Create Illustration
    </Link>
  </div>
);

const RecentCard = ({ g }: { g: Generation }) => {
  const download = () => {
    const a = document.createElement("a");
    a.href = g.image_url;
    a.download = `creonix-${g.id}.png`;
    a.target = "_blank";
    a.click();
  };
  const ts = new Date(g.created_at);
  return (
    <article className="group relative bauhaus-border bg-card overflow-hidden rounded-2xl cursor-pointer transition-all duration-150 ease-out hover:-translate-y-[3px] hover:shadow-[4px_4px_0_0_hsl(var(--ink))]">
      <div className="bg-muted overflow-hidden rounded-t-[14px] h-[140px] md:h-[160px] lg:h-[180px] xl:h-[200px]">
        <img src={g.image_url} alt={g.prompt} className="w-full h-full object-cover object-top transition-transform duration-200 group-hover:scale-[1.04]" loading="lazy" />
      </div>
      <div className="p-3 flex items-center justify-between gap-2 border-t-[3px] border-ink">
        <div className="min-w-0">
          <div className="text-[10px] font-extrabold uppercase truncate">{g.style}</div>
          <div className="text-[10px] text-muted-foreground">{ts.toLocaleString()}</div>
        </div>
        <button
          onClick={download}
          className="p-1.5 bauhaus-border bg-background hover:bg-accent rounded-lg flex-shrink-0"
          aria-label="Download"
        >
          <Download size={14} />
        </button>
      </div>
    </article>
  );
};

export default Dashboard;

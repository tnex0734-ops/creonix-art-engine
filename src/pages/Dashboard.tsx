import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Download, Plus } from "lucide-react";
import { toast } from "sonner";

type Generation = {
  id: string;
  prompt: string;
  style: string;
  image_url: string;
  created_at: string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("generations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) toast.error(error.message);
      else setItems((data ?? []) as Generation[]);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8 items-end">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bauhaus-border bg-accent text-ink text-xs font-extrabold uppercase mb-4">
              Studio
            </div>
            <h1 className="heading-display text-5xl md:text-6xl text-balance">What will you create today?</h1>
            <p className="mt-4 text-muted-foreground max-w-xl">
              Your canvas is ready. Pick a style and describe your vision — we'll handle the rest.
            </p>
          </div>
          <div className="flex lg:justify-end">
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-6 py-4 bg-primary text-primary-foreground font-extrabold uppercase bauhaus-border hover-lift"
            >
              <Plus size={18} /> Create New Illustration
            </Link>
          </div>
        </div>

        <div className="mt-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="heading-display text-2xl md:text-3xl">Recent</h2>
            {items.length > 0 && (
              <Link to="/gallery" className="text-sm font-extrabold uppercase inline-flex items-center gap-1 hover:text-primary">
                View all <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bauhaus-border bg-muted animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map((g) => (
                <GenerationCard key={g.id} g={g} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const EmptyState = () => (
  <div className="bauhaus-border-thick p-8 md:p-14 bg-card text-center relative overflow-hidden">
    <div className="absolute inset-0 dot-pattern opacity-10" />
    <div className="relative flex justify-center gap-3 mb-6">
      <div className="h-16 w-16 rounded-full bg-primary border-[3px] border-ink" />
      <div className="h-16 w-16 bg-secondary border-[3px] border-ink" />
      <div className="h-16 w-16 bg-accent border-[3px] border-ink" style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
    </div>
    <h3 className="heading-display text-2xl md:text-3xl relative">No illustrations yet</h3>
    <p className="text-muted-foreground mt-2 relative">Create your first one — it takes about 10 seconds.</p>
    <Link to="/generate" className="relative inline-flex items-center gap-2 mt-6 px-5 py-3 bg-primary text-primary-foreground font-extrabold uppercase bauhaus-border hover-lift">
      <Plus size={16} /> Start Creating
    </Link>
  </div>
);

const GenerationCard = ({ g }: { g: Generation }) => {
  const download = async () => {
    const a = document.createElement("a");
    a.href = g.image_url;
    a.download = `creonix-${g.id}.png`;
    a.target = "_blank";
    a.click();
  };
  return (
    <div className="group relative bauhaus-border bg-card overflow-hidden hover-lift">
      <div className="aspect-square bg-muted overflow-hidden">
        <img src={g.image_url} alt={g.prompt} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-3 flex items-center justify-between gap-2 border-t-[3px] border-ink">
        <span className="text-xs font-extrabold uppercase truncate">{g.style}</span>
        <button onClick={download} className="p-1.5 bauhaus-border bg-background hover:bg-accent" aria-label="Download">
          <Download size={14} />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

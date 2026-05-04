import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { STYLES } from "@/lib/styles";
import { DownloadDropdown } from "@/components/DownloadDropdown";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { GalleryPreviewModal } from "@/components/GalleryPreviewModal";

type Generation = {
  id: string;
  prompt: string;
  style: string;
  image_url: string;
  created_at: string;
};

const Gallery = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("generations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      else setItems((data ?? []) as Generation[]);
      setLoading(false);
    })();
  }, [user]);

  const filtered = useMemo(
    () => filter === "All" ? items : items.filter((g) => g.style === filter),
    [items, filter]
  );

  const usedStyles = useMemo(() => {
    const set = new Set(items.map((i) => i.style));
    return STYLES.filter((s) => set.has(s.name));
  }, [items]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("generations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((arr) => arr.filter((i) => i.id !== id));
    toast.success("Deleted");
  };

  const openPreview = (id: string) => {
    sessionStorage.setItem("gallery-scroll", String(window.scrollY));
    const i = filtered.findIndex((g) => g.id === id);
    if (i >= 0) setPreviewIndex(i);
  };

  const closePreview = () => {
    setPreviewIndex(null);
    requestAnimationFrame(() => {
      const y = Number(sessionStorage.getItem("gallery-scroll") || 0);
      window.scrollTo({ top: y });
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="container py-12">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bauhaus-border bg-secondary text-secondary-foreground text-xs font-extrabold uppercase mb-3 rounded-2xl">
              Gallery
            </div>
            <h1 className="heading-display text-5xl md:text-6xl">Your creations</h1>
            <p className="mt-3 text-muted-foreground">
              {items.length} illustration{items.length === 1 ? "" : "s"} so far.
            </p>
          </div>
          <Link
            to="/generate"
            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-extrabold uppercase bauhaus-border hover-lift rounded-2xl"
          >
            <Plus size={16} /> New illustration
          </Link>
        </div>

        {usedStyles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <FilterPill label="All" active={filter === "All"} onClick={() => setFilter("All")} />
            {usedStyles.map((s) => (
              <FilterPill key={s.name} label={s.name} active={filter === s.name} onClick={() => setFilter(s.name)} />
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bauhaus-border bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bauhaus-border-thick p-14 bg-card text-center rounded-2xl">
            <h3 className="heading-display text-2xl">Nothing here yet</h3>
            <p className="text-muted-foreground mt-2">Create your first illustration to fill this gallery.</p>
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-primary text-primary-foreground font-extrabold uppercase bauhaus-border hover-lift rounded-2xl"
            >
              <Plus size={16} /> Start Creating
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((g) => (
              <article
                key={g.id}
                onClick={() => openPreview(g.id)}
                className="bauhaus-border bg-card rounded-2xl cursor-pointer transition-all duration-150 ease-out hover:scale-[1.02] hover:shadow-[8px_8px_0_0_hsl(var(--ink))]"
              >
                <div className="aspect-square bg-muted overflow-hidden rounded-t-[14px]">
                  <img src={g.image_url} alt={g.prompt} crossOrigin="anonymous" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-3 border-t-[3px] border-ink">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase truncate">{g.style}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(g.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2lh]">{g.prompt}</p>
                  <div className="flex gap-2 mt-3 items-center" onClick={(e) => e.stopPropagation()}>
                    <DownloadDropdown
                      imageUrl={g.image_url}
                      filenameBase={`creonix-${g.id}`}
                      variant="primary"
                      align="left"
                      className="flex-1"
                    />
                    <button
                      onClick={() => remove(g.id)}
                      className="p-2 bauhaus-border bg-background hover:bg-destructive hover:text-destructive-foreground rounded-lg"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {previewIndex !== null && filtered[previewIndex] && (
        <GalleryPreviewModal
          items={filtered}
          index={previewIndex}
          onClose={closePreview}
          onIndexChange={setPreviewIndex}
          onDeleted={(id) => {
            setItems((arr) => arr.filter((i) => i.id !== id));
            setPreviewIndex((idx) => {
              if (idx === null) return null;
              const remaining = filtered.length - 1;
              if (remaining <= 0) return null;
              return Math.min(idx, remaining - 1);
            });
          }}
        />
      )}
    </div>
  );
};

const FilterPill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 bauhaus-border text-xs font-extrabold uppercase hover-lift rounded-full ${
      active ? "bg-ink text-ink-foreground" : "bg-background"
    }`}
  >
    {label}
  </button>
);

export default Gallery;

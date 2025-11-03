import { useEffect, useMemo, useState, useRef } from "react";
import { Calendar, MapPin, Star, Filter, ChevronDown, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import climbingWallSample from "@/assets/climbing-wall-sample.png";
import { saveRouteToFirestore, listenRoutesForUser, RouteRecord } from "@/lib/logbook";
import { onAuth } from "@/lib/firebase";
import { toast } from "sonner";

/* ---------- helpers ---------- */
function getRandomDots(count: number) {
  const colors = ["#f87171", "#34d399", "#60a5fa", "#fbbf24", "#a78bfa", "#fb7185", "#38bdf8"];
  return Array.from({ length: count }).map((_, i) => ({
    top: `${Math.random() * 85 + 5}%`,
    left: `${Math.random() * 85 + 5}%`,
    color: colors[i % colors.length],
  }));
}
function toRelativeLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  return weeks <= 1 ? "1 week ago" : `${weeks} weeks ago`;
}
function colorForDifficulty(diff: string) {
  const n = Number(diff.replace(/[^0-9]/g, ""));
  if (n === 2) return "warning";
  if (n === 3) return "accent";
  if (n >= 5) return "secondary";
  return "primary";
}

/* ---------- default demo data ---------- */
const demoRoutes = [
  { id: "demo1", image: climbingWallSample, difficulty: "V4", date: "Today", location: "Boulder Gym", rating: 5, notes: "Nailed it! Perfect technique 💪", color: "primary" },
  { id: "demo2", image: climbingWallSample, difficulty: "V3", date: "Yesterday", location: "Climb Zone", rating: 4, notes: "Challenging start sequence", color: "accent" },
  { id: "demo3", image: climbingWallSample, difficulty: "V5", date: "2 days ago", location: "Boulder Gym", rating: 3, notes: "Almost sent it!", color: "secondary" },
  { id: "demo4", image: climbingWallSample, difficulty: "V2", date: "1 week ago", location: "Rock Hall", rating: 5, notes: "Nice warm-up route ✨", color: "warning" },
];

export default function LogbookPage() {
  const climbingDots = useMemo(() => getRandomDots(8), []);
  const [routes, setRoutes] = useState(demoRoutes);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // filters
  const [showFilters, setShowFilters] = useState(true);
  const [difficulty, setDifficulty] = useState("all");
  const [location, setLocation] = useState("all");
  const [timeRange, setTimeRange] = useState("all");

  // popup preview
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  /* ---------- login + realtime Firestore ---------- */
  useEffect(() => {
    let unsubscribe: any = null;
    const unsubAuth = onAuth((user) => {
      if (user) {
        setUserId(user.uid);
        unsubscribe?.();
        unsubscribe = listenRoutesForUser((data) => {
          console.log("🔄 Firestore updated:", data.length);
          const formatted = data.map((r) => ({
            id: r.id || Math.random().toString(),
            image: r.imageUrl || climbingWallSample,
            difficulty: r.difficulty,
            date: toRelativeLabel(r.date),
            location: r.location,
            rating: r.rating,
            notes: r.notes,
            color: colorForDifficulty(r.difficulty),
          }));
          setRoutes([...formatted, ...demoRoutes]);
        });
      } else {
        setUserId(null);
        unsubscribe?.();
        setRoutes(demoRoutes);
      }
    });
    return () => {
      unsubAuth?.();
      unsubscribe?.();
    };
  }, []);

  /* ---------- filters ---------- */
  const now = new Date();
  const filteredRoutes = routes.filter((r) => {
    const okDiff = difficulty === "all" || r.difficulty === difficulty;
    const okLoc = location === "all" || r.location === location;
    let okTime = true;
    if (timeRange !== "all") {
      const d = new Date(r.date);
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (timeRange === "today") okTime = diffDays === 0;
      else if (timeRange === "7") okTime = diffDays <= 7;
      else if (timeRange === "30") okTime = diffDays <= 30;
    }
    return okDiff && okLoc && okTime;
  });

  const renderStars = (n: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < n ? "text-warning fill-warning" : "text-muted"}`} />
    ));

  /* ---------- add form ---------- */
  const [open, setOpen] = useState(false);
  const [formDifficulty, setFormDifficulty] = useState("V3");
  const [formLocation, setFormLocation] = useState("");
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formNotes, setFormNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoUrl(URL.createObjectURL(f));
  };

  const onSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Please log in first");
      return;
    }
    try {
      setLoading(true);
      await saveRouteToFirestore({
        file: photoFile,
        difficulty: formDifficulty,
        date: formDate,
        location: formLocation || "Unknown Gym",
        rating: 5,
        notes: formNotes,
      });
      toast.success("✅ Route saved!");
      setOpen(false);
      setPhotoFile(null);
      setPhotoUrl(null);
      setFormLocation("");
      setFormNotes("");
    } catch (err: any) {
      console.error(err);
      toast.error("❌ Failed to save: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative min-h-screen bg-gray-100 overflow-hidden">
        {climbingDots.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: d.top,
              left: d.left,
              width: "40px",
              height: "40px",
              background: d.color,
              borderRadius: "50%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              zIndex: 10,
            }}
          />
        ))}

        <div className="relative z-20 space-y-6 pb-24">
          <div className="flex items-center justify-between px-4 pt-8">
            <div>
              <h1 className="text-2xl font-bold">My Routes 📖</h1>
              <p className="text-muted-foreground">Your climbing journey</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />Add Route
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />Filter
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="px-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Difficulty", value: difficulty, set: setDifficulty, options: ["all", "V2", "V3", "V4", "V5"] },
                { label: "Location", value: location, set: setLocation, options: ["all", "Boulder Gym", "Climb Zone", "Rock Hall"] },
                { label: "Time Range", value: timeRange, set: setTimeRange, options: ["all", "today", "7", "30"] },
              ].map((f, i) => (
                <label key={i} className="flex flex-col text-sm">
                  <span className="mb-1 text-muted-foreground">{f.label}</span>
                  <div className="relative">
                    <select
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      className="w-full rounded-lg border bg-card text-foreground px-3 py-2 appearance-none pr-9"
                    >
                      {f.options.map((o) => (
                        <option key={o} value={o}>
                          {o === "all"
                            ? "All"
                            : f.label === "Time Range"
                            ? o === "today"
                              ? "Today"
                              : `Last ${o} days`
                            : o}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Routes */}
          <div className="space-y-4 px-4">
            {filteredRoutes.map((r) => (
              <div key={r.id} className="bg-white rounded-xl shadow p-4 flex gap-4 items-start">
                <button
                  type="button"
                  onClick={() => setPreviewSrc(r.image)}
                  className="relative focus:outline-none"
                  title="Click to preview"
                >
                  <img src={r.image} alt={r.difficulty} className="w-20 h-20 rounded-lg object-cover" />
                  <div className={`absolute -top-2 -right-2 px-2 py-1 text-xs rounded-full bg-${r.color}`}>
                    <span className="text-white font-bold">{r.difficulty}</span>
                  </div>
                </button>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {r.date}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {r.location}
                      </div>
                    </div>
                    <div className="flex gap-1">{renderStars(r.rating)}</div>
                  </div>
                  <div className="text-sm text-gray-700">{r.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      {previewSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewSrc(null)} />
          <div className="relative w-[90vw] max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl">
            <img src={previewSrc} alt="preview" className="w-full h-auto max-h-[80vh] object-contain" />
            <button
              onClick={() => setPreviewSrc(null)}
              className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Add modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow p-5 w-[92vw] max-w-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Add Route</h3>
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <form className="space-y-4" onSubmit={onSubmitNew}>
              <div>
                <label className="text-sm">Photo</label>
                <div
                  className="border-dashed border-2 rounded-xl p-3 mt-1 flex items-center gap-3 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {photoUrl ? (
                      <img src={photoUrl} className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Click to upload</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="Location"
                  className="border rounded-lg px-3 py-2"
                />
                <select
                  value={formDifficulty}
                  onChange={(e) => setFormDifficulty(e.target.value)}
                  className="border rounded-lg px-3 py-2"
                >
                  {Array.from({ length: 11 }, (_, i) => `V${i}`).map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              />
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                placeholder="Notes"
                className="border rounded-lg px-3 py-2 w-full"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

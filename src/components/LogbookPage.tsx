import { useMemo, useState, useRef, useEffect } from "react";
import { Calendar, MapPin, Star, Filter, ChevronDown, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import climbingWallSample from "@/assets/climbing-wall-sample.png";

/* ---------- helpers ---------- */
function getRandomDots(count: number) {
  const colors = ["#f87171", "#34d399", "#60a5fa", "#fbbf24", "#a78bfa", "#fb7185", "#38bdf8"];
  return Array.from({ length: count }).map((_, i) => ({
    top: `${Math.random() * 85 + 5}%`,
    left: `${Math.random() * 85 + 5}%`,
    color: colors[i % colors.length],
  }));
}
function parseRelativeDate(label: string): Date {
  const now = new Date();
  const d = new Date(now);
  const lower = label.toLowerCase();
  if (lower === "today") return d;
  if (lower === "yesterday") { d.setDate(d.getDate() - 1); return d; }
  const days = lower.match(/(\d+)\s+days?\s+ago/);
  if (days) { d.setDate(d.getDate() - parseInt(days[1], 10)); return d; }
  const weeks = lower.match(/(\d+)\s+weeks?\s+ago/);
  if (weeks) { d.setDate(d.getDate() - 7 * parseInt(weeks[1], 10)); return d; }
  const asDate = new Date(label);
  return isNaN(asDate.getTime()) ? d : asDate;
}
function toRelativeLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  return weeks <= 1 ? "1 week ago" : `${weeks} weeks ago`;
}
type ColorToken = "primary" | "secondary" | "accent" | "warning";
function colorForDifficulty(diff: string): ColorToken {
  const n = Number(diff.replace(/[^0-9]/g, ""));
  if (n === 2) return "warning";
  if (n === 3) return "accent";
  if (n >= 5) return "secondary";
  return "primary";
}

/* ---------- types ---------- */
interface Route {
  id: number;
  image: string;
  difficulty: string;
  date: string;       // display label
  location: string;
  rating: number;
  notes: string;
  color: ColorToken;
}

export default function LogbookPage() {
  const climbingDots = useMemo(() => getRandomDots(8), []);

  const initialRoutes: Route[] = [
    { id: 1, image: climbingWallSample, difficulty: "V4", date: "Today",     location: "Boulder Gym", rating: 5, notes: "Nailed it! Perfect technique on the overhang 💪", color: "primary" },
    { id: 2, image: climbingWallSample, difficulty: "V3", date: "Yesterday", location: "Climb Zone",  rating: 4, notes: "Great holds, challenging start sequence",       color: "accent"  },
    { id: 3, image: climbingWallSample, difficulty: "V5", date: "2 days ago",location: "Boulder Gym", rating: 3, notes: "Still working on this one... so close!",          color: "secondary" },
    { id: 4, image: climbingWallSample, difficulty: "V2", date: "1 week ago",location: "Rock Hall",   rating: 5, notes: "Perfect warm-up route! Love the flow ✨",          color: "warning" },
  ];

  const [routes, setRoutes] = useState<Route[]>(initialRoutes);

  /* ---------- filter state ---------- */
  const [showFilters, setShowFilters] = useState(true);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("all"); // all|today|7|30

  const difficultyOptions = useMemo(() => ["all", ...Array.from(new Set(routes.map(r => r.difficulty)))], [routes]);
  const locationOptions   = useMemo(() => ["all", ...Array.from(new Set(routes.map(r => r.location)))], [routes]);

  const colorClassMap: Record<ColorToken, string> = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent:   "bg-accent",
    warning:  "bg-warning",
  };

  const filteredRoutes = useMemo(() => {
    const now = new Date();
    return routes.filter(r => {
      const okDiff = difficulty === "all" || r.difficulty === difficulty;
      const okLoc  = location === "all" || r.location === location;
      let okTime = true;
      if (timeRange !== "all") {
        const d = parseRelativeDate(r.date);
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        okTime = timeRange === "today"
          ? d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate()
          : diffDays <= parseInt(timeRange, 10);
      }
      return okDiff && okLoc && okTime;
    });
  }, [routes, difficulty, location, timeRange]);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-warning fill-warning" : "text-muted"}`} />
    ));

  const resetFilters = () => { setDifficulty("all"); setLocation("all"); setTimeRange("all"); };

  /* ---------- Add New Route Modal ---------- */
  const [open, setOpen] = useState(false);
  const [formDifficulty, setFormDifficulty] = useState("V3");
  const [formLocation,   setFormLocation]   = useState("");
  const [formDate,       setFormDate]       = useState(() => new Date().toISOString().slice(0,10));
  const [formNotes,      setFormNotes]      = useState("");
  const [photoUrl,       setPhotoUrl]       = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl); }, [photoUrl]);

  const onPickPhoto = () => fileInputRef.current?.click();
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPhotoUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
  };

  const onSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    const label = toRelativeLabel(formDate);
    const color = colorForDifficulty(formDifficulty);
    const newRoute: Route = {
      id: Date.now(),
      image: photoUrl || climbingWallSample,
      difficulty: formDifficulty,
      date: label,
      location: formLocation || "Unknown Gym",
      rating: 5,
      notes: formNotes || "Added via Logbook",
      color,
    };
    setRoutes(prev => [newRoute, ...prev]);
    setOpen(false);
    setFormDifficulty("V3"); setFormLocation(""); setFormDate(new Date().toISOString().slice(0,10)); setFormNotes("");
    if (photoUrl) { URL.revokeObjectURL(photoUrl); setPhotoUrl(null); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ---------- Preview (enlarge) Modal ---------- */
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewCaption, setPreviewCaption] = useState<string>("");

  // 键盘 ESC 关闭预览
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openPreview = (src: string, caption: string) => {
    setPreviewSrc(src);
    setPreviewCaption(caption);
    setPreviewOpen(true);
  };

  return (
    <>
      {/* 防止动态类被摇掉 */}
      <div className="hidden"><div className="bg-primary bg-secondary bg-accent bg-warning"/></div>

      <div className="relative min-h-screen bg-gray-100 overflow-hidden">
        {/* 背景点（z-10） */}
        {climbingDots.map((dot, i) => (
          <div key={i} style={{ position:"absolute", top:dot.top, left:dot.left, width:"40px", height:"40px", background:dot.color, borderRadius:"50%", boxShadow:"0 2px 8px rgba(0,0,0,0.12)", zIndex:10 }} />
        ))}

        {/* 前景内容（z-20，受到全局 960px 限宽） */}
        <div className="relative z-20 space-y-6 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Routes 📖</h1>
              <p className="text-muted-foreground">Your climbing journey</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className={`rounded-full transition-all ${open ? "bg-primary/10" : ""}`}
                onClick={() => setOpen(true)}
                title="Add new route"
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Route
              </Button>

              <Button
                variant="outline"
                size="sm"
                className={`rounded-full transition-all ${showFilters ? "bg-primary/10" : ""}`}
                onClick={() => setShowFilters(s => !s)}
                title="Toggle filters"
              >
                <Filter className={`w-4 h-4 mr-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                Filter
              </Button>
            </div>
          </div>

          {/* Filters (collapsible) */}
          <div
            className={`px-4 grid grid-cols-1 sm:grid-cols-3 gap-3 overflow-hidden transition-[max-height,opacity,margin] duration-300 ${
              showFilters ? "max-h-72 opacity-100 mt-1" : "max-h-0 opacity-0 -mt-2"
            }`}
            aria-hidden={!showFilters}
          >
            {/* Difficulty */}
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-muted-foreground">Difficulty</span>
              <div className="relative">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-lg border bg-card text-foreground px-3 py-2 appearance-none pr-9"
                >
                  {difficultyOptions.map(opt => <option key={opt} value={opt}>{opt==="all"?"All":opt}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </label>

            {/* Location */}
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-muted-foreground">Location</span>
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border bg-card text-foreground px-3 py-2 appearance-none pr-9"
                >
                  {locationOptions.map(opt => <option key={opt} value={opt}>{opt==="all"?"All":opt}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </label>

            {/* Time */}
            <label className="flex flex-col text-sm">
              <span className="mb-1 text-muted-foreground">Time</span>
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full rounded-lg border bg-card text-foreground px-3 py-2 appearance-none pr-9"
                >
                  <option value="all">All time</option>
                  <option value="today">Today</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </label>

            {/* Reset */}
            <div className="sm:col-span-3 flex justify-end">
              <Button variant="outline" size="sm" onClick={resetFilters}>Reset</Button>
            </div>
          </div>

          {/* Route Cards */}
          <div className="space-y-4 px-4">
            {filteredRoutes.map((route) => (
              <div key={route.id} className="card-kawaii hover:scale-[1.02] cursor-pointer">
                <div className="flex gap-4">
                  {/* Image + Grade badge (点击图片打开预览) */}
                  <button
                    type="button"
                    className="relative flex-shrink-0 focus:outline-none"
                    onClick={() => openPreview(route.image, `${route.location} • ${route.difficulty}`)}
                    title="Click to preview"
                  >
                    <img
                      src={route.image}
                      alt={`Route ${route.difficulty}`}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-kawaii ${colorClassMap[route.color]}`}>
                      <span className="text-xs font-bold text-white">{route.difficulty}</span>
                    </div>
                  </button>

                  {/* Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-3 h-3" /><span>{route.date}</span></div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-3 h-3" /><span>{route.location}</span></div>
                      </div>
                      <div className="flex items-center gap-1">{renderStars(route.rating)}</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm text-foreground">{route.notes}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredRoutes.length === 0 && (
              <div className="text-center text-muted-foreground py-8">No routes match your filters.</div>
            )}
          </div>

          {/* Stats */}
          <div className="mx-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">This Month</p>
              <div className="flex justify-center gap-6">
                <div className="text-center"><p className="text-xl font-bold text-primary">28</p><p className="text-xs text-muted-foreground">Routes</p></div>
                <div className="text-center"><p className="text-xl font-bold text-accent">V4.2</p><p className="text-xs text-muted-foreground">Avg Grade</p></div>
                <div className="text-center"><p className="text-xl font-bold text-warning">9.2</p><p className="text-xs text-muted-foreground">Sessions</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Add Route Modal ---------- */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-card text-card-foreground rounded-2xl shadow-float w-[92vw] max-w-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Add New Route</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-muted/50">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={onSubmitNew}>
              {/* Photo */}
              <div>
                <label className="text-sm text-muted-foreground">Beta Photo</label>
                <div
                  className="mt-1 border-2 border-dashed rounded-xl p-3 flex items-center gap-3 hover:bg-muted/30 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                    {photoUrl ? (
                      <img src={photoUrl} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Click to upload a photo</p>
                    <p className="text-xs text-muted-foreground">JPG/PNG up to ~10MB</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>

              {/* Location & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col text-sm">
                  <span className="mb-1 text-muted-foreground">Location</span>
                  <input
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="rounded-lg border bg-card text-foreground px-3 py-2"
                    placeholder="e.g., Boulder Gym"
                  />
                </label>

                <label className="flex flex-col text-sm">
                  <span className="mb-1 text-muted-foreground">Difficulty</span>
                  <div className="relative">
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value)}
                      className="w-full rounded-lg border bg-card text-foreground px-3 py-2 appearance-none pr-9"
                    >
                      {Array.from({ length: 11 }, (_, i) => `V${i}`).map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </label>
              </div>

              {/* Date */}
              <label className="flex flex-col text-sm">
                <span className="mb-1 text-muted-foreground">Date</span>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="rounded-lg border bg-card text-foreground px-3 py-2"
                />
              </label>

              {/* Notes */}
              <label className="flex flex-col text-sm">
                <span className="mb-1 text-muted-foreground">Notes</span>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  className="rounded-lg border bg-card text-foreground px-3 py-2"
                  placeholder="Beta, sequence, how it felt…"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="btn-kawaii">Save Route</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Preview Image Modal ---------- */}
      {previewOpen && previewSrc && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          {/* overlay */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewOpen(false)} />
          {/* content */}
          <div className="relative w-[94vw] max-w-4xl">
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute -top-10 right-0 text-white/90 hover:text-white"
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="rounded-2xl overflow-hidden shadow-float bg-black">
              <img
                src={previewSrc}
                alt={previewCaption || "beta preview"}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
            {previewCaption && (
              <div className="mt-3 text-center text-sm text-white/90">{previewCaption}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// src/pages/LogbookPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, MapPin, Star, Filter, ChevronDown, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import climbingWallSample from "@/assets/climbing-wall-sample.png";
import { saveRouteToFirestore, listenRoutesForUser, RouteRecord } from "@/lib/logbook";
import { onAuth } from "@/lib/firebase";
import { toast } from "sonner";

/* utils */
function getRandomDots(n: number) {
  const colors = ["#f87171", "#34d399", "#60a5fa", "#fbbf24", "#a78bfa", "#fb7185", "#38bdf8"];
  return Array.from({ length: n }).map(() => ({
    top: `${Math.random() * 85 + 5}%`,
    left: `${Math.random() * 85 + 5}%`,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}
function toRelativeLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const days = Math.floor((+now - +d) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const w = Math.floor(days / 7);
  return w <= 1 ? "1 week ago" : `${w} weeks ago`;
}
type ColorToken = "primary" | "secondary" | "accent" | "warning";
function colorForDifficulty(diff: string): ColorToken {
  const n = Number(diff.replace(/\D/g, ""));
  if (n >= 5) return "secondary";
  if (n === 3) return "accent";
  if (n === 2) return "warning";
  return "primary";
}

/* UI Route type: 带原始日期与展示文案 */
type UIRoute = {
  id: string;
  image: string;
  difficulty: string;
  dateISO: string;     // 用于筛选
  dateLabel: string;   // 用于展示
  location: string;
  rating: number;
  notes: string;
  color: ColorToken;
};

/* 默认四条（带 dateISO） */
const todayISO = new Date().toISOString().slice(0, 10);
const yISO = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const d2ISO = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
const w1ISO = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

const demoRoutes: UIRoute[] = [
  { id: "demo1", image: climbingWallSample, difficulty: "V4", dateISO: todayISO, dateLabel: "Today", location: "Boulder Gym", rating: 5, notes: "Nailed it! Perfect technique 💪", color: "primary" },
  { id: "demo2", image: climbingWallSample, difficulty: "V3", dateISO: yISO,     dateLabel: "Yesterday", location: "Climb Zone",  rating: 4, notes: "Challenging start sequence", color: "accent" },
  { id: "demo3", image: climbingWallSample, difficulty: "V5", dateISO: d2ISO,    dateLabel: "2 days ago", location: "Boulder Gym", rating: 3, notes: "Almost sent it!",         color: "secondary" },
  { id: "demo4", image: climbingWallSample, difficulty: "V2", dateISO: w1ISO,    dateLabel: "1 week ago", location: "Rock Hall",   rating: 5, notes: "Nice warm-up route ✨",    color: "warning" },
];

export default function LogbookPage() {
  const [routes, setRoutes] = useState<UIRoute[]>(demoRoutes);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* filters */
  const [showFilters, setShowFilters] = useState(true);
  const [difficulty, setDifficulty] = useState("all");
  const [location, setLocation] = useState("all");
  const [timeRange, setTimeRange] = useState("all"); // all|today|7|30

  /* image preview */
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  /* auth + realtime listen */
  useEffect(() => {
    let off: any;
    const unAuth = onAuth((user) => {
      if (user) {
        setUserId(user.uid);
        off?.();
        off = listenRoutesForUser((rows) => {
          const fromFS: UIRoute[] = rows.map((r) => ({
            id: r.id || crypto.randomUUID(),
            image: r.imageUrl || climbingWallSample,
            difficulty: r.difficulty,
            dateISO: r.date,
            dateLabel: toRelativeLabel(r.date),
            location: r.location,
            rating: r.rating,
            notes: r.notes,
            color: colorForDifficulty(r.difficulty),
          }));
          // 用 Firestore 数据覆盖临时项，再追加 demo
          setRoutes([...fromFS, ...demoRoutes]);
        });
      } else {
        setUserId(null);
        off?.();
        setRoutes(demoRoutes);
      }
    });
    return () => {
      unAuth?.();
      off?.();
    };
  }, []);

  /* filtering 使用 dateISO */
  const filtered = useMemo(() => {
    const now = Date.now();
    return routes.filter((r) => {
      const okDiff = difficulty === "all" || r.difficulty === difficulty;
      const okLoc  = location === "all"   || r.location === location;
      let okTime   = true;
      if (timeRange !== "all") {
        const d = new Date(r.dateISO).getTime();
        const diffDays = Math.floor((now - d) / 86400000);
        if (timeRange === "today") okTime = diffDays === 0;
        else if (timeRange === "7") okTime = diffDays <= 7;
        else if (timeRange === "30") okTime = diffDays <= 30;
      }
      return okDiff && okLoc && okTime;
    });
  }, [routes, difficulty, location, timeRange]);

  const renderStars = (n: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < n ? "text-warning fill-warning" : "text-muted"}`} />
    ));

  /* add route form */
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
    if (!userId) return toast.error("Please log in first");

    try {
      setLoading(true);

      // 乐观更新：先插入一条临时记录，界面立即看到
      const tempId = `temp-${Date.now()}`;
      const optimistic: UIRoute = {
        id: tempId,
        image: photoUrl || climbingWallSample,
        difficulty: formDifficulty,
        dateISO: formDate,
        dateLabel: toRelativeLabel(formDate),
        location: formLocation || "Unknown Gym",
        rating: 5,
        notes: formNotes,
        color: colorForDifficulty(formDifficulty),
      };
      setRoutes((prev) => [optimistic, ...prev]);

      await saveRouteToFirestore({
        file: photoFile,
        difficulty: formDifficulty,
        date: formDate,
        location: optimistic.location,
        rating: 5,
        notes: formNotes,
      });

      toast.success("✅ Route saved!");
      setOpen(false);
      setPhotoFile(null);
      setPhotoUrl(null);
      setFormLocation("");
      setFormNotes("");
      // snapshot 到来后会用 Firestore 数据覆盖（包含真正 id）
    } catch (err: any) {
      console.error(err);
      toast.error("❌ Failed to save: " + err.message);
      // 回滚乐观项
      setRoutes((prev) => prev.filter((r) => !r.id.startsWith("temp-")));
    } finally {
      setLoading(false);
    }
  };

  /* UI */
  const optionsBlock = (
    <div className="px-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[
        { label: "Difficulty", value: difficulty, set: setDifficulty, options: ["all", "V2", "V3", "V4", "V5"] },
        { label: "Location", value: location, set: setLocation, options: ["all", "Boulder Gym", "Climb Zone", "Rock Hall"] },
        { label: "Time Range", value: timeRange, set: setTimeRange, options: ["all", "today", "7", "30"] },
      ].map((f, idx) => (
        <label key={idx} className="flex flex-col text-sm">
          <span className="mb-1 text-muted-foreground">{f.label}</span>
          <div className="relative">
            <select
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="w-full rounded-lg border bg-card text-foreground px-3 py-2 appearance-none pr-9"
            >
              {f.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "all"
                    ? "All"
                    : f.label === "Time Range"
                    ? opt === "today"
                      ? "Today"
                      : `Last ${opt} days`
                    : opt}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </label>
      ))}
    </div>
  );

  return (
    <>
      <div className="relative min-h-screen bg-gray-100 overflow-hidden">
        {getRandomDots(8).map((d, i) => (
          <div key={i} style={{ position: "absolute", top: d.top, left: d.left, width: 40, height: 40, background: d.color, borderRadius: "50%", boxShadow: "0 2px 8px rgba(0,0,0,.12)", zIndex: 10 }} />
        ))}

        <div className="relative z-20 space-y-6 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-8">
            <div>
              <h1 className="text-2xl font-bold">My Routes 📖</h1>
              <p className="text-muted-foreground">Your climbing journey</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Add Route
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowFilters((s) => !s)}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {showFilters && optionsBlock}

          {/* List */}
          <div className="space-y-4 px-4">
            {filtered.map((r) => (
              <div key={r.id} className="bg-white rounded-xl shadow p-4 flex gap-4 items-start">
                <button type="button" onClick={() => setPreviewSrc(r.image)} className="relative focus:outline-none">
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
                        {r.dateLabel}
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
            {filtered.length === 0 && (
              <div className="text-center text-muted-foreground py-8">No routes match your filters.</div>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      {previewSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPreviewSrc(null)} />
          <div className="relative w-[90vw] max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl">
            <img src={previewSrc} alt="preview" className="w-full h-auto max-h-[80vh] object-contain" />
            <button onClick={() => setPreviewSrc(null)} className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white rounded-full p-1">
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
              <button onClick={() => setOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form className="space-y-4" onSubmit={onSubmitNew}>
              <div>
                <label className="text-sm">Photo</label>
                <div className="border-2 border-dashed rounded-xl p-3 mt-1 flex items-center gap-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover" /> : <Upload className="w-5 h-5 text-gray-400" />}
                  </div>
                  <p className="text-sm text-gray-600">Click to upload</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="Location" className="border rounded-lg px-3 py-2" />
                <select value={formDifficulty} onChange={(e) => setFormDifficulty(e.target.value)} className="border rounded-lg px-3 py-2">
                  {Array.from({ length: 11 }, (_, i) => `V${i}`).map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
              <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="border rounded-lg px-3 py-2 w-full" />
              <textarea rows={3} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Notes" className="border rounded-lg px-3 py-2 w-full" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

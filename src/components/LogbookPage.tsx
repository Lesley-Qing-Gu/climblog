import { useMemo, useState } from "react";
import { Calendar, MapPin, Star, Filter, ChevronDown } from "lucide-react";
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

/* ---------- types ---------- */
interface Route {
  id: number;
  image: string;
  difficulty: string;
  date: string;
  location: string;
  rating: number;
  notes: string;
  color: "primary" | "secondary" | "accent" | "warning";
}

export default function LogbookPage() {
  const climbingDots = useMemo(() => getRandomDots(8), []);

  const routes: Route[] = [
    { id: 1, image: climbingWallSample, difficulty: "V4", date: "Today", location: "Boulder Gym", rating: 5, notes: "Nailed it! Perfect technique on the overhang 💪", color: "primary" },
    { id: 2, image: climbingWallSample, difficulty: "V3", date: "Yesterday", location: "Climb Zone", rating: 4, notes: "Great holds, challenging start sequence", color: "accent" },
    { id: 3, image: climbingWallSample, difficulty: "V5", date: "2 days ago", location: "Boulder Gym", rating: 3, notes: "Still working on this one... so close!", color: "secondary" },
    { id: 4, image: climbingWallSample, difficulty: "V2", date: "1 week ago", location: "Rock Hall", rating: 5, notes: "Perfect warm-up route! Love the flow ✨", color: "warning" },
  ];

  /* ---------- filter state ---------- */
  const [showFilters, setShowFilters] = useState(true); // 点击 Filter 切换
  const [difficulty, setDifficulty] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("all"); // all|today|7|30

  const difficultyOptions = useMemo(() => ["all", ...Array.from(new Set(routes.map(r => r.difficulty)))], [routes]);
  const locationOptions = useMemo(() => ["all", ...Array.from(new Set(routes.map(r => r.location)))], [routes]);

  const colorClassMap: Record<Route["color"], string> = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
    warning: "bg-warning",
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

  const resetFilters = () => {
    setDifficulty("all"); setLocation("all"); setTimeRange("all");
  };

  return (
    <>
      {/* 防止类被摇掉 */}
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
                {/* 自定义箭头，绝对定位垂直居中（修正偏移） */}
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

          {/* Routes */}
          <div className="space-y-4 px-4">
            {filteredRoutes.map((route) => (
              <div key={route.id} className="card-kawaii hover:scale-[1.02] cursor-pointer">
                <div className="flex gap-4">
                  <div className="relative flex-shrink-0">
                    <img src={route.image} alt={`Route ${route.difficulty}`} className="w-20 h-20 rounded-lg object-cover" />
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-kawaii ${colorClassMap[route.color]}`}>
                      <span className="text-xs font-bold text-white">{route.difficulty}</span>
                    </div>
                  </div>
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

          {/* CTA */}
          <div className="px-4">
            <Button className="w-full btn-kawaii text-lg py-6">📸 Add New Route</Button>
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
    </>
  );
}

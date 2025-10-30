import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, X, Star, Clock, Target, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/* -------------------- Utils -------------------- */
function getRandomDots(count: number) {
  const colors = ["#f87171", "#34d399", "#60a5fa", "#fbbf24", "#a78bfa", "#fb7185", "#38bdf8"];
  return Array.from({ length: count }).map(() => ({
    top: `${Math.random() * 85 + 5}%`,
    left: `${Math.random() * 85 + 5}%`,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

type ColorToken = "primary" | "secondary" | "accent" | "warning";
type Difficulty = "V0-V2" | "V1-V3" | "V2-V4" | "V3-V5" | "V4-V6";

export interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  timeLimit: string;
  points: number;
  emoji: string;
  color: ColorToken;
  gradient: string; // tailwind gradient class
}

/** 本地降级数据（AI 失败时使用） */
const localFallback: Challenge[] = [
  { id: 1, title: "Pink Power Hour", description: "Complete 5 routes using only pink holds! Show those rosy routes who's boss 💪", difficulty: "V2-V4", timeLimit: "60 minutes", points: 150, emoji: "🌸", color: "primary", gradient: "from-primary to-primary/60" },
  { id: 2, title: "Overhang Queen", description: "Conquer 3 overhang routes in a single session. Time to defy gravity!", difficulty: "V3-V5", timeLimit: "2 hours", points: 200, emoji: "👑", color: "secondary", gradient: "from-secondary to-secondary/60" },
  { id: 3, title: "Gentle Giant", description: "Complete the tallest route in the gym. Reach for the stars! ✨", difficulty: "V1-V3", timeLimit: "No limit", points: 100, emoji: "🌟", color: "accent", gradient: "from-accent to-accent/60" },
  { id: 4, title: "Speed Demon", description: "Complete any route in under 30 seconds. Fast and fabulous!", difficulty: "V1-V2", timeLimit: "30 seconds", points: 175, emoji: "⚡", color: "warning", gradient: "from-warning to-warning/60" },
];

/** color → gradient */
const colorToGradient: Record<ColorToken, string> = {
  primary: "from-primary to-primary/60",
  secondary: "from-secondary to-secondary/60",
  accent: "from-accent to-accent/60",
  warning: "from-warning to-warning/60",
};

/** 从任意文本中抓取 JSON 数组（支持被 ```json 包裹） */
function safeParseArrayJSON(text: string): any[] {
  const s = (text || "").trim();
  // 1) 尝试直接 parse
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}

  // 2) 捕获 ```json ... ``` 中内容
  const fenced = s.match(/```json([\s\S]*?)```/i);
  if (fenced) {
    const inner = fenced[1].trim();
    const parsed = JSON.parse(inner);
    if (Array.isArray(parsed)) return parsed;
  }

  // 3) 兜底：从全文提取首个 [...] 段
  const m = s.match(/\[[\s\S]*\]/);
  if (m) {
    const parsed = JSON.parse(m[0]);
    if (Array.isArray(parsed)) return parsed;
  }

  throw new Error("No JSON array found in model response");
}

/** 调用 Gemini 生成挑战 */
async function fetchChallengesFromGemini(): Promise<Challenge[]> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");

  const MODEL = "models/gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent`;

  // 1) 声明函数（注意：snake_case）
  const tools = [
    {
      function_declarations: [
        {
          name: "returnChallenges",
          description: "Return exactly 4 playful bouldering challenges.",
          parameters: {
            type: "OBJECT",
            properties: {
              items: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    id: { type: "INTEGER" },
                    title: { type: "STRING" },
                    description: { type: "STRING" },
                    difficulty: {
                      type: "STRING",
                      enum: ["V0-V2","V1-V3","V2-V4","V3-V5","V4-V6"]
                    },
                    timeLimit: { type: "STRING" },
                    points: { type: "INTEGER" },
                    emoji: { type: "STRING" },
                    color: {
                      type: "STRING",
                      enum: ["primary","secondary","accent","warning"]
                    }
                  },
                  required: ["title","description","difficulty","timeLimit","points","emoji","color"]
                }
              }
            },
            required: ["items"]
          }
        }
      ]
    }
  ];

  // 2) 要求必须/优先使用函数调用（snake_case）
  const tool_config = {
    function_calling_config: {
      mode: "ANY",
      allowed_function_names: ["returnChallenges"]
    }
  };

  const prompt = `
Generate 4 varied, fun bouldering challenges for a cute climbing app.
- Titles 2–4 words; description ≤ 120 chars
- Vary difficulties, time limits, points (100–250)
- One relevant emoji per item
- Color must vary among: primary | secondary | accent | warning
Return by calling function "returnChallenges" with { items: [...] }.
`.trim();

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    tools,                // ✅ snake_case 内部字段
    tool_config,          // ✅ snake_case
    generation_config: {  // ✅ snake_case
      temperature: 0.8,
      max_output_tokens: 512
    }
  };

  const res = await fetch(`${url}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}: ${raw}`);
  }

  const data = JSON.parse(raw);
  const parts = data?.candidates?.[0]?.content?.parts ?? [];

  // 3) 解析函数调用（注意：function_call）
  let fc: any = parts.find((p: any) => p.function_call)?.function_call;

  // 兜底：如果没按函数返回，再尝试文本 JSON
  if (!fc) {
    const text = parts.map((p: any) => p?.text ?? "").join("\n").trim();
    let arr: any[] | null = null;
    try {
      const m = text.match(/\[[\s\S]*\]/);
      if (m) arr = JSON.parse(m[0]);
    } catch {}
    if (!arr) throw new Error("Model did not return function_call and no JSON array found in text");
    fc = { name: "returnChallenges", args: JSON.stringify({ items: arr }) };
  }

  const argsObj = typeof fc.args === "string" ? JSON.parse(fc.args) : fc.args;
  const items = Array.isArray(argsObj?.items) ? argsObj.items : [];
  if (!items.length) throw new Error("Function returned no items");

  const normalized: Challenge[] = items.slice(0, 4).map((c: any, i: number) => {
    const color: ColorToken = ["primary","secondary","accent","warning"].includes(c?.color)
      ? c.color
      : "primary";
    return {
      id: typeof c?.id === "number" ? c.id : i + 1,
      title: String(c?.title ?? "Fun Challenge"),
      description: String(c?.description ?? "Have fun and climb!"),
      difficulty: (c?.difficulty ?? "V2-V4") as any,
      timeLimit: String(c?.timeLimit ?? "60 minutes"),
      points: Number.isFinite(c?.points) ? Number(c.points) : 150,
      emoji: String(c?.emoji ?? "🧗"),
      color,
      gradient: {
        primary: "from-primary to-primary/60",
        secondary: "from-secondary to-secondary/60",
        accent: "from-accent to-accent/60",
        warning: "from-warning to-warning/60",
      }[color],
    };
  });

  return normalized;
}

/* -------------------- Component -------------------- */
export default function ChallengesPage() {
  const [items, setItems] = useState<Challenge[]>(localFallback);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeAnimation, setSwipeAnimation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // drag state
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [rot, setRot] = useState(0);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);

  // static dots
  const climbingDots = useMemo(() => getRandomDots(8), []);

  // load on mount
  useEffect(() => {
    refreshChallenges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshChallenges() {
    try {
      setLoading(true);
      setErr(null);
      const data = await fetchChallengesFromGemini();
      setItems(data);
      setCurrentCardIndex(0);
    } catch (e: any) {
      console.warn("Gemini failed, using fallback:", e?.message || e);
      setErr("AI challenges unavailable, showing defaults.");
      setItems(localFallback);
      setCurrentCardIndex(0);
    } finally {
      setLoading(false);
    }
  }

  const current = items[currentCardIndex];
  if (!current) return null;

  // swipe thresholds
  const H_THRESHOLD = 90;
  const V_THRESHOLD = 120;

  const finishCard = (direction: "left" | "right" | "up") => {
    setSwipeAnimation(`animate-swipe-${direction}`);
    setDx(0); setDy(0); setRot(0);
    setTimeout(() => {
      if (direction === "right") {
        console.log(`Saved challenge: ${current.title}`);
      } else if (direction === "up") {
        console.log(`Starting challenge: ${current.title}`);
      }
      setCurrentCardIndex((prev) => (prev + 1) % items.length);
      setSwipeAnimation(null);
    }, 300);
  };

  const handleSwipe = (direction: "left" | "right" | "up") => finishCard(direction);

  // drag handlers
  const onDragStart = (x: number, y: number) => {
    startX.current = x;
    startY.current = y;
    dragging.current = true;
  };
  const onDragMove = (x: number, y: number) => {
    if (!dragging.current || startX.current == null || startY.current == null) return;
    const deltaX = x - startX.current;
    const deltaY = y - startY.current;
    setDx(deltaX);
    setDy(deltaY);
    setRot(Math.max(-12, Math.min(12, deltaX / 10)));
  };
  const onDragEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (Math.abs(dx) > H_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      finishCard(dx > 0 ? "right" : "left");
    } else if (dy < -V_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
      finishCard("up");
    } else {
      setDx(0); setDy(0); setRot(0);
    }
  };

  // touch/mouse wiring
  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const t = e.touches[0];
    onDragStart(t.clientX, t.clientY);
  };
  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const t = e.touches[0];
    onDragMove(t.clientX, t.clientY);
  };
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => onDragEnd();

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    onDragStart(e.clientX, e.clientY);
  };
  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => onDragMove(e.clientX, e.clientY);
  const onMouseUp: React.MouseEventHandler<HTMLDivElement> = () => onDragEnd();
  const onMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => onDragEnd();

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background relative overflow-hidden">
      {/* 背景彩点 */}
      {climbingDots.map((dot, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: dot.top,
            left: dot.left,
            width: "40px",
            height: "40px",
            background: dot.color,
            borderRadius: "50%",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            zIndex: 1,
          }}
        />
      ))}

      {/* Header */}
      <div className="text-center space-y-2 px-4 pt-8 pb-3 relative z-10">
        <h1 className="text-2xl font-bold text-foreground">Challenges ⚡</h1>
        <p className="text-muted-foreground">Swipe to find your next adventure!</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-center gap-3 z-10 relative">
        <Button variant="outline" size="sm" onClick={refreshChallenges} disabled={loading} className="rounded-full">
          <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh challenges"}
        </Button>
        {err && <span className="text-xs text-muted-foreground">{err}</span>}
      </div>

      {/* Card stack */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10 select-none">
        <div className="relative w-full max-w-sm">
          {items.slice(currentCardIndex + 1, currentCardIndex + 3).map((challenge, index) => (
            <div
              key={challenge.id}
              className={`absolute inset-0 transform transition-transform duration-300 ${
                index === 0 ? "scale-95 translate-y-2" : "scale-90 translate-y-4 opacity-60"
              }`}
              style={{ zIndex: -index - 1 }}
            >
              <div className={`h-96 bg-gradient-to-br ${challenge.gradient} rounded-xl`} />
            </div>
          ))}

          {/* Main draggable card */}
          <div
            className={`relative z-10 will-change-transform ${swipeAnimation || ""}`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            style={{
              transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
              transition: dragging.current || swipeAnimation ? "none" : "transform 0.25s ease",
            }}
          >
            <div className={`h-96 bg-gradient-to-br ${current.gradient} rounded-xl p-6 text-white space-y-4 flex flex-col`}>
              <div className="text-center space-y-2">
                <div className="text-4xl">{current.emoji}</div>
                <h2 className="text-xl font-bold">{current.title}</h2>
              </div>

              <div className="flex-1 space-y-4">
                <p className="text-sm opacity-90 leading-relaxed">{current.description}</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm"><Target className="w-4 h-4" /><span>Difficulty: {current.difficulty}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4" /><span>Time: {current.timeLimit}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Star className="w-4 h-4" /><span>{current.points} points</span></div>
                </div>
              </div>

              <div className="text-center text-xs opacity-75 space-y-1">
                <p>👆 Swipe up to start now</p>
                <p>❤️ Swipe right to save • ❌ Swipe left to skip</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center items-center gap-8 px-4 py-6 relative z-10">
        <Button onClick={() => handleSwipe("left")} variant="outline" size="lg" className="w-14 h-14 rounded-full border-destructive/30 hover:bg-destructive/10">
          <X className="w-6 h-6 text-destructive" />
        </Button>
        <Button onClick={() => handleSwipe("up")} size="lg" className="w-16 h-16 rounded-full bg-gradient-to-r from-info to-info/80 hover:scale-110 transition-transform">
          <Star className="w-6 h-6 text-white" />
        </Button>
        <Button onClick={() => handleSwipe("right")} variant="outline" size="lg" className="w-14 h-14 rounded-full border-success/30 hover:bg-success/10">
          <Heart className="w-6 h-6 text-success" />
        </Button>
      </div>

      {/* Dots */}
      <div className="px-4 pb-4 relative z-10">
        <div className="flex justify-center gap-2">
          {items.map((_, index) => (
            <div key={index} className={`w-2 h-2 rounded-full transition-colors duration-300 ${index === currentCardIndex ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

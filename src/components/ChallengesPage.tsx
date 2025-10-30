import { useMemo, useRef, useState } from "react";
import { Heart, X, Star, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

function getRandomDots(count: number) {
  const colors = ["#f87171", "#34d399", "#60a5fa", "#fbbf24", "#a78bfa", "#fb7185", "#38bdf8"];
  return Array.from({ length: count }).map((_, i) => ({
    top: `${Math.random() * 85 + 5}%`,
    left: `${Math.random() * 85 + 5}%`,
    color: colors[i % colors.length],
  }));
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  timeLimit: string;
  points: number;
  emoji: string;
  color: string;
  gradient: string;
}

export default function ChallengesPage() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [swipeAnimation, setSwipeAnimation] = useState<string | null>(null);

  // 拖拽中的位移/角度
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [rot, setRot] = useState(0);

  // 起点
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);

  // 防止每次渲染点位变化
  const climbingDots = useMemo(() => getRandomDots(8), []);

  const challenges: Challenge[] = [
    { id: 1, title: "Pink Power Hour", description: "Complete 5 routes using only pink holds! Show those rosy routes who's boss 💪", difficulty: "V2-V4", timeLimit: "60 minutes", points: 150, emoji: "🌸", color: "primary", gradient: "from-primary to-primary/60" },
    { id: 2, title: "Overhang Queen", description: "Conquer 3 overhang routes in a single session. Time to defy gravity!", difficulty: "V3-V5", timeLimit: "2 hours", points: 200, emoji: "👑", color: "secondary", gradient: "from-secondary to-secondary/60" },
    { id: 3, title: "Gentle Giant", description: "Complete the tallest route in the gym. Reach for the stars! ✨", difficulty: "V1-V3", timeLimit: "No limit", points: 100, emoji: "🌟", color: "accent", gradient: "from-accent to-accent/60" },
    { id: 4, title: "Speed Demon", description: "Complete any route in under 30 seconds. Fast and fabulous!", difficulty: "V1-V2", timeLimit: "30 seconds", points: 175, emoji: "⚡", color: "warning", gradient: "from-warning to-warning/60" },
  ];

  const currentChallenge = challenges[currentCardIndex];
  if (!currentChallenge) return null;

  // 阈值（像素）
  const H_THRESHOLD = 90;  // 左右滑触发
  const V_THRESHOLD = 120; // 上滑触发

  const finishCard = (direction: "left" | "right" | "up") => {
    setSwipeAnimation(`animate-swipe-${direction}`);
    // 重置拖拽位移，交给动画完成
    setDx(0); setDy(0); setRot(0);

    setTimeout(() => {
      if (direction === "right") {
        console.log(`Saved challenge: ${currentChallenge.title}`);
      } else if (direction === "up") {
        console.log(`Starting challenge: ${currentChallenge.title}`);
      }
      setCurrentCardIndex((prev) => (prev + 1) % challenges.length);
      setSwipeAnimation(null);
    }, 300);
  };

  const handleSwipe = (direction: "left" | "right" | "up") => finishCard(direction);

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
    setRot(Math.max(-12, Math.min(12, deltaX / 10))); // 轻微旋转
  };

  const onDragEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;

    // 判定方向
    if (Math.abs(dx) > H_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      finishCard(dx > 0 ? "right" : "left");
    } else if (dy < -V_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
      finishCard("up");
    } else {
      // 回弹
      setDx(0); setDy(0); setRot(0);
    }
  };

  // 触摸事件
  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const t = e.touches[0];
    onDragStart(t.clientX, t.clientY);
  };
  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const t = e.touches[0];
    onDragMove(t.clientX, t.clientY);
  };
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => onDragEnd();

  // 鼠标事件（桌面）
  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    onDragStart(e.clientX, e.clientY);
  };
  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => onDragMove(e.clientX, e.clientY);
  const onMouseUp: React.MouseEventHandler<HTMLDivElement> = () => onDragEnd();
  const onMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => onDragEnd();

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background relative overflow-hidden">
      {/* 背景攀岩点 */}
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
      <div className="text-center space-y-2 px-4 pt-8 pb-6 relative z-10">
        <h1 className="text-2xl font-bold text-foreground">Challenges ⚡</h1>
        <p className="text-muted-foreground">Swipe to find your next adventure!</p>
      </div>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10 select-none">
        <div className="relative w-full max-w-sm">
          {/* 背景叠卡 */}
          {challenges.slice(currentCardIndex + 1, currentCardIndex + 3).map((challenge, index) => (
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

          {/* 主卡片（可拖拽 + 动画） */}
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
            <div className={`h-96 bg-gradient-to-br ${currentChallenge.gradient} rounded-xl p-6 text-white space-y-4 flex flex-col`}>
              <div className="text-center space-y-2">
                <div className="text-4xl">{currentChallenge.emoji}</div>
                <h2 className="text-xl font-bold">{currentChallenge.title}</h2>
              </div>

              <div className="flex-1 space-y-4">
                <p className="text-sm opacity-90 leading-relaxed">{currentChallenge.description}</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm"><Target className="w-4 h-4" /><span>Difficulty: {currentChallenge.difficulty}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4" /><span>Time: {currentChallenge.timeLimit}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Star className="w-4 h-4" /><span>{currentChallenge.points} points</span></div>
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

      {/* Action Buttons */}
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
          {challenges.map((_, index) => (
            <div key={index} className={`w-2 h-2 rounded-full transition-colors duration-300 ${index === currentCardIndex ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

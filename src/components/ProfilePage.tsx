import { useEffect, useMemo, useState } from "react";
import {
  User as UserIcon,
  Trophy,
  Target,
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  Award,
  Heart,
  LogOut,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth, onAuth, googleSignIn, googleSignOut } from "@/lib/firebase";

// 随机攀岩点背景
function getRandomDots(count: number) {
  const colors = ["#f87171", "#34d399", "#60a5fa", "#fbbf24", "#a78bfa", "#fb7185", "#38bdf8"];
  return Array.from({ length: count }).map((_, i) => ({
    top: `${Math.random() * 85 + 5}%`,
    left: `${Math.random() * 85 + 5}%`,
    color: colors[i % colors.length],
  }));
}

// Tailwind 动态颜色类映射
const colorClass = (token: "primary" | "secondary" | "accent" | "warning") => {
  switch (token) {
    case "primary":
      return { bg: "bg-primary/10", text: "text-primary" };
    case "secondary":
      return { bg: "bg-secondary/10", text: "text-secondary" };
    case "accent":
      return { bg: "bg-accent/10", text: "text-accent" };
    case "warning":
      return { bg: "bg-warning/10", text: "text-warning" };
  }
};

export default function ProfilePage() {
  const climbingDots = useMemo(() => getRandomDots(8), []);
  const [user, setUser] = useState(auth.currentUser);
  const [location, setLocation] = useState<string>(() => localStorage.getItem("climblog.location") || "");
  const [editingLoc, setEditingLoc] = useState(false);
  const [locInput, setLocInput] = useState(location);

  useEffect(() => {
    const unsub = onAuth((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem("climblog.location", location);
  }, [location]);

  const displayName = user?.displayName || "Guest Climber";
  const email = user?.email || "";
  const photoURL = user?.photoURL || "";
  const joined = user?.metadata?.creationTime
    ? `Joined ${new Date(user.metadata.creationTime).toLocaleString(undefined, { year: "numeric", month: "long" })}`
    : "";

  const userStats = [
    { label: "Routes Completed", value: "156", icon: Target, color: "primary" as const },
    { label: "Total Height", value: "2,847m", icon: TrendingUp, color: "accent" as const },
    { label: "Current Streak", value: "12 days", icon: Calendar, color: "warning" as const },
    { label: "Favorite Grade", value: "V4", icon: Star, color: "secondary" as const },
  ];

  const achievements = [
    { title: "First Climb", description: "Completed your first route", emoji: "🌱", earned: true },
    { title: "Century Club", description: "Completed 100 routes", emoji: "💯", earned: true },
    { title: "Height Master", description: "Climbed equivalent of Mount Fuji", emoji: "🗾", earned: true },
    { title: "Speed Demon", description: "Completed route under 30s", emoji: "⚡", earned: false },
    { title: "Overhang Queen", description: "Master of difficult overhangs", emoji: "👑", earned: false },
    { title: "Social Climber", description: "Shared 50 routes", emoji: "📸", earned: false },
  ];

  const saveLocation = () => {
    setLocation(locInput.trim());
    setEditingLoc(false);
  };

  const handleAuthButton = async () => {
    if (user) {
      await googleSignOut();
    } else {
      await googleSignIn();
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 overflow-hidden">
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
            zIndex: 10,
          }}
        />
      ))}

      <div className="relative z-20 space-y-6 pb-24">
        {/* Header */}
        <div className="text-center space-y-4 px-4 pt-8">
          <div className="relative inline-block">
            {photoURL ? (
              <img src={photoURL} alt={displayName} className="w-24 h-24 rounded-full object-cover shadow-float" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-float">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-kawaii">
              <span className="text-lg">🌸</span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground break-all">{displayName}</h1>

            {/* 可编辑位置 */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {!editingLoc ? (
                <>
                  <span>{location || "Add your location"}</span>
                  {user && (
                    <button
                      className="text-xs underline hover:opacity-80"
                      onClick={() => {
                        setLocInput(location);
                        setEditingLoc(true);
                      }}
                    >
                      Edit
                    </button>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    className="px-2 py-1 rounded-md border bg-background text-foreground text-sm"
                    placeholder="e.g. Stockholm, Sweden"
                    value={locInput}
                    onChange={(e) => setLocInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveLocation()}
                  />
                  <Button size="sm" onClick={saveLocation}>
                    Save
                  </Button>
                </div>
              )}
            </div>

            {/* 邮箱与时间 */}
            {user && (
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
                {joined && <span>{joined}</span>}
                {email && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[180px]" title={email}>
                      {email}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {user && (
          <div className="grid grid-cols-2 gap-3 px-4">
            {userStats.map((stat, index) => {
              const Icon = stat.icon;
              const cc = colorClass(stat.color);
              return (
                <div key={index} className="card-kawaii text-center space-y-3 p-4">
                  <div className={`w-10 h-10 rounded-full ${cc.bg} mx-auto flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${cc.text}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Achievements */}
        {user && (
          <div className="space-y-4 px-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Achievements
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((a, i) => (
                <div
                  key={i}
                  className={`card-kawaii text-center space-y-2 p-4 transition-all duration-300 ${
                    a.earned ? "hover:scale-105 shadow-card" : "opacity-60 hover:opacity-80"
                  }`}
                >
                  <div className={`text-2xl ${a.earned ? "bounce-gentle" : "grayscale"}`}>{a.emoji}</div>
                  <div className="space-y-1">
                    <h4 className={`text-sm font-semibold ${a.earned ? "text-foreground" : "text-muted-foreground"}`}>
                      {a.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-tight">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign In / Out 按钮（在最底部） */}
        <div className="px-4 pt-6 pb-12">
          <Button
            onClick={handleAuthButton}
            className={`w-full py-4 rounded-xl text-white font-semibold shadow-card hover:shadow-float transition-all duration-300 ${
              user
                ? "bg-primary hover:bg-primary/90" // 🌸 粉色 Sign Out
                : "bg-primary hover:bg-primary/90" // 同样粉色 Sign In
            }`}
          >
            {user ? (
              <>
                <LogOut className="w-5 h-5 mr-2" />
                Sign out
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Sign in with Google
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 防止 Tailwind 清掉这些类 */}
      <div className="hidden bg-primary/10 text-primary bg-secondary/10 text-secondary bg-accent/10 text-accent bg-warning/10 text-warning" />
    </div>
  );
}

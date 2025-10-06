import { Trophy, TrendingUp, Target } from "lucide-react";
import mountainSilhouette from "@/assets/mountain-silhouette.png";

// Generate random climbing holds positions
function getRandomDots(count: number) {
  const colors = ["#f87171", "#34d399", "#60a5fa", "#fbbf24", "#a78bfa", "#fb7185", "#38bdf8"];
  return Array.from({ length: count }).map((_, i) => ({
    top: `${Math.random() * 85 + 5}%`,    // 5% ~ 90%
    left: `${Math.random() * 85 + 5}%`,   // 5% ~ 90%
    color: colors[i % colors.length],
  }));
}

export default function HomePage() {
  // Achievement data for progress bars
  const achievements = [
    { name: "Mount Fuji", height: "3,776m", progress: 85, color: "achievement-gold" },
    { name: "Mount Whitney", height: "4,421m", progress: 60, color: "achievement-silver" },
    { name: "Mount Washington", height: "1,916m", progress: 100, color: "achievement-bronze" },
  ];

  // Statistics for the stats grid
  const stats = [
    { label: "Total Height", value: "2,847m", icon: TrendingUp, color: "primary" },
    { label: "Routes Climbed", value: "156", icon: Target, color: "accent" },
    { label: "Current Streak", value: "12 days", icon: Trophy, color: "warning" },
  ];

  // Generate 8 random climbing holds
  const climbingDots = getRandomDots(8);

  return (
    // Main background: gray climbing wall
    <div className="relative min-h-screen bg-gray-200 overflow-hidden space-y-6 pb-24">
      {/* Climbing wall colored holds (random positions) */}
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

      {/* Main content */}
      <div className="relative z-10 space-y-6 pb-24">
        {/* Header section */}
        <div className="text-center space-y-2 px-4 pt-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome back! 🌸
          </h1>
          <p className="text-muted-foreground">Ready for your next adventure?</p>
        </div>

        {/* Achievement card */}
        <div className="card-kawaii mx-4 overflow-hidden">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-achievement-gold" />
              Your Climbing Journey
            </h2>
            
            {/* Mountain image visualization */}
            <div className="relative">
              <img 
                src={mountainSilhouette} 
                alt="Mountain achievement" 
                className="w-full h-48 object-cover rounded-lg opacity-80"
              />
              
              {/* Floating achievement badge */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-float bounce-gentle">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    2,847m climbed! 🏔️
                  </span>
                </div>
              </div>
            </div>

            {/* Achievement progress bars */}
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{achievement.name}</span>
                    <span className="text-sm text-muted-foreground">{achievement.height}</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${achievement.progress}%`,
                        background: `linear-gradient(90deg, hsl(var(--${achievement.color})), hsl(var(--${achievement.color})) 70%)`
                      }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-primary">{achievement.progress}% complete</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 px-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card-kawaii text-center space-y-2 p-4">
                <div className={`w-10 h-10 rounded-full bg-${stat.color}/10 mx-auto flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational quote */}
        <div className="mx-4 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
          <div className="text-center space-y-2">
            <div className="text-2xl">🌟</div>
            <p className="text-foreground font-medium">
              "Every mountain top is within reach if you just keep climbing!"
            </p>
            <p className="text-sm text-muted-foreground">- ClimbLog Team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
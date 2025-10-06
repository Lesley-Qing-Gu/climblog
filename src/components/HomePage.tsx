import { Trophy, TrendingUp, Target } from "lucide-react";
import mountainSilhouette from "@/assets/mountain-silhouette.png";

export default function HomePage() {
  const achievements = [
    { name: "Mount Fuji", height: "3,776m", progress: 85, color: "achievement-gold" },
    { name: "Mount Whitney", height: "4,421m", progress: 60, color: "achievement-silver" },
    { name: "Mount Washington", height: "1,916m", progress: 100, color: "achievement-bronze" },
  ];

  const stats = [
    { label: "Total Height", value: "2,847m", icon: TrendingUp, color: "primary" },
    { label: "Routes Climbed", value: "156", icon: Target, color: "accent" },
    { label: "Current Streak", value: "12 days", icon: Trophy, color: "warning" },
  ];

  return (
    <div className="relative min-h-screen wall-gradient pb-24">
      {/* Decorative Climbing Holds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hold-decoration hold-pink w-8 h-8 top-10 left-4"></div>
        <div className="hold-decoration hold-green w-6 h-6 top-20 right-8"></div>
        <div className="hold-decoration hold-blue w-10 h-10 top-32 left-12"></div>
        <div className="hold-decoration hold-orange w-7 h-7 top-40 right-6"></div>
        <div className="hold-decoration hold-yellow w-9 h-9 top-60 left-6"></div>
        <div className="hold-decoration hold-purple w-5 h-5 top-80 right-12"></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 px-4 pt-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome back! 🏔️
          </h1>
          <p className="text-muted-foreground">Ready for your next climb?</p>
        </div>

        {/* Mountain Achievement */}
        <div className="card-cute mx-4 overflow-hidden">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              Your Climbing Journey
            </h2>
            
            <div className="relative">
              <img 
                src={mountainSilhouette} 
                alt="Mountain achievement" 
                className="w-full h-48 object-cover rounded-lg opacity-80"
              />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-card">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    2,847m climbed! 🏔️
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">{achievement.name}</span>
                    <span className="text-sm text-muted-foreground">{achievement.height}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                        achievement.color === 'achievement-gold' ? 'bg-hold-orange' :
                        achievement.color === 'achievement-silver' ? 'bg-hold-blue' :
                        'bg-hold-green'
                      }`}
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-primary">{achievement.progress}% complete</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 px-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const holdColor = index === 0 ? 'hold-pink' : index === 1 ? 'hold-green' : 'hold-yellow';
            return (
              <div key={index} className="card-cute text-center space-y-3 p-4">
                <div className={`w-12 h-12 rounded-2xl ${holdColor} mx-auto flex items-center justify-center shadow-soft`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational Quote */}
        <div className="mx-4 card-cute">
          <div className="text-center space-y-3">
            <div className="text-3xl">🎯</div>
            <p className="text-foreground font-medium text-lg">
              "Every mountain top is within reach if you just keep climbing!"
            </p>
            <p className="text-sm text-muted-foreground">- Climbing Wisdom</p>
          </div>
        </div>
      </div>
    </div>
  );
}
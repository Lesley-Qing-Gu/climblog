import { 
  User, 
  Settings, 
  Trophy, 
  Target, 
  Calendar, 
  MapPin, 
  Star,
  TrendingUp,
  Award,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const userStats = [
    { label: "Routes Completed", value: "156", icon: Target, color: "hold-red" },
    { label: "Total Height", value: "2,847m", icon: TrendingUp, color: "hold-green" },
    { label: "Current Streak", value: "12 days", icon: Calendar, color: "hold-blue" },
    { label: "Favorite Grade", value: "V4", icon: Star, color: "hold-yellow" },
  ];

  const achievements = [
    { title: "First Climb", description: "Completed your first route", emoji: "🌱", earned: true },
    { title: "Century Club", description: "Completed 100 routes", emoji: "💯", earned: true },
    { title: "Height Master", description: "Climbed equivalent of Mount Fuji", emoji: "🗾", earned: true },
    { title: "Speed Demon", description: "Completed route under 30s", emoji: "⚡", earned: false },
    { title: "Overhang Queen", description: "Master of difficult overhangs", emoji: "👑", earned: false },
    { title: "Social Climber", description: "Shared 50 routes", emoji: "📸", earned: false },
  ];

  return (
    <div className="relative min-h-screen wall-gradient pb-24">
      {/* Decorative Climbing Holds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hold-decoration hold-pink w-6 h-6 top-16 right-8"></div>
        <div className="hold-decoration hold-blue w-8 h-8 top-32 left-6"></div>
        <div className="hold-decoration hold-green w-5 h-5 top-48 right-12"></div>
        <div className="hold-decoration hold-yellow w-7 h-7 top-64 left-10"></div>
        <div className="hold-decoration hold-orange w-6 h-6 bottom-32 right-6"></div>
        <div className="hold-decoration hold-purple w-9 h-9 bottom-48 left-8"></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 px-4 pt-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-card">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-success flex items-center justify-center shadow-soft">
              <span className="text-xl">🧗‍♀️</span>
            </div>
          </div>
        
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Sarah Chen</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-1">
            <MapPin className="w-4 h-4" />
            San Francisco, CA
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Joined March 2024</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              Boulder Lover
            </span>
          </div>
        </div>
      </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 px-4">
          {userStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card-cute text-center space-y-3 p-5">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} mx-auto flex items-center justify-center shadow-soft`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground leading-tight">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Level */}
        <div className="mx-4 card-cute space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-warning to-hold-orange flex items-center justify-center shadow-soft">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Boulder Crusher</h3>
                <p className="text-sm text-muted-foreground">Level 7</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-primary">2,470 / 3,000 XP</p>
              <p className="text-xs text-muted-foreground">530 XP to Level 8</p>
            </div>
          </div>
          
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="h-3 rounded-full bg-hold-orange transition-all duration-1000 ease-out"
              style={{ width: "82%" }}
            />
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-4 px-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Achievements
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`card-cute text-center space-y-3 p-4 transition-all duration-300 ${
                  achievement.earned 
                    ? "hover:scale-105 shadow-hold" 
                    : "opacity-60 hover:opacity-80"
                }`}
              >
                <div className={`text-3xl ${achievement.earned ? "animate-bounce-gentle" : "grayscale"}`}>
                  {achievement.emoji}
                </div>
                <div className="space-y-1">
                  <h4 className={`text-sm font-semibold ${
                    achievement.earned ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned && (
                  <div className="w-full h-2 bg-gradient-to-r from-primary to-accent rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 px-4">
          <Button variant="outline" className="w-full py-4 rounded-2xl bg-card border-0 shadow-soft hover:shadow-card">
            <Settings className="w-5 h-5 mr-3" />
            Settings & Preferences
          </Button>
          
          <Button variant="outline" className="w-full py-4 rounded-2xl bg-card border-0 shadow-soft hover:shadow-card">
            <Target className="w-5 h-5 mr-3" />
            Training Goals
          </Button>
          
          <Button variant="outline" className="w-full py-4 rounded-2xl bg-card border-0 shadow-soft hover:shadow-card">
            <Star className="w-5 h-5 mr-3" />
            Rate ClimbLog
          </Button>
        </div>

        {/* Motivational Section */}
        <div className="mx-4 card-cute">
          <div className="text-center space-y-3">
            <div className="text-3xl">🎯</div>
            <h3 className="font-semibold text-foreground text-lg">Keep Crushing!</h3>
            <p className="text-sm text-muted-foreground">
              You're doing amazing! Just 3 more routes to hit your weekly goal 💪
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
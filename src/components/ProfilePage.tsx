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
    { label: "Routes Completed", value: "156", icon: Target, color: "primary" },
    { label: "Total Height", value: "2,847m", icon: TrendingUp, color: "accent" },
    { label: "Current Streak", value: "12 days", icon: Calendar, color: "warning" },
    { label: "Favorite Grade", value: "V4", icon: Star, color: "secondary" },
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
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="text-center space-y-4 px-4 pt-8">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-float">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-kawaii">
            <span className="text-lg">🌸</span>
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
      <div className="grid grid-cols-2 gap-3 px-4">
        {userStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card-kawaii text-center space-y-3 p-4">
              <div className={`w-10 h-10 rounded-full bg-${stat.color}/10 mx-auto flex items-center justify-center`}>
                <Icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Level */}
      <div className="mx-4 card-kawaii space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-achievement-gold to-achievement-bronze flex items-center justify-center shadow-kawaii">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Boulder Enthusiast</h3>
              <p className="text-sm text-muted-foreground">Level 7</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-primary">2,470 / 3,000 XP</p>
            <p className="text-xs text-muted-foreground">530 XP to Level 8</p>
          </div>
        </div>
        
        <div className="w-full bg-muted/50 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-achievement-gold to-achievement-bronze transition-all duration-1000 ease-out"
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
        
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`card-kawaii text-center space-y-2 p-4 transition-all duration-300 ${
                achievement.earned 
                  ? "hover:scale-105 shadow-card" 
                  : "opacity-60 hover:opacity-80"
              }`}
            >
              <div className={`text-2xl ${achievement.earned ? "bounce-gentle" : "grayscale"}`}>
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
                <div className="w-full h-1 bg-gradient-to-r from-achievement-gold to-achievement-bronze rounded-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3 px-4">
        <Button variant="outline" className="w-full py-4 rounded-xl">
          <Settings className="w-5 h-5 mr-3" />
          Settings & Preferences
        </Button>
        
        <Button variant="outline" className="w-full py-4 rounded-xl">
          <Target className="w-5 h-5 mr-3" />
          Training Goals
        </Button>
        
        <Button variant="outline" className="w-full py-4 rounded-xl">
          <Star className="w-5 h-5 mr-3" />
          Rate ClimbLog
        </Button>
      </div>

      {/* Motivational Section */}
      <div className="mx-4 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
        <div className="text-center space-y-2">
          <div className="text-2xl">🎯</div>
          <h3 className="font-semibold text-foreground">Keep Climbing!</h3>
          <p className="text-sm text-muted-foreground">
            You're doing amazing! Just 3 more routes to hit your weekly goal 💪
          </p>
        </div>
      </div>
    </div>
  );
}
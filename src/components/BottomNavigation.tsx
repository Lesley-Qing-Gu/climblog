import { Mountain, BookOpen, Zap, Camera, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navigationItems = [
  { id: "home", icon: Mountain, label: "Home", gradient: "from-primary to-secondary" },
  { id: "logbook", icon: BookOpen, label: "Logbook", gradient: "from-secondary to-accent" },
  { id: "challenges", icon: Zap, label: "Challenges", gradient: "from-accent to-warning" },
  { id: "camera", icon: Camera, label: "Camera", gradient: "from-warning to-primary" },
  { id: "profile", icon: User, label: "Profile", gradient: "from-primary to-accent" },
];

export default function BottomNavigation({ currentPage, onPageChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border rounded-t-xl shadow-card">
      <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 hover:scale-105 min-w-0",
                isActive 
                  ? "bg-primary/10 shadow-kawaii" 
                  : "hover:bg-primary/5"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  isActive
                    ? `bg-gradient-to-r ${item.gradient} shadow-float`
                    : "bg-muted/50"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isActive ? "text-white" : "text-muted-foreground"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-300 truncate",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
import { Mountain, BookOpen, Zap, Camera, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navigationItems = [
  { id: "home", icon: Mountain, label: "Home", gradient: "from-hold-red to-hold-orange" },
  { id: "logbook", icon: BookOpen, label: "Logbook", gradient: "from-hold-blue to-hold-cyan" },
  { id: "challenges", icon: Zap, label: "Challenges", gradient: "from-hold-green to-hold-yellow" },
  { id: "camera", icon: Camera, label: "Camera", gradient: "from-hold-purple to-hold-pink" },
  { id: "profile", icon: User, label: "Profile", gradient: "from-hold-orange to-hold-red" },
];

export default function BottomNavigation({ currentPage, onPageChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card shadow-card rounded-t-3xl border-t border-border/20">
      <div className="flex justify-around items-center py-4 px-4">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const holdColor = index === 0 ? 'hold-pink' : 
                           index === 1 ? 'hold-blue' : 
                           index === 2 ? 'hold-green' : 
                           index === 3 ? 'hold-orange' : 'hold-purple';
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center space-y-2 p-3 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? `${holdColor} shadow-soft scale-105` 
                  : 'hover:bg-muted/30'
              }`}
            >
              <Icon 
                className={`w-6 h-6 transition-colors ${
                  isActive ? 'text-white' : 'text-muted-foreground'
                }`} 
              />
              <span 
                className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-white' : 'text-muted-foreground'
                }`}
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
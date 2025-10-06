import { Calendar, MapPin, Star, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import climbingWallSample from "@/assets/climbing-wall-sample.png";

// Generate random climbing holds positions
function getRandomDots(count: number) {
  const colors = ["#f87171", "#34d399", "#60a5fa", "#fbbf24", "#a78bfa", "#fb7185", "#38bdf8"];
  return Array.from({ length: count }).map((_, i) => ({
    top: `${Math.random() * 85 + 5}%`,    // 5% ~ 90%
    left: `${Math.random() * 85 + 5}%`,   // 5% ~ 90%
    color: colors[i % colors.length],
  }));
}

interface Route {
  id: number;
  image: string;
  difficulty: string;
  date: string;
  location: string;
  rating: number;
  notes: string;
  color: string;
}

export default function LogbookPage() {
  // Generate 8 random climbing holds
  const climbingDots = getRandomDots(8);

  // Example routes, V2 always uses "warning" color
  const routes: Route[] = [
    {
      id: 1,
      image: climbingWallSample,
      difficulty: "V4",
      date: "Today",
      location: "Boulder Gym",
      rating: 5,
      notes: "Nailed it! Perfect technique on the overhang 💪",
      color: "primary"
    },
    {
      id: 2,
      image: climbingWallSample,
      difficulty: "V3",
      date: "Yesterday",
      location: "Climb Zone",
      rating: 4,
      notes: "Great holds, challenging start sequence",
      color: "accent"
    },
    {
      id: 3,
      image: climbingWallSample,
      difficulty: "V5",
      date: "2 days ago",
      location: "Boulder Gym",
      rating: 3,
      notes: "Still working on this one... so close!",
      color: "secondary"
    },
    {
      id: 4,
      image: climbingWallSample,
      difficulty: "V2",
      date: "1 week ago",
      location: "Rock Hall",
      rating: 5,
      notes: "Perfect warm-up route! Love the flow ✨",
      color: "warning" // V2 always uses warning color
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-warning fill-warning" : "text-muted"
        }`}
      />
    ));
  };

  return (
    <>
      {/* Ensure Tailwind generates bg-warning class */}
      <div className="bg-warning" style={{ display: "none" }} />
      <div className="relative min-h-screen bg-gray-100 overflow-hidden">
        {/* Random climbing holds on the background (z-10) */}
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

        {/* Main content (z-20) */}
        <div className="relative z-20 space-y-6 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Routes 📖</h1>
              <p className="text-muted-foreground">Your climbing journey</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Route Cards */}
          <div className="space-y-4 px-4">
            {routes.map((route) => (
              <div key={route.id} className="card-kawaii hover:scale-[1.02] cursor-pointer">
                <div className="flex gap-4">
                  {/* Route Image */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={route.image}
                      alt={`Route ${route.difficulty}`}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-${route.color} flex items-center justify-center shadow-kawaii`}>
                      <span className="text-xs font-bold text-white">{route.difficulty}</span>
                    </div>
                  </div>

                  {/* Route Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{route.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{route.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(route.rating)}
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm text-foreground">{route.notes}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Route Button */}
          <div className="px-4">
            <Button className="w-full btn-kawaii text-lg py-6">
              📸 Add New Route
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="mx-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">This Month</p>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">28</p>
                  <p className="text-xs text-muted-foreground">Routes</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-accent">V4.2</p>
                  <p className="text-xs text-muted-foreground">Avg Grade</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-warning">9.2</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
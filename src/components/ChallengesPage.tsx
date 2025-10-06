import { useState } from "react";
import { Heart, X, Star, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const challenges: Challenge[] = [
    {
      id: 1,
      title: "Red Route Rush",
      description: "Complete 5 routes using only red holds! Show those crimson climbs who's boss 💪",
      difficulty: "V2-V4",
      timeLimit: "60 minutes",
      points: 150,
      emoji: "🔴",
      color: "hold-red",
      gradient: "from-hold-red to-hold-orange"
    },
    {
      id: 2,
      title: "Overhang Master",
      description: "Conquer 3 overhang routes in a single session. Time to defy gravity!",
      difficulty: "V3-V5",
      timeLimit: "2 hours",
      points: 200,
      emoji: "⛰️",
      color: "hold-blue",
      gradient: "from-hold-blue to-hold-cyan"
    },
    {
      id: 3,
      title: "Green Machine",
      description: "Complete the hardest green route in the gym. Go green or go home! ✨",
      difficulty: "V1-V3",
      timeLimit: "No limit",
      points: 100,
      emoji: "🟢",
      color: "hold-green",
      gradient: "from-hold-green to-hold-yellow"
    },
    {
      id: 4,
      title: "Speed Demon",
      description: "Complete any route in under 30 seconds. Fast and focused!",
      difficulty: "V1-V2",
      timeLimit: "30 seconds",
      points: 175,
      emoji: "⚡",
      color: "hold-purple",
      gradient: "from-hold-purple to-hold-pink"
    }
  ];

  const currentChallenge = challenges[currentCardIndex];

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    setSwipeAnimation(`animate-swipe-${direction}`);
    
    setTimeout(() => {
      if (direction === 'right') {
        // Liked - save challenge
        console.log(`Saved challenge: ${currentChallenge.title}`);
      } else if (direction === 'up') {
        // Super like - start challenge immediately
        console.log(`Starting challenge: ${currentChallenge.title}`);
      }
      
      setCurrentCardIndex((prev) => (prev + 1) % challenges.length);
      setSwipeAnimation(null);
    }, 300);
  };

  if (!currentChallenge) return null;

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="text-center space-y-2 px-4 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-foreground">Challenges ⚡</h1>
        <p className="text-muted-foreground">Swipe to find your next route!</p>
      </div>

      {/* Challenge Card Stack */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm">
          {/* Background Cards */}
          {challenges.slice(currentCardIndex + 1, currentCardIndex + 3).map((challenge, index) => (
            <div
              key={challenge.id}
              className={`absolute inset-0 card-kawaii transform transition-transform duration-300 ${
                index === 0 ? 'scale-95 translate-y-2' : 'scale-90 translate-y-4 opacity-60'
              }`}
              style={{ zIndex: -index - 1 }}
            >
              <div className={`h-96 bg-gradient-to-br ${challenge.gradient} rounded-xl`} />
            </div>
          ))}

          {/* Main Card */}
          <div className={`card-gym ${swipeAnimation || ''} relative z-10`}>
            <div className={`h-96 bg-gradient-to-br ${currentChallenge.gradient} rounded-xl p-6 text-white space-y-4 flex flex-col shadow-float`}>
              {/* Challenge Emoji & Title */}
              <div className="text-center space-y-2">
                <div className="text-4xl bounce-gentle">{currentChallenge.emoji}</div>
                <h2 className="text-xl font-bold">{currentChallenge.title}</h2>
              </div>

              {/* Challenge Details */}
              <div className="flex-1 space-y-4">
                <p className="text-sm opacity-90 leading-relaxed">
                  {currentChallenge.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4" />
                    <span>Difficulty: {currentChallenge.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Time: {currentChallenge.timeLimit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4" />
                    <span>{currentChallenge.points} points</span>
                  </div>
                </div>
              </div>

              {/* Swipe Hint */}
              <div className="text-center text-xs opacity-75 space-y-1">
                <p>👆 Swipe up to start now</p>
                <p>❤️ Swipe right to save • ❌ Swipe left to skip</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-8 px-4 py-6">
        <Button
          onClick={() => handleSwipe('left')}
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full border-destructive/30 hover:bg-destructive/10"
        >
          <X className="w-6 h-6 text-destructive" />
        </Button>

        <Button
          onClick={() => handleSwipe('up')}
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-r from-info to-info/80 hover:scale-110 transition-transform"
        >
          <Star className="w-6 h-6 text-white" />
        </Button>

        <Button
          onClick={() => handleSwipe('right')}
          variant="outline"
          size="lg"
          className="w-14 h-14 rounded-full border-success/30 hover:bg-success/10"
        >
          <Heart className="w-6 h-6 text-success" />
        </Button>
      </div>

      {/* Challenge Progress */}
      <div className="px-4 pb-4">
        <div className="flex justify-center gap-2">
          {challenges.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentCardIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
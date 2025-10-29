import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

const TIMER_PRESETS = [
  { label: "20 min", minutes: 20 },
  { label: "40 min", minutes: 40 },
  { label: "60 min", minutes: 60 },
];

const AFFIRMATIONS = [
  "You are progressing — one reflection at a time.",
  "Every small step counts toward your growth.",
  "Your focus is a superpower.",
  "Breathe. You're exactly where you need to be.",
  "Progress over perfection.",
];

const Focus = () => {
  const [timeLeft, setTimeLeft] = useState(20 * 60); // seconds
  const [isActive, setIsActive] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(20);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState(
    AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]
  );

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      toast.success("Focus session complete! Great work! 🎉");
      
      // Change affirmation
      setCurrentAffirmation(
        AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]
      );
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handleStart = () => {
    setIsActive(true);
    toast.success("Focus mode activated 🎯");
  };

  const handlePause = () => {
    setIsActive(false);
    toast.info("Focus paused");
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(selectedPreset * 60);
    toast.info("Timer reset");
  };

  const handlePresetChange = (minutes: number) => {
    setSelectedPreset(minutes);
    setTimeLeft(minutes * 60);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((selectedPreset * 60 - timeLeft) / (selectedPreset * 60)) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">🌙 Focus Mode</h1>
          <p className="text-muted-foreground">
            Distraction-free space for deep work and reflection
          </p>
        </header>

        {/* Timer Card */}
        <Card className="overflow-hidden shadow-2xl">
          <CardContent className="p-12 text-center">
            {/* Breathing Animation Background */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 breathe"
              />
            </div>

            {/* Timer Display */}
            <div className="relative z-10 mb-8">
              <div className="text-8xl font-bold mb-4 tabular-nums">
                {formatTime(timeLeft)}
              </div>
              
              {/* Progress Circle */}
              <svg className="mx-auto" width="200" height="200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="8"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-8">
              {!isActive ? (
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="rounded-full gap-2 px-8"
                >
                  <Play className="h-5 w-5" />
                  Start
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handlePause}
                  className="rounded-full gap-2 px-8"
                >
                  <Pause className="h-5 w-5" />
                  Pause
                </Button>
              )}
              
              <Button
                size="lg"
                variant="outline"
                onClick={handleReset}
                className="rounded-full gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                Reset
              </Button>

              <Button
                size="lg"
                variant="ghost"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="rounded-full"
              >
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Preset Buttons */}
            <div className="flex justify-center gap-3 mb-8">
              {TIMER_PRESETS.map((preset) => (
                <Button
                  key={preset.minutes}
                  variant={selectedPreset === preset.minutes ? "default" : "outline"}
                  onClick={() => handlePresetChange(preset.minutes)}
                  disabled={isActive}
                  className="rounded-full"
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Affirmation */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border">
              <p className="text-lg font-medium text-center italic">
                "{currentAffirmation}"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Tip: Use this space for deep work, journaling, or completing reflections without
            distractions
          </p>
        </div>
      </div>
    </div>
  );
};

export default Focus;

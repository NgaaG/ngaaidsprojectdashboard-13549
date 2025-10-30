import { Button } from "@/components/ui/button";
import { Mode } from "@/types";

interface OnboardingOverlayProps {
  onSelectMode: (mode: Mode) => void;
  onClose: () => void;
}

export const OnboardingOverlay = ({ onSelectMode, onClose }: OnboardingOverlayProps) => {
  const handleModeSelect = (mode: Mode) => {
    onSelectMode(mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in">
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-4xl w-full space-y-12 animate-scale-in">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              ADHD Creative Studio
            </h1>
            <p className="text-lg text-muted-foreground">
              My creative growth, visualized.
            </p>
          </div>

          {/* Mode Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Personal Mode Card */}
            <div className="bg-card rounded-3xl p-8 border-2 border-primary/30 hover:border-primary transition-all hover:scale-105 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 breathe flex items-center justify-center">
                    <span className="text-4xl">🪷</span>
                  </div>
                </div>
                <div className="space-y-3 text-center">
                  <h2 className="text-2xl font-bold text-foreground">Personal Mode</h2>
                  <h3 className="text-lg font-semibold text-primary">Time-Out Reflections</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Track emotions, capture thoughts, and grow insights. Each reflection auto-saves and visualizes my emotional journey.
                  </p>
                </div>
                <Button
                  onClick={() => handleModeSelect("personal")}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg rounded-full"
                >
                  🌱 Enter Personal Mode
                </Button>
              </div>
            </div>

            {/* Lecture Mode Card */}
            <div className="bg-card rounded-3xl p-8 border-2 border-secondary/30 hover:border-secondary transition-all hover:scale-105 shadow-lg pulse-glow">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                    <span className="text-4xl">📚</span>
                  </div>
                </div>
                <div className="space-y-3 text-center">
                  <h2 className="text-2xl font-bold text-foreground">Lecture Mode</h2>
                  <h3 className="text-lg font-semibold text-secondary">Mentorship Log</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Showcase sprints, visuals, and learning progress. Each entry syncs to my mentor dashboard automatically.
                  </p>
                </div>
                <Button
                  onClick={() => handleModeSelect("lecturer")}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 text-lg rounded-full"
                >
                  🎓 Enter Lecture Mode
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground italic">
              My creative growth, visualized.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

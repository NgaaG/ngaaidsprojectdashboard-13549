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
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 py-12">
        <div className="max-w-4xl w-full space-y-8 sm:space-y-12 animate-scale-in my-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Ngaa's Creative Studio
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A work progress dashboard that helps me (Ngaa) communicate my creative journey to my lecturers clearly—especially during moments of ADHD overwhelm, anxiety, or when verbal communication feels impossible. This visual system ensures my work speaks for itself.
            </p>
          </div>

          {/* Mode Cards */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Personal Mode Card */}
            <div className="bg-card rounded-3xl p-6 sm:p-8 border-2 border-primary/40 hover:border-primary transition-all hover:scale-105 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 breathe flex items-center justify-center shadow-lg">
                    <span className="text-4xl">🪷</span>
                  </div>
                </div>
                <div className="space-y-3 text-center">
                  <h2 className="text-2xl font-bold text-foreground">Personal Mode</h2>
                  <h3 className="text-lg font-semibold" style={{ color: 'hsl(270 60% 70%)' }}>My Emotional Regulation</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    My private space for tracking emotions, capturing thoughts during heightened anxiety or ADHD overwhelm, and visualizing my emotional patterns. This is for me—to understand myself better.
                  </p>
                </div>
                <Button
                  onClick={() => handleModeSelect("personal")}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg rounded-full shadow-md hover:shadow-lg"
                  style={{ backgroundColor: 'hsl(270 60% 70%)', color: 'white' }}
                >
                  🌱 Enter Personal Mode
                </Button>
              </div>
            </div>

            {/* Lecture Mode Card - EMPHASIZED FOR LECTURERS */}
            <div className="bg-card rounded-3xl p-6 sm:p-8 border-2 border-secondary hover:border-secondary transition-all hover:scale-105 shadow-xl lecture-highlight relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-secondary text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                  👨‍🏫 FOR LECTURERS
                </span>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center shadow-lg breathe">
                    <span className="text-4xl">📚</span>
                  </div>
                </div>
                <div className="space-y-3 text-center">
                  <h2 className="text-2xl font-extrabold text-foreground">Lecture Mode</h2>
                  <h3 className="text-lg font-bold" style={{ color: 'hsl(180 60% 65%)' }}>Consultation Prep & Progress Showcase</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    <strong>For my mentor &amp; expert studio lecturers.</strong> Pre and post-consultation logs, project progress, and visual documentation—ensuring you can see my work clearly even when I'm experiencing ADHD paralysis, anxiety attacks, or when verbal communication is challenging.
                  </p>
                </div>
                <Button
                  onClick={() => handleModeSelect("lecturer")}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white h-12 text-lg rounded-full shadow-lg hover:shadow-xl font-bold"
                  style={{ backgroundColor: 'hsl(180 60% 65%)' }}
                >
                  🎓 Enter Lecture Mode
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground italic">
              Designed by Ngaa to bridge communication during challenging moments ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

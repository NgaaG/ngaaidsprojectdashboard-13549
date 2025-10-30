import { Mode } from "@/types";
import { Button } from "@/components/ui/button";
import { User, GraduationCap } from "lucide-react";

interface ModeToggleProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="flex items-center gap-2 bg-card rounded-full p-1 shadow-sm border">
      <Button
        variant={mode === "personal" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("personal")}
        className="rounded-full gap-2"
      >
        <User className="h-4 w-4" />
        Personal
      </Button>
      <Button
        variant={mode === "lecturer" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("lecturer")}
        className="rounded-full gap-2 pulse-glow"
      >
        <GraduationCap className="h-4 w-4" />
        Lecturer
      </Button>
    </div>
  );
};

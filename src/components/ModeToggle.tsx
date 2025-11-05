import { Mode } from "@/types";
import { Button } from "@/components/ui/button";
import { User, GraduationCap } from "lucide-react";

interface ModeToggleProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <div className="flex items-center gap-2 bg-card rounded-full p-1 shadow-md border-2">
      <Button
        variant={mode === "personal" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("personal")}
        className="rounded-full gap-2 transition-all"
        style={mode === "personal" ? { 
          backgroundColor: 'hsl(270 60% 70%)', 
          color: 'white',
          fontWeight: '600'
        } : {}}
      >
        <User className="h-4 w-4" />
        Personal
      </Button>
      <Button
        variant={mode === "lecturer" ? "default" : "ghost"}
        size="sm"
        onClick={() => onModeChange("lecturer")}
        className="rounded-full gap-2 lecture-highlight font-bold transition-all"
        style={mode === "lecturer" ? { 
          backgroundColor: 'hsl(180 60% 65%)', 
          color: 'white',
          fontWeight: '700',
          boxShadow: '0 4px 12px hsl(180 60% 65% / 0.4)'
        } : {}}
      >
        <GraduationCap className="h-4 w-4" />
        <strong>Lecturer</strong>
      </Button>
    </div>
  );
};

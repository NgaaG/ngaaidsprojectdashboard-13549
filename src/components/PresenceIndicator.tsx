import { Eye } from "lucide-react";
import { usePresence } from "@/hooks/usePresence";
import { cn } from "@/lib/utils";

interface PresenceIndicatorProps {
  className?: string;
}

export const PresenceIndicator = ({ className }: PresenceIndicatorProps) => {
  const { studentOnline, lecturerCount } = usePresence('portfolio-viewers');

  return (
    <div className={cn("flex items-center gap-4 text-sm", className)}>
      {/* Student (Owner) Status */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Eye className="h-5 w-5 text-destructive" />
          <span 
            className={cn(
              "absolute -top-1 -right-1 h-3 w-3 rounded-full",
              studentOnline ? "bg-destructive animate-pulse" : "bg-muted"
            )}
          />
        </div>
        <span className="text-muted-foreground font-medium">
          You {studentOnline ? 'online' : 'offline'}
        </span>
      </div>

      {/* External Viewers (Lecturers) */}
      {lecturerCount > 0 && (
        <>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="relative">
              <Eye className="h-5 w-5 text-primary" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <span className="text-muted-foreground">
              {lecturerCount} viewer{lecturerCount !== 1 ? 's' : ''} online
            </span>
          </div>
        </>
      )}
    </div>
  );
};

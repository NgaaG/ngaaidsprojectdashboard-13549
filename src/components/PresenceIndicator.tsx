import { Eye } from "lucide-react";
import { usePresence } from "@/hooks/usePresence";
import { cn } from "@/lib/utils";

interface PresenceIndicatorProps {
  className?: string;
}

export const PresenceIndicator = ({ className }: PresenceIndicatorProps) => {
  const { viewerCount } = usePresence('portfolio-viewers');

  if (viewerCount <= 1) return null;

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <div className="relative">
        <Eye className="h-5 w-5 text-primary" />
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
      </div>
      <span className="text-muted-foreground">
        {viewerCount - 1} viewer{viewerCount - 1 !== 1 ? 's' : ''} online
      </span>
    </div>
  );
};

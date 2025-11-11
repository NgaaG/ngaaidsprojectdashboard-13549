import { Home, MessageCircle, Compass, TrendingUp, Moon, Eye } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useViewMode } from "@/hooks/useViewMode";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarProps {
  onHeartClick?: () => void;
}

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Compass, label: "Mentor/Lecturer Log", path: "/mentor-logs" },
  { icon: MessageCircle, label: "Reflections", path: "/reflections" },
  { icon: TrendingUp, label: "Growth", path: "/growth" },
  { icon: Moon, label: "Focus", path: "/focus" },
];

export const Sidebar = ({ onHeartClick }: SidebarProps) => {
  const location = useLocation();
  const { isViewerMode } = useViewMode();

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-8 gap-6 z-50">
      {isViewerMode && (
        <Badge variant="secondary" className="absolute top-2 left-1/2 -translate-x-1/2 text-xs flex items-center gap-1">
          <Eye className="h-3 w-3" />
          Viewer
        </Badge>
      )}
      <button
        onClick={onHeartClick}
        className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg mt-6 hover:scale-110 transition-transform cursor-pointer"
        title="View intro"
      >
        💜
      </button>

      <nav className="flex flex-col gap-4 mt-8 flex-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
                "hover:bg-sidebar-accent hover:scale-105",
                isActive && "bg-sidebar-accent shadow-md"
              )}
              title={label}
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-colors",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground"
                )}
              />
              <span className="text-[10px] font-medium text-sidebar-foreground">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <ThemeToggle />
      </div>
    </aside>
  );
};

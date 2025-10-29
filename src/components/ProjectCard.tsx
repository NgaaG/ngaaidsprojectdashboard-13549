import { Project } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const COMPETENCY_COLORS: Record<string, string> = {
  Research: "hsl(265 45% 80%)",
  Create: "hsl(160 55% 80%)",
  Organize: "hsl(195 60% 76%)",
  Communicate: "hsl(280 50% 75%)",
  Learn: "hsl(150 60% 75%)",
  "Unsure/TBD": "hsl(0 0% 70%)",
};

const MOOD_EMOJIS: Record<string, string> = {
  calm: "😌",
  anxious: "😰",
  focused: "🎯",
  overwhelmed: "😵",
  energized: "⚡",
};

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const borderColor = COMPETENCY_COLORS[project.competencies[0]];
  const moodEmoji = project.lastReflectionMood ? MOOD_EMOJIS[project.lastReflectionMood] : null;

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
      style={{ borderLeft: `4px solid ${borderColor}` }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">{project.name}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {project.competencies.map(comp => (
                <span
                  key={comp}
                  className="text-xs font-medium px-2 py-1 rounded-full inline-block"
                  style={{ backgroundColor: `${COMPETENCY_COLORS[comp]}40`, color: COMPETENCY_COLORS[comp] }}
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>
          {moodEmoji && (
            <span className="text-2xl" title={`Last mood: ${project.lastReflectionMood}`}>
              {moodEmoji}
            </span>
          )}
        </div>

        {project.visualUrl && (
          <div className="mb-3 rounded-lg overflow-hidden bg-muted h-32 flex items-center justify-center">
            <img
              src={project.visualUrl}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{project.completion}%</span>
          </div>
          <Progress value={project.completion} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

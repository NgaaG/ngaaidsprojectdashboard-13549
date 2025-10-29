import { useEffect, useState } from "react";
import { CompetencyWheel } from "@/components/CompetencyWheel";
import { ProjectCard } from "@/components/ProjectCard";
import { ModeToggle } from "@/components/ModeToggle";
import { getProjects, getCompetencyProgress, getMode, setMode } from "@/lib/storage";
import { Mode, Project, CompetencyProgress } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Home = () => {
  const [mode, setModeState] = useState<Mode>(getMode());
  const [projects, setProjects] = useState<Project[]>([]);
  const [competencyProgress, setCompetencyProgress] = useState<CompetencyProgress>(
    getCompetencyProgress()
  );

  useEffect(() => {
    setProjects(getProjects());
    setCompetencyProgress(getCompetencyProgress());
  }, []);

  const handleModeChange = (newMode: Mode) => {
    setModeState(newMode);
    setMode(newMode);
  };

  return (
    <div className="min-h-screen">
      {/* Animated gradient header */}
      <header className="gradient-calm bg-[length:200%_200%] py-16 px-8 rounded-b-3xl shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                ADHD Creative Studio
              </h1>
              <p className="text-muted-foreground">
                Track your progress with clarity and calm
              </p>
            </div>
            <ModeToggle mode={mode} onModeChange={handleModeChange} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Competency Wheel Centerpiece */}
        <section className="mb-16 flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            CMD Competency Wheel
          </h2>
          <CompetencyWheel progress={competencyProgress} size={350} />
        </section>

        {/* Project Snapshot Cards */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {mode === "personal" ? "My Projects" : "Project Portfolio"}
            </h2>
            <Button className="gap-2 rounded-full">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border-2 border-dashed">
              <p className="text-muted-foreground text-lg mb-4">
                No projects yet. Create your first one!
              </p>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>

        {/* Mode-specific content */}
        {mode === "lecturer" && (
          <section className="mt-12 bg-secondary/20 rounded-2xl p-8 border border-secondary">
            <h3 className="text-xl font-semibold mb-4">📊 Portfolio Summary</h3>
            <p className="text-muted-foreground mb-4">
              View comprehensive learning evidence and mentor session insights.
            </p>
            <div className="flex gap-4">
              <Button variant="outline">View Mentor Logs</Button>
              <Button variant="outline">Export Summary</Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;

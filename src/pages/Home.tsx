import { useEffect, useState } from "react";
import { CompetencyWheel } from "@/components/CompetencyWheel";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectDialog } from "@/components/ProjectDialog";
import { ProjectDetailView } from "@/components/ProjectDetailView";
import { ModeToggle } from "@/components/ModeToggle";
import { OnboardingOverlay } from "@/components/OnboardingOverlay";
import { getMode, setMode } from "@/lib/storage";
import { Mode, Project, CompetencyProgress } from "@/types";
import { Button } from "@/components/ui/button";
import { Download, HelpCircle } from "lucide-react";
import { db } from "@/lib/supabaseHelpers";
import { exportToJSON, exportToCSV } from "@/lib/exportUtils";
import { toast } from "sonner";

const Home = () => {
  const [mode, setModeState] = useState<Mode>(getMode());
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [competencyProgress, setCompetencyProgress] = useState<CompetencyProgress>({
    Research: 0,
    Create: 0,
    Organize: 0,
    Communicate: 0,
    Learn: 0,
    "Unsure/TBD": 0,
  });

  // Check if first visit
  useEffect(() => {
    const hasSeenOnboarding = sessionStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
      sessionStorage.setItem("hasSeenOnboarding", "true");
    }
  }, []);

  const loadData = async () => {
    // Load projects
    const { data: projectsData } = await db
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectsData) {
      const mappedProjects: Project[] = projectsData.map((p: any) => ({
        id: p.id,
        name: p.name,
        completion: p.completion,
        competencies: p.competencies || ["Create"],
        visualUrl: p.visual_url,
        lastReflectionMood: p.last_reflection_mood,
        description: p.description,
        figmaLink: p.figma_link,
        githubLink: p.github_link,
        mode: p.mode || "personal",
        learningGoals: p.learning_goals,
        keyTasks: p.key_tasks,
      }));
      
      // Filter projects by current mode
      const filteredProjects = mappedProjects.filter(p => p.mode === mode);
      setProjects(filteredProjects);
    }

    const filteredProjects = projects.filter(p => p.mode === mode);

    // Load competency progress
    const { data: progressData } = await db
      .from("competency_progress")
      .select("*")
      .maybeSingle();

    if (progressData) {
      setCompetencyProgress({
        Research: progressData.research,
        Create: progressData.create_score,
        Organize: progressData.organize,
        Communicate: progressData.communicate,
        Learn: progressData.learn,
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [mode]);

  const handleModeChange = (newMode: Mode) => {
    setModeState(newMode);
    setMode(newMode);
  };

  const handleExportJSON = async () => {
    const { data: reflections } = await db
      .from("reflections")
      .select("*");

    const { data: mentorLogs } = await db
      .from("mentor_logs")
      .select("*");

    const exportData = {
      reflections,
      mentorLogs,
      projects,
      competencyProgress,
      exportedAt: new Date().toISOString(),
    };

    exportToJSON(exportData, "adhd-studio-export.json");
    toast.success("Data exported successfully!");
  };

  const handleExportCSV = async () => {
    const { data: reflections } = await db
      .from("reflections")
      .select("*");

    const { data: mentorLogs } = await db
      .from("mentor_logs")
      .select("*");

    if (reflections && mentorLogs) {
      exportToCSV(
        reflections.map((r: any) => ({
          id: r.id,
          timestamp: r.created_at,
          mood: r.mood,
          emotionalDump: r.emotional_dump,
          thoughtsWhatIThink: r.thoughts_what_i_think,
          thoughtsWhatIsTrue: r.thoughts_what_is_true,
          contingencyPlan: r.contingency_plan,
          todoList: r.todo_list,
          progress: r.progress,
          sentiment: r.sentiment,
        })),
        mentorLogs.map((m: any) => ({
          id: m.id,
          timestamp: m.created_at,
          date: m.date,
          title: m.title,
          keyGoals: m.key_goals,
          outcomes: m.outcomes,
          competency: m.competency,
          evidenceImages: m.evidence_images,
        })),
        "adhd-studio-data.csv"
      );
      toast.success("CSV exported successfully!");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <OnboardingOverlay
          onSelectMode={(selectedMode) => {
            handleModeChange(selectedMode);
          }}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {/* Animated gradient header */}
      <header className="gradient-calm bg-[length:200%_200%] py-16 px-8 rounded-b-3xl shadow-lg relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                ADHD Creative Studio
              </h1>
              <p className="text-muted-foreground">
                Track my progress with clarity and calm
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowOnboarding(true)}
                className="rounded-full hover:bg-primary/20"
                title="Show onboarding"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button variant="outline" onClick={handleExportJSON} className="gap-2">
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
              <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <ModeToggle mode={mode} onModeChange={handleModeChange} />
            </div>
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
            <ProjectDialog onProjectCreated={loadData} currentMode={mode} />
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border-2 border-dashed">
              <p className="text-muted-foreground text-lg mb-4">
                No projects yet. Create my first one!
              </p>
              <ProjectDialog onProjectCreated={loadData} currentMode={mode} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => {
                    setSelectedProject(project);
                    setDetailViewOpen(true);
                  }}
                />
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

      {selectedProject && (
        <ProjectDetailView
          project={selectedProject}
          mode={mode}
          open={detailViewOpen}
          onOpenChange={setDetailViewOpen}
          onUpdate={loadData}
        />
      )}
    </div>
  );
};

export default Home;

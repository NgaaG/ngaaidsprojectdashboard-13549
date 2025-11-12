import { useEffect, useState } from "react";
import { CompetencyWheel } from "@/components/CompetencyWheel";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectDialog } from "@/components/ProjectDialog";
import { ProjectDetailView } from "@/components/ProjectDetailView";
import { ModeToggle } from "@/components/ModeToggle";
import { PresenceIndicator } from "@/components/PresenceIndicator";
import { getMode, setMode } from "@/lib/storage";
import { Mode, Project, CompetencyProgress } from "@/types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { db } from "@/lib/supabaseHelpers";
import { exportToJSON, exportToCSV } from "@/lib/exportUtils";
import { toast } from "sonner";
import { useViewMode } from "@/hooks/useViewMode";

const Home = () => {
  const { isViewerMode } = useViewMode();
  const [mode, setModeState] = useState<Mode>(getMode());
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [competencyProgress, setCompetencyProgress] = useState<CompetencyProgress>({
    Research: 0,
    Create: 0,
    Organize: 0,
    Communicate: 0,
    Learn: 0,
    "Unsure/TBD": 0,
  });

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
        learningGoalsAchievements: p.learning_goals_achievements,
        keyTasks: p.key_tasks,
      }));
      
      // Filter projects by current mode
      const filteredProjects = mappedProjects.filter(p => p.mode === mode);
      setProjects(filteredProjects);
      
      // Update selectedProject if it exists
      if (selectedProject) {
        const updatedSelectedProject = mappedProjects.find(p => p.id === selectedProject.id);
        if (updatedSelectedProject) {
          setSelectedProject(updatedSelectedProject);
        }
      }
    }

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
      {/* Live Presence Indicator - Top of Page */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-b border-border py-3 px-4 sm:px-8 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <PresenceIndicator />
        </div>
      </div>

      {/* Dashboard Intro Panel */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/10 to-background py-6 sm:py-8 px-4 sm:px-8 border-b-2 border-border animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-3">
            ✨ Ngaa's Creative Studio
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
            A work progress dashboard that allows me (Ngaa) to communicate my creative journey to my lecturers clearly—especially during moments of ADHD overwhelm, anxiety, or when verbal communication feels impossible. This visual system ensures my work speaks for itself.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="bg-card p-4 sm:p-6 rounded-2xl border shadow-sm" style={{ borderColor: 'hsl(270 60% 70% / 0.3)' }}>
              <h3 className="font-semibold text-base sm:text-lg mb-2 flex items-center gap-2" style={{ color: 'hsl(270 60% 70%)' }}>
                <span className="text-xl sm:text-2xl">🪷</span> Personal Mode
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                My private space for tracking emotions during heightened anxiety or ADHD overwhelm—for my own emotional regulation and self-understanding.
              </p>
            </div>
            
            <div className="bg-card p-4 sm:p-6 rounded-2xl border shadow-lg lecture-highlight" style={{ borderColor: 'hsl(180 60% 65% / 0.5)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl sm:text-2xl">🎓</span>
                <h3 className="font-bold text-base sm:text-lg" style={{ color: 'hsl(180 60% 65%)' }}>
                  <strong>Lecture Mode</strong>
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'hsl(180 60% 65%)', color: 'white' }}>
                  FOR LECTURERS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <strong>For my mentor & expert studio lecturers.</strong> Pre and post-consultation logs, project progress, and visual documentation—ensuring you can see my work clearly even when I'm experiencing ADHD paralysis, anxiety attacks, or when verbal communication is challenging.
              </p>
            </div>
          </div>

          <div className="bg-card/50 p-4 sm:p-6 rounded-2xl border backdrop-blur-sm space-y-3">
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium mb-1">🎯 Purpose:</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Bridge communication during challenging moments—visualize progress when words fail.
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium mb-1">⚡ Features:</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Auto-generated templates, consultation prep & logs, real-time progress tracking.
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium mb-1">🔒 Privacy:</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Personal mode = my emotional regulation. Lecture mode = accessible to my educators.
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium mb-1">🌱 Design:</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Created by Ngaa to ensure my creative growth is visible, even when I'm not verbal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Poster Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-8 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-3xl group">
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img 
              src={new URL('../assets/portfolio-poster.png', import.meta.url).href}
              alt="Ngaa Gjonaj Portfolio Poster"
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* Header with controls */}
      <header className="bg-background py-4 sm:py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">My Dashboard</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Track my progress with clarity and calm
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {!isViewerMode && (
              <>
                <Button variant="outline" size="sm" onClick={handleExportJSON} className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Export</span> JSON
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-10">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Export</span> CSV
                </Button>
              </>
            )}
            <ModeToggle mode={mode} onModeChange={handleModeChange} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
        {/* Competency Wheel Centerpiece */}
        <section className="mb-8 sm:mb-16 flex flex-col items-center">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-8 text-center">
            CMD Competency Wheel
          </h2>
          <div className="w-full max-w-[280px] sm:max-w-none">
            <CompetencyWheel progress={competencyProgress} size={Math.min(350, window.innerWidth - 80)} />
          </div>
        </section>

        {/* Project Snapshot Cards */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <h2 className="text-xl sm:text-2xl font-semibold">
              {mode === "personal" ? "My Projects" : "Project Portfolio"}
            </h2>
            {!isViewerMode && <ProjectDialog onProjectCreated={loadData} currentMode={mode} />}
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border-2 border-dashed">
              <p className="text-muted-foreground text-lg mb-4">
                {isViewerMode ? "No projects available" : "No projects yet. Create my first one!"}
              </p>
              {!isViewerMode && <ProjectDialog onProjectCreated={loadData} currentMode={mode} />}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, idx) => (
                <div key={project.id} className="stagger-item" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <ProjectCard
                    project={project}
                    onClick={() => {
                      setSelectedProject(project);
                      setDetailViewOpen(true);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Mode-specific content */}
        {mode === "lecturer" && (
          <section className="mt-8 sm:mt-12 bg-secondary/20 rounded-2xl p-4 sm:p-8 border border-secondary">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">📊 Portfolio Summary</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
              View comprehensive learning evidence and mentor session insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">View Mentor Logs</Button>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">Export Summary</Button>
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
          isViewerMode={isViewerMode}
        />
      )}
    </div>
  );
};

export default Home;

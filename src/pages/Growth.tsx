import { useEffect, useState } from "react";
import { CompetencyWheel } from "@/components/CompetencyWheel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PresenceIndicator } from "@/components/PresenceIndicator";
import {
  getCompetencyProgress,
  updateCompetencyProgress,
  getMentorLogs,
  getReflections,
} from "@/lib/storage";
import { CompetencyProgress, Competency } from "@/types";
import { TrendingUp, Award, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/supabaseHelpers";
import { calculateCompetencyProgressFromProjects } from "@/lib/growthCalculations";

const COMPETENCIES: Competency[] = ["Research", "Create", "Organize", "Communicate", "Learn"];

const COMPETENCY_COLORS: Record<Competency, string> = {
  Research: "hsl(265 45% 80%)",
  Create: "hsl(160 55% 80%)",
  Organize: "hsl(195 60% 76%)",
  Communicate: "hsl(280 50% 75%)",
  Learn: "hsl(150 60% 75%)",
  "Unsure/TBD": "hsl(0 0% 70%)",
};

const Growth = () => {
  const [progress, setProgress] = useState<CompetencyProgress>(getCompetencyProgress());
  const [stats, setStats] = useState({
    totalReflections: 0,
    totalMentorLogs: 0,
    averageProgress: 0,
  });
  const [isAutoCalculating, setIsAutoCalculating] = useState(false);

  useEffect(() => {
    loadStats();
  }, [progress]);

  const loadStats = async () => {
    const reflections = getReflections();
    const mentorLogs = getMentorLogs();
    const totalProgress = Object.values(progress).reduce((sum, val) => sum + val, 0);
    const avgProgress = totalProgress / COMPETENCIES.length;

    setStats({
      totalReflections: reflections.length,
      totalMentorLogs: mentorLogs.length,
      averageProgress: Math.round(avgProgress),
    });
  };

  const autoCalculateProgress = async () => {
    setIsAutoCalculating(true);
    try {
      // Fetch all projects from database
      const { data: projects, error } = await db
        .from("projects")
        .select("*");

      if (error) throw error;

      if (projects && projects.length > 0) {
        // Calculate progress from projects
        const calculatedProgress = calculateCompetencyProgressFromProjects(projects);
        
        // Update state and storage
        setProgress(calculatedProgress);
        COMPETENCIES.forEach((comp) => {
          updateCompetencyProgress(comp, calculatedProgress[comp] || 0);
        });

        toast.success("Progress auto-calculated from all projects!");
      } else {
        toast.info("No projects found to calculate from");
      }
    } catch (error: any) {
      toast.error("Failed to auto-calculate progress");
      console.error(error);
    } finally {
      setIsAutoCalculating(false);
    }
  };

  const handleProgressChange = (competency: Competency, value: number) => {
    const newProgress = { ...progress, [competency]: value };
    setProgress(newProgress);
    updateCompetencyProgress(competency, value);
    toast.success(`${competency} updated to ${value}%`);
  };

  return (
    <div className="min-h-screen">
      {/* Live Presence Indicator - Top of Page */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-b border-border py-3 px-4 sm:px-8 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <PresenceIndicator />
        </div>
      </div>
      
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📊 Growth Visualization</h1>
          <p className="text-muted-foreground">
            Track your learning journey across all CMD competencies
          </p>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card hover-lift stagger-item">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Reflections</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{stats.totalReflections}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center pulse-ring">
                  💭
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift stagger-item" style={{ animationDelay: '0.1s' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mentor Sessions</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">{stats.totalMentorLogs}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center pulse-ring">
                  🧭
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift stagger-item" style={{ animationDelay: '0.2s' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Progress</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">{stats.averageProgress}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center pulse-ring">
                  <TrendingUp className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Competency Wheel */}
        <section className="mb-12 animate-fade-in">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  CMD Competency Wheel
                </CardTitle>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={autoCalculateProgress}
                  disabled={isAutoCalculating}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isAutoCalculating ? 'animate-spin' : ''}`} />
                  Auto-Calculate
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Progress automatically reflects learning goals satisfaction from all projects
              </p>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <CompetencyWheel progress={progress} size={400} />
            </CardContent>
          </Card>
        </section>

        {/* Progress Sliders */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Adjust Competency Progress</h2>
          <div className="space-y-6">
            {COMPETENCIES.map((comp) => {
              const color = COMPETENCY_COLORS[comp];
              const value = progress[comp] || 0;
              
              return (
                <Card key={comp} className="glass-card hover-lift stagger-item" style={{ animationDelay: `${COMPETENCIES.indexOf(comp) * 0.05}s` }}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full shadow-lg transition-transform hover:scale-150"
                            style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
                          />
                          <h3 className="font-semibold">{comp}</h3>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{value}%</span>
                      </div>
                      
                      <Slider
                        value={[value]}
                        onValueChange={(vals) => handleProgressChange(comp, vals[0])}
                        max={100}
                        step={5}
                        className="cursor-pointer"
                      />
                      
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Beginner</span>
                        <span>Intermediate</span>
                        <span>Advanced</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Growth Insights */}
        <section className="mt-12">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2">
            <CardHeader>
              <CardTitle>🌱 Growth Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm">
                  <strong>Strongest Area:</strong>{" "}
                  {COMPETENCIES.reduce((max, comp) =>
                    (progress[comp] || 0) > (progress[max] || 0) ? comp : max
                  )}
                </p>
                <p className="text-sm">
                  <strong>Focus Area:</strong>{" "}
                  {COMPETENCIES.reduce((min, comp) =>
                    (progress[comp] || 0) < (progress[min] || 0) ? comp : min
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Keep documenting your reflections and mentor sessions to track progress
                  automatically!
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
        </div>
      </div>
    </div>
  );
};

export default Growth;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { PresenceIndicator } from "@/components/PresenceIndicator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Calendar, Edit } from "lucide-react";
import { Competency, Mode } from "@/types";
import { db } from "@/lib/supabaseHelpers";
import { toast } from "sonner";
import { ModeToggle } from "@/components/ModeToggle";
import { useViewMode } from "@/hooks/useViewMode";
import { MentorLogDetailView } from "@/components/MentorLogDetailView";
import { useSearchParams } from "react-router-dom";

const COMPETENCIES: Competency[] = ["Research", "Create", "Organize", "Communicate", "Learn", "Unsure/TBD"];

const COMPETENCY_COLORS: Record<Competency, string> = {
  Research: "hsl(265 45% 80%)",
  Create: "hsl(160 55% 80%)",
  Organize: "hsl(195 60% 76%)",
  Communicate: "hsl(280 50% 75%)",
  Learn: "hsl(150 60% 75%)",
  "Unsure/TBD": "hsl(0 0% 70%)",
};

const MentorLogs = () => {
  const { isViewerMode } = useViewMode();
  const [logs, setLogs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<Mode>("lecturer");
  const [editingLog, setEditingLog] = useState<any | null>(null);
  const [detailViewLog, setDetailViewLog] = useState<any | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [unreadLogIds, setUnreadLogIds] = useState<Set<string>>(new Set());
  const [logViews, setLogViews] = useState<Record<string, string>>({});
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "",
    keyGoals: [] as string[],
    outcomes: [] as string[],
    mentorComments: "",
    competencies: ["Create"] as Competency[],
    projectIds: [] as string[],
    selectedTaskIds: [] as string[],
    lecturer: "",
  });
  const [newGoalInput, setNewGoalInput] = useState("");
  const [newOutcomeInput, setNewOutcomeInput] = useState("");

  useEffect(() => {
    loadData();

    // Real-time subscription for mentor logs
    const channel = db
      .channel('mentor-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentor_logs'
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, [currentMode]);

  // Handle logId from query params (when navigating from project detail view)
  useEffect(() => {
    const logId = searchParams.get('logId');
    if (logId && logs.length > 0) {
      const log = logs.find(l => l.id === logId);
      if (log) {
        setDetailViewLog(log);
        // Clear the query param
        setSearchParams({});
      }
    }
  }, [searchParams, logs]);

  const loadData = async () => {
    const { data: projectsData } = await db
      .from("projects")
      .select("*")
      .eq("mode", currentMode)
      .order("name");
    if (projectsData) setProjects(projectsData);

    // Fetch logs without the automatic join (since project_ids is an array now)
    const { data: logsData } = await db
      .from("mentor_logs")
      .select("*")
      .order("created_at", { ascending: false });
    
    // Fetch log views to check for unread updates
    const { data: viewsData } = await db
      .from("mentor_log_views")
      .select("*");
    
    const viewsMap: Record<string, string> = {};
    if (viewsData) {
      viewsData.forEach(view => {
        viewsMap[view.mentor_log_id] = view.last_viewed_at;
      });
    }
    setLogViews(viewsMap);
    
    if (logsData && projectsData) {
      // Manually attach project data to each log and check for unread status
      const logsWithProjects = logsData.map(log => {
        if (log.project_ids && log.project_ids.length > 0) {
          const logProjects = projectsData.filter(p => 
            log.project_ids.includes(p.id)
          );
          return { ...log, projects: logProjects };
        }
        return log;
      });
      setLogs(logsWithProjects);
      
      // Check for unread logs (updated after last view)
      const unread = new Set<string>();
      logsData.forEach(log => {
        const lastViewed = viewsMap[log.id];
        if (lastViewed && new Date(log.updated_at) > new Date(lastViewed)) {
          unread.add(log.id);
        }
      });
      setUnreadLogIds(unread);
    } else if (logsData) {
      setLogs(logsData);
    }
  };

  const filteredLogs = logs.filter(log => (log.mode || "lecturer") === currentMode);

  const toggleCompetency = (comp: Competency) => {
    setNewLog(prev => ({
      ...prev,
      competencies: prev.competencies.includes(comp)
        ? prev.competencies.filter(c => c !== comp)
        : [...prev.competencies, comp]
    }));
  };

  const handleOpenEdit = (log: any) => {
    setEditingLog(log);
    setNewLog({
      date: log.date,
      title: log.title,
      keyGoals: log.key_goals || [],
      outcomes: log.outcomes || [],
      mentorComments: log.mentor_comments || "",
      competencies: log.competencies || ["Create"],
      projectIds: log.project_ids || [],
      selectedTaskIds: log.selected_task_ids || [],
      lecturer: log.lecturer || "",
    });
    setIsDialogOpen(true);
  };

  const handleCardClick = async (log: any) => {
    setDetailViewLog(log);
    
    // Mark log as viewed
    const { error } = await db
      .from("mentor_log_views")
      .upsert({
        mentor_log_id: log.id,
        last_viewed_at: new Date().toISOString(),
      }, {
        onConflict: 'mentor_log_id'
      });
    
    if (!error) {
      // Remove from unread list
      setUnreadLogIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(log.id);
        return newSet;
      });
    }
  };

  const handleSave = async () => {
    if (!newLog.title.trim()) {
      toast.error("Please add a title");
      return;
    }

    if (newLog.competencies.length === 0) {
      toast.error("Please select at least one competency");
      return;
    }

    try {
      if (editingLog) {
        // Update existing log
        const { error } = await db.from("mentor_logs").update({
          date: newLog.date,
          title: newLog.title,
          key_goals: newLog.keyGoals,
          outcomes: newLog.outcomes,
          mentor_comments: newLog.mentorComments || null,
          competencies: newLog.competencies,
          project_ids: newLog.projectIds.length > 0 ? newLog.projectIds : null,
          selected_task_ids: newLog.selectedTaskIds.length > 0 ? newLog.selectedTaskIds : null,
          lecturer: newLog.lecturer || null,
        }).eq("id", editingLog.id);

        if (error) throw error;
        toast.success("Mentor log updated!");
      } else {
        // Create new log
        const { error } = await db.from("mentor_logs").insert({
          date: newLog.date,
          title: newLog.title,
          key_goals: newLog.keyGoals,
          outcomes: newLog.outcomes,
          mentor_comments: newLog.mentorComments || null,
          competencies: newLog.competencies,
          project_ids: newLog.projectIds.length > 0 ? newLog.projectIds : null,
          selected_task_ids: newLog.selectedTaskIds.length > 0 ? newLog.selectedTaskIds : null,
          lecturer: newLog.lecturer || null,
          mode: currentMode,
        });

        if (error) throw error;
        toast.success("Mentor log saved!");
      }

      setIsDialogOpen(false);
      setEditingLog(null);
      loadData();

      // Reset form
      setNewLog({
        date: new Date().toISOString().split("T")[0],
        title: "",
        keyGoals: [],
        outcomes: [],
        mentorComments: "",
        competencies: ["Create"],
        projectIds: [],
        selectedTaskIds: [],
        lecturer: "",
      });
      setNewGoalInput("");
      setNewOutcomeInput("");
    } catch (error: any) {
      toast.error(error.message || "Failed to save mentor log");
    }
  };

  const handleDelete = async (id: string) => {
    const logToDelete = logs.find(l => l.id === id);
    
    try {
      const { error } = await db.from("mentor_logs").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Mentor log deleted", {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              const { error: insertError } = await db.from("mentor_logs").insert(logToDelete);
              if (insertError) throw insertError;
              toast.success("Log restored");
              loadData();
            } catch (error: any) {
              toast.error("Failed to restore log");
            }
          }
        }
      });
      
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete mentor log");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Live Presence Indicator - Top of Page */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-b border-border py-3 px-4 sm:px-8 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <PresenceIndicator />
        </div>
      </div>
      
      <div className="py-8 px-4 animate-fade-in">
        <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">🧭 Mentor/Lecture Consult Log</h1>
              <p className="text-muted-foreground">
                Document mentorship sessions and learning evidence
              </p>
            </div>
            <ModeToggle mode={currentMode} onModeChange={setCurrentMode} />
          </div>

          {/* New Mentor Log Button */}
          {!isViewerMode && (
            <div className="flex justify-end mb-6">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 rounded-full">
                    <Plus className="h-4 w-4" />
                    New Mentor Log
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                    {editingLog ? "Edit Mentor Log" : `Add New Mentor Log (${currentMode === "personal" ? "Personal" : "Lecture"} Mode)`}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="projects">Projects & Tasks (optional)</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Select projects to reference and their tasks for consultation
                    </p>
                    <div className="space-y-3">
                      {projects.map((project) => {
                        const isProjectSelected = newLog.projectIds.includes(project.id);
                        const projectTasks = project.key_tasks || [];
                        
                        return (
                          <div key={project.id} className="border rounded-lg p-4 bg-muted/20">
                            <div className="flex items-start space-x-3 mb-3">
                              <Checkbox
                                id={`project-${project.id}`}
                                checked={isProjectSelected}
                                onCheckedChange={(checked) => {
                                  setNewLog(prev => ({
                                    ...prev,
                                    projectIds: checked
                                      ? [...prev.projectIds, project.id]
                                      : prev.projectIds.filter(id => id !== project.id),
                                    // Remove tasks from deselected project
                                    selectedTaskIds: checked
                                      ? prev.selectedTaskIds
                                      : prev.selectedTaskIds.filter(taskId => 
                                          !projectTasks.some((t: any) => t.id === taskId)
                                        )
                                  }));
                                }}
                              />
                              <label
                                htmlFor={`project-${project.id}`}
                                className="font-medium text-sm cursor-pointer flex-1"
                              >
                                {project.name}
                              </label>
                            </div>

                            {/* Show tasks if project is selected */}
                            {isProjectSelected && projectTasks.length > 0 && (
                              <div className="ml-7 pl-4 border-l-2 space-y-2 max-h-40 overflow-y-auto">
                                <p className="text-xs text-muted-foreground mb-2">Select tasks:</p>
                                {projectTasks.map((task: any) => (
                                  <div key={task.id} className="flex items-start space-x-2">
                                    <Checkbox
                                      id={`task-${task.id}`}
                                      checked={newLog.selectedTaskIds.includes(task.id)}
                                      onCheckedChange={(checked) => {
                                        setNewLog(prev => ({
                                          ...prev,
                                          selectedTaskIds: checked
                                            ? [...prev.selectedTaskIds, task.id]
                                            : prev.selectedTaskIds.filter(id => id !== task.id)
                                        }));
                                      }}
                                    />
                                    <label
                                      htmlFor={`task-${task.id}`}
                                      className="text-sm leading-tight cursor-pointer flex-1"
                                    >
                                      <span className="font-medium">{task.name}</span>
                                      {task.status && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                          ({task.status === "completed" ? "✅" : task.status === "not-completed" ? "🕓" : "🔮"})
                                        </span>
                                      )}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        type="date"
                        value={newLog.date}
                        onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Competencies (select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-3 mt-3 p-4 bg-muted/50 rounded-lg">
                      {COMPETENCIES.map((comp) => (
                        <div key={comp} className="flex items-center space-x-2">
                          <Checkbox
                            id={comp}
                            checked={newLog.competencies.includes(comp)}
                            onCheckedChange={() => toggleCompetency(comp)}
                          />
                          <label
                            htmlFor={comp}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {comp}
                          </label>
                        </div>
                      ))}
                    </div>
                    {newLog.competencies.length === 0 && (
                      <p className="text-xs text-destructive mt-2">Select at least one competency</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="title">Session Title</Label>
                    <Input
                      placeholder="e.g., Portfolio Review Session"
                      value={newLog.title}
                      onChange={(e) => setNewLog({ ...newLog, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lecturer">Lecturer/Mentor</Label>
                    <Select value={newLog.lecturer} onValueChange={(value) => setNewLog({ ...newLog, lecturer: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lecturer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Marc (mentor)">Marc (mentor)</SelectItem>
                        <SelectItem value="Thomas">Thomas</SelectItem>
                        <SelectItem value="Tjerk">Tjerk</SelectItem>
                        <SelectItem value="Raymond">Raymond</SelectItem>
                        <SelectItem value="Jop">Jop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-6 border rounded-lg p-5 bg-muted/20">
                    <div className="border-b pb-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        📝 Student Section
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">Pre-session goals and post-session reflections</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="goals" className="text-sm font-medium">Key Goals (Pre-Session)</Label>
                      <p className="text-xs text-muted-foreground mb-2">What do you hope to achieve in this session?</p>
                      <div className="space-y-2">
                        {newLog.keyGoals.map((goal, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded border">
                            <span className="flex-1 text-sm">{goal}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setNewLog({
                                  ...newLog,
                                  keyGoals: newLog.keyGoals.filter((_, i) => i !== index)
                                });
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a goal..."
                            value={newGoalInput}
                            onChange={(e) => setNewGoalInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newGoalInput.trim()) {
                                setNewLog({
                                  ...newLog,
                                  keyGoals: [...newLog.keyGoals, newGoalInput.trim()]
                                });
                                setNewGoalInput("");
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (newGoalInput.trim()) {
                                setNewLog({
                                  ...newLog,
                                  keyGoals: [...newLog.keyGoals, newGoalInput.trim()]
                                });
                                setNewGoalInput("");
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="outcomes" className="text-sm font-medium">Outcomes / Notes (Post-Session)</Label>
                      <p className="text-xs text-muted-foreground mb-2">What did you learn, achieve, or discover?</p>
                      <div className="space-y-2">
                        {newLog.outcomes.map((outcome, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded border">
                            <span className="flex-1 text-sm">{outcome}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setNewLog({
                                  ...newLog,
                                  outcomes: newLog.outcomes.filter((_, i) => i !== index)
                                });
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add an outcome..."
                            value={newOutcomeInput}
                            onChange={(e) => setNewOutcomeInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newOutcomeInput.trim()) {
                                setNewLog({
                                  ...newLog,
                                  outcomes: [...newLog.outcomes, newOutcomeInput.trim()]
                                });
                                setNewOutcomeInput("");
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (newOutcomeInput.trim()) {
                                setNewLog({
                                  ...newLog,
                                  outcomes: [...newLog.outcomes, newOutcomeInput.trim()]
                                });
                                setNewOutcomeInput("");
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border rounded-lg p-5 bg-accent/5">
                    <div className="border-b pb-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        🎓 Lecturer Section
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">Mentor feedback, resources, and guidance</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="mentorComments" className="text-sm font-medium">Comments / Resources / Suggestions</Label>
                      <p className="text-xs text-muted-foreground mb-2">Add feedback, links, or next-step recommendations</p>
                      <Textarea
                        placeholder="• Feedback on progress&#10;• Suggested resources: [link]&#10;• Next steps or challenges to consider..."
                        value={newLog.mentorComments}
                        onChange={(e) => setNewLog({ ...newLog, mentorComments: e.target.value })}
                        className="min-h-32 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingLog(null);
                      setNewLog({
                        date: new Date().toISOString().split("T")[0],
                        title: "",
                        keyGoals: [],
                        outcomes: [],
                        mentorComments: "",
                        competencies: ["Create"],
                        projectIds: [],
                        selectedTaskIds: [],
                        lecturer: "",
                      });
                      setNewGoalInput("");
                      setNewOutcomeInput("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={newLog.competencies.length === 0}>
                    {editingLog ? "Update Log" : "Save Log"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          )}
        </header>

        {/* Mentor Log Cards */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border-2 border-dashed animate-fade-in">
            <p className="text-muted-foreground text-lg mb-4">
              No mentor logs in {currentMode} mode yet. Document your first session!
            </p>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Mentor Log
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLogs.map((log, idx) => {
              const primaryColor = COMPETENCY_COLORS[log.competencies?.[0] || "Create"];
              return (
                <Card
                  key={log.id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group glass-card stagger-item"
                  style={{ 
                    borderTop: `4px solid ${primaryColor}`,
                    animationDelay: `${idx * 0.05}s`
                  }}
                  onClick={() => handleCardClick(log)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {(log.competencies || ["Create"]).map((comp: Competency) => (
                            <span
                              key={comp}
                              className="text-xs font-medium px-2 py-1 rounded-full inline-block"
                              style={{ 
                                backgroundColor: `${COMPETENCY_COLORS[comp]}40`, 
                                color: COMPETENCY_COLORS[comp]
                              }}
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{log.title}</CardTitle>
                          {unreadLogIds.has(log.id) && (
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!isViewerMode && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 flex-col h-auto py-2 px-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(log);
                              }}
                              title="Edit pre-session agenda prep"
                            >
                              <div className="flex items-center gap-1">
                                <Edit className="h-3 w-3" />
                                <span className="font-bold text-xs">Edit Pre-Session</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-normal">Agenda prep for consult</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(log.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4" />
                      {new Date(log.date).toLocaleDateString()}
                    </div>
                    
                    <div className="space-y-4">
                      {log.projects && log.projects.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          📁 Projects: 
                          <div className="ml-4 mt-1 space-y-1">
                            {log.projects.map((proj: any) => (
                              <span key={proj.id} className="block font-medium">{proj.name}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {log.key_goals && Array.isArray(log.key_goals) && log.key_goals.length > 0 && (
                          <p>📝 {log.key_goals.slice(0, 2).join(' • ')}{log.key_goals.length > 2 ? '...' : ''}</p>
                        )}
                      </div>
                      
                      {/* Satisfaction Score Progress Bar */}
                      {log.key_goals && Array.isArray(log.key_goals) && log.key_goals.length > 0 && (
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Goals Covered</span>
                            <span className="font-semibold">
                              {Math.round(((log.achieved_goals?.length || 0) / log.key_goals.length) * 100)}%
                            </span>
                          </div>
                          <Progress 
                            value={((log.achieved_goals?.length || 0) / log.key_goals.length) * 100} 
                            className="h-2" 
                          />
                        </div>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(log);
                        }}
                      >
                        View Full Mentor Log Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Learning Tracker Summary */}
        <section className="mt-12 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8 border shadow-lg animate-scale-in">
          <h2 className="text-2xl font-semibold mb-4">📊 Learning Tracker</h2>
          <p className="text-muted-foreground mb-6">
            Track your evidence across all CMD competencies through mentor sessions
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {COMPETENCIES.map((comp) => {
              const count = filteredLogs.filter((log) => 
                (log.competencies || []).includes(comp)
              ).length;
              const color = COMPETENCY_COLORS[comp];
              return (
                <div
                  key={comp}
                  className="bg-card rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow hover-scale"
                  style={{ borderBottom: `3px solid ${color}` }}
                >
                  <p className="text-2xl font-bold mb-1">{count}</p>
                  <p className="text-xs text-muted-foreground">{comp}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-4">
            <Button variant="outline" className="gap-2">
              Export Summary
            </Button>
            <Button variant="outline" className="gap-2">
              Share with Mentor
            </Button>
          </div>
        </section>

        {/* Detail View Dialog */}
        {detailViewLog && (
          <MentorLogDetailView
            log={detailViewLog}
            open={!!detailViewLog}
            onOpenChange={(open) => !open && setDetailViewLog(null)}
            onUpdate={loadData}
            selectedTasks={
              detailViewLog.selected_task_ids && detailViewLog.projects
                ? detailViewLog.projects.flatMap((proj: any) => 
                    proj.key_tasks?.filter((task: any) => 
                      detailViewLog.selected_task_ids.includes(task.id)
                    ).map((task: any) => ({ ...task, projectName: proj.name })) || []
                  )
                : []
            }
          />
        )}
        </div>
      </div>
    </div>
  );
};

export default MentorLogs;
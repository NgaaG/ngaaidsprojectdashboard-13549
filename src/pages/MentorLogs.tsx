import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { MentorLogDetailView } from "@/components/MentorLogDetailView";

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
  const [logs, setLogs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<Mode>("lecturer");
  const [editingLog, setEditingLog] = useState<any | null>(null);
  const [detailViewLog, setDetailViewLog] = useState<any | null>(null);
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "",
    keyGoals: "",
    outcomes: "",
    mentorComments: "",
    competencies: ["Create"] as Competency[],
    projectId: null as string | null,
    selectedTaskIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, [currentMode]);

  const loadData = async () => {
    const { data: projectsData } = await db
      .from("projects")
      .select("*")
      .eq("mode", currentMode)
      .order("name");
    if (projectsData) setProjects(projectsData);

    const { data: logsData } = await db
      .from("mentor_logs")
      .select("*, projects(name, key_tasks)")
      .order("created_at", { ascending: false });
    if (logsData) setLogs(logsData);
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
      keyGoals: log.key_goals || "",
      outcomes: log.outcomes || "",
      mentorComments: log.mentor_comments || "",
      competencies: log.competencies || ["Create"],
      projectId: log.project_id,
      selectedTaskIds: log.selected_task_ids || [],
    });
    setIsDialogOpen(true);
  };

  const handleCardClick = (log: any) => {
    setDetailViewLog(log);
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
          project_id: newLog.projectId,
          selected_task_ids: newLog.selectedTaskIds.length > 0 ? newLog.selectedTaskIds : null,
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
          project_id: newLog.projectId,
          selected_task_ids: newLog.selectedTaskIds.length > 0 ? newLog.selectedTaskIds : null,
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
        keyGoals: "",
        outcomes: "",
        mentorComments: "",
        competencies: ["Create"],
        projectId: null,
        selectedTaskIds: [],
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to save mentor log");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await db.from("mentor_logs").delete().eq("id", id);
      if (error) throw error;
      toast.success("Mentor log deleted");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete mentor log");
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">🧭 Mentor Logs</h1>
              <p className="text-muted-foreground">
                Document mentorship sessions and learning evidence
              </p>
            </div>
            <ModeToggle mode={currentMode} onModeChange={setCurrentMode} />
          </div>

          {/* New Mentor Log Button */}
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
                    <Label htmlFor="project">Project (optional)</Label>
                    <Select
                      value={newLog.projectId || ""}
                      onValueChange={(value) => setNewLog({ ...newLog, projectId: value, selectedTaskIds: [] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Project Tasks Selection */}
                  {newLog.projectId && (() => {
                    const selectedProject = projects.find(p => p.id === newLog.projectId);
                    const projectTasks = selectedProject?.key_tasks || [];
                    
                    if (projectTasks.length > 0) {
                      return (
                        <div className="p-4 bg-muted/30 rounded-lg">
                          <Label className="mb-3 block">Reference Project Tasks (optional)</Label>
                          <p className="text-xs text-muted-foreground mb-3">
                            Select tasks to reference during this consultation
                          </p>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
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
                        </div>
                      );
                    }
                    return null;
                  })()}

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
                      <Textarea
                        placeholder="• Goal 1&#10;• Goal 2&#10;• Goal 3"
                        value={newLog.keyGoals}
                        onChange={(e) => setNewLog({ ...newLog, keyGoals: e.target.value })}
                        className="min-h-28 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="outcomes" className="text-sm font-medium">Outcomes / Notes (Post-Session)</Label>
                      <p className="text-xs text-muted-foreground mb-2">What did you learn, achieve, or discover?</p>
                      <Textarea
                        placeholder="• Outcome 1&#10;• Outcome 2&#10;• Next steps..."
                        value={newLog.outcomes}
                        onChange={(e) => setNewLog({ ...newLog, outcomes: e.target.value })}
                        className="min-h-28 font-mono text-sm"
                      />
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
                        keyGoals: "",
                        outcomes: "",
                        mentorComments: "",
                        competencies: ["Create"],
                        projectId: null,
                        selectedTaskIds: [],
                      });
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
            {filteredLogs.map((log) => {
              const primaryColor = COMPETENCY_COLORS[log.competencies?.[0] || "Create"];
              return (
                <Card
                  key={log.id}
                  className="overflow-hidden hover:shadow-lg transition-all hover-scale animate-fade-in cursor-pointer"
                  style={{ borderTop: `4px solid ${primaryColor}` }}
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
                        <CardTitle className="text-lg">{log.title}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(log);
                          }}
                        >
                          <Edit className="h-4 w-4" />
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
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4" />
                      {new Date(log.date).toLocaleDateString()}
                    </div>
                    
                    <div className="space-y-4">
                      {log.projects && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          📁 Project: <span className="font-medium">{log.projects.name}</span>
                        </p>
                      )}
                      
                      <div className="space-y-3 border-l-2 border-primary/30 pl-4 py-2">
                        <div>
                          <p className="text-sm font-semibold mb-1 text-primary">📝 Key Goals</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {log.key_goals || "No goals set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold mb-1 text-primary">✅ Outcomes</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {log.outcomes || "No outcomes recorded"}
                          </p>
                        </div>
                      </div>
                      
                      {log.mentor_comments && (
                        <div className="border-t pt-3 mt-3 bg-accent/10 -mx-6 px-6 pb-3 border-l-2 border-accent/50">
                          <p className="text-sm font-semibold mb-1 text-accent flex items-center gap-1">
                            🎓 Lecturer Feedback
                          </p>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {log.mentor_comments}
                          </p>
                        </div>
                      )}
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
              detailViewLog.selected_task_ids && detailViewLog.projects?.key_tasks
                ? detailViewLog.projects.key_tasks.filter((task: any) => 
                    detailViewLog.selected_task_ids.includes(task.id)
                  )
                : []
            }
          />
        )}
      </div>
    </div>
  );
};

export default MentorLogs;
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2, Calendar } from "lucide-react";
import { Competency } from "@/types";
import { db } from "@/lib/supabaseHelpers";
import { toast } from "sonner";

const COMPETENCIES: Competency[] = ["Research", "Create", "Organize", "Communicate", "Learn"];

const COMPETENCY_COLORS: Record<Competency, string> = {
  Research: "hsl(265 45% 80%)",
  Create: "hsl(160 55% 80%)",
  Organize: "hsl(195 60% 76%)",
  Communicate: "hsl(280 50% 75%)",
  Learn: "hsl(150 60% 75%)",
};

const MentorLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "",
    keyGoals: "",
    outcomes: "",
    competency: "Create" as Competency,
    projectId: null as string | null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: projectsData } = await db
      .from("projects")
      .select("*")
      .order("name");
    if (projectsData) setProjects(projectsData);

    const { data: logsData } = await db
      .from("mentor_logs")
      .select("*, projects(name)")
      .order("created_at", { ascending: false });
    if (logsData) setLogs(logsData);
  };

  const handleSave = async () => {
    if (!newLog.title.trim()) {
      toast.error("Please add a title");
      return;
    }

    try {
      const { error } = await db.from("mentor_logs").insert({
        date: newLog.date,
        title: newLog.title,
        key_goals: newLog.keyGoals,
        outcomes: newLog.outcomes,
        competency: newLog.competency,
        project_id: newLog.projectId,
      });

      if (error) throw error;

      toast.success("Mentor log saved!");
      setIsDialogOpen(false);
      loadData();

      // Reset form
      setNewLog({
        date: new Date().toISOString().split("T")[0],
        title: "",
        keyGoals: "",
        outcomes: "",
        competency: "Create",
        projectId: null,
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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">🧭 Mentor Logs</h1>
            <p className="text-muted-foreground">
              Document mentorship sessions and learning evidence
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-full">
                <Plus className="h-4 w-4" />
                New Mentor Log
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Mentor Log</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="project">Project (optional)</Label>
                  <Select
                    value={newLog.projectId || ""}
                    onValueChange={(value) => setNewLog({ ...newLog, projectId: value })}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      type="date"
                      value={newLog.date}
                      onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="competency">Competency</Label>
                    <Select
                      value={newLog.competency}
                      onValueChange={(value) =>
                        setNewLog({ ...newLog, competency: value as Competency })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPETENCIES.map((comp) => (
                          <SelectItem key={comp} value={comp}>
                            {comp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <Label htmlFor="goals">Key Goals</Label>
                  <Textarea
                    placeholder="What were the main goals for this session?"
                    value={newLog.keyGoals}
                    onChange={(e) => setNewLog({ ...newLog, keyGoals: e.target.value })}
                    className="min-h-24"
                  />
                </div>

                <div>
                  <Label htmlFor="outcomes">Outcomes</Label>
                  <Textarea
                    placeholder="What did you learn or achieve?"
                    value={newLog.outcomes}
                    onChange={(e) => setNewLog({ ...newLog, outcomes: e.target.value })}
                    className="min-h-24"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Log</Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        {/* Mentor Log Cards */}
        {logs.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border-2 border-dashed">
            <p className="text-muted-foreground text-lg mb-4">
              No mentor logs yet. Document your first session!
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
            {logs.map((log) => {
              const color = COMPETENCY_COLORS[log.competency];
              return (
                <Card
                  key={log.id}
                  className="overflow-hidden hover:shadow-lg transition-all hover:scale-105"
                  style={{ borderTop: `4px solid ${color}` }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-full inline-block mb-2"
                          style={{ backgroundColor: `${color}40`, color }}
                        >
                          {log.competency}
                        </span>
                        <CardTitle className="text-lg">{log.title}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(log.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="h-4 w-4" />
                      {new Date(log.date).toLocaleDateString()}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        {log.projects && (
                          <p className="text-xs text-muted-foreground mb-2">
                            Project: {log.projects.name}
                          </p>
                        )}
                        <p className="text-sm font-medium mb-1">Key Goals:</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {log.key_goals}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Outcomes:</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {log.outcomes}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Learning Tracker Summary */}
        <section className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border">
          <h2 className="text-2xl font-semibold mb-4">📊 Learning Tracker</h2>
          <p className="text-muted-foreground mb-6">
            Track your evidence across all CMD competencies through mentor sessions
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {COMPETENCIES.map((comp) => {
              const count = logs.filter((log) => log.competency === comp).length;
              const color = COMPETENCY_COLORS[comp];
              return (
                <div
                  key={comp}
                  className="bg-card rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"
                  style={{ borderBottom: `3px solid ${color}` }}
                >
                  <p className="text-2xl font-bold mb-1">{count}</p>
                  <p className="text-sm text-muted-foreground">{comp}</p>
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
      </div>
    </div>
  );
};

export default MentorLogs;

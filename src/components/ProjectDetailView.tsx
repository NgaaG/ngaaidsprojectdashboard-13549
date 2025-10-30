import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project, Mode } from "@/types";
import { db } from "@/lib/supabaseHelpers";
import { Edit, ExternalLink, Calendar } from "lucide-react";
import { ProjectEditDialog } from "./ProjectEditDialog";

interface ProjectDetailViewProps {
  project: Project;
  mode: Mode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const ProjectDetailView = ({
  project,
  mode,
  open,
  onOpenChange,
  onUpdate,
}: ProjectDetailViewProps) => {
  const [reflections, setReflections] = useState<any[]>([]);
  const [mentorLogs, setMentorLogs] = useState<any[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadProjectData();
    }
  }, [open, project.id]);

  const loadProjectData = async () => {
    // Load reflections for this project
    const { data: reflectionsData } = await db
      .from("reflections")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });

    if (reflectionsData) setReflections(reflectionsData);

    // Load mentor logs for this project
    const { data: logsData } = await db
      .from("mentor_logs")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });

    if (logsData) setMentorLogs(logsData);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    onUpdate();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-1">{project.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {project.competencies.join(", ")} • {project.completion}% Complete
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Basic Info Section */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📋 Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.description && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Description</p>
                    <p className="text-muted-foreground">{project.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold mb-2">Competencies</p>
                  <div className="flex flex-wrap gap-2">
                    {project.competencies.map((comp) => (
                      <span key={comp} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Completion</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all"
                        style={{ width: `${project.completion}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{project.completion}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Goals Section */}
            {project.learningGoals && Object.values(project.learningGoals).some(g => g) && (
              <Card className="border-l-4 border-l-accent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎯 Learning Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {Object.entries(project.learningGoals).map(([competency, goal]) => 
                      goal ? (
                        <div key={competency} className="border-l-2 border-primary/30 pl-4 py-2">
                          <p className="text-sm font-semibold text-primary mb-1">{competency}</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{goal}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Tasks Section */}
            {project.keyTasks && project.keyTasks.length > 0 && (
              <Card className="border-l-4 border-l-secondary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    ✅ Key Tasks & Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {project.keyTasks.map((task) => (
                      <div key={task.id} className="p-5 bg-muted/30 rounded-lg border space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-base">{task.name}</h4>
                          <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${
                            task.status === "completed" ? "bg-green-500/20 text-green-700 dark:text-green-300" :
                            task.status === "not-completed" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300" :
                            "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                          }`}>
                            {task.status === "completed" ? "✅ Completed" :
                             task.status === "not-completed" ? "🕓 In Sprint" :
                             "🔮 Future"}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}

                        {/* Media Gallery */}
                        {task.files && task.files.length > 0 && (
                          <div className="pt-3 border-t">
                            <p className="text-xs font-semibold mb-3">Files & Media</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {task.files.map((file, idx) => (
                                <a
                                  key={idx}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group relative aspect-video rounded-lg overflow-hidden border hover:border-primary transition-colors"
                                >
                                  {file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <img 
                                      src={file.url} 
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted">
                                      <div className="text-center p-3">
                                        <ExternalLink className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                                        <p className="text-xs truncate">{file.name}</p>
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ExternalLink className="h-5 w-5 text-white" />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Links */}
                        {task.links && task.links.length > 0 && (
                          <div className="pt-3 border-t">
                            <p className="text-xs font-semibold mb-2">Links</p>
                            <div className="space-y-2">
                              {task.links.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2.5 bg-background rounded border hover:border-primary transition-colors group"
                                >
                                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                  <span className="text-sm text-primary hover:underline truncate">
                                    {link.title}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mode-specific content */}
            <Tabs defaultValue={mode === "personal" ? "reflections" : "mentor-logs"}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="reflections">
                  Reflections ({reflections.length})
                </TabsTrigger>
                <TabsTrigger value="mentor-logs">
                  Mentor Logs ({mentorLogs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reflections" className="space-y-4">
                {reflections.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No reflections for this project yet
                    </CardContent>
                  </Card>
                ) : (
                  reflections.map((reflection) => (
                    <Card key={reflection.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium">Mood: {reflection.mood}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(reflection.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Progress: {reflection.progress}%
                          </span>
                        </div>
                        {reflection.emotional_dump && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {reflection.emotional_dump}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="mentor-logs" className="space-y-4">
                {mentorLogs.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No mentor logs for this project yet
                    </CardContent>
                  </Card>
                ) : (
                  mentorLogs.map((log) => (
                    <Card key={log.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{log.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(log.date).toLocaleDateString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {log.key_goals && (
                          <div>
                            <p className="text-sm font-medium mb-1">Key Goals:</p>
                            <p className="text-sm text-muted-foreground">{log.key_goals}</p>
                          </div>
                        )}
                        {log.outcomes && (
                          <div>
                            <p className="text-sm font-medium mb-1">Outcomes:</p>
                            <p className="text-sm text-muted-foreground">{log.outcomes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <ProjectEditDialog
        project={project}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

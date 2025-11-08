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
import { Badge } from "@/components/ui/badge";
import { Project, Mode, LearningGoals } from "@/types";
import { db } from "@/lib/supabaseHelpers";
import { Edit, ExternalLink, Calendar, Trash2, Eye, Edit2 } from "lucide-react";
import { ProjectEditDialog } from "./ProjectEditDialog";
import { LearningGoalsEditDialog } from "./LearningGoalsEditDialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectDetailViewProps {
  project: Project;
  mode: Mode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  isViewerMode?: boolean;
}

// Emotion options for personal mode (how you're feeling)
const MOODS: { value: string; emoji: string; label: string; color: string }[] = [
  { value: "calm", emoji: "😌", label: "Calm", color: "hsl(195 60% 76%)" },
  { value: "anxious", emoji: "😰", label: "Anxious", color: "hsl(0 70% 70%)" },
  { value: "focused", emoji: "🎯", label: "Focused", color: "hsl(160 55% 80%)" },
  { value: "overwhelmed", emoji: "😵", label: "Overwhelmed", color: "hsl(280 50% 75%)" },
  { value: "energized", emoji: "⚡", label: "Energized", color: "hsl(45 100% 65%)" },
];

// Satisfaction levels for lecture mode (how satisfied you were)
const SATISFACTION: { value: string; emoji: string; label: string; color: string }[] = [
  { value: "energized", emoji: "🤩", label: "Very Satisfied", color: "hsl(160 55% 80%)" },
  { value: "focused", emoji: "😊", label: "Satisfied", color: "hsl(195 60% 76%)" },
  { value: "calm", emoji: "😐", label: "Neutral", color: "hsl(45 100% 75%)" },
  { value: "anxious", emoji: "😔", label: "Dissatisfied", color: "hsl(35 90% 70%)" },
  { value: "overwhelmed", emoji: "😞", label: "Very Dissatisfied", color: "hsl(0 70% 70%)" },
];

export const ProjectDetailView = ({
  project,
  mode,
  open,
  onOpenChange,
  onUpdate,
  isViewerMode = false,
}: ProjectDetailViewProps) => {
  const [reflections, setReflections] = useState<any[]>([]);
  const [mentorLogs, setMentorLogs] = useState<any[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalsEditDialogOpen, setGoalsEditDialogOpen] = useState(false);
  const navigate = useNavigate();

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

    // Load mentor logs for this project - check if project.id is in the project_ids array
    const { data: logsData } = await db
      .from("mentor_logs")
      .select("*")
      .contains("project_ids", [project.id])
      .order("created_at", { ascending: false });

    if (logsData) setMentorLogs(logsData);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    onUpdate();
  };

  const handleDelete = async () => {
    const projectToDelete = { ...project };
    
    try {
      const { error } = await db.from("projects").delete().eq("id", project.id);
      if (error) throw error;
      
      toast.success("Project deleted", {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              const { error: insertError } = await db.from("projects").insert(projectToDelete);
              if (insertError) throw insertError;
              toast.success("Project restored");
              onUpdate();
            } catch (error: any) {
              toast.error("Failed to restore project");
            }
          }
        }
      });
      
      setDeleteDialogOpen(false);
      onOpenChange(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete project");
    }
  };

  const handleViewMentorLog = (logId: string) => {
    // Navigate to mentor logs page with the log ID as a query parameter
    navigate(`/mentor-logs?logId=${logId}`);
    onOpenChange(false);
  };

  const handleViewReflection = (reflectionId: string) => {
    // Navigate to reflections page with the reflection ID as a query parameter
    navigate(`/reflections?reflectionId=${reflectionId}`);
    onOpenChange(false);
  };

  const handleSaveLearningGoals = async (goals: LearningGoals) => {
    try {
      const { error } = await db
        .from("projects")
        .update({ learning_goals: goals })
        .eq("id", project.id);

      if (error) throw error;

      onUpdate();
    } catch (error: any) {
      toast.error("Failed to update learning goals");
      console.error(error);
    }
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
              <div className="flex gap-2">
                {!isViewerMode && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditDialogOpen(true)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
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
            {project.learningGoals && (
              <Card className="border-l-4 border-l-accent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        🎯 Learning Goals
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Specific learning objectives for each competency
                      </p>
                    </div>
                    {!isViewerMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setGoalsEditDialogOpen(true)}
                        className="gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(["Research", "Create", "Organize", "Communicate", "Learn"] as const).map((comp) => {
                      const goals = project.learningGoals?.[comp];
                      if (!Array.isArray(goals) || goals.length === 0) return null;
                      
                      return (
                        <div key={comp} className="border rounded-lg p-3 bg-background">
                          <h4 className="font-semibold text-sm mb-2">{comp}</h4>
                          <div className="space-y-1 pl-2">
                            {goals.map((goal, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <span className="font-bold text-sm">•</span>
                                <span className="text-sm font-medium">{goal}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goals Achievement Tracking Section */}
            {project.learningGoalsAchievements && (
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📊 Goals Achievement
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Progress and satisfaction levels for each learning goal
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {(["Research", "Create", "Organize", "Communicate", "Learn"] as const).map((comp) => {
                      const goals = project.learningGoals?.[comp] || [];
                      const achievements = project.learningGoalsAchievements?.[comp] || [];
                      // Only show achievements that have corresponding goals
                      const validAchievements = achievements.filter(ach => 
                        goals.some(goal => goal === ach.goal)
                      );
                      if (validAchievements.length === 0) return null;
                      
                      return (
                        <div key={comp} className="border rounded-lg p-4 bg-background">
                          <h4 className="font-semibold text-sm mb-3">{comp}</h4>
                          <div className="space-y-4">
                            {validAchievements.map((achievement, index) => (
                              <div key={index} className="p-3 bg-muted/30 rounded-lg space-y-2">
                                <div className="flex items-start gap-2">
                                  <span className={`text-sm ${achievement.achieved ? 'text-green-600 font-semibold' : 'text-muted-foreground'}`}>
                                    {achievement.achieved ? '✓' : '○'}
                                  </span>
                                  <span className={`text-sm flex-1 ${achievement.achieved ? 'font-medium' : ''}`}>
                                    {achievement.goal}
                                  </span>
                                </div>
                                
                                <div className="pl-6">
                                  <div className="text-xs text-muted-foreground mb-1">
                                    Satisfaction: {achievement.satisfaction}%
                                  </div>
                                  <div className="w-full bg-secondary rounded-full h-2">
                                     <div 
                                      className="bg-primary h-2 rounded-full transition-all"
                                      style={{ width: `${achievement.satisfaction}%` }}
                                    />
                                  </div>
                                  {achievement.explanation && (
                                    <p className="text-xs text-muted-foreground mt-2 italic">
                                      "{achievement.explanation}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
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
                  <p className="text-sm text-muted-foreground mt-1">
                    Breakdown of project deliverables and evidence
                  </p>
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

                        {/* Competency & Learning Goal */}
                        {(task.competency || task.learningGoal) && (
                          <div className="space-y-1 text-xs">
                            {task.competency && (
                              <p className="text-muted-foreground">
                                <span className="font-semibold text-primary">Competency:</span> {task.competency}
                              </p>
                            )}
                            {task.learningGoal && (
                              <p className="text-muted-foreground">
                                <span className="font-semibold text-primary">Learning Goal:</span> {task.learningGoal}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {task.description && (
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        )}

                        {/* Media Gallery */}
                        {task.files && task.files.length > 0 && (
                          <div className="pt-3 border-t">
                            <p className="text-xs font-semibold mb-3 text-foreground/80">Files & Media</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                              {task.files.map((file, idx) => (
                                <a
                                  key={idx}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group relative aspect-square rounded-xl overflow-hidden border border-border/50 hover:border-primary/70 transition-all hover:shadow-lg hover:scale-[1.02] bg-muted/30"
                                >
                                  {file.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                                    <>
                                      <img 
                                        src={file.url} 
                                        alt={file.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        loading="lazy"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                      <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                        <p className="text-[10px] text-white font-medium truncate drop-shadow-lg">{file.name}</p>
                                      </div>
                                    </>
                                  ) : file.url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                                    <>
                                      <video 
                                        src={file.url}
                                        className="w-full h-full object-cover"
                                        muted
                                        playsInline
                                      />
                                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center backdrop-blur-sm">
                                          <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-primary border-b-[8px] border-b-transparent ml-1" />
                                        </div>
                                      </div>
                                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                        <p className="text-[10px] text-white font-medium truncate">{file.name}</p>
                                      </div>
                                    </>
                                  ) : file.url.match(/\.(pdf)$/i) ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 p-4">
                                      <div className="w-14 h-14 mb-2 text-red-600 dark:text-red-400">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-2 4h-1v1h1v1h-1v2H9v-2H8v-1h1v-1H8v-1h1v-1h1v1h1v1zm5 4h-1v-1h-1v-1h1v-1h1v3z"/>
                                        </svg>
                                      </div>
                                      <p className="text-[10px] text-center font-medium text-red-700 dark:text-red-300 truncate w-full px-1">{file.name}</p>
                                    </div>
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50 p-4">
                                      <ExternalLink className="h-8 w-8 mb-2 text-muted-foreground/70" />
                                      <p className="text-[10px] text-center font-medium text-muted-foreground truncate w-full px-1">{file.name}</p>
                                    </div>
                                  )}
                                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                    <ExternalLink className="h-3.5 w-3.5 text-foreground" />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Links */}
                        {task.links && task.links.length > 0 && (
                          <div className="pt-3 border-t">
                            <p className="text-xs font-semibold mb-2.5 text-foreground/80">Related Links</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {task.links.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center gap-2.5 p-2.5 rounded-lg border border-border/50 hover:border-primary/70 bg-muted/20 hover:bg-muted/40 transition-all hover:shadow-md text-sm"
                                >
                                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <ExternalLink className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="text-foreground/90 group-hover:text-primary truncate font-medium transition-colors">{link.title}</span>
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
                  reflections.map((reflection) => {
                    // Use the correct emotion set based on the reflection's mode
                    const emotionSet = reflection.mode === "personal" ? MOODS : SATISFACTION;
                    const moodData = emotionSet.find((m) => m.value === reflection.mood);
                    
                    return (
                      <Card 
                        key={reflection.id} 
                        className="hover:shadow-lg transition-all border-l-4" 
                        style={{ borderLeftColor: moodData?.color || 'hsl(195 60% 76%)' }}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">{moodData?.emoji || '😐'}</span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold">{moodData?.label || reflection.mood}</p>
                                    <Badge variant="outline" className="text-xs">
                                      {reflection.mode === "personal" ? "Personal" : "Lecture"}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(reflection.created_at).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              {reflection.progress > 0 && (
                                <div className="mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-muted rounded-full h-1.5">
                                      <div 
                                        className="bg-primary h-full rounded-full transition-all"
                                        style={{ width: `${reflection.progress}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground">{Math.round(reflection.progress)}%</span>
                                  </div>
                                </div>
                              )}
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {reflection.emotional_dump}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewReflection(reflection.id)}
                                className="gap-2"
                              >
                                <Eye className="h-3 w-3" />
                                View Full
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
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
                    <Card key={log.id} className="hover:border-primary/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{log.title}</CardTitle>
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {new Date(log.date).toLocaleDateString()}
                              </div>
                              {log.lecturer && (
                                <Badge variant="secondary" className="text-xs">
                                  {log.lecturer}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewMentorLog(log.id)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Full Log
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {log.key_goals && (
                          <div>
                            <p className="text-sm font-medium mb-1">Key Goals:</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{log.key_goals}</p>
                          </div>
                        )}
                        {log.outcomes && (
                          <div>
                            <p className="text-sm font-medium mb-1">Outcomes:</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{log.outcomes}</p>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LearningGoalsEditDialog
        open={goalsEditDialogOpen}
        onOpenChange={setGoalsEditDialogOpen}
        learningGoals={project.learningGoals || { Research: [], Create: [], Organize: [], Communicate: [], Learn: [] }}
        onSave={handleSaveLearningGoals}
      />
    </>
  );
};

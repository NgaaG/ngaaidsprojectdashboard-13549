import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Plus, Trash2, ExternalLink } from "lucide-react";
import { Competency, Project, LearningGoals, LearningGoalsAchievements, KeyTask, LearningGoalAchievement } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/supabaseHelpers";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const COMPETENCIES: Competency[] = [
  "Research",
  "Create",
  "Organize",
  "Communicate",
  "Learn",
  "Unsure/TBD",
];

interface ProjectEditDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ProjectEditDialog = ({
  project,
  open,
  onOpenChange,
  onSuccess,
}: ProjectEditDialogProps) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [competencies, setCompetencies] = useState<Competency[]>(project.competencies);
  const [completion, setCompletion] = useState(project.completion);
  const [loading, setLoading] = useState(false);
  const [learningGoals, setLearningGoals] = useState<LearningGoals>(
    project.learningGoals || {
      Research: [],
      Create: [],
      Organize: [],
      Communicate: [],
      Learn: [],
    }
  );
  const [learningGoalsAchievements, setLearningGoalsAchievements] = useState<LearningGoalsAchievements>(
    project.learningGoalsAchievements || {
      Research: [],
      Create: [],
      Organize: [],
      Communicate: [],
      Learn: [],
    }
  );
  const [keyTasks, setKeyTasks] = useState<KeyTask[]>(project.keyTasks || []);

  useEffect(() => {
    if (open) {
      setName(project.name);
      setDescription(project.description || "");
      setCompetencies(project.competencies);
      setCompletion(project.completion);
      setLearningGoals(
        project.learningGoals || {
          Research: [],
          Create: [],
          Organize: [],
          Communicate: [],
          Learn: [],
        }
      );
      setLearningGoalsAchievements(
        project.learningGoalsAchievements || {
          Research: [],
          Create: [],
          Organize: [],
          Communicate: [],
          Learn: [],
        }
      );
      setKeyTasks(project.keyTasks || []);
    }
  }, [open, project]);

  const toggleCompetency = (comp: Competency) => {
    setCompetencies(prev =>
      prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]
    );
  };

  const addGoalToCompetency = (comp: keyof LearningGoals, goal: string) => {
    if (!goal.trim()) return;
    setLearningGoals(prev => ({
      ...prev,
      [comp]: [...prev[comp], goal.trim()],
    }));
    // Initialize achievement tracking for new goal
    setLearningGoalsAchievements(prev => ({
      ...prev,
      [comp]: [...prev[comp], { goal: goal.trim(), achieved: false, satisfaction: 0, explanation: "" }],
    }));
  };

  const removeGoalFromCompetency = (comp: keyof LearningGoals, index: number) => {
    setLearningGoals(prev => ({
      ...prev,
      [comp]: prev[comp].filter((_, i) => i !== index),
    }));
    setLearningGoalsAchievements(prev => ({
      ...prev,
      [comp]: prev[comp].filter((_, i) => i !== index),
    }));
  };

  const updateAchievement = (comp: keyof LearningGoalsAchievements, index: number, field: keyof LearningGoalAchievement, value: any) => {
    setLearningGoalsAchievements(prev => {
      const updatedAchievements = [...prev[comp]];
      if (updatedAchievements[index]) {
        updatedAchievements[index] = { ...updatedAchievements[index], [field]: value };
      }
      return {
        ...prev,
        [comp]: updatedAchievements,
      };
    });
  };

  const addTask = () => {
    setKeyTasks([
      ...keyTasks,
      {
        id: Date.now().toString(),
        name: "",
        status: "not-completed",
        description: "",
        files: [],
        links: [],
      },
    ]);
  };

  const updateTask = (id: string, field: keyof KeyTask, value: any) => {
    setKeyTasks(keyTasks.map(task => task.id === id ? { ...task, [field]: value } : task));
  };

  const removeTask = (id: string) => {
    setKeyTasks(keyTasks.filter(task => task.id !== id));
  };

  const handleTaskFileUpload = async (taskId: string, files: FileList) => {
    const task = keyTasks.find(t => t.id === taskId);
    if (!task) return;

    const uploadedFiles = [];
    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(fileName, file);

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("project-files")
        .getPublicUrl(fileName);
      
      uploadedFiles.push({ url: publicUrl, name: file.name });
    }

    updateTask(taskId, "files", [...(task.files || []), ...uploadedFiles]);
  };

  const removeTaskFile = (taskId: string, fileIndex: number) => {
    const task = keyTasks.find(t => t.id === taskId);
    if (!task || !task.files) return;
    updateTask(taskId, "files", task.files.filter((_, i) => i !== fileIndex));
  };

  const addTaskLink = (taskId: string, url: string, title: string) => {
    const task = keyTasks.find(t => t.id === taskId);
    if (!task || !url.trim()) return;
    
    // Ensure URL has protocol
    let formattedUrl = url.trim();
    if (!formattedUrl.match(/^https?:\/\//i)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    updateTask(taskId, "links", [...(task.links || []), { url: formattedUrl, title: title.trim() || formattedUrl }]);
  };

  const removeTaskLink = (taskId: string, linkIndex: number) => {
    const task = keyTasks.find(t => t.id === taskId);
    if (!task || !task.links) return;
    updateTask(taskId, "links", task.links.filter((_, i) => i !== linkIndex));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await db
        .from("projects")
        .update({
          name,
          description,
          competencies,
          completion,
          learning_goals: learningGoals,
          learning_goals_achievements: learningGoalsAchievements,
          key_tasks: keyTasks,
        })
        .eq("id", project.id);

      if (error) throw error;

      toast.success("Project updated successfully!");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Update project details, goals, and resources
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="learning">Learning Goals</TabsTrigger>
              <TabsTrigger value="tasks">Key Tasks</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-5 mt-4">
              <div className="space-y-4 border rounded-lg p-5 bg-muted/20">
                <h3 className="font-semibold flex items-center gap-2">
                  📋 Basic Information
                </h3>
                
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter project name"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe my project..."
                    rows={3}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>CMD Competencies (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-3 p-4 bg-background rounded-lg border">
                    {COMPETENCIES.map((comp) => (
                      <div key={comp} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${comp}`}
                          checked={competencies.includes(comp)}
                          onCheckedChange={() => toggleCompetency(comp)}
                        />
                        <label
                          htmlFor={`edit-${comp}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {comp}
                        </label>
                      </div>
                    ))}
                  </div>
                  {competencies.length === 0 && (
                    <p className="text-xs text-destructive mt-2">Select at least one competency</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="completion">Completion: {completion}%</Label>
                  <Slider
                    id="completion"
                    value={[completion]}
                    onValueChange={(value) => setCompletion(value[0])}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-3"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="learning" className="space-y-5 mt-4">
              <div className="space-y-6">
                {/* Learning Goals Section */}
                <div className="border rounded-lg p-5 bg-primary/5">
                  <div className="border-b pb-3 mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      🎯 Learning Goals
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add learning goals for each competency. Each goal will appear as a bullet point.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {(["Research", "Create", "Organize", "Communicate", "Learn"] as const).map((comp) => (
                      <div key={comp} className="border rounded-lg p-4 bg-background">
                        <Label className="text-sm font-semibold mb-2 block">{comp}</Label>
                        
                        {learningGoals[comp].map((goal, index) => (
                          <div key={index} className="flex items-start gap-2 mb-2 p-2 bg-muted/20 rounded">
                            <span className="font-bold text-sm mt-1">•</span>
                            <span className="flex-1 text-sm">{goal}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeGoalFromCompetency(comp, index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        
                        <div className="flex gap-2 mt-2">
                          <Input
                            id={`new-goal-${comp}`}
                            placeholder="Add a learning goal..."
                            className="text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.currentTarget;
                                addGoalToCompetency(comp, input.value);
                                input.value = "";
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.getElementById(`new-goal-${comp}`) as HTMLInputElement;
                              if (input) {
                                addGoalToCompetency(comp, input.value);
                                input.value = "";
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goals Achievement Tracking Section */}
                <div className="border rounded-lg p-5 bg-accent/5">
                  <div className="border-b pb-3 mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      📊 Goals Achievement Tracking
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Track your progress on each learning goal
                    </p>
                  </div>

                  <div className="space-y-6">
                    {(["Research", "Create", "Organize", "Communicate", "Learn"] as const).map((comp) => (
                      learningGoals[comp].length > 0 && (
                        <div key={comp} className="border rounded-lg p-4 bg-background">
                          <h4 className="font-semibold text-sm mb-3">{comp}</h4>
                          <div className="space-y-4">
                            {learningGoals[comp].map((goal, index) => {
                              const achievement = learningGoalsAchievements[comp][index] || {
                                goal,
                                achieved: false,
                                satisfaction: 0,
                                explanation: "",
                              };
                              return (
                                <div key={index} className="p-3 bg-muted/30 rounded-lg space-y-3">
                                  <div className="flex items-start gap-2">
                                    <Checkbox
                                      id={`achieved-${comp}-${index}`}
                                      checked={achievement.achieved}
                                      onCheckedChange={(checked) => 
                                        updateAchievement(comp, index, "achieved", checked)
                                      }
                                    />
                                    <label
                                      htmlFor={`achieved-${comp}-${index}`}
                                      className="text-sm flex-1 cursor-pointer"
                                    >
                                      {goal}
                                    </label>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-xs mb-2 block">
                                      Satisfaction Level: {achievement.satisfaction}%
                                    </Label>
                                    <Slider
                                      value={[achievement.satisfaction]}
                                      onValueChange={(value) => 
                                        updateAchievement(comp, index, "satisfaction", value[0])
                                      }
                                      min={0}
                                      max={100}
                                      step={5}
                                      className="mt-2"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label className="text-xs mb-1.5 block">Achievement Explanation</Label>
                                    <Textarea
                                      value={achievement.explanation}
                                      onChange={(e) => 
                                        updateAchievement(comp, index, "explanation", e.target.value)
                                      }
                                      placeholder="Explain your achievement..."
                                      rows={2}
                                      className="text-xs"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-5 mt-4">
              <div className="space-y-5">
                <div className="space-y-4 border rounded-lg p-5 bg-accent/5">
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        ✅ Key Tasks
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Track project deliverables and learning activities
                      </p>
                    </div>
                    <Button type="button" onClick={addTask} size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Task
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {keyTasks.map((task) => (
                      <div key={task.id} className="p-5 bg-background rounded-lg border space-y-4">
                        {/* Competency and Learning Goal Dropdowns */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs mb-1.5 block">Competency</Label>
                            <Select
                              value={task.competency || ""}
                              onValueChange={(value) => updateTask(task.id, "competency", value as Competency)}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select competency..." />
                              </SelectTrigger>
                              <SelectContent>
                                {COMPETENCIES.filter(c => c !== "Unsure/TBD").map((comp) => (
                                  <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs mb-1.5 block">Learning Goal</Label>
                            <Select
                              value={task.learningGoal || ""}
                              onValueChange={(value) => updateTask(task.id, "learningGoal", value)}
                              disabled={!task.competency}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select learning goal..." />
                              </SelectTrigger>
                              <SelectContent>
                                {task.competency && learningGoals[task.competency as keyof LearningGoals].map((goal, idx) => (
                                  <SelectItem key={idx} value={goal}>{goal}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex justify-between items-start gap-2">
                          <Input
                            value={task.name}
                            onChange={(e) => updateTask(task.id, "name", e.target.value)}
                            placeholder="Task name..."
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <RadioGroup
                          value={task.status}
                          onValueChange={(value) => updateTask(task.id, "status", value)}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="completed" id={`${task.id}-completed`} />
                            <Label htmlFor={`${task.id}-completed`} className="text-sm cursor-pointer">
                              ✅ Completed
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="not-completed" id={`${task.id}-not-completed`} />
                            <Label htmlFor={`${task.id}-not-completed`} className="text-sm cursor-pointer">
                              🕓 Not completed (within sprint)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="to-be-completed" id={`${task.id}-to-be-completed`} />
                            <Label htmlFor={`${task.id}-to-be-completed`} className="text-sm cursor-pointer">
                              🔮 To be completed (future)
                            </Label>
                          </div>
                        </RadioGroup>

                        <Textarea
                          value={task.description || ""}
                          onChange={(e) => updateTask(task.id, "description", e.target.value)}
                          placeholder="Task description (optional)..."
                          rows={2}
                          className="text-sm"
                        />

                        {/* Task Resources Section */}
                        <div className="pt-3 border-t space-y-3">
                          <h4 className="text-sm font-semibold">Task Resources</h4>
                          
                          {/* File Upload */}
                          <div>
                            <Label className="text-xs">Files & Media</Label>
                            <label htmlFor={`task-files-${task.id}`} className="cursor-pointer mt-1.5 block">
                              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                                <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">Upload files</p>
                              </div>
                              <Input
                                id={`task-files-${task.id}`}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => e.target.files && handleTaskFileUpload(task.id, e.target.files)}
                                accept="image/*,video/*,.pdf,.doc,.docx"
                              />
                            </label>

                            {task.files && task.files.length > 0 && (
                              <div className="mt-2 space-y-2">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {task.files.map((file, fileIndex) => (
                                    <div key={fileIndex} className="group relative aspect-square rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 bg-muted/30 transition-all">
                                      {file.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                                        <img 
                                          src={file.url} 
                                          alt={file.name}
                                          className="w-full h-full object-cover"
                                          loading="lazy"
                                        />
                                      ) : file.url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                                        <>
                                          <video 
                                            src={file.url}
                                            className="w-full h-full object-cover"
                                            muted
                                          />
                                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                                              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-primary border-b-[6px] border-b-transparent ml-0.5" />
                                            </div>
                                          </div>
                                        </>
                                      ) : file.url.match(/\.(pdf)$/i) ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 p-3">
                                          <div className="w-10 h-10 mb-1.5 text-red-600 dark:text-red-400">
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-2 4h-1v1h1v1h-1v2H9v-2H8v-1h1v-1H8v-1h1v-1h1v1h1v1zm5 4h-1v-1h-1v-1h1v-1h1v3z"/>
                                            </svg>
                                          </div>
                                          <p className="text-[9px] text-center font-medium text-red-700 dark:text-red-300 truncate w-full px-1">{file.name}</p>
                                        </div>
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-3">
                                          <ExternalLink className="h-6 w-6 mb-1 text-muted-foreground/70" />
                                          <p className="text-[9px] text-center text-muted-foreground truncate w-full">{file.name}</p>
                                        </div>
                                      )}
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        onClick={() => removeTaskFile(task.id, fileIndex)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs"
                                  onClick={() => document.getElementById(`task-files-${task.id}`)?.click()}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add More Files
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Links */}
                          <div>
                            <Label className="text-xs">Links</Label>
                            <div className="mt-1.5 space-y-2">
                              {task.links && task.links.map((link, linkIndex) => (
                                <div key={linkIndex} className="flex items-center gap-2 p-2 bg-muted/30 rounded border">
                                  <a 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline truncate flex-1"
                                  >
                                    {link.title}
                                  </a>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeTaskLink(task.id, linkIndex)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <Input
                                  id={`link-url-${task.id}`}
                                  placeholder="https://..."
                                  className="text-xs"
                                />
                                <Input
                                  id={`link-title-${task.id}`}
                                  placeholder="Title (optional)"
                                  className="text-xs"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const urlInput = document.getElementById(`link-url-${task.id}`) as HTMLInputElement;
                                    const titleInput = document.getElementById(`link-title-${task.id}`) as HTMLInputElement;
                                    if (urlInput.value) {
                                      addTaskLink(task.id, urlInput.value, titleInput.value);
                                      urlInput.value = "";
                                      titleInput.value = "";
                                    }
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {keyTasks.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground">No tasks added yet</p>
                        <Button type="button" variant="ghost" onClick={addTask} className="mt-2">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Task
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || competencies.length === 0}>
              {loading ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
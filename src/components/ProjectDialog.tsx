import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, X, Trash2, Link as LinkIcon } from "lucide-react";
import { Competency, Mode, LearningGoals, KeyTask } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/supabaseHelpers";
import { toast } from "sonner";

const COMPETENCIES: Competency[] = ["Research", "Create", "Organize", "Communicate", "Learn", "Unsure/TBD"];

interface ProjectDialogProps {
  onProjectCreated: () => void;
  currentMode: Mode;
}

export const ProjectDialog = ({ onProjectCreated, currentMode }: ProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [competencies, setCompetencies] = useState<Competency[]>(["Create"]);
  const [loading, setLoading] = useState(false);
  const [learningGoals, setLearningGoals] = useState<LearningGoals>({
    Research: [],
    Create: [],
    Organize: [],
    Communicate: [],
    Learn: [],
  });
  const [keyTasks, setKeyTasks] = useState<KeyTask[]>([]);

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
  };

  const removeGoalFromCompetency = (comp: keyof LearningGoals, index: number) => {
    setLearningGoals(prev => ({
      ...prev,
      [comp]: prev[comp].filter((_, i) => i !== index),
    }));
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
    if (!task || !url) return;
    updateTask(taskId, "links", [...(task.links || []), { url, title: title || url }]);
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
      const { error } = await db.from("projects").insert({
        name,
        description,
        competencies,
        completion: 0,
        mode: currentMode,
        learning_goals: learningGoals,
        key_tasks: keyTasks,
      });

      if (error) throw error;

      toast.success("Project created successfully!");
      setOpen(false);
      resetForm();
      onProjectCreated();
    } catch (error: any) {
      toast.error(error.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCompetencies(["Create"]);
    setKeyTasks([]);
    setLearningGoals({
      Research: [],
      Create: [],
      Organize: [],
      Communicate: [],
      Learn: [],
    });
  };

  const allLearningGoals = Object.entries(learningGoals).flatMap(([comp, goals]) => 
    goals.map(goal => ({ competency: comp as Competency, goal }))
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-full">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Set up your project with clear goals, tasks, and resources
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="goals">Learning Goals</TabsTrigger>
              <TabsTrigger value="tasks">Key Tasks</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-6">
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
                        id={comp}
                        checked={competencies.includes(comp)}
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
                {competencies.length === 0 && (
                  <p className="text-xs text-destructive mt-2">Select at least one competency</p>
                )}
              </div>
            </TabsContent>

            {/* Learning Goals Tab */}
            <TabsContent value="goals" className="space-y-4 mt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Add learning goals for each competency. Each goal will appear as a bullet point.
              </p>
              
              <div className="space-y-6">
                {COMPETENCIES.filter(c => c !== "Unsure/TBD").map((comp) => (
                  <div key={comp} className="border rounded-lg p-4 bg-muted/20">
                    <Label className="text-sm font-semibold mb-2 block">{comp}</Label>
                    
                    {learningGoals[comp as keyof LearningGoals].map((goal, index) => (
                      <div key={index} className="flex items-start gap-2 mb-2 p-2 bg-background rounded">
                        <span className="font-bold text-sm mt-1">•</span>
                        <span className="flex-1 text-sm">{goal}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGoalFromCompetency(comp as keyof LearningGoals, index)}
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
                            addGoalToCompetency(comp as keyof LearningGoals, input.value);
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
                            addGoalToCompetency(comp as keyof LearningGoals, input.value);
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
            </TabsContent>

            {/* Key Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4 mt-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-muted-foreground">
                  Create tasks and add files/links for each task
                </p>
                <Button type="button" onClick={addTask} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </div>

              <div className="space-y-4">
                {keyTasks.map((task) => (
                  <div key={task.id} className="p-5 bg-muted/30 rounded-lg border space-y-4">
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
                            {task.files.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center justify-between p-2 bg-background rounded border text-xs">
                                <span className="truncate flex-1">{file.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTaskFile(task.id, fileIndex)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
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
                            <div key={linkIndex} className="flex items-center gap-2 p-2 bg-background rounded border">
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
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || competencies.length === 0}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
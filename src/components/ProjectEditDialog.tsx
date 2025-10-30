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
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { Competency, Project, LearningGoals, KeyTask } from "@/types";
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
  const [figmaLink, setFigmaLink] = useState(project.figmaLink || "");
  const [githubLink, setGithubLink] = useState(project.githubLink || "");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [learningGoals, setLearningGoals] = useState<LearningGoals>(
    project.learningGoals || {
      Research: "",
      Create: "",
      Organize: "",
      Communicate: "",
      Learn: "",
    }
  );
  const [keyTasks, setKeyTasks] = useState<KeyTask[]>(project.keyTasks || []);

  useEffect(() => {
    if (open) {
      setName(project.name);
      setDescription(project.description || "");
      setCompetencies(project.competencies);
      setCompletion(project.completion);
      setFigmaLink(project.figmaLink || "");
      setGithubLink(project.githubLink || "");
      setFiles([]);
      setLearningGoals(
        project.learningGoals || {
          Research: "",
          Create: "",
          Organize: "",
          Communicate: "",
          Learn: "",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const addTask = () => {
    setKeyTasks([
      ...keyTasks,
      {
        id: Date.now().toString(),
        name: "",
        status: "not-completed",
        description: "",
      },
    ]);
  };

  const updateTask = (id: string, field: keyof KeyTask, value: string) => {
    setKeyTasks(keyTasks.map(task => task.id === id ? { ...task, [field]: value } : task));
  };

  const removeTask = (id: string) => {
    setKeyTasks(keyTasks.filter(task => task.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let visualUrl = project.visualUrl;

      // Upload new files if provided
      if (files.length > 0) {
        const file = files[0];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("project-files")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("project-files").getPublicUrl(fileName);

        visualUrl = publicUrl;
      }

      // Update project
      const { error } = await db
        .from("projects")
        .update({
          name,
          description,
          competencies,
          completion,
          figma_link: figmaLink || null,
          github_link: githubLink || null,
          visual_url: visualUrl || null,
          learning_goals: learningGoals,
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
              <div className="space-y-4 border rounded-lg p-5 bg-primary/5">
                <div className="border-b pb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    🎯 Learning Goals
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    What do you aim to learn or achieve with each competency?
                  </p>
                </div>
                
                <div className="space-y-4">
                  {(["Research", "Create", "Organize", "Communicate", "Learn"] as const).map((comp) => (
                    <div key={comp}>
                      <Label htmlFor={`goal-${comp}`} className="text-sm font-semibold">
                        {comp}
                      </Label>
                      <Textarea
                        id={`goal-${comp}`}
                        value={learningGoals[comp]}
                        onChange={(e) =>
                          setLearningGoals({ ...learningGoals, [comp]: e.target.value })
                        }
                        placeholder={`Learning goals for ${comp}...`}
                        rows={2}
                        className="mt-1.5 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-5 mt-4">
              <div className="space-y-5">
                {/* Task Management Section */}
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
                      <div key={task.id} className="p-4 bg-background rounded-lg border space-y-3">
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
                      </div>
                    ))}

                    {keyTasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
                        No tasks yet. Click "Add Task" to create one.
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Resources Section */}
                <div className="space-y-4 border rounded-lg p-5 bg-muted/20">
                  <div className="border-b pb-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      🔗 Project Resources
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add links and upload project files
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="figma">Figma Link</Label>
                      <Input
                        id="figma"
                        type="url"
                        value={figmaLink}
                        onChange={(e) => setFigmaLink(e.target.value)}
                        placeholder="https://figma.com/..."
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="github">GitHub Link</Label>
                      <Input
                        id="github"
                        type="url"
                        value={githubLink}
                        onChange={(e) => setGithubLink(e.target.value)}
                        placeholder="https://github.com/..."
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="files">Project Files & Media</Label>
                    <div className="mt-2">
                      <label htmlFor="files" className="cursor-pointer">
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors bg-background">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload new files
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Images, videos, documents
                          </p>
                        </div>
                        <Input
                          id="files"
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileChange}
                          accept="image/*,video/*,.pdf,.doc,.docx"
                        />
                      </label>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-background rounded-lg border"
                          >
                            <span className="text-sm truncate flex-1">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || competencies.length === 0} className="px-6">
              {loading ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
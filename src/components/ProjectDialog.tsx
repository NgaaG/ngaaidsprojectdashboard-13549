import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Upload, X } from "lucide-react";
import { Competency, Mode, LearningGoals } from "@/types";
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
  const [figmaLink, setFigmaLink] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [learningGoals, setLearningGoals] = useState<LearningGoals>({
    Research: "",
    Create: "",
    Organize: "",
    Communicate: "",
    Learn: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload files to storage
      let visualUrl = "";
      if (files.length > 0) {
        const file = files[0]; // Use first file as visual
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from("project-files")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("project-files")
          .getPublicUrl(fileName);
        
        visualUrl = publicUrl;
      }

      // Create project
      const { error } = await db.from("projects").insert({
        name,
        description,
        competencies,
        figma_link: figmaLink || null,
        github_link: githubLink || null,
        visual_url: visualUrl || null,
        completion: 0,
        mode: currentMode,
        learning_goals: learningGoals,
        key_tasks: [],
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
    setFigmaLink("");
    setGithubLink("");
    setFiles([]);
    setLearningGoals({
      Research: "",
      Create: "",
      Organize: "",
      Communicate: "",
      Learn: "",
    });
  };

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
          {/* Basic Info Section */}
          <div className="space-y-4 border rounded-lg p-5 bg-muted/20">
            <h3 className="font-semibold flex items-center gap-2 text-base">
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
          </div>

          {/* Learning Goals Section */}
          <div className="space-y-4 border rounded-lg p-5 bg-primary/5">
            <h3 className="font-semibold flex items-center gap-2 text-base">
              🎯 Learning Goals
            </h3>
            <p className="text-sm text-muted-foreground">
              What do you aim to learn or achieve with each competency?
            </p>
            
            <div className="grid gap-4">
              {COMPETENCIES.filter(c => c !== "Unsure/TBD").map((comp) => (
                <div key={comp}>
                  <Label htmlFor={`goal-${comp}`} className="text-sm font-semibold">
                    {comp}
                  </Label>
                  <Textarea
                    id={`goal-${comp}`}
                    value={learningGoals[comp as keyof LearningGoals] || ""}
                    onChange={(e) => {
                      setLearningGoals({
                        ...learningGoals,
                        [comp]: e.target.value,
                      });
                    }}
                    placeholder={`Learning goals for ${comp}...`}
                    rows={2}
                    className="mt-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Key Tasks & Resources Section */}
          <div className="space-y-4 border rounded-lg p-5 bg-accent/5">
            <h3 className="font-semibold flex items-center gap-2 text-base">
              ✅ Key Tasks & Resources
            </h3>
            <p className="text-sm text-muted-foreground">
              Upload project files, add links to Figma, GitHub, or other resources
            </p>

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
                      Click to upload or drag and drop
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
                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border">
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

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || competencies.length === 0} className="px-6">
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

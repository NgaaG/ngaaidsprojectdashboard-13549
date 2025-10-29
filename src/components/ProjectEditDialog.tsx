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
import { Upload, X } from "lucide-react";
import { Competency, Project } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/supabaseHelpers";
import { toast } from "sonner";

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

  useEffect(() => {
    if (open) {
      setName(project.name);
      setDescription(project.description || "");
      setCompetencies(project.competencies);
      setCompletion(project.completion);
      setFigmaLink(project.figmaLink || "");
      setGithubLink(project.githubLink || "");
      setFiles([]);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter project name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={3}
            />
          </div>

          <div>
            <Label>CMD Competencies (select all that apply)</Label>
            <div className="grid grid-cols-2 gap-3 mt-3 p-4 bg-muted/50 rounded-lg">
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
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="figma">Figma Link (optional)</Label>
            <Input
              id="figma"
              type="url"
              value={figmaLink}
              onChange={(e) => setFigmaLink(e.target.value)}
              placeholder="https://figma.com/..."
            />
          </div>

          <div>
            <Label htmlFor="github">GitHub Link (optional)</Label>
            <Input
              id="github"
              type="url"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <Label htmlFor="files">Update Visual (Images, Videos, PDFs)</Label>
            <div className="mt-2">
              <label htmlFor="files" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload new files
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
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded"
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

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
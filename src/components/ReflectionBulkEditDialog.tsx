import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { MoodType } from "@/types";
import { db } from "@/lib/supabaseHelpers";
import { toast } from "sonner";

const MOODS: { value: MoodType; emoji: string; label: string; color: string }[] = [
  { value: "calm", emoji: "😌", label: "Calm", color: "hsl(195 60% 76%)" },
  { value: "anxious", emoji: "😰", label: "Anxious", color: "hsl(0 70% 70%)" },
  { value: "focused", emoji: "🎯", label: "Focused", color: "hsl(160 55% 80%)" },
  { value: "overwhelmed", emoji: "😵", label: "Overwhelmed", color: "hsl(280 50% 75%)" },
  { value: "energized", emoji: "⚡", label: "Energized", color: "hsl(45 100% 65%)" },
];

const SATISFACTION: { value: MoodType; emoji: string; label: string; color: string }[] = [
  { value: "energized", emoji: "🤩", label: "Very Satisfied", color: "hsl(160 55% 80%)" },
  { value: "focused", emoji: "😊", label: "Satisfied", color: "hsl(195 60% 76%)" },
  { value: "calm", emoji: "😐", label: "Neutral", color: "hsl(45 100% 75%)" },
  { value: "anxious", emoji: "😔", label: "Dissatisfied", color: "hsl(35 90% 70%)" },
  { value: "overwhelmed", emoji: "😞", label: "Very Dissatisfied", color: "hsl(0 70% 70%)" },
];

interface ReflectionBulkEditDialogProps {
  selectedReflections: any[];
  projects: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ReflectionBulkEditDialog = ({
  selectedReflections,
  projects,
  open,
  onOpenChange,
  onSuccess,
}: ReflectionBulkEditDialogProps) => {
  const [projectId, setProjectId] = useState<string>("");
  const [mood, setMood] = useState<MoodType | "">("");
  const [loading, setLoading] = useState(false);

  // Detect if all selected reflections are the same mode
  const modes = [...new Set(selectedReflections.map(r => r.mode))];
  const isMixedMode = modes.length > 1;
  const singleMode = modes.length === 1 ? modes[0] : "personal";
  const emotionOptions = singleMode === "personal" ? MOODS : SATISFACTION;

  useEffect(() => {
    if (open) {
      setProjectId("");
      setMood("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId && !mood) {
      toast.error("Please select at least one field to update");
      return;
    }

    setLoading(true);

    try {
      const updateData: any = {};
      if (projectId) updateData.project_id = projectId;
      if (mood) updateData.mood = mood;

      // Update all selected reflections
      const updatePromises = selectedReflections.map(reflection =>
        db
          .from("reflections")
          .update(updateData)
          .eq("id", reflection.id)
      );

      const results = await Promise.all(updatePromises);

      // Check for errors
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} reflection(s)`);
      }

      toast.success(`Successfully updated ${selectedReflections.length} reflection(s)!`);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update reflections");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Bulk Edit Reflections</DialogTitle>
          <DialogDescription className="text-base">
            Update {selectedReflections.length} selected reflection{selectedReflections.length !== 1 ? 's' : ''} at once.
            Only fill in the fields you want to change.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="bulk-project">Change Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Keep current projects..." />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="_none_">
                  <span className="text-muted-foreground">Keep current projects</span>
                </SelectItem>
                {projects.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    No projects available
                  </div>
                ) : (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <span>{project.name}</span>
                        <span className="text-xs text-muted-foreground">({project.completion}% complete)</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Mood Selection */}
          <div className="space-y-3">
            <Label>Change {isMixedMode ? "Mood/Satisfaction" : (singleMode === "personal" ? "Mood" : "Satisfaction Level")}</Label>
            {isMixedMode && (
              <p className="text-sm text-muted-foreground">
                Note: Selected reflections have mixed modes (Personal/Sprint). Mood will be applied to all.
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMood("")}
                className={`gap-2 transition-all ${!mood ? 'border-primary' : ''}`}
              >
                <X className="h-4 w-4" />
                Keep Current
              </Button>
              {emotionOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={mood === option.value ? "default" : "outline"}
                  onClick={() => setMood(option.value)}
                  className="gap-2 transition-all hover:scale-105"
                  style={
                    mood === option.value
                      ? { backgroundColor: option.color, borderColor: option.color, color: 'hsl(260 35% 25%)' }
                      : {}
                  }
                >
                  <span className="text-xl">{option.emoji}</span>
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold">Summary of Changes:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {selectedReflections.length} reflection{selectedReflections.length !== 1 ? 's' : ''} will be updated</li>
              {projectId && projectId !== "_none_" && (
                <li>• Project will be changed to: {projects.find(p => p.id === projectId)?.name}</li>
              )}
              {mood && (
                <li>• Mood will be changed to: {emotionOptions.find(e => e.value === mood)?.label}</li>
              )}
              {!projectId && !mood && (
                <li className="text-amber-600">• No changes selected yet</li>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || (!projectId && !mood) || projectId === "_none_"} 
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? "Updating..." : `Update ${selectedReflections.length} Reflection${selectedReflections.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

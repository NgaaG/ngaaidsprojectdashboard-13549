import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Competency, LearningGoals } from "@/types";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

interface LearningGoalsEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learningGoals: LearningGoals;
  onSave: (goals: LearningGoals) => void;
}

const COMPETENCIES: Competency[] = ["Research", "Create", "Organize", "Communicate", "Learn"];

export const LearningGoalsEditDialog = ({
  open,
  onOpenChange,
  learningGoals,
  onSave,
}: LearningGoalsEditDialogProps) => {
  const [editedGoals, setEditedGoals] = useState<LearningGoals>(learningGoals);

  useEffect(() => {
    if (open) {
      setEditedGoals(learningGoals);
    }
  }, [open, learningGoals]);

  const handleAddGoal = (competency: Competency) => {
    setEditedGoals({
      ...editedGoals,
      [competency]: [...(editedGoals[competency] || []), ""],
    });
  };

  const handleRemoveGoal = (competency: Competency, index: number) => {
    const updated = [...(editedGoals[competency] || [])];
    updated.splice(index, 1);
    setEditedGoals({
      ...editedGoals,
      [competency]: updated,
    });
  };

  const handleUpdateGoal = (competency: Competency, index: number, value: string) => {
    const updated = [...(editedGoals[competency] || [])];
    updated[index] = value;
    setEditedGoals({
      ...editedGoals,
      [competency]: updated,
    });
  };

  const handleSave = () => {
    // Filter out empty goals
    const cleanedGoals: LearningGoals = {
      Research: [],
      Create: [],
      Organize: [],
      Communicate: [],
      Learn: [],
    };

    COMPETENCIES.forEach((comp) => {
      cleanedGoals[comp] = (editedGoals[comp] || []).filter((goal) => goal.trim() !== "");
    });

    onSave(cleanedGoals);
    toast.success("Learning goals updated!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Learning Goals</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {COMPETENCIES.map((competency) => (
            <div key={competency} className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">{competency}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddGoal(competency)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Goal
                </Button>
              </div>

              <div className="space-y-2">
                {(editedGoals[competency] || []).map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={goal}
                      onChange={(e) => handleUpdateGoal(competency, index, e.target.value)}
                      placeholder={`Enter ${competency.toLowerCase()} goal...`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveGoal(competency, index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {(!editedGoals[competency] || editedGoals[competency].length === 0) && (
                  <p className="text-sm text-muted-foreground italic">
                    No goals set for this competency yet
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Edit2, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface GeneralLearningGoalsData {
  heading: string;
  subheading: string;
  goals: string[];
}

interface GeneralLearningGoalsSectionProps {
  data: GeneralLearningGoalsData | null;
  onSave: (data: GeneralLearningGoalsData) => Promise<void>;
  isViewerMode?: boolean;
}

export const GeneralLearningGoalsSection = ({ 
  data, 
  onSave, 
  isViewerMode = false 
}: GeneralLearningGoalsSectionProps) => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [savedData, setSavedData] = useState<GeneralLearningGoalsData | null>(data);

  useEffect(() => {
    if (data) {
      setSavedData(data);
    }
  }, [data]);

  const addGoal = () => {
    if (!newGoal.trim()) {
      toast.error("Please enter a goal");
      return;
    }
    setGoals([...goals, newGoal.trim()]);
    setNewGoal("");
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!heading.trim() && goals.length === 0) {
      toast.error("Please enter a heading and at least one goal");
      return;
    }

    if (!heading.trim()) {
      toast.error("Please enter a heading");
      return;
    }

    const goalsData: GeneralLearningGoalsData = {
      heading: heading.trim(),
      subheading: subheading.trim(),
      goals: goals.filter(g => g.trim()),
    };

    try {
      await onSave(goalsData);
      setSavedData(goalsData);
      // Clear form after save
      setHeading("");
      setSubheading("");
      setGoals([]);
      toast.success("Learning goals saved!");
    } catch (error) {
      // Error already handled in parent
    }
  };

  const handleEdit = () => {
    if (savedData) {
      setHeading(savedData.heading);
      setSubheading(savedData.subheading);
      setGoals(savedData.goals);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete all general learning goals?")) {
      try {
        await onSave({ heading: "", subheading: "", goals: [] });
        setSavedData(null);
        setHeading("");
        setSubheading("");
        setGoals([]);
        toast.success("Learning goals deleted");
      } catch (error) {
        // Error already handled in parent
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>💡 General Learning Goals</CardTitle>
        <CardDescription>
          Explore and define your learning intentions in an abstract way before organizing them into competencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Form */}
        <div className="space-y-2">
          <Label htmlFor="heading">Main Heading/Title</Label>
          <Input
            id="heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="e.g., Q2 Learning Focus Areas"
            disabled={isViewerMode}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subheading">Subheading (optional)</Label>
          <Input
            id="subheading"
            value={subheading}
            onChange={(e) => setSubheading(e.target.value)}
            placeholder="e.g., Core skills I want to develop this quarter"
            disabled={isViewerMode}
          />
        </div>

        <div className="space-y-2">
          <Label>Learning Goals</Label>
          <div className="space-y-2">
            {goals.map((goal, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-muted/20 rounded">
                <span className="font-bold text-sm mt-1">•</span>
                <span className="flex-1 text-sm">{goal}</span>
                {!isViewerMode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGoal(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {!isViewerMode && (
            <div className="flex gap-2">
              <Input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a learning goal..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addGoal();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGoal}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {!isViewerMode && (
          <Button onClick={handleSave} className="w-full gap-2">
            <Save className="h-4 w-4" />
            Save Learning Goals
          </Button>
        )}

        {/* Saved Overview Display */}
        {savedData && savedData.heading && (
          <div className="mt-6 pt-6 border-t space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-base mb-1">
                  📋 Saved Overview
                </h4>
                <h5 className="text-lg font-bold">{savedData.heading}</h5>
                {savedData.subheading && (
                  <p className="text-sm text-muted-foreground mt-1">{savedData.subheading}</p>
                )}
              </div>
              {!isViewerMode && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
            
            {savedData.goals.length > 0 ? (
              <ul className="space-y-2 bg-muted/30 rounded-lg p-4">
                {savedData.goals.map((goal, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="font-bold mt-0.5">•</span>
                    <span className="flex-1">{goal}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No goals added yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

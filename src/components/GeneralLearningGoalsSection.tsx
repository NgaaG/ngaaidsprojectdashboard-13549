import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Edit2, Trash2 } from "lucide-react";
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
  const [isEditing, setIsEditing] = useState(!data?.heading && !data?.goals?.length);
  const [heading, setHeading] = useState(data?.heading || "");
  const [subheading, setSubheading] = useState(data?.subheading || "");
  const [goals, setGoals] = useState<string[]>(data?.goals || []);
  const [newGoal, setNewGoal] = useState("");

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
    if (!heading.trim()) {
      toast.error("Please enter a heading");
      return;
    }

    const goalsData: GeneralLearningGoalsData = {
      heading: heading.trim(),
      subheading: subheading.trim(),
      goals: goals.filter(g => g.trim()),
    };

    await onSave(goalsData);
    setIsEditing(false);
    toast.success("Learning goals saved!");
  };

  const handleEdit = () => {
    if (data) {
      setHeading(data.heading);
      setSubheading(data.subheading);
      setGoals(data.goals);
    }
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete all general learning goals?")) {
      await onSave({ heading: "", subheading: "", goals: [] });
      setHeading("");
      setSubheading("");
      setGoals([]);
      setIsEditing(true);
      toast.success("Learning goals deleted");
    }
  };

  if (!isEditing && data?.heading) {
    // Display mode
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                💡 {data.heading}
              </CardTitle>
              {data.subheading && (
                <CardDescription className="mt-1">{data.subheading}</CardDescription>
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
        </CardHeader>
        <CardContent>
          {data.goals.length > 0 ? (
            <ul className="space-y-2">
              {data.goals.map((goal, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="font-bold mt-0.5">•</span>
                  <span className="flex-1">{goal}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No goals added yet</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Edit mode
  return (
    <Card>
      <CardHeader>
        <CardTitle>💡 General Learning Goals</CardTitle>
        <CardDescription>
          Explore and define your learning intentions in an abstract way before organizing them into competencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Learning Goals
            </Button>
            {data?.heading && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setHeading(data.heading);
                  setSubheading(data.subheading);
                  setGoals(data.goals);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
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
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, X, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LearningGoalsEntry {
  id: string;
  entry_date: string;
  heading: string;
  subheading: string;
  goals: string[];
  achievement_level: number;
}

interface GeneralLearningGoalsEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: LearningGoalsEntry | null;
  onSave: (updatedEntry: LearningGoalsEntry) => void;
}

export const GeneralLearningGoalsEditDialog = ({
  open,
  onOpenChange,
  entry,
  onSave,
}: GeneralLearningGoalsEditDialogProps) => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [achievementLevel, setAchievementLevel] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (open && entry) {
      setHeading(entry.heading);
      setSubheading(entry.subheading);
      setGoals(entry.goals);
      setAchievementLevel(entry.achievement_level);
      setSelectedDate(new Date(entry.entry_date));
    }
  }, [open, entry]);

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

  const handleSave = () => {
    if (!heading.trim()) {
      toast.error("Please enter a heading");
      return;
    }

    if (goals.length === 0) {
      toast.error("Please add at least one goal");
      return;
    }

    if (!entry) return;

    const updatedEntry: LearningGoalsEntry = {
      ...entry,
      entry_date: format(selectedDate, "yyyy-MM-dd"),
      heading: heading.trim(),
      subheading: subheading.trim(),
      goals: goals.filter(g => g.trim()),
      achievement_level: achievementLevel,
    };

    onSave(updatedEntry);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Learning Goals Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Entry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-heading">Main Heading/Title *</Label>
            <Input
              id="edit-heading"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g., Q2 Learning Focus Areas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-subheading">Subheading (optional)</Label>
            <Input
              id="edit-subheading"
              value={subheading}
              onChange={(e) => setSubheading(e.target.value)}
              placeholder="e.g., Core skills I want to develop"
            />
          </div>

          <div className="space-y-2">
            <Label>Learning Goals</Label>
            <div className="space-y-2">
              {goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted/20 rounded">
                  <span className="font-bold text-sm mt-1">•</span>
                  <span className="flex-1 text-sm">{goal}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGoal(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

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
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Achievement Level</Label>
              <span className="text-2xl font-bold text-primary">{achievementLevel}%</span>
            </div>
            <Slider
              value={[achievementLevel]}
              onValueChange={(vals) => setAchievementLevel(vals[0])}
              max={100}
              step={5}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Not Started</span>
              <span>In Progress</span>
              <span>Achieved</span>
            </div>
          </div>
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

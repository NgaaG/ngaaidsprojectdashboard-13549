import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, X, Save, CalendarIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/supabaseHelpers";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LearningGoalsEntry {
  id: string;
  entry_date: string;
  heading: string;
  subheading: string;
  goals: string[];
  achievement_level: number;
  created_at: string;
}

interface GeneralLearningGoalsHistoryProps {
  isViewerMode?: boolean;
}

export const GeneralLearningGoalsHistory = ({ 
  isViewerMode = false 
}: GeneralLearningGoalsHistoryProps) => {
  const [entries, setEntries] = useState<LearningGoalsEntry[]>([]);
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [achievementLevel, setAchievementLevel] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const { data, error } = await db
        .from("general_learning_goals_entries")
        .select("*")
        .order("entry_date", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error loading learning goals entries:", error);
    }
  };

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

    if (goals.length === 0) {
      toast.error("Please add at least one goal");
      return;
    }

    setLoading(true);
    try {
      const { error } = await db
        .from("general_learning_goals_entries")
        .insert({
          entry_date: format(selectedDate, "yyyy-MM-dd"),
          heading: heading.trim(),
          subheading: subheading.trim(),
          goals: goals.filter(g => g.trim()),
          achievement_level: achievementLevel,
        });

      if (error) throw error;

      toast.success("Learning goals entry saved!");
      
      // Clear form
      setHeading("");
      setSubheading("");
      setGoals([]);
      setAchievementLevel(0);
      setSelectedDate(new Date());
      
      // Reload entries
      loadEntries();
    } catch (error: any) {
      console.error("Error saving learning goals entry:", error);
      toast.error("Failed to save learning goals entry");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this learning goals entry?")) {
      return;
    }

    try {
      const { error } = await db
        .from("general_learning_goals_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Entry deleted");
      loadEntries();
    } catch (error: any) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>💡 General Learning Goals</CardTitle>
        <CardDescription>
          Track your learning intentions over time with achievement levels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isViewerMode && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h3 className="font-semibold">Add New Entry</h3>
            
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
              <Label htmlFor="heading">Main Heading/Title *</Label>
              <Input
                id="heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g., Q2 Learning Focus Areas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subheading">Subheading (optional)</Label>
              <Input
                id="subheading"
                value={subheading}
                onChange={(e) => setSubheading(e.target.value)}
                placeholder="e.g., Core skills I want to develop"
              />
            </div>

            <div className="space-y-2">
              <Label>Learning Goals</Label>
              <div className="space-y-2">
                {goals.map((goal, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-background rounded">
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

            <Button 
              onClick={handleSave} 
              className="w-full gap-2"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        )}

        {/* Display All Entries */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Learning Goals History</h3>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground italic text-center py-8">
              No learning goals entries yet. Create your first one above!
            </p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 border rounded-lg space-y-3 bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        📅 {format(new Date(entry.entry_date), "PPP")}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold">{entry.heading}</h4>
                    {entry.subheading && (
                      <p className="text-sm text-muted-foreground mt-1">{entry.subheading}</p>
                    )}
                  </div>
                  {!isViewerMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {entry.goals.length > 0 && (
                  <ul className="space-y-1 bg-muted/30 rounded-lg p-3">
                    {entry.goals.map((goal: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="font-bold mt-0.5">•</span>
                        <span className="flex-1">{goal}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Achievement</span>
                    <span className="font-bold text-primary">{entry.achievement_level}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${entry.achievement_level}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
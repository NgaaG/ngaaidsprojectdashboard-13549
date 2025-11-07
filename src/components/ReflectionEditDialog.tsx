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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Save } from "lucide-react";
import { MoodType, Mode } from "@/types";
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

interface ReflectionEditDialogProps {
  reflection: any;
  projects: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ReflectionEditDialog = ({
  reflection,
  projects,
  open,
  onOpenChange,
  onSuccess,
}: ReflectionEditDialogProps) => {
  const [projectId, setProjectId] = useState(reflection.project_id);
  const [mood, setMood] = useState<MoodType>(reflection.mood);
  const [emotionalDump, setEmotionalDump] = useState(reflection.emotional_dump || "");
  const [thoughtsWhatIThink, setThoughtsWhatIThink] = useState(reflection.thoughts_what_i_think || "");
  const [thoughtsWhatIsTrue, setThoughtsWhatIsTrue] = useState(reflection.thoughts_what_is_true || "");
  const [contingencyPlan, setContingencyPlan] = useState(reflection.contingency_plan || "");
  const [todoList, setTodoList] = useState<string[]>(reflection.todo_list || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setProjectId(reflection.project_id);
      setMood(reflection.mood);
      setEmotionalDump(reflection.emotional_dump || "");
      setThoughtsWhatIThink(reflection.thoughts_what_i_think || "");
      setThoughtsWhatIsTrue(reflection.thoughts_what_is_true || "");
      setContingencyPlan(reflection.contingency_plan || "");
      setTodoList(reflection.todo_list || []);
    }
  }, [open, reflection]);

  const calculateProgress = () => {
    const fields = [emotionalDump, thoughtsWhatIThink, thoughtsWhatIsTrue, contingencyPlan];
    const filledFields = fields.filter((f) => f.trim().length > 0).length;
    return (filledFields / 4) * 100;
  };

  const emotionOptions = reflection.mode === "personal" ? MOODS : SATISFACTION;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId) {
      toast.error("Please select a project");
      return;
    }

    setLoading(true);

    try {
      const progress = calculateProgress();
      
      const { error } = await db
        .from("reflections")
        .update({
          project_id: projectId,
          mood,
          emotional_dump: emotionalDump,
          thoughts_what_i_think: thoughtsWhatIThink,
          thoughts_what_is_true: thoughtsWhatIsTrue,
          contingency_plan: contingencyPlan,
          todo_list: todoList,
          progress,
        })
        .eq("id", reflection.id);

      if (error) throw error;

      toast.success("Reflection updated successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update reflection");
    } finally {
      setLoading(false);
    }
  };

  const addTodoItem = () => {
    setTodoList([...todoList, ""]);
  };

  const updateTodoItem = (index: number, value: string) => {
    const newList = [...todoList];
    newList[index] = value;
    setTodoList(newList);
  };

  const removeTodoItem = (index: number) => {
    setTodoList(todoList.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Reflection</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Update your reflection details and content
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent className="bg-popover">
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
            <Label>
              {reflection.mode === "personal" ? "How are you feeling?" : "Satisfaction Level"}
            </Label>
            <div className="flex gap-2 flex-wrap">
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

          {/* Content Sections */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="emotional-dump">
                {reflection.mode === "personal" ? "Emotional Brain Dump" : "Sprint Summary - What I Learned"}
              </Label>
              <Textarea
                id="emotional-dump"
                value={emotionalDump}
                onChange={(e) => setEmotionalDump(e.target.value)}
                placeholder={reflection.mode === "personal" ? "Let it all out..." : "What I learned..."}
                className="min-h-32 mt-2"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="thoughts-think">
                  {reflection.mode === "personal" ? "What I Think" : "Challenges Faced"}
                </Label>
                <Textarea
                  id="thoughts-think"
                  value={thoughtsWhatIThink}
                  onChange={(e) => setThoughtsWhatIThink(e.target.value)}
                  placeholder={reflection.mode === "personal" ? "The thought that's bothering me..." : "Challenges I faced..."}
                  className="min-h-32 mt-2"
                />
              </div>
              <div>
                <Label htmlFor="thoughts-true">
                  {reflection.mode === "personal" ? "What's True" : "How I Overcame Them"}
                </Label>
                <Textarea
                  id="thoughts-true"
                  value={thoughtsWhatIsTrue}
                  onChange={(e) => setThoughtsWhatIsTrue(e.target.value)}
                  placeholder={reflection.mode === "personal" ? "The evidence and reality..." : "How I solved them..."}
                  className="min-h-32 mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contingency-plan">
                {reflection.mode === "personal" ? "Contingency Plan" : "Next Steps"}
              </Label>
              <Textarea
                id="contingency-plan"
                value={contingencyPlan}
                onChange={(e) => setContingencyPlan(e.target.value)}
                placeholder={reflection.mode === "personal" ? "What can I do next?" : "Next steps..."}
                className="min-h-24 mt-2"
              />
            </div>

            {/* To-Do List (only for personal mode) */}
            {reflection.mode === "personal" && (
              <div>
                <Label>To-Do Anchor</Label>
                <p className="text-xs text-muted-foreground mb-3">Break it down into bite-sized tasks</p>
                <div className="space-y-2">
                  {todoList.map((todo, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={todo}
                        onChange={(e) => updateTodoItem(index, e.target.value)}
                        placeholder="Small actionable task..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTodoItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTodoItem}
                    className="w-full"
                  >
                    + Add Task
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !projectId} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

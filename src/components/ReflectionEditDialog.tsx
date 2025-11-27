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
import { Trash2, Save, Plus } from "lucide-react";
import { MoodType, Mode, ReflectionEntry, ChallengeEntry } from "@/types";
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
  
  // New structured fields for lecture mode
  const [whatIDid, setWhatIDid] = useState<ReflectionEntry[]>(reflection.what_i_did || []);
  const [whatILearned, setWhatILearned] = useState<ReflectionEntry[]>(reflection.what_i_learned || []);
  const [challengesStructured, setChallengesStructured] = useState<ChallengeEntry[]>(reflection.challenges_structured || []);
  const [solutionsStructured, setSolutionsStructured] = useState<ChallengeEntry[]>(reflection.solutions_structured || []);
  const [fillTheGaps, setFillTheGaps] = useState<ReflectionEntry[]>(reflection.fill_the_gaps || []);
  const [nextSteps, setNextSteps] = useState<ReflectionEntry[]>(reflection.next_steps || []);
  
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
      setWhatIDid(reflection.what_i_did || []);
      setWhatILearned(reflection.what_i_learned || []);
      setChallengesStructured(reflection.challenges_structured || []);
      setSolutionsStructured(reflection.solutions_structured || []);
      setFillTheGaps(reflection.fill_the_gaps || []);
      setNextSteps(reflection.next_steps || []);
    }
  }, [open, reflection]);

  const calculateProgress = () => {
    if (reflection.mode === "personal") {
      const fields = [emotionalDump, thoughtsWhatIThink, thoughtsWhatIsTrue, contingencyPlan];
      const filledFields = fields.filter((f) => f.trim().length > 0).length;
      return (filledFields / 4) * 100;
    } else {
      const sections = [
        emotionalDump,
        whatIDid.length > 0,
        whatILearned.length > 0,
        challengesStructured.length > 0 || solutionsStructured.length > 0,
        fillTheGaps.length > 0,
        nextSteps.length > 0,
      ];
      const filledSections = sections.filter(s => typeof s === "string" ? s.trim() : s).length;
      return (filledSections / 6) * 100;
    }
  };

  const emotionOptions = reflection.mode === "personal" ? MOODS : SATISFACTION;

  // Helper functions for entry management
  const addEntry = (
    entries: ReflectionEntry[],
    setEntries: (entries: ReflectionEntry[]) => void
  ) => {
    setEntries([...entries, { id: crypto.randomUUID(), subheading: "", content: "" }]);
  };

  const updateEntry = (
    entries: ReflectionEntry[],
    setEntries: (entries: ReflectionEntry[]) => void,
    id: string,
    field: "subheading" | "content",
    value: string
  ) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEntry = (
    entries: ReflectionEntry[],
    setEntries: (entries: ReflectionEntry[]) => void,
    id: string
  ) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  // Challenge entry helpers
  const addChallenge = (type: "challenge" | "solution") => {
    const entries = type === "challenge" ? challengesStructured : solutionsStructured;
    const setEntries = type === "challenge" ? setChallengesStructured : setSolutionsStructured;
    setEntries([...entries, { id: crypto.randomUUID(), category: "ideas-design", content: "" }]);
  };

  const updateChallenge = (
    type: "challenge" | "solution",
    id: string,
    field: "category" | "content",
    value: string
  ) => {
    const entries = type === "challenge" ? challengesStructured : solutionsStructured;
    const setEntries = type === "challenge" ? setChallengesStructured : setSolutionsStructured;
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeChallenge = (type: "challenge" | "solution", id: string) => {
    const entries = type === "challenge" ? challengesStructured : solutionsStructured;
    const setEntries = type === "challenge" ? setChallengesStructured : setSolutionsStructured;
    setEntries(entries.filter(e => e.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId) {
      toast.error("Please select a project");
      return;
    }

    setLoading(true);

    try {
      const progress = Math.round(calculateProgress());
      
      const updateData: any = {
        project_id: projectId,
        mood,
        emotional_dump: emotionalDump,
        progress,
      };

      if (reflection.mode === "personal") {
        updateData.thoughts_what_i_think = thoughtsWhatIThink;
        updateData.thoughts_what_is_true = thoughtsWhatIsTrue;
        updateData.contingency_plan = contingencyPlan;
        updateData.todo_list = todoList;
      } else {
        updateData.what_i_did = whatIDid;
        updateData.what_i_learned = whatILearned;
        updateData.challenges_structured = challengesStructured;
        updateData.solutions_structured = solutionsStructured;
        updateData.fill_the_gaps = fillTheGaps;
        updateData.next_steps = nextSteps;
      }

      const { error } = await db
        .from("reflections")
        .update(updateData)
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

  const renderEntrySection = (
    title: string,
    entries: ReflectionEntry[],
    setEntries: (entries: ReflectionEntry[]) => void
  ) => (
    <div className="space-y-3">
      <Label className="text-base font-semibold">{title}</Label>
      {entries.map((entry, index) => (
        <div key={entry.id} className="p-4 border rounded-lg space-y-3 bg-muted/10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Entry {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeEntry(entries, setEntries, entry.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Input
            placeholder="Subheading (optional one-liner)"
            value={entry.subheading}
            onChange={(e) => updateEntry(entries, setEntries, entry.id, "subheading", e.target.value)}
          />
          <Textarea
            placeholder="Content..."
            value={entry.content}
            onChange={(e) => updateEntry(entries, setEntries, entry.id, "content", e.target.value)}
            className="min-h-24"
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => addEntry(entries, setEntries)}
        className="w-full gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Entry
      </Button>
    </div>
  );

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
          <div className="space-y-6">
            {/* Session Summary (both modes) */}
            <div>
              <Label htmlFor="emotional-dump">
                {reflection.mode === "personal" ? "Emotional Brain Dump" : "Session Summary"}
              </Label>
              <Textarea
                id="emotional-dump"
                value={emotionalDump}
                onChange={(e) => setEmotionalDump(e.target.value)}
                placeholder={reflection.mode === "personal" ? "Let it all out..." : "Summary of the session..."}
                className="min-h-32 mt-2"
              />
            </div>

            {reflection.mode === "personal" ? (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="thoughts-think">What I Think</Label>
                    <Textarea
                      id="thoughts-think"
                      value={thoughtsWhatIThink}
                      onChange={(e) => setThoughtsWhatIThink(e.target.value)}
                      placeholder="The thought that's bothering me..."
                      className="min-h-32 mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thoughts-true">What's True</Label>
                    <Textarea
                      id="thoughts-true"
                      value={thoughtsWhatIsTrue}
                      onChange={(e) => setThoughtsWhatIsTrue(e.target.value)}
                      placeholder="The evidence and reality..."
                      className="min-h-32 mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contingency-plan">Contingency Plan</Label>
                  <Textarea
                    id="contingency-plan"
                    value={contingencyPlan}
                    onChange={(e) => setContingencyPlan(e.target.value)}
                    placeholder="What can I do next?"
                    className="min-h-24 mt-2"
                  />
                </div>

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
              </>
            ) : (
              <>
                {/* Lecture Mode Sections */}
                {renderEntrySection("2️⃣ What I Did", whatIDid, setWhatIDid)}
                {renderEntrySection("3️⃣ What I Learned", whatILearned, setWhatILearned)}

                {/* Challenges & Solutions */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">4️⃣ Challenges & Solutions</Label>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Challenges */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Challenges</p>
                      {challengesStructured.map((entry, index) => (
                        <div key={entry.id} className="p-3 border rounded-lg space-y-2 bg-muted/10">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Challenge {index + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChallenge("challenge", entry.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <Select
                            value={entry.category}
                            onValueChange={(value) => updateChallenge("challenge", entry.id, "category", value)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ideas-design">💡 Ideas/Design Skills</SelectItem>
                              <SelectItem value="personal">🧠 Personal</SelectItem>
                            </SelectContent>
                          </Select>
                          <Textarea
                            placeholder="Describe the challenge..."
                            value={entry.content}
                            onChange={(e) => updateChallenge("challenge", entry.id, "content", e.target.value)}
                            className="min-h-20"
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addChallenge("challenge")}
                        className="w-full gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Challenge
                      </Button>
                    </div>

                    {/* Solutions */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Solutions</p>
                      {solutionsStructured.map((entry, index) => (
                        <div key={entry.id} className="p-3 border rounded-lg space-y-2 bg-muted/10">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Solution {index + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChallenge("solution", entry.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <Select
                            value={entry.category}
                            onValueChange={(value) => updateChallenge("solution", entry.id, "category", value)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ideas-design">💡 Ideas/Design Skills</SelectItem>
                              <SelectItem value="personal">🧠 Personal</SelectItem>
                            </SelectContent>
                          </Select>
                          <Textarea
                            placeholder="Describe the solution..."
                            value={entry.content}
                            onChange={(e) => updateChallenge("solution", entry.id, "content", e.target.value)}
                            className="min-h-20"
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addChallenge("solution")}
                        className="w-full gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Solution
                      </Button>
                    </div>
                  </div>
                </div>

                {renderEntrySection("5️⃣ Where I Want to Fill in the Gaps", fillTheGaps, setFillTheGaps)}
                {renderEntrySection("6️⃣ Next Steps", nextSteps, setNextSteps)}
              </>
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
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Save, Trash2, Calendar } from "lucide-react";
import { MoodType, Mode } from "@/types";
import { db } from "@/lib/supabaseHelpers";
import { toast } from "sonner";
import { ModeToggle } from "@/components/ModeToggle";
import { useSearchParams } from "react-router-dom";
import { useViewMode } from "@/hooks/useViewMode";

const MOODS: { value: MoodType; emoji: string; label: string; color: string }[] = [
  { value: "calm", emoji: "😌", label: "Calm", color: "hsl(195 60% 76%)" },
  { value: "anxious", emoji: "😰", label: "Anxious", color: "hsl(0 70% 70%)" },
  { value: "focused", emoji: "🎯", label: "Focused", color: "hsl(160 55% 80%)" },
  { value: "overwhelmed", emoji: "😵", label: "Overwhelmed", color: "hsl(280 50% 75%)" },
  { value: "energized", emoji: "⚡", label: "Energized", color: "hsl(45 100% 65%)" },
];

// Satisfaction levels for lecture mode (post-project reflections)
const SATISFACTION: { value: MoodType; emoji: string; label: string; color: string }[] = [
  { value: "energized", emoji: "🤩", label: "Very Satisfied", color: "hsl(160 55% 80%)" },
  { value: "focused", emoji: "😊", label: "Satisfied", color: "hsl(195 60% 76%)" },
  { value: "calm", emoji: "😐", label: "Neutral", color: "hsl(45 100% 75%)" },
  { value: "anxious", emoji: "😔", label: "Dissatisfied", color: "hsl(35 90% 70%)" },
  { value: "overwhelmed", emoji: "😞", label: "Very Dissatisfied", color: "hsl(0 70% 70%)" },
];

const Reflections = () => {
  const { isViewerMode } = useViewMode();
  const [currentMode, setCurrentMode] = useState<Mode>("personal");
  const [reflections, setReflections] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightedReflectionId, setHighlightedReflectionId] = useState<string | null>(null);
  const [currentReflection, setCurrentReflection] = useState({
    mood: "calm",
    emotionalDump: "",
    thoughtsWhatIThink: "",
    thoughtsWhatIsTrue: "",
    contingencyPlan: "",
    todoList: [] as string[],
    progress: 0,
    sentiment: 50,
    category: "time-out",
  });

  useEffect(() => {
    loadData();
  }, [currentMode]);

  // Handle reflectionId from query params (when navigating from project detail view)
  useEffect(() => {
    const reflectionId = searchParams.get('reflectionId');
    if (reflectionId && reflections.length > 0) {
      const reflection = reflections.find(r => r.id === reflectionId);
      if (reflection) {
        setHighlightedReflectionId(reflectionId);
        // Scroll to the reflection
        setTimeout(() => {
          const element = document.getElementById(`reflection-${reflectionId}`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        // Clear the query param after 3 seconds
        setTimeout(() => {
          setSearchParams({});
          setHighlightedReflectionId(null);
        }, 3000);
      }
    }
  }, [searchParams, reflections]);

  const loadData = async () => {
    const { data: projectsData } = await db
      .from("projects")
      .select("*")
      .eq("mode", currentMode)
      .order("name");
    if (projectsData) setProjects(projectsData);

    const { data: reflectionsData } = await db
      .from("reflections")
      .select("*")
      .eq("mode", currentMode)
      .order("created_at", { ascending: false });
    if (reflectionsData) setReflections(reflectionsData);
  };

  useEffect(() => {
    // Calculate progress based on filled fields
    const fields = [
      currentReflection.emotionalDump,
      currentReflection.thoughtsWhatIThink,
      currentReflection.thoughtsWhatIsTrue,
      currentReflection.contingencyPlan,
    ];
    const filledFields = fields.filter((f) => f.trim().length > 0).length;
    const newProgress = (filledFields / 4) * 100;
    
    if (newProgress !== currentReflection.progress) {
      setCurrentReflection((prev) => ({ ...prev, progress: newProgress }));
    }
  }, [
    currentReflection.emotionalDump,
    currentReflection.thoughtsWhatIThink,
    currentReflection.thoughtsWhatIsTrue,
    currentReflection.contingencyPlan,
  ]);

  const handleSave = async () => {
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }

    try {
      const { error } = await db.from("reflections").insert({
        project_id: selectedProjectId,
        mood: currentReflection.mood,
        emotional_dump: currentReflection.emotionalDump,
        thoughts_what_i_think: currentReflection.thoughtsWhatIThink,
        thoughts_what_is_true: currentReflection.thoughtsWhatIsTrue,
        contingency_plan: currentReflection.contingencyPlan,
        todo_list: currentReflection.todoList,
        progress: currentReflection.progress,
        sentiment: currentReflection.sentiment,
        category: currentReflection.category,
        mode: currentMode,
      });

      if (error) throw error;

      toast.success("Reflection saved!");
      loadData();

      // Reset form
      setCurrentReflection({
        mood: "calm",
        emotionalDump: "",
        thoughtsWhatIThink: "",
        thoughtsWhatIsTrue: "",
        contingencyPlan: "",
        todoList: [],
        progress: 0,
        sentiment: 50,
        category: currentMode === "personal" ? "time-out" : "sprint",
      });
      setSelectedProjectId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to save reflection");
    }
  };

  const handleDelete = async (id: string) => {
    const reflectionToDelete = reflections.find(r => r.id === id);
    
    try {
      const { error } = await db.from("reflections").delete().eq("id", id);
      if (error) throw error;
      
      // Show toast with undo action
      toast.success("Reflection deleted", {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              const { error: insertError } = await db.from("reflections").insert(reflectionToDelete);
              if (insertError) throw insertError;
              toast.success("Reflection restored");
              loadData();
            } catch (error: any) {
              toast.error("Failed to restore reflection");
            }
          }
        }
      });
      
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete reflection");
    }
  };

  const emotionOptions = currentMode === "personal" ? MOODS : SATISFACTION;
  const moodColor = emotionOptions.find((m) => m.value === currentReflection.mood)?.color || "hsl(195 60% 76%)";

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {currentMode === "personal" ? "💭 Time-Out Reflection Studio" : "🎓 Sprint Reflection"}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                {currentMode === "personal" 
                  ? "Process emotions and thoughts in a structured, calming space"
                  : "Reflect on learning outcomes and sprint progress"}
              </p>
            </div>
            <ModeToggle mode={currentMode} onModeChange={setCurrentMode} />
          </div>
          <div className="h-1 w-32 bg-gradient-to-r from-primary via-secondary to-accent rounded-full" />
        </header>

        {/* Progress Card */}
        <div className="mb-8 bg-gradient-to-br from-card via-card to-muted/20 rounded-2xl p-6 shadow-xl border-2 backdrop-blur-sm" style={{ borderColor: moodColor }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Current Reflection</h2>
              <p className="text-xs text-muted-foreground mt-1">Complete all sections to save</p>
            </div>
            <div className="flex gap-2">
              {!isViewerMode && (
                <Button 
                  onClick={handleSave} 
                  className="gap-2 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
                  disabled={!selectedProjectId || currentReflection.progress < 100}
                >
                  <Save className="h-4 w-4" />
                  Save Reflection
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={currentReflection.progress} className="h-3" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {Math.round(currentReflection.progress)}% Complete
              </p>
              {currentReflection.progress === 100 && (
                <span className="text-xs text-primary font-semibold animate-pulse">✓ Ready to save</span>
              )}
            </div>
          </div>
        </div>

        {/* Project Selection */}
        <Card className="shadow-md border-l-4 border-l-primary">
          <CardContent className="pt-6 space-y-2">
            <Label htmlFor="project" className="text-sm font-semibold">Select Project *</Label>
            <p className="text-xs text-muted-foreground mb-2">Choose which project this reflection is for</p>
            <Select value={selectedProjectId || ""} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {projects.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    No projects available. Create a project first!
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
          </CardContent>
        </Card>

        {/* Reflection Sections */}
        <div className="space-y-6">
          {currentMode === "personal" ? (
            <>
              {/* Personal Mode: Time-Out Reflection */}
              <Card className="overflow-hidden" style={{ borderLeft: `4px solid ${moodColor}` }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    1️⃣ Emotional Brain Dump
                  </CardTitle>
                </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                  <span>How are you feeling?</span>
                  <span className="text-xs text-muted-foreground font-normal">(Select your current emotional state)</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {emotionOptions.map((mood) => (
                    <Button
                      key={mood.value}
                      variant={currentReflection.mood === mood.value ? "default" : "outline"}
                      onClick={() =>
                        setCurrentReflection((prev) => ({ ...prev, mood: mood.value }))
                      }
                      className="gap-2 transition-all hover:scale-105"
                      style={
                        currentReflection.mood === mood.value
                          ? { backgroundColor: mood.color, borderColor: mood.color, color: 'hsl(260 35% 25%)' }
                          : {}
                      }
                    >
                      <span className="text-xl">{mood.emoji}</span>
                      {mood.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Let it all out... what's on your mind right now?"
                value={currentReflection.emotionalDump}
                onChange={(e) =>
                  setCurrentReflection((prev) => ({ ...prev, emotionalDump: e.target.value }))
                }
                className="min-h-32"
              />
            </CardContent>
          </Card>

          {/* 2. Thoughts on Trial */}
          <Card className="border-l-4 border-l-secondary shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                2️⃣ Thoughts on Trial
              </CardTitle>
              <p className="text-sm text-muted-foreground">Challenge your automatic thoughts with evidence</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">What I Think</label>
                  <Textarea
                    placeholder="The thought that's bothering me..."
                    value={currentReflection.thoughtsWhatIThink}
                    onChange={(e) =>
                      setCurrentReflection((prev) => ({
                        ...prev,
                        thoughtsWhatIThink: e.target.value,
                      }))
                    }
                    className="min-h-32"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">What's True</label>
                  <Textarea
                    placeholder="The evidence and reality..."
                    value={currentReflection.thoughtsWhatIsTrue}
                    onChange={(e) =>
                      setCurrentReflection((prev) => ({
                        ...prev,
                        thoughtsWhatIsTrue: e.target.value,
                      }))
                    }
                    className="min-h-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Contingency Plan */}
          <Card className="border-l-4 border-l-accent shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                3️⃣ Contingency Plan
              </CardTitle>
              <p className="text-sm text-muted-foreground">Small, actionable steps you can take right now</p>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="What can I do next? What small step would help?"
                value={currentReflection.contingencyPlan}
                onChange={(e) =>
                  setCurrentReflection((prev) => ({
                    ...prev,
                    contingencyPlan: e.target.value,
                  }))
                }
                className="min-h-24"
              />
            </CardContent>
          </Card>

          {/* 4. To-Do Anchor */}
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                4️⃣ To-Do Anchor
              </CardTitle>
              <p className="text-sm text-muted-foreground">Break it down into bite-sized tasks</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentReflection.todoList.map((todo, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={todo}
                      onChange={(e) => {
                        const newList = [...currentReflection.todoList];
                        newList[index] = e.target.value;
                        setCurrentReflection((prev) => ({ ...prev, todoList: newList }));
                      }}
                      placeholder="Small actionable task..."
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newList = currentReflection.todoList.filter((_, i) => i !== index);
                        setCurrentReflection((prev) => ({ ...prev, todoList: newList }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() =>
                    setCurrentReflection((prev) => ({
                      ...prev,
                      todoList: [...prev.todoList, ""],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </div>
            </CardContent>
          </Card>
            </>
          ) : (
            <>
              {/* Lecture Mode: Sprint Reflection */}
              <Card className="overflow-hidden" style={{ borderLeft: `4px solid ${moodColor}` }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    1️⃣ Sprint Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                      <span>How satisfied were you with this sprint?</span>
                      <span className="text-xs text-muted-foreground font-normal">(Select satisfaction level)</span>
                    </label>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {emotionOptions.map((mood) => (
                        <Button
                          key={mood.value}
                          variant={currentReflection.mood === mood.value ? "default" : "outline"}
                          onClick={() =>
                            setCurrentReflection((prev) => ({ ...prev, mood: mood.value }))
                          }
                          className="gap-2 transition-all hover:scale-105"
                          style={
                            currentReflection.mood === mood.value
                              ? { backgroundColor: mood.color, borderColor: mood.color, color: 'hsl(260 35% 25%)' }
                              : {}
                          }
                        >
                          <span className="text-xl">{mood.emoji}</span>
                          {mood.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">What did you learn?</label>
                    <Textarea
                      placeholder="Key learnings and insights from this sprint..."
                      value={currentReflection.emotionalDump}
                      onChange={(e) =>
                        setCurrentReflection((prev) => ({ ...prev, emotionalDump: e.target.value }))
                      }
                      className="min-h-32"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    2️⃣ Challenges & Solutions
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Document obstacles and how you overcame them</p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Challenges Faced</label>
                      <Textarea
                        placeholder="What obstacles did you encounter?"
                        value={currentReflection.thoughtsWhatIThink}
                        onChange={(e) =>
                          setCurrentReflection((prev) => ({
                            ...prev,
                            thoughtsWhatIThink: e.target.value,
                          }))
                        }
                        className="min-h-32"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">How You Overcame Them</label>
                      <Textarea
                        placeholder="Solutions and strategies used..."
                        value={currentReflection.thoughtsWhatIsTrue}
                        onChange={(e) =>
                          setCurrentReflection((prev) => ({
                            ...prev,
                            thoughtsWhatIsTrue: e.target.value,
                          }))
                        }
                        className="min-h-32"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    3️⃣ Next Steps
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Plan your approach for future sprints</p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="What will you do differently or work on next?"
                    value={currentReflection.contingencyPlan}
                    onChange={(e) =>
                      setCurrentReflection((prev) => ({
                        ...prev,
                        contingencyPlan: e.target.value,
                      }))
                    }
                    className="min-h-24"
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Past Reflections */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Past Reflections</h2>
              <p className="text-sm text-muted-foreground mt-1">View your reflection history for this mode</p>
            </div>
            <Badge variant="outline" className="text-sm">
              {reflections.length} {reflections.length === 1 ? 'Entry' : 'Entries'}
            </Badge>
          </div>
          <div className="space-y-4">
            {reflections.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No reflections yet for {currentMode} mode.</p>
                  <p className="text-sm text-muted-foreground mt-1">Start by creating your first reflection above!</p>
                </CardContent>
              </Card>
            ) : (
              reflections.map((reflection) => {
                // Get the correct emotion set based on reflection mode
                const emotionSet = reflection.mode === "personal" ? MOODS : SATISFACTION;
                const mood = emotionSet.find((m) => m.value === reflection.mood);
                const isHighlighted = highlightedReflectionId === reflection.id;
                return (
                  <Card 
                    key={reflection.id} 
                    id={`reflection-${reflection.id}`}
                    className={`hover:shadow-lg transition-all border-l-4 ${isHighlighted ? 'ring-2 ring-primary shadow-xl animate-pulse' : ''}`}
                    style={{ borderLeftColor: mood?.color || 'hsl(195 60% 76%)' }}
                  >
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{mood?.emoji}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-base">{mood?.label}</p>
                                <Badge variant="outline" className="text-xs">
                                  {reflection.mode === "personal" ? "Personal" : "Lecture"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(reflection.created_at).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          {reflection.progress > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 bg-muted rounded-full h-1.5">
                                  <div 
                                    className="bg-primary h-full rounded-full transition-all"
                                    style={{ width: `${reflection.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{Math.round(reflection.progress)}%</span>
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {reflection.emotional_dump}
                          </p>
                        </div>
                        {!isViewerMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(reflection.id)}
                            className="hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reflections;

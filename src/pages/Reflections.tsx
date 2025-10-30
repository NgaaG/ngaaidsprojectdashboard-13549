import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Save, Trash2 } from "lucide-react";
import { MoodType, Mode } from "@/types";
import { db } from "@/lib/supabaseHelpers";
import { toast } from "sonner";
import { ModeToggle } from "@/components/ModeToggle";

const MOODS: { value: MoodType; emoji: string; label: string; color: string }[] = [
  { value: "calm", emoji: "😌", label: "Calm", color: "hsl(195 60% 76%)" },
  { value: "anxious", emoji: "😰", label: "Anxious", color: "hsl(0 70% 70%)" },
  { value: "focused", emoji: "🎯", label: "Focused", color: "hsl(160 55% 80%)" },
  { value: "overwhelmed", emoji: "😵", label: "Overwhelmed", color: "hsl(280 50% 75%)" },
  { value: "energized", emoji: "⚡", label: "Energized", color: "hsl(45 100% 65%)" },
];

const Reflections = () => {
  const [currentMode, setCurrentMode] = useState<Mode>("personal");
  const [reflections, setReflections] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
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
    try {
      const { error } = await db.from("reflections").delete().eq("id", id);
      if (error) throw error;
      toast.success("Reflection deleted");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete reflection");
    }
  };

  const moodColor = MOODS.find((m) => m.value === currentReflection.mood)?.color || "hsl(195 60% 76%)";

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {currentMode === "personal" ? "💭 Time-Out Reflection Studio" : "🎓 Sprint Reflection"}
              </h1>
              <p className="text-muted-foreground">
                {currentMode === "personal" 
                  ? "Process emotions and thoughts in a structured, calming space"
                  : "Reflect on learning outcomes and sprint progress"}
              </p>
            </div>
            <ModeToggle mode={currentMode} onModeChange={setCurrentMode} />
          </div>
        </header>

        {/* Progress Ring */}
        <div className="mb-8 bg-card rounded-2xl p-6 shadow-lg border-2" style={{ borderColor: moodColor }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Current Reflection</h2>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gap-2 rounded-full">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
          <Progress value={currentReflection.progress} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            {Math.round(currentReflection.progress)}% Complete
          </p>
        </div>

        {/* Project Selection */}
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="project">Select Project</Label>
            <Select value={selectedProjectId || ""} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
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
                <label className="text-sm font-medium mb-2 block">How are you feeling?</label>
                <div className="flex gap-2 flex-wrap">
                  {MOODS.map((mood) => (
                    <Button
                      key={mood.value}
                      variant={currentReflection.mood === mood.value ? "default" : "outline"}
                      onClick={() =>
                        setCurrentReflection((prev) => ({ ...prev, mood: mood.value }))
                      }
                      className="gap-2"
                      style={
                        currentReflection.mood === mood.value
                          ? { backgroundColor: mood.color, borderColor: mood.color }
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
          <Card>
            <CardHeader>
              <CardTitle>2️⃣ Thoughts on Trial</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>3️⃣ Contingency Plan</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle>4️⃣ To-Do Anchor</CardTitle>
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
              <Card>
                <CardHeader>
                  <CardTitle>1️⃣ Sprint Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

              <Card>
                <CardHeader>
                  <CardTitle>2️⃣ Challenges & Solutions</CardTitle>
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

              <Card>
                <CardHeader>
                  <CardTitle>3️⃣ Next Steps</CardTitle>
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
          <h2 className="text-2xl font-semibold mb-6">Past Reflections</h2>
          <div className="space-y-4">
            {reflections.map((reflection) => {
              const mood = MOODS.find((m) => m.value === reflection.mood);
              return (
                <Card key={reflection.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{mood?.emoji}</span>
                          <div>
                            <p className="font-medium">{mood?.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(reflection.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {reflection.emotional_dump}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(reflection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reflections;

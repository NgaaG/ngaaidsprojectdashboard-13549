import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Pencil } from "lucide-react";
import { MoodType, ReflectionEntry, ChallengeEntry } from "@/types";

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

interface ReflectionDetailViewProps {
  reflection: any;
  projectName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

export const ReflectionDetailView = ({ 
  reflection,
  projectName,
  open, 
  onOpenChange,
  onEdit
}: ReflectionDetailViewProps) => {
  const emotionSet = reflection.mode === "personal" ? MOODS : SATISFACTION;
  const mood = emotionSet.find((m) => m.value === reflection.mood);
  const moodColor = mood?.color || "hsl(195 60% 76%)";

  const renderEntryList = (entries: ReflectionEntry[] | undefined, emptyMessage: string) => {
    if (!entries || entries.length === 0) {
      return <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>;
    }
    
    return (
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-2">
            {entry.subheading && (
              <p className="text-sm font-bold text-foreground">{entry.subheading}</p>
            )}
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {entry.content || "No content"}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderChallenges = (
    challenges: ChallengeEntry[] | undefined,
    solutions: ChallengeEntry[] | undefined
  ) => {
    const ideasDesignChallenges = challenges?.filter(c => c.category === "ideas-design") || [];
    const personalChallenges = challenges?.filter(c => c.category === "personal") || [];
    const ideasDesignSolutions = solutions?.filter(s => s.category === "ideas-design") || [];
    const personalSolutions = solutions?.filter(s => s.category === "personal") || [];

    if (
      ideasDesignChallenges.length === 0 &&
      personalChallenges.length === 0 &&
      ideasDesignSolutions.length === 0 &&
      personalSolutions.length === 0
    ) {
      return <p className="text-sm text-muted-foreground italic">No challenges recorded</p>;
    }

    return (
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ideas/Design Skills Column */}
        <div className="space-y-4">
          <p className="text-base font-bold text-secondary">💡 Ideas/Design Skills</p>
          {ideasDesignChallenges.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">Challenges:</p>
              {ideasDesignChallenges.map((entry) => (
                <p key={entry.id} className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {entry.content}
                </p>
              ))}
            </div>
          )}
          {ideasDesignSolutions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">Solutions:</p>
              {ideasDesignSolutions.map((entry) => (
                <p key={entry.id} className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {entry.content}
                </p>
              ))}
            </div>
          )}
          {ideasDesignChallenges.length === 0 && ideasDesignSolutions.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No entries</p>
          )}
        </div>

        {/* Personal Column */}
        <div className="space-y-4">
          <p className="text-base font-bold text-secondary">🧠 Personal</p>
          {personalChallenges.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">Challenges:</p>
              {personalChallenges.map((entry) => (
                <p key={entry.id} className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {entry.content}
                </p>
              ))}
            </div>
          )}
          {personalSolutions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">Solutions:</p>
              {personalSolutions.map((entry) => (
                <p key={entry.id} className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {entry.content}
                </p>
              ))}
            </div>
          )}
          {personalChallenges.length === 0 && personalSolutions.length === 0 && (
            <p className="text-sm text-muted-foreground italic">No entries</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl sm:text-3xl mb-3 leading-tight flex items-center gap-3">
                <span className="text-4xl">{mood?.emoji}</span>
                <span>{mood?.label}</span>
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(reflection.created_at).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {reflection.mode === "personal" ? "Personal Reflection" : "Sprint Reflection"}
                </Badge>
                {projectName ? (
                  <Badge variant="secondary" className="text-xs">
                    📁 {projectName}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    📅 Daily Reflection
                  </Badge>
                )}
              </div>
              {reflection.progress > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${reflection.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">{Math.round(reflection.progress)}%</span>
                  </div>
                </div>
              )}
            </div>
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="gap-2 shrink-0"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {reflection.mode === "personal" ? (
            <>
              {/* Personal Mode Sections */}
              <div className="border-l-4 pl-5 py-3 rounded-r-lg bg-gradient-to-r from-transparent to-muted/10" style={{ borderColor: moodColor }}>
                <p className="text-base font-bold mb-3 text-primary flex items-center gap-2">
                  <span>1️⃣</span>
                  <span>Emotional Brain Dump</span>
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {reflection.emotional_dump || "No content"}
                </p>
              </div>

              <div className="border-l-4 border-secondary/50 pl-5 py-3 rounded-r-lg bg-gradient-to-r from-transparent to-secondary/5">
                <p className="text-base font-bold mb-3 text-primary flex items-center gap-2">
                  <span>2️⃣</span>
                  <span>Thoughts on Trial</span>
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold mb-2 text-secondary">What I Think</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {reflection.thoughts_what_i_think || "No content"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2 text-secondary">What's True</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {reflection.thoughts_what_is_true || "No content"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-accent/50 pl-5 py-3 rounded-r-lg bg-gradient-to-r from-transparent to-accent/5">
                <p className="text-base font-bold mb-3 text-primary flex items-center gap-2">
                  <span>3️⃣</span>
                  <span>Contingency Plan</span>
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {reflection.contingency_plan || "No plan set"}
                </p>
              </div>

              {reflection.todo_list && reflection.todo_list.length > 0 && (
                <div className="border-l-4 border-primary/50 pl-5 py-3 rounded-r-lg bg-gradient-to-r from-transparent to-primary/5">
                  <p className="text-base font-bold mb-3 text-primary flex items-center gap-2">
                    <span>4️⃣</span>
                    <span>To-Do Anchor</span>
                  </p>
                  <div className="space-y-2">
                    {reflection.todo_list.filter((t: string) => t.trim()).map((todo: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <p className="text-sm text-muted-foreground">{todo}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Lecture Mode Sections */}
              <div className="border-l-4 pl-5 py-3 rounded-r-lg bg-gradient-to-r from-transparent to-muted/10" style={{ borderColor: moodColor }}>
                <p className="text-base font-bold mb-3 text-primary flex items-center gap-2">
                  <span>1️⃣</span>
                  <span>Session Summary</span>
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {reflection.emotional_dump || "No summary"}
                </p>
              </div>

              {/* What I Did */}
              <div className="border-l-4 border-primary/50 pl-5 py-3 rounded-r-lg bg-gradient-to-r from-transparent to-primary/5">
                <p className="text-base font-bold mb-3 text-primary flex items-center gap-2">
                  <span>2️⃣</span>
                  <span>What I Did</span>
                </p>
                {renderEntryList(reflection.what_i_did, "No activities recorded")}
              </div>

              {/* What I Learned */}
              <div className="border-l-4 border-secondary/50 pl-5 py-3 rounded-r-lg bg-gradient-to-r from-transparent to-secondary/5">
                <p className="text-base font-bold mb-3 text-primary flex items-center gap-2">
                  <span>3️⃣</span>
                  <span>What I Learned</span>
                </p>
                {renderEntryList(reflection.what_i_learned, "No learnings recorded")}
              </div>

              {/* Challenges & Solutions */}
              <div className="border-l-4 border-accent/50 pl-5 py-3 rounded-r-lg bg-gradient-to-r from-transparent to-accent/5">
                <p className="text-base font-bold mb-3 text-primary flex items-center gap-2">
                  <span>4️⃣</span>
                  <span>Challenges & Solutions</span>
                </p>
                {renderChallenges(reflection.challenges_structured, reflection.solutions_structured)}
              </div>

              {/* Where I Want to Fill in the Gaps */}
              <div className="border-l-4 border-primary/50 pl-5 py-3 rounded-r-lg bg-gradient-to-r from-transparent to-primary/5">
                <p className="text-base font-bold mb-3 text-primary flex items-center gap-2">
                  <span>5️⃣</span>
                  <span>Where I Want to Fill in the Gaps</span>
                </p>
                {renderEntryList(reflection.fill_the_gaps, "No gaps identified")}
              </div>

              {/* Next Steps */}
              <div className="border-l-4 border-secondary/50 pl-5 py-3 rounded-r-lg bg-gradient-to-r from-transparent to-secondary/5">
                <p className="text-base font-bold mb-3 text-primary flex items-center gap-2">
                  <span>6️⃣</span>
                  <span>Next Steps</span>
                </p>
                {renderEntryList(reflection.next_steps, "No next steps planned")}
              </div>

            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Edit, Calendar, ExternalLink, Trash2, Plus } from "lucide-react";
import { Competency } from "@/types";
import { db } from "@/lib/supabaseHelpers";
import { toast } from "sonner";

const COMPETENCY_COLORS: Record<Competency, string> = {
  Research: "hsl(265 45% 80%)",
  Create: "hsl(160 55% 80%)",
  Organize: "hsl(195 60% 76%)",
  Communicate: "hsl(280 50% 75%)",
  Learn: "hsl(150 60% 75%)",
  "Unsure/TBD": "hsl(0 0% 70%)",
};

interface MentorLogDetailViewProps {
  log: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  selectedTasks?: any[];
}

export const MentorLogDetailView = ({ 
  log, 
  open, 
  onOpenChange, 
  onUpdate,
  selectedTasks = []
}: MentorLogDetailViewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [mentorComments, setMentorComments] = useState(log.mentor_comments || "");
  const [outcomes, setOutcomes] = useState<string[]>(log.outcomes || []);
  const [resourceLinks, setResourceLinks] = useState(log.resource_links || "");
  const [achievedGoals, setAchievedGoals] = useState<string[]>(log.achieved_goals || []);
  const [loading, setLoading] = useState(false);
  const [newOutcomeInput, setNewOutcomeInput] = useState("");

  // Key goals are now stored as an array
  const keyGoalsList = log.key_goals || [];

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await db.from("mentor_logs").update({
        outcomes,
        mentor_comments: mentorComments || null,
        resource_links: resourceLinks || null,
        achieved_goals: achievedGoals.length > 0 ? achievedGoals : null,
      }).eq("id", log.id);

      if (error) throw error;
      
      toast.success("Mentor log updated!");
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to update mentor log");
    } finally {
      setLoading(false);
    }
  };

  const toggleGoalAchievement = (goal: string) => {
    setAchievedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const primaryColor = COMPETENCY_COLORS[log.competencies?.[0] || "Create"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-1 w-full">
              <DialogTitle className="text-2xl sm:text-3xl mb-3 leading-tight">{log.title}</DialogTitle>
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{new Date(log.date).toLocaleDateString()}</span>
                </div>
                {log.lecturer && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      🎓 {log.lecturer}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(log.competencies || ["Create"]).map((comp: Competency) => (
                  <span
                    key={comp}
                    className="text-xs font-medium px-3 py-1.5 rounded-full shadow-sm border"
                    style={{ 
                      backgroundColor: `${COMPETENCY_COLORS[comp]}30`, 
                      borderColor: `${COMPETENCY_COLORS[comp]}50`,
                      color: COMPETENCY_COLORS[comp]
                    }}
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
            {!isEditing && (
              <Button
                variant="default"
                size="sm"
                className="shrink-0 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg flex-col h-auto py-3 px-4 gap-1"
                onClick={() => setIsEditing(true)}
              >
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  <span className="font-bold">Edit Post-Session</span>
                </div>
                <span className="text-[10px] font-normal opacity-90">Session outcomes notes & feedback: mine & lecturer</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Projects Info */}
          {log.projects && log.projects.length > 0 && (
            <div className="p-5 bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl border border-border/50 shadow-sm">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span>📁</span>
                <span>Referenced Projects</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {log.projects.map((project: any) => (
                  <span key={project.id} className="text-sm px-4 py-2 bg-background rounded-full border border-border/50 font-medium shadow-sm hover:shadow-md transition-shadow">
                    {project.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Selected Tasks Gallery */}
          {selectedTasks.length > 0 && (
            <div className="border rounded-xl p-6 bg-gradient-to-br from-accent/5 to-accent/10 shadow-sm">
              <h3 className="font-semibold text-lg mb-5 flex items-center gap-2 text-foreground">
                ✅ Referenced Project Tasks
              </h3>
              <div className="space-y-6">
                {selectedTasks.map((task) => (
                  <div key={task.id} className="p-6 bg-background rounded-xl border border-border/50 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                    {/* Project Name Header */}
                    {task.projectName && (
                      <div className="flex items-center gap-2 pb-3 border-b border-border/30">
                        <span className="text-xs font-semibold text-primary/80 uppercase tracking-wide">
                          📁 {task.projectName}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-semibold text-base flex-1">{task.name}</h4>
                      <span className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium shadow-sm ${
                        task.status === "completed" ? "bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30" :
                        task.status === "not-completed" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30" :
                        "bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30"
                      }`}>
                        {task.status === "completed" ? "✅ Completed" :
                         task.status === "not-completed" ? "🕓 In Sprint" :
                         "🔮 Future"}
                      </span>
                    </div>

                    {/* Competency & Learning Goal */}
                    {(task.competency || task.learningGoal) && (
                      <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/30">
                        {task.competency && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-primary">🎯 Competency:</span> {task.competency}
                          </p>
                        )}
                        {task.learningGoal && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-primary">🎓 Learning Goal:</span> {task.learningGoal}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
                    )}

                    {/* Media Gallery */}
                    {task.files && task.files.length > 0 && (
                      <div className="pt-4 border-t border-border/30">
                        <p className="text-xs font-semibold mb-3 text-muted-foreground">📎 Files & Media</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {task.files.map((file: any, idx: number) => (
                            <a
                              key={idx}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative aspect-video rounded-lg overflow-hidden border border-border/50 hover:border-primary hover:shadow-md transition-all"
                            >
                              {file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img 
                                  src={file.url} 
                                  alt={file.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                  <div className="text-center p-3">
                                    <p className="text-xs truncate font-medium">{file.name}</p>
                                  </div>
                                </div>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    {task.links && task.links.length > 0 && (
                      <div className="pt-4 border-t border-border/30">
                        <p className="text-xs font-semibold mb-3 text-muted-foreground">🔗 Links</p>
                        <div className="space-y-2">
                          {task.links.map((link: any, idx: number) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50 hover:border-primary hover:bg-muted/50 transition-all group text-sm"
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              <span className="text-foreground group-hover:text-primary truncate font-medium transition-colors">
                                {link.title}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pre-Session: Key Goals */}
          <div className="border-l-4 pl-5 py-3 rounded-r-lg bg-gradient-to-r from-transparent to-muted/10" style={{ borderColor: primaryColor }}>
            <div>
              <p className="text-base font-bold mb-4 text-primary flex items-center gap-2">
                <span>📝</span>
                <span className="font-bold">Key Goals (Pre-Session)</span>
              </p>
              {keyGoalsList.length > 0 ? (
                <div className="space-y-2">
                  {keyGoalsList.map((goal: string, idx: number) => {
                    const isAchieved = achievedGoals.includes(goal.trim());
                    return (
                      <div key={idx} className="flex items-start gap-3 group">
                        {isEditing && (
                          <input
                            type="checkbox"
                            checked={isAchieved}
                            onChange={() => toggleGoalAchievement(goal.trim())}
                            className="mt-1 h-4 w-4 rounded border-gray-300"
                          />
                        )}
                        <p className={`text-sm flex-1 ${isAchieved ? 'text-green-600 dark:text-green-400 line-through' : 'text-muted-foreground'}`}>
                          {isAchieved && '✅ '}{goal.trim()}
                        </p>
                      </div>
                    );
                  })}
                  {isEditing && (
                    <p className="text-xs text-muted-foreground mt-3 italic">
                      Check the goals that were achieved during the session
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No goals set</p>
              )}
            </div>
          </div>

          {/* Post-Session: Outcomes */}
          <div className="border-l-4 border-accent/50 pl-5 py-3 rounded-r-lg bg-gradient-to-r from-transparent to-accent/5">
            <div>
              <p className="text-base font-semibold mb-3 text-primary flex items-center gap-2">
                <span>✅</span>
                <span>Key Outcomes (Post-Session)</span>
              </p>
              {isEditing ? (
                <div className="space-y-2">
                  {outcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-background rounded border">
                      <span className="flex-1 text-sm">{outcome}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setOutcomes(outcomes.filter((_, i) => i !== idx));
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an outcome..."
                      value={newOutcomeInput}
                      onChange={(e) => setNewOutcomeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newOutcomeInput.trim()) {
                          setOutcomes([...outcomes, newOutcomeInput.trim()]);
                          setNewOutcomeInput("");
                        }
                      }}
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (newOutcomeInput.trim()) {
                          setOutcomes([...outcomes, newOutcomeInput.trim()]);
                          setNewOutcomeInput("");
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {outcomes.length > 0 ? (
                    outcomes.map((outcome, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground">
                        • {outcome}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No outcomes recorded</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lecturer Feedback */}
          <div className="border rounded-xl p-6 bg-gradient-to-br from-accent/5 to-accent/10 shadow-sm space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <p className="text-base font-semibold text-accent flex items-center gap-2">
                  <span>🎓</span>
                  <span>Lecturer Feedback</span>
                </p>
                {isEditing && <span className="text-xs text-muted-foreground px-2 py-1 bg-muted/50 rounded">(editable)</span>}
              </div>
              {isEditing ? (
                <Textarea
                  value={mentorComments}
                  onChange={(e) => setMentorComments(e.target.value)}
                  placeholder="Add feedback, comments, or next-step recommendations..."
                  rows={5}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {mentorComments || "No feedback provided yet"}
                </p>
              )}
            </div>

            <div>
              <Label className="text-base font-semibold text-accent mb-3 flex items-center gap-2">
                <span>📚</span>
                <span>Resource Links</span>
              </Label>
              {isEditing ? (
                <Textarea
                  value={resourceLinks}
                  onChange={(e) => setResourceLinks(e.target.value)}
                  placeholder="Add links to resources, articles, tutorials, etc.&#10;• https://example.com/resource1&#10;• https://example.com/resource2"
                  rows={3}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {resourceLinks || "No resource links added yet"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {isEditing && (
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-6 border-t">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setIsEditing(false);
                setMentorComments(log.mentor_comments || "");
                setOutcomes(log.outcomes || []);
                setResourceLinks(log.resource_links || "");
                setAchievedGoals(log.achieved_goals || []);
                setNewOutcomeInput("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
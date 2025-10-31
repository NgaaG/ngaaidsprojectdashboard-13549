import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Calendar, ExternalLink } from "lucide-react";
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
  const [outcomes, setOutcomes] = useState(log.outcomes || "");
  const [resourceLinks, setResourceLinks] = useState(log.resource_links || "");
  const [achievedGoals, setAchievedGoals] = useState<string[]>(log.achieved_goals || []);
  const [loading, setLoading] = useState(false);

  // Parse key goals into individual goals
  const keyGoalsList = (log.key_goals || "").split('\n').filter((g: string) => g.trim());

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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{log.title}</DialogTitle>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Calendar className="h-4 w-4" />
                {new Date(log.date).toLocaleDateString()}
              </div>
              <div className="flex flex-wrap gap-2">
                {(log.competencies || ["Create"]).map((comp: Competency) => (
                  <span
                    key={comp}
                    className="text-xs font-medium px-3 py-1 rounded-full"
                    style={{ 
                      backgroundColor: `${COMPETENCY_COLORS[comp]}40`, 
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
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
                Edit Post-Session
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Projects Info */}
          {log.project_ids && log.project_ids.length > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-semibold mb-2">📁 Referenced Projects</p>
              <div className="flex flex-wrap gap-2">
                {log.project_ids.map((projectId: string) => {
                  // This would need to be populated from the parent component
                  // For now, just show project IDs
                  return (
                    <span key={projectId} className="text-sm px-3 py-1 bg-background rounded-full border">
                      Project {projectId.slice(0, 8)}...
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Tasks Gallery */}
          {selectedTasks.length > 0 && (
            <div className="border rounded-lg p-5 bg-accent/10">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                ✅ Referenced Project Tasks
              </h3>
              <div className="space-y-5">
                {selectedTasks.map((task) => (
                  <div key={task.id} className="p-5 bg-background rounded-lg border space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-base">{task.name}</h4>
                      <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${
                        task.status === "completed" ? "bg-green-500/20 text-green-700 dark:text-green-300" :
                        task.status === "not-completed" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300" :
                        "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                      }`}>
                        {task.status === "completed" ? "✅ Completed" :
                         task.status === "not-completed" ? "🕓 In Sprint" :
                         "🔮 Future"}
                      </span>
                    </div>

                    {/* Competency & Learning Goal */}
                    {(task.competency || task.learningGoal) && (
                      <div className="space-y-1 text-xs">
                        {task.competency && (
                          <p className="text-muted-foreground">
                            <span className="font-semibold text-primary">Competency:</span> {task.competency}
                          </p>
                        )}
                        {task.learningGoal && (
                          <p className="text-muted-foreground">
                            <span className="font-semibold text-primary">Learning Goal:</span> {task.learningGoal}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}

                    {/* Media Gallery */}
                    {task.files && task.files.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-xs font-semibold mb-3">Files & Media</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {task.files.map((file: any, idx: number) => (
                            <a
                              key={idx}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative aspect-video rounded-lg overflow-hidden border hover:border-primary transition-colors"
                            >
                              {file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                <img 
                                  src={file.url} 
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <div className="text-center p-3">
                                    <p className="text-xs truncate">{file.name}</p>
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
                      <div className="pt-3 border-t">
                        <p className="text-xs font-semibold mb-2">Links</p>
                        <div className="space-y-2">
                          {task.links.map((link: any, idx: number) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2.5 bg-muted/30 rounded border hover:border-primary transition-colors group text-sm"
                            >
                              <span className="text-primary hover:underline truncate">
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
          <div className="border-l-4 pl-4 py-2" style={{ borderColor: primaryColor }}>
            <div>
              <p className="text-sm font-semibold mb-3 text-primary">📝 Key Goals (Pre-Session)</p>
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
          <div className="border-l-4 border-accent/50 pl-4 py-2">
            <div>
              <p className="text-sm font-semibold mb-2 text-primary">✅ Key Outcomes (Ngaa) - Post-Session</p>
              {isEditing ? (
                <Textarea
                  value={outcomes}
                  onChange={(e) => setOutcomes(e.target.value)}
                  placeholder="What did you learn, achieve, or discover?"
                  rows={4}
                  className="text-sm"
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {outcomes || "No outcomes recorded"}
                </p>
              )}
            </div>
          </div>

          {/* Lecturer Feedback */}
          <div className="border rounded-lg p-5 bg-accent/5 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm font-semibold text-accent">🎓 Lecturer Feedback</p>
                {isEditing && <span className="text-xs text-muted-foreground">(editable)</span>}
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
              <Label className="text-sm font-semibold text-accent mb-2 block">📚 Resource Links</Label>
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
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setMentorComments(log.mentor_comments || "");
                setOutcomes(log.outcomes || "");
                setResourceLinks(log.resource_links || "");
                setAchievedGoals(log.achieved_goals || []);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Calendar, X } from "lucide-react";
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
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await db.from("mentor_logs").update({
        outcomes,
        mentor_comments: mentorComments || null,
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
          {/* Project Info */}
          {log.projects && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-semibold mb-1">📁 Project</p>
              <p className="text-sm">{log.projects.name}</p>
            </div>
          )}

          {/* Selected Tasks */}
          {selectedTasks.length > 0 && (
            <div className="border rounded-lg p-5 bg-accent/10">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                ✅ Referenced Tasks
              </h3>
              <div className="space-y-4">
                {selectedTasks.map((task) => (
                  <div key={task.id} className="p-4 bg-background rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{task.name}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10">
                        {task.status === "completed" ? "✅ Completed" : 
                         task.status === "not-completed" ? "🕓 In Progress" : 
                         "🔮 Future"}
                      </span>
                    </div>
                    {task.competency && (
                      <p className="text-xs text-muted-foreground mb-2">
                        <span className="font-semibold">Competency:</span> {task.competency}
                      </p>
                    )}
                    {task.learningGoal && (
                      <p className="text-xs text-muted-foreground mb-3">
                        <span className="font-semibold">Learning Goal:</span> {task.learningGoal}
                      </p>
                    )}
                    {task.description && (
                      <p className="text-sm mb-3">{task.description}</p>
                    )}
                    
                    {/* Task Files & Links */}
                    {task.files && task.files.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold mb-2">Files:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {task.files.map((file: any, idx: number) => (
                            <a
                              key={idx}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline truncate block p-2 bg-muted/20 rounded"
                            >
                              📎 {file.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {task.links && task.links.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold mb-2">Links:</p>
                        <div className="space-y-1">
                          {task.links.map((link: any, idx: number) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline block"
                            >
                              🔗 {link.title}
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
              <p className="text-sm font-semibold mb-2 text-primary">📝 Key Goals (Pre-Session)</p>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {log.key_goals || "No goals set"}
              </p>
            </div>
          </div>

          {/* Post-Session: Outcomes */}
          <div className="border-l-4 border-accent/50 pl-4 py-2">
            <div>
              <p className="text-sm font-semibold mb-2 text-primary">✅ Outcomes / Notes (Post-Session)</p>
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
          <div className="border rounded-lg p-5 bg-accent/5">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-semibold text-accent">🎓 Lecturer Feedback</p>
              {isEditing && <span className="text-xs text-muted-foreground">(editable)</span>}
            </div>
            {isEditing ? (
              <Textarea
                value={mentorComments}
                onChange={(e) => setMentorComments(e.target.value)}
                placeholder="Add feedback, links, or next-step recommendations..."
                rows={5}
                className="text-sm"
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {mentorComments || "No feedback provided yet"}
              </p>
            )}
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
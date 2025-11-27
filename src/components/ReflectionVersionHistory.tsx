import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar, RotateCcw, Clock } from "lucide-react";
import { db } from "@/lib/supabaseHelpers";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReflectionVersionHistoryProps {
  reflectionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevert: () => void;
}

export const ReflectionVersionHistory = ({
  reflectionId,
  open,
  onOpenChange,
  onRevert,
}: ReflectionVersionHistoryProps) => {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [showRevertDialog, setShowRevertDialog] = useState(false);
  const [reverting, setReverting] = useState(false);

  useEffect(() => {
    if (open && reflectionId) {
      loadVersions();
    }
  }, [open, reflectionId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const { data, error } = await db
        .from("reflection_versions")
        .select("*")
        .eq("reflection_id", reflectionId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error: any) {
      toast.error("Failed to load version history");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevertClick = (version: any) => {
    setSelectedVersion(version);
    setShowRevertDialog(true);
  };

  const handleRevert = async () => {
    if (!selectedVersion) return;

    setReverting(true);
    try {
      const { error } = await db
        .from("reflections")
        .update({
          project_id: selectedVersion.project_id,
          mood: selectedVersion.mood,
          emotional_dump: selectedVersion.emotional_dump,
          thoughts_what_i_think: selectedVersion.thoughts_what_i_think,
          thoughts_what_is_true: selectedVersion.thoughts_what_is_true,
          contingency_plan: selectedVersion.contingency_plan,
          todo_list: selectedVersion.todo_list,
          what_i_did: selectedVersion.what_i_did,
          what_i_learned: selectedVersion.what_i_learned,
          challenges_structured: selectedVersion.challenges_structured,
          solutions_structured: selectedVersion.solutions_structured,
          fill_the_gaps: selectedVersion.fill_the_gaps,
          next_steps: selectedVersion.next_steps,
          progress: selectedVersion.progress,
          mode: selectedVersion.mode,
          category: selectedVersion.category,
        })
        .eq("id", reflectionId);

      if (error) throw error;

      toast.success(`Reverted to version ${selectedVersion.version_number}`);
      setShowRevertDialog(false);
      onRevert();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to revert to version");
    } finally {
      setReverting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Version History
            </DialogTitle>
            <DialogDescription>
              View and restore previous versions of this reflection
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[60vh] pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No version history yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Versions are created automatically when you edit this reflection
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div key={version.id}>
                    <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs font-mono">
                            v{version.version_number}
                          </Badge>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(version.created_at)}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-semibold">Mood:</span>{" "}
                            <span className="text-muted-foreground">{version.mood}</span>
                          </p>
                          {version.emotional_dump && (
                            <p className="text-sm line-clamp-2">
                              <span className="font-semibold">
                                {version.mode === 'personal' ? 'Emotional Dump' : 'Session Summary'}:
                              </span>{" "}
                              <span className="text-muted-foreground">{version.emotional_dump}</span>
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Progress: {version.progress}% • Mode: {version.mode}
                          </p>
                        </div>

                        {version.change_description && (
                          <p className="text-xs italic text-muted-foreground">
                            {version.change_description}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevertClick(version)}
                        className="gap-2 shrink-0"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Revert
                      </Button>
                    </div>
                    {index < versions.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showRevertDialog} onOpenChange={setShowRevertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert to Version {selectedVersion?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will restore the reflection to how it was on{" "}
                {selectedVersion && formatDate(selectedVersion.created_at)}.
              </p>
              <p className="font-semibold text-foreground">
                A new version will be created automatically, so you can always undo this action.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reverting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevert}
              disabled={reverting}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {reverting ? "Reverting..." : "Revert to This Version"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

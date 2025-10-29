import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project, Mode } from "@/types";
import { db } from "@/lib/supabaseHelpers";
import { Edit, ExternalLink, Calendar } from "lucide-react";
import { ProjectEditDialog } from "./ProjectEditDialog";

interface ProjectDetailViewProps {
  project: Project;
  mode: Mode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const ProjectDetailView = ({
  project,
  mode,
  open,
  onOpenChange,
  onUpdate,
}: ProjectDetailViewProps) => {
  const [reflections, setReflections] = useState<any[]>([]);
  const [mentorLogs, setMentorLogs] = useState<any[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadProjectData();
    }
  }, [open, project.id]);

  const loadProjectData = async () => {
    // Load reflections for this project
    const { data: reflectionsData } = await db
      .from("reflections")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });

    if (reflectionsData) setReflections(reflectionsData);

    // Load mentor logs for this project
    const { data: logsData } = await db
      .from("mentor_logs")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });

    if (logsData) setMentorLogs(logsData);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    onUpdate();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl">{project.name}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {project.competency} • {project.completion}% Complete
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.visualUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={project.visualUrl}
                      alt={project.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                {project.description && (
                  <p className="text-muted-foreground">{project.description}</p>
                )}
                <div className="flex gap-4">
                  {project.figmaLink && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.figmaLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Figma
                      </a>
                    </Button>
                  )}
                  {project.githubLink && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mode-specific content */}
            <Tabs defaultValue={mode === "personal" ? "reflections" : "mentor-logs"}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="reflections">
                  Reflections ({reflections.length})
                </TabsTrigger>
                <TabsTrigger value="mentor-logs">
                  Mentor Logs ({mentorLogs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reflections" className="space-y-4">
                {reflections.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No reflections for this project yet
                    </CardContent>
                  </Card>
                ) : (
                  reflections.map((reflection) => (
                    <Card key={reflection.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium">Mood: {reflection.mood}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(reflection.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Progress: {reflection.progress}%
                          </span>
                        </div>
                        {reflection.emotional_dump && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {reflection.emotional_dump}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="mentor-logs" className="space-y-4">
                {mentorLogs.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No mentor logs for this project yet
                    </CardContent>
                  </Card>
                ) : (
                  mentorLogs.map((log) => (
                    <Card key={log.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{log.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(log.date).toLocaleDateString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {log.key_goals && (
                          <div>
                            <p className="text-sm font-medium mb-1">Key Goals:</p>
                            <p className="text-sm text-muted-foreground">{log.key_goals}</p>
                          </div>
                        )}
                        {log.outcomes && (
                          <div>
                            <p className="text-sm font-medium mb-1">Outcomes:</p>
                            <p className="text-sm text-muted-foreground">{log.outcomes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <ProjectEditDialog
        project={project}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

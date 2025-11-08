import { Project, Competency, CompetencyProgress } from "@/types";

/**
 * Calculate competency progress based on all projects' learning goals achievements
 * @param projects - Array of all projects
 * @returns CompetencyProgress object with percentages for each competency
 */
export const calculateCompetencyProgressFromProjects = (
  projects: Project[]
): CompetencyProgress => {
  const competencies: Competency[] = ["Research", "Create", "Organize", "Communicate", "Learn"];
  const progress: CompetencyProgress = {};

  competencies.forEach((competency) => {
    let totalSatisfaction = 0;
    let count = 0;

    // Aggregate satisfaction from all projects for this competency
    projects.forEach((project) => {
      const achievements = project.learningGoalsAchievements?.[competency];
      if (achievements && achievements.length > 0) {
        achievements.forEach((achievement) => {
          totalSatisfaction += achievement.satisfaction || 0;
          count++;
        });
      }
    });

    // Calculate average satisfaction, or 0 if no data
    progress[competency] = count > 0 ? Math.round(totalSatisfaction / count) : 0;
  });

  return progress;
};

import { LearningGoalsAchievements, KeyTask } from "@/types";

/**
 * Calculate overall project progress based on learning goals satisfaction and key tasks completion
 * @param learningGoalsAchievements - The learning goals achievements object
 * @param keyTasks - Array of key tasks
 * @returns Progress percentage (0-100)
 */
export const calculateProjectProgress = (
  learningGoalsAchievements?: LearningGoalsAchievements,
  keyTasks?: KeyTask[]
): number => {
  let totalProgress = 0;
  let componentsCount = 0;

  // Calculate learning goals satisfaction average
  if (learningGoalsAchievements) {
    const allAchievements = [
      ...learningGoalsAchievements.Research,
      ...learningGoalsAchievements.Create,
      ...learningGoalsAchievements.Organize,
      ...learningGoalsAchievements.Communicate,
      ...learningGoalsAchievements.Learn,
    ];

    if (allAchievements.length > 0) {
      const totalSatisfaction = allAchievements.reduce(
        (sum, achievement) => sum + (achievement.satisfaction || 0),
        0
      );
      const avgSatisfaction = totalSatisfaction / allAchievements.length;
      totalProgress += avgSatisfaction;
      componentsCount++;
    }
  }

  // Calculate key tasks completion percentage
  if (keyTasks && keyTasks.length > 0) {
    const completedTasks = keyTasks.filter(
      (task) => task.status === "completed"
    ).length;
    const tasksProgress = (completedTasks / keyTasks.length) * 100;
    totalProgress += tasksProgress;
    componentsCount++;
  }

  // Return average of both components, or 0 if no data
  return componentsCount > 0 ? Math.round(totalProgress / componentsCount) : 0;
};

import { Reflection, MentorLog, Project, CompetencyProgress } from "@/types";

const STORAGE_KEYS = {
  REFLECTIONS: "adhd-studio-reflections",
  MENTOR_LOGS: "adhd-studio-mentor-logs",
  PROJECTS: "adhd-studio-projects",
  COMPETENCY_PROGRESS: "adhd-studio-competency",
  MODE: "adhd-studio-mode",
} as const;

// Reflections
export const getReflections = (): Reflection[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
  return stored ? JSON.parse(stored) : [];
};

export const saveReflection = (reflection: Reflection): void => {
  const reflections = getReflections();
  const index = reflections.findIndex((r) => r.id === reflection.id);
  if (index >= 0) {
    reflections[index] = reflection;
  } else {
    reflections.unshift(reflection);
  }
  localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(reflections));
};

export const deleteReflection = (id: string): void => {
  const reflections = getReflections().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(reflections));
};

// Mentor Logs
export const getMentorLogs = (): MentorLog[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.MENTOR_LOGS);
  return stored ? JSON.parse(stored) : [];
};

export const saveMentorLog = (log: MentorLog): void => {
  const logs = getMentorLogs();
  const index = logs.findIndex((l) => l.id === log.id);
  if (index >= 0) {
    logs[index] = log;
  } else {
    logs.unshift(log);
  }
  localStorage.setItem(STORAGE_KEYS.MENTOR_LOGS, JSON.stringify(logs));
};

export const deleteMentorLog = (id: string): void => {
  const logs = getMentorLogs().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.MENTOR_LOGS, JSON.stringify(logs));
};

// Projects
export const getProjects = (): Project[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  return stored ? JSON.parse(stored) : [];
};

export const saveProject = (project: Project): void => {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const deleteProject = (id: string): void => {
  const projects = getProjects().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

// Competency Progress
export const getCompetencyProgress = (): CompetencyProgress => {
  const stored = localStorage.getItem(STORAGE_KEYS.COMPETENCY_PROGRESS);
  return stored
    ? JSON.parse(stored)
    : {
        Research: 0,
        Create: 0,
        Organize: 0,
        Communicate: 0,
        Learn: 0,
      };
};

export const updateCompetencyProgress = (competency: string, value: number): void => {
  const progress = getCompetencyProgress();
  progress[competency] = Math.min(100, Math.max(0, value));
  localStorage.setItem(STORAGE_KEYS.COMPETENCY_PROGRESS, JSON.stringify(progress));
};

// Mode
export const getMode = (): "personal" | "lecturer" => {
  return (localStorage.getItem(STORAGE_KEYS.MODE) as "personal" | "lecturer") || "personal";
};

export const setMode = (mode: "personal" | "lecturer"): void => {
  localStorage.setItem(STORAGE_KEYS.MODE, mode);
};

// Export all data
export const exportAllData = () => {
  return {
    reflections: getReflections(),
    mentorLogs: getMentorLogs(),
    projects: getProjects(),
    competencyProgress: getCompetencyProgress(),
    exportedAt: new Date().toISOString(),
  };
};

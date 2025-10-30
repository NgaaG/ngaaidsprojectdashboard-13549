export type Mode = "personal" | "lecturer";

export type Competency = "Research" | "Create" | "Organize" | "Communicate" | "Learn" | "Unsure/TBD";

export type MoodType = "calm" | "anxious" | "focused" | "overwhelmed" | "energized";

export interface Reflection {
  id: string;
  timestamp: string;
  mood: MoodType;
  emotionalDump: string;
  thoughtsWhatIThink: string;
  thoughtsWhatIsTrue: string;
  contingencyPlan: string;
  todoList: string[];
  progress: number;
  sentiment: number; // 0-100
}

export interface MentorLog {
  id: string;
  timestamp: string;
  date: string;
  title: string;
  keyGoals: string;
  outcomes: string;
  competency: Competency;
  evidenceImages: string[];
}

export interface KeyTask {
  id: string;
  name: string;
  status: "completed" | "not-completed" | "to-be-completed";
  description?: string;
  files?: { url: string; name: string }[];
  links?: { url: string; title: string }[];
}

export interface LearningGoals {
  Research: string;
  Create: string;
  Organize: string;
  Communicate: string;
  Learn: string;
}

export interface Project {
  id: string;
  name: string;
  completion: number;
  competencies: Competency[];
  visualUrl?: string;
  lastReflectionMood?: MoodType;
  description?: string;
  figmaLink?: string;
  githubLink?: string;
  mode: Mode;
  learningGoals?: LearningGoals;
  keyTasks?: KeyTask[];
}

export interface CompetencyProgress {
  [key: string]: number; // Competency name to percentage
}

export type Mode = "personal" | "lecturer";

export type Competency = "Research" | "Create" | "Organize" | "Communicate" | "Learn";

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

export interface Project {
  id: string;
  name: string;
  completion: number;
  competency: Competency;
  visualUrl?: string;
  lastReflectionMood?: MoodType;
}

export interface CompetencyProgress {
  [key: string]: number; // Competency name to percentage
}

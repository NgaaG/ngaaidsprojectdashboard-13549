import { Competency } from "@/types";

export interface PortfolioLearningGoal {
  title: string;
  rewrittenOutcome: string;
  learningActivities: string[];
  reflection: {
    knowledge: string;
    skills: string;
    transfer: string;
  };
  appendixEvidence: string[];
}

export interface PortfolioSection {
  competency: Competency;
  learningGoals: PortfolioLearningGoal[];
}

export interface PortfolioData {
  intro: {
    name: string;
    period: string;
    overview: string;
  };
  competencyMatrix: {
    competency: Competency;
    progress: number;
    keyOutcomes: string[];
  }[];
  sections: PortfolioSection[];
}

export const generatePortfolio = async (
  reflections: any[],
  mentorLogs: any[],
  projects: any[]
): Promise<PortfolioData> => {
  
  // Filter only lecturer mode data
  const lecturerReflections = reflections.filter(r => r.mode === 'lecturer');
  const lecturerProjects = projects.filter(p => p.mode === 'lecturer');
  
  // Extract competencies from all lecturer-mode content
  const allCompetencies = new Set<Competency>();
  lecturerProjects.forEach(p => {
    p.competencies?.forEach((c: Competency) => allCompetencies.add(c));
  });
  mentorLogs.forEach(log => {
    log.competencies?.forEach((c: Competency) => allCompetencies.add(c));
  });

  // Build competency matrix
  const competencyMatrix = Array.from(allCompetencies).map(competency => {
    const relatedProjects = lecturerProjects.filter(p => 
      p.competencies?.includes(competency)
    );
    const relatedLogs = mentorLogs.filter(log => 
      log.competencies?.includes(competency)
    );
    
    // Calculate progress (average of related projects)
    const progress = relatedProjects.length > 0
      ? relatedProjects.reduce((sum, p) => sum + (p.completion || 0), 0) / relatedProjects.length
      : 0;

    // Extract key outcomes from mentor logs
    const keyOutcomes = relatedLogs
      .flatMap(log => log.achieved_goals || [])
      .filter((goal, index, self) => self.indexOf(goal) === index)
      .slice(0, 3);

    return { competency, progress, keyOutcomes };
  });

  // Build sections per competency
  const sections: PortfolioSection[] = Array.from(allCompetencies).map(competency => {
    const relatedProjects = lecturerProjects.filter(p => 
      p.competencies?.includes(competency)
    );
    
    const learningGoals: PortfolioLearningGoal[] = relatedProjects.flatMap(project => {
      const projectGoals = project.learning_goals?.[competency] || [];
      const goalsArray = Array.isArray(projectGoals) ? projectGoals : [projectGoals];
      
      return goalsArray.filter(Boolean).map((goal: string) => {
        // Find related reflections for this project
        const projectReflections = lecturerReflections.filter(
          r => r.project_id === project.id
        );

        // Extract learning activities from reflections and mentor logs
        const activities: string[] = [];
        projectReflections.forEach(r => {
          if (r.thoughts_what_i_think) activities.push(r.thoughts_what_i_think);
        });

        const relatedLogs = mentorLogs.filter(log => 
          log.project_ids?.includes(project.id)
        );
        relatedLogs.forEach(log => {
          if (log.outcomes) {
            const outcomes = Array.isArray(log.outcomes) ? log.outcomes : [log.outcomes];
            activities.push(...outcomes.map((o: any) => typeof o === 'string' ? o : o.outcome || '').filter(Boolean));
          }
        });

        // Build reflection from project achievements
        const achievements = project.learning_goals_achievements?.[competency] || [];
        const achievementsArray = Array.isArray(achievements) ? achievements : [];
        
        const reflection = {
          knowledge: achievementsArray
            .map((a: any) => a.explanation || '')
            .filter(Boolean)
            .join(' ') || 'Developed understanding through hands-on practice and iteration.',
          skills: `Applied ${competency.toLowerCase()} skills through project work and mentor feedback sessions.`,
          transfer: `These ${competency.toLowerCase()} capabilities will transfer to future projects requiring similar competencies.`
        };

        // Evidence (text-only references)
        const evidence: string[] = [];
        if (project.description) evidence.push(`Project: ${project.name}`);
        relatedLogs.forEach(log => {
          evidence.push(`Session: ${log.title} (${log.date})`);
        });

        return {
          title: goal,
          rewrittenOutcome: goal,
          learningActivities: activities.slice(0, 5),
          reflection,
          appendixEvidence: evidence
        };
      });
    });

    return { competency, learningGoals };
  });

  return {
    intro: {
      name: "Student Portfolio",
      period: "Academic Semester",
      overview: "This portfolio showcases my learning journey and growth across key competencies."
    },
    competencyMatrix,
    sections: sections.filter(s => s.learningGoals.length > 0)
  };
};
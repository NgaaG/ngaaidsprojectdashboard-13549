import { Competency } from "@/types";

export interface LearningGoal {
  title: string;
  rewrittenOutcome: string;
  learningActivities: string[];
  reflection: {
    knowledge: string;
    skills: string;
    transfer: string;
  };
}

export interface PortfolioSection {
  competency: Competency;
  feedbackSummary: string;
  reflectionOnFeedback: string;
  firstHalf: LearningGoal[];
  secondHalf: LearningGoal[];
  appendixEvidence: string[];
}

export interface PortfolioData {
  intro: {
    name: string;
    studentNumber: string;
    aboutMe: string;
    period: string;
  };
  tableOfContents: string[];
  competencyMatrix: {
    competency: Competency;
    midSemester: { ecsRequested: number; ecsEarned: number };
    endSemester: { ecsEarned: number; ecsDesired: number };
  }[];
  allGoalsSummary: {
    competency: Competency;
    goals: string[];
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
  const lecturerMentorLogs = mentorLogs.filter(m => m.mode === 'lecturer');
  
  // ALL 5 competencies must be included
  const allCompetencies: Competency[] = ["Research", "Create", "Organize", "Communicate", "Learn"];
  
  // Build competency matrix with placeholders
  const competencyMatrix = allCompetencies.map(competency => {
    return {
      competency,
      midSemester: { ecsRequested: 0, ecsEarned: 0 },
      endSemester: { ecsEarned: 0, ecsDesired: 0 }
    };
  });

  // Build all goals summary
  const allGoalsSummary = allCompetencies.map(competency => {
    const relatedProjects = lecturerProjects.filter(p => 
      p.competencies?.includes(competency)
    );
    
    const goals: string[] = [];
    relatedProjects.forEach(project => {
      const projectGoals = project.learning_goals?.[competency];
      if (projectGoals) {
        if (Array.isArray(projectGoals)) {
          goals.push(...projectGoals.filter(Boolean));
        } else if (typeof projectGoals === 'string' && projectGoals.trim()) {
          goals.push(projectGoals);
        }
      }
    });
    
    return { competency, goals };
  });

  // Build table of contents
  const tableOfContents = [
    "About Me",
    "Competency Matrix",
    "All Learning Goals Summarized",
    ...allCompetencies.map(c => c),
    "Appendix"
  ];

  // Build sections per competency
  const sections: PortfolioSection[] = allCompetencies.map(competency => {
    const relatedProjects = lecturerProjects.filter(p => 
      p.competencies?.includes(competency)
    );
    
    const relatedLogs = lecturerMentorLogs.filter(log => 
      log.competencies?.includes(competency)
    );
    
    const allLearningGoals: LearningGoal[] = [];
    
    // Extract learning goals from projects
    relatedProjects.forEach(project => {
      const projectGoals = project.learning_goals?.[competency];
      const goalsArray = Array.isArray(projectGoals) 
        ? projectGoals 
        : (projectGoals ? [projectGoals] : []);
      
      goalsArray.filter(Boolean).forEach((goalTitle: string) => {
        // Find related reflections
        const projectReflections = lecturerReflections.filter(
          r => r.project_id === project.id
        );

        // Extract learning activities
        const activities: string[] = [];
        
        // From reflections
        projectReflections.forEach(r => {
          if (r.thoughts_what_i_think) activities.push(r.thoughts_what_i_think);
          if (r.thoughts_what_is_true) activities.push(r.thoughts_what_is_true);
        });

        // From mentor logs
        const projectLogs = relatedLogs.filter(log => 
          log.project_ids?.includes(project.id)
        );
        projectLogs.forEach(log => {
          if (log.outcomes) {
            const outcomes = Array.isArray(log.outcomes) ? log.outcomes : [log.outcomes];
            outcomes.forEach((o: any) => {
              const outcomeText = typeof o === 'string' ? o : (o?.outcome || '');
              if (outcomeText) activities.push(outcomeText);
            });
          }
        });

        // Build reflection from achievements
        const achievements = project.learning_goals_achievements?.[competency];
        const achievementsArray = Array.isArray(achievements) ? achievements : [];
        
        const knowledgeText = achievementsArray
          .map((a: any) => a.explanation || '')
          .filter(Boolean)
          .join(' ');
        
        const reflection = {
          knowledge: knowledgeText || '[To be completed]',
          skills: `[To be completed]`,
          transfer: `[To be completed]`
        };

        allLearningGoals.push({
          title: goalTitle,
          rewrittenOutcome: '[To be completed]',
          learningActivities: activities.slice(0, 5),
          reflection
        });
      });
    });

    // Split into first and second half
    const midpoint = Math.ceil(allLearningGoals.length / 2);
    const firstHalf = allLearningGoals.slice(0, midpoint);
    const secondHalf = allLearningGoals.slice(midpoint);

    // Evidence from projects and logs
    const evidence: string[] = [];
    relatedProjects.forEach(p => {
      if (p.name) evidence.push(`Project: ${p.name}`);
    });
    relatedLogs.forEach(log => {
      evidence.push(`Session: ${log.title} (${log.date})`);
    });

    return {
      competency,
      feedbackSummary: '[To be completed]',
      reflectionOnFeedback: '[To be completed]',
      firstHalf,
      secondHalf,
      appendixEvidence: evidence
    };
  });

  return {
    intro: {
      name: "Student Name",
      studentNumber: "Student Number",
      aboutMe: "[To be completed]",
      period: "Academic Semester 2024"
    },
    tableOfContents,
    competencyMatrix,
    allGoalsSummary,
    sections
  };
};
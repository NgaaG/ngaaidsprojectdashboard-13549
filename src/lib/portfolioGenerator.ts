import { Competency } from "@/types";

export interface LearningGoal {
  title: string;
  rewrittenOutcome: string;
  learningActivities: string[];
  reflection: {
    whatIDid: string;
    whatILearned: string;
    challengesAndSolutions: string;
    fillTheGaps: string;
    nextSteps: string;
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

        // Extract learning activities from project key tasks
        const activities: string[] = [];
        if (project.key_tasks && Array.isArray(project.key_tasks)) {
          project.key_tasks.forEach((task: any) => {
            if (task.name || task.task) {
              activities.push(task.name || task.task);
            }
          });
        }

        // Build reflection from actual reflection entries
        const whatIDidEntries: string[] = [];
        const whatILearnedEntries: string[] = [];
        const challengesEntries: string[] = [];
        const solutionsEntries: string[] = [];
        const fillTheGapsEntries: string[] = [];
        const nextStepsEntries: string[] = [];

        projectReflections.forEach(r => {
          // What I did
          if (r.what_i_did && Array.isArray(r.what_i_did)) {
            r.what_i_did.forEach((entry: any) => {
              if (entry.content) whatIDidEntries.push(entry.content);
            });
          }

          // What I learned
          if (r.what_i_learned && Array.isArray(r.what_i_learned)) {
            r.what_i_learned.forEach((entry: any) => {
              if (entry.content) whatILearnedEntries.push(entry.content);
            });
          }

          // Challenges
          if (r.challenges_structured && Array.isArray(r.challenges_structured)) {
            r.challenges_structured.forEach((entry: any) => {
              if (entry.content) challengesEntries.push(entry.content);
            });
          }

          // Solutions
          if (r.solutions_structured && Array.isArray(r.solutions_structured)) {
            r.solutions_structured.forEach((entry: any) => {
              if (entry.content) solutionsEntries.push(entry.content);
            });
          }

          // Fill the gaps
          if (r.fill_the_gaps && Array.isArray(r.fill_the_gaps)) {
            r.fill_the_gaps.forEach((entry: any) => {
              if (entry.content) fillTheGapsEntries.push(entry.content);
            });
          }

          // Next steps
          if (r.next_steps && Array.isArray(r.next_steps)) {
            r.next_steps.forEach((entry: any) => {
              if (entry.content) nextStepsEntries.push(entry.content);
            });
          }
        });

        // Combine challenges and solutions
        const challengesAndSolutions: string[] = [];
        challengesEntries.forEach((challenge, idx) => {
          const solution = solutionsEntries[idx] || '';
          if (solution) {
            challengesAndSolutions.push(`Challenge: ${challenge}\nSolution: ${solution}`);
          } else {
            challengesAndSolutions.push(`Challenge: ${challenge}`);
          }
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

        const reflection = {
          whatIDid: whatIDidEntries.length > 0 
            ? whatIDidEntries.map((entry, idx) => `${idx + 1}. ${entry}`).join('\n')
            : '[To be completed]',
          whatILearned: whatILearnedEntries.length > 0
            ? whatILearnedEntries.map((entry, idx) => `${idx + 1}. ${entry}`).join('\n')
            : '[To be completed]',
          challengesAndSolutions: challengesAndSolutions.length > 0
            ? challengesAndSolutions.map((entry, idx) => `${idx + 1}. ${entry}`).join('\n\n')
            : '[To be completed]',
          fillTheGaps: fillTheGapsEntries.length > 0
            ? fillTheGapsEntries.map((entry, idx) => `${idx + 1}. ${entry}`).join('\n')
            : '[To be completed]',
          nextSteps: nextStepsEntries.length > 0
            ? nextStepsEntries.map((entry, idx) => `${idx + 1}. ${entry}`).join('\n')
            : '[To be completed]'
        };

        allLearningGoals.push({
          title: goalTitle,
          rewrittenOutcome: '[To be completed]',
          learningActivities: activities,
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
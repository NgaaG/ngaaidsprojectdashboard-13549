import { Competency } from "@/types";

export interface PortfolioSection {
  competency: Competency;
  feedbackSummary: string;
  reflectionOnFeedback: string;
  learningGoals: string[];
  learningActivities: {
    name: string;
    description: string;
    projectName: string;
  }[];
  reflections: {
    projectName: string;
    content: string[];
  }[];
  appendixFiles: {
    name: string;
    url: string;
    taskName: string;
  }[];
  appendixLinks: {
    title: string;
    url: string;
    taskName: string;
  }[];
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
    
    // 1. Learning Goals - All goals for this competency across all projects
    const learningGoals: string[] = [];
    relatedProjects.forEach(project => {
      const projectGoals = project.learning_goals?.[competency];
      if (projectGoals) {
        if (Array.isArray(projectGoals)) {
          learningGoals.push(...projectGoals.filter(Boolean));
        } else if (typeof projectGoals === 'string' && projectGoals.trim()) {
          learningGoals.push(projectGoals);
        }
      }
    });

    // 2. Learning Activities - All key tasks for this competency across all projects
    const learningActivities: { name: string; description: string; projectName: string }[] = [];
    relatedProjects.forEach(project => {
      const keyTasks = project.key_tasks || [];
      keyTasks.forEach((task: any) => {
        if (task.competency === competency && task.title) {
          learningActivities.push({
            name: task.title,
            description: task.description || '',
            projectName: project.name
          });
        }
      });
    });

    // 3. Reflections - All reflection content for this competency
    const reflections: { projectName: string; content: string[] }[] = [];
    relatedProjects.forEach(project => {
      const projectReflections = lecturerReflections.filter(
        r => r.project_id === project.id
      );
      
      const reflectionContent: string[] = [];
      projectReflections.forEach(r => {
        if (r.emotional_dump) reflectionContent.push(r.emotional_dump);
        
        if (r.what_i_did) {
          r.what_i_did.forEach((entry: any) => {
            if (entry.content) reflectionContent.push(`What I Did: ${entry.content}`);
          });
        }
        
        if (r.what_i_learned) {
          r.what_i_learned.forEach((entry: any) => {
            if (entry.content) reflectionContent.push(`What I Learned: ${entry.content}`);
          });
        }
        
        if (r.challenges_structured) {
          r.challenges_structured.forEach((entry: any) => {
            if (entry.content) reflectionContent.push(`Challenge: ${entry.content}`);
          });
        }
        
        if (r.solutions_structured) {
          r.solutions_structured.forEach((entry: any) => {
            if (entry.content) reflectionContent.push(`Solution: ${entry.content}`);
          });
        }
        
        if (r.fill_the_gaps) {
          r.fill_the_gaps.forEach((entry: any) => {
            if (entry.content) reflectionContent.push(`Gap: ${entry.content}`);
          });
        }
      });
      
      if (reflectionContent.length > 0) {
        reflections.push({
          projectName: project.name,
          content: reflectionContent
        });
      }
    });

    // 4. Appendix - Files and links from key tasks
    const appendixFiles: { name: string; url: string; taskName: string }[] = [];
    const appendixLinks: { title: string; url: string; taskName: string }[] = [];
    
    relatedProjects.forEach(project => {
      const keyTasks = project.key_tasks || [];
      keyTasks.forEach((task: any) => {
        if (task.competency === competency) {
          // Extract files
          if (task.files && Array.isArray(task.files)) {
            task.files.forEach((file: any) => {
              if (file.url && file.name) {
                appendixFiles.push({
                  name: file.name,
                  url: file.url,
                  taskName: task.title || 'Unnamed Task'
                });
              }
            });
          }
          
          // Extract links
          if (task.links && Array.isArray(task.links)) {
            task.links.forEach((link: any) => {
              if (link.url && link.title) {
                appendixLinks.push({
                  title: link.title,
                  url: link.url,
                  taskName: task.title || 'Unnamed Task'
                });
              }
            });
          }
        }
      });
    });

    return {
      competency,
      feedbackSummary: '[To be completed]',
      reflectionOnFeedback: '[To be completed]',
      learningGoals,
      learningActivities,
      reflections,
      appendixFiles,
      appendixLinks
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
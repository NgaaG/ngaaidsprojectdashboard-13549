import { Competency } from "@/types";

export interface PortfolioSection {
  competency: Competency;
  feedbackSummary: string;
  reflectionOnFeedback: string;
  learningGoals: {
    projectName: string;
    goals: string[];
  }[];
  learningActivities: {
    projectName: string;
    tasks: {
      name: string;
      description: string;
    }[];
  }[];
  reflections: {
    projectName: string;
    sections: {
      heading: string;
      content: string[];
    }[];
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
    
    // 1. Learning Goals - Grouped by project
    const learningGoals: { projectName: string; goals: string[] }[] = [];
    relatedProjects.forEach(project => {
      const projectGoals = project.learning_goals?.[competency];
      const goals: string[] = [];
      
      if (projectGoals) {
        if (Array.isArray(projectGoals)) {
          goals.push(...projectGoals.filter(Boolean));
        } else if (typeof projectGoals === 'string' && projectGoals.trim()) {
          goals.push(projectGoals);
        }
      }
      
      if (goals.length > 0) {
        learningGoals.push({
          projectName: project.name,
          goals
        });
      }
    });

    // 2. Learning Activities - Grouped by project
    const learningActivities: { projectName: string; tasks: { name: string; description: string }[] }[] = [];
    relatedProjects.forEach(project => {
      const keyTasks = project.key_tasks || [];
      const tasks: { name: string; description: string }[] = [];
      
      keyTasks.forEach((task: any) => {
        if (task.competency === competency && task.title) {
          tasks.push({
            name: task.title,
            description: task.description || ''
          });
        }
      });
      
      if (tasks.length > 0) {
        learningActivities.push({
          projectName: project.name,
          tasks
        });
      }
    });

    // 3. Reflections - All reflection content for this competency, organized by heading
    const reflections: { projectName: string; sections: { heading: string; content: string[] }[] }[] = [];
    relatedProjects.forEach(project => {
      const projectReflections = lecturerReflections.filter(
        r => r.project_id === project.id
      );
      
      const sections: { heading: string; content: string[] }[] = [];
      
      projectReflections.forEach(r => {
        // Emotional Dump
        if (r.emotional_dump) {
          sections.push({
            heading: "Emotional Dump",
            content: [r.emotional_dump]
          });
        }
        
        // What I Did
        if (r.what_i_did && Array.isArray(r.what_i_did)) {
          const whatDidContent = r.what_i_did
            .map((entry: any) => entry.content)
            .filter(Boolean);
          if (whatDidContent.length > 0) {
            sections.push({
              heading: "What I Did",
              content: whatDidContent
            });
          }
        }
        
        // What I Learned
        if (r.what_i_learned && Array.isArray(r.what_i_learned)) {
          const whatLearnedContent = r.what_i_learned
            .map((entry: any) => entry.content)
            .filter(Boolean);
          if (whatLearnedContent.length > 0) {
            sections.push({
              heading: "What I Learned",
              content: whatLearnedContent
            });
          }
        }
        
        // Challenges
        if (r.challenges_structured && Array.isArray(r.challenges_structured)) {
          const challengesContent = r.challenges_structured
            .map((entry: any) => entry.content)
            .filter(Boolean);
          if (challengesContent.length > 0) {
            sections.push({
              heading: "Challenges",
              content: challengesContent
            });
          }
        }
        
        // Solutions
        if (r.solutions_structured && Array.isArray(r.solutions_structured)) {
          const solutionsContent = r.solutions_structured
            .map((entry: any) => entry.content)
            .filter(Boolean);
          if (solutionsContent.length > 0) {
            sections.push({
              heading: "Solutions",
              content: solutionsContent
            });
          }
        }
        
        // Fill the Gaps
        if (r.fill_the_gaps && Array.isArray(r.fill_the_gaps)) {
          const gapsContent = r.fill_the_gaps
            .map((entry: any) => entry.content)
            .filter(Boolean);
          if (gapsContent.length > 0) {
            sections.push({
              heading: "Fill the Gaps",
              content: gapsContent
            });
          }
        }
        
        // Thoughts - What I Think
        if (r.thoughts_what_i_think) {
          sections.push({
            heading: "What I Think",
            content: [r.thoughts_what_i_think]
          });
        }
        
        // Thoughts - What is True
        if (r.thoughts_what_is_true) {
          sections.push({
            heading: "What is True",
            content: [r.thoughts_what_is_true]
          });
        }
        
        // Next Steps
        if (r.next_steps && Array.isArray(r.next_steps)) {
          const nextStepsContent = r.next_steps
            .map((entry: any) => entry.content)
            .filter(Boolean);
          if (nextStepsContent.length > 0) {
            sections.push({
              heading: "Next Steps",
              content: nextStepsContent
            });
          }
        }
        
        // Contingency Plan
        if (r.contingency_plan) {
          sections.push({
            heading: "Contingency Plan",
            content: [r.contingency_plan]
          });
        }
      });
      
      if (sections.length > 0) {
        reflections.push({
          projectName: project.name,
          sections
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
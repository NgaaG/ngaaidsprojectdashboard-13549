import { PortfolioData } from "./portfolioGenerator";

export const exportToPDF = () => {
  window.print();
};

export const generateNotionMarkdown = (data: PortfolioData): string => {
  const competencyEmojis: Record<string, string> = {
    Research: "🔍",
    Create: "🎨",
    Organize: "📊",
    Communicate: "💬",
    Learn: "📚"
  };

  let md = `# GROWTH PORTFOLIO\n\n`;
  md += `**${data.intro.name}**\n`;
  md += `**${data.intro.studentNumber}**\n`;
  md += `**${data.intro.period}**\n\n`;
  md += `---\n\n`;

  // About Me
  md += `## 🧘🏾 ABOUT ME\n\n`;
  md += `${data.intro.aboutMe}\n\n`;
  md += `---\n\n`;

  // Table of Contents
  md += `## 📑 TABLE OF CONTENTS\n\n`;
  data.tableOfContents.forEach(item => {
    md += `- ${item}\n`;
  });
  md += `\n---\n\n`;

  // Competency Matrix
  md += `## 📊 COMPETENCY MATRIX\n\n`;
  md += `| Competency | Mid-Semester ECs Requested | Mid-Semester ECs Earned | End-Semester ECs Earned | End-Semester ECs Desired |\n`;
  md += `|------------|----------------------------|-------------------------|-------------------------|-------------------------|\n`;
  data.competencyMatrix.forEach(({ competency, midSemester, endSemester }) => {
    md += `| ${competencyEmojis[competency]} ${competency} | `;
    md += `${midSemester.ecsRequested || '[TBD]'} | `;
    md += `${midSemester.ecsEarned || '[TBD]'} | `;
    md += `${endSemester.ecsEarned || '[TBD]'} | `;
    md += `${endSemester.ecsDesired || '[TBD]'} |\n`;
  });
  md += `\n---\n\n`;

  // All Learning Goals Summarized
  md += `## 🎯 ALL LEARNING GOALS SUMMARIZED\n\n`;
  data.allGoalsSummary.forEach(({ competency, goals }) => {
    md += `### ${competencyEmojis[competency]} ${competency.toUpperCase()}\n\n`;
    if (goals.length > 0) {
      goals.forEach(goal => {
        md += `- ${goal}\n`;
      });
    } else {
      md += `[No learning goals yet]\n`;
    }
    md += `\n`;
  });
  md += `---\n\n`;

  // Competency Sections
  data.sections.forEach(section => {
    md += `# ${competencyEmojis[section.competency]} ${section.competency.toUpperCase()}\n\n`;

    // Feedback Summary
    md += `## 📝 Feedback Summary (Previous Assessment)\n\n`;
    md += `${section.feedbackSummary}\n\n`;

    // Reflection on Feedback
    md += `## 💭 My Reflection on the Feedback\n\n`;
    md += `${section.reflectionOnFeedback}\n\n`;

    // Learning Goals
    md += `## 🎯 Learning Goals\n\n`;
    if (section.learningGoals.length > 0) {
      section.learningGoals.forEach(goalGroup => {
        md += `### Project: ${goalGroup.projectName}\n\n`;
        goalGroup.goals.forEach(goal => {
          md += `- ${goal}\n`;
        });
        md += `\n`;
      });
    } else {
      md += `[No learning goals yet]\n`;
    }
    md += `\n`;

    // Learning Activities (Key Tasks)
    md += `## 🛠 Learning Activities\n\n`;
    if (section.learningActivities.length > 0) {
      section.learningActivities.forEach(activityGroup => {
        md += `### Project: ${activityGroup.projectName}\n\n`;
        activityGroup.tasks.forEach(task => {
          md += `**${task.name}**\n`;
          if (task.description) {
            md += `${task.description}\n\n`;
          } else {
            md += `\n`;
          }
        });
        md += `\n`;
      });
    } else {
      md += `[No learning activities yet]\n\n`;
    }

    // Reflections
    md += `## 💭 Reflections\n\n`;
    if (section.reflections.length > 0) {
      section.reflections.forEach(reflection => {
        md += `### Project: ${reflection.projectName}\n\n`;
        reflection.sections.forEach(sec => {
          md += `#### ${sec.heading}\n\n`;
          sec.content.forEach(content => {
            md += `- ${content}\n`;
          });
          md += `\n`;
        });
        md += `\n`;
      });
    } else {
      md += `[No reflections yet]\n\n`;
    }

    // Appendix - Files and Links
    md += `## 📎 Appendix: Files and Evidence\n\n`;
    
    if (section.appendixFiles.length > 0) {
      md += `### Files to Upload\n\n`;
      section.appendixFiles.forEach(file => {
        md += `- **${file.name}** (from "${file.taskName}")\n`;
        md += `  - URL: ${file.url}\n`;
        md += `  - [Insert image/file here]\n\n`;
      });
    }
    
    if (section.appendixLinks.length > 0) {
      md += `### Links\n\n`;
      section.appendixLinks.forEach(link => {
        md += `- [${link.title}](${link.url}) (from "${link.taskName}")\n`;
      });
      md += `\n`;
    }
    
    if (section.appendixFiles.length === 0 && section.appendixLinks.length === 0) {
      md += `[No files or links to attach]\n\n`;
    }
    
    md += `---\n\n`;
  });

  // Final Appendix
  md += `# 📎 APPENDIX\n\n`;
  md += `[Attach folders and files here]\n`;

  return md;
};
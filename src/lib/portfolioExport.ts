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

    // First Half
    if (section.firstHalf.length > 0) {
      md += `## 📖 FIRST HALF\n\n`;
      section.firstHalf.forEach((goal, idx) => {
        md += `### 🎯 Learning Goal ${idx + 1}: ${goal.title}\n\n`;
        md += `**Rewritten Learning Outcome:**\n${goal.rewrittenOutcome}\n\n`;
        
        if (goal.learningActivities.length > 0) {
          md += `**🛠 Learning Activities:**\n`;
          goal.learningActivities.forEach(activity => {
            md += `- ${activity}\n`;
          });
          md += `\n`;
        }
        
        md += `**🧠 Reflection: Knowledge, Skills, Transfer**\n\n`;
        md += `**KNOWLEDGE:**\n${goal.reflection.knowledge}\n\n`;
        md += `**SKILLS:**\n${goal.reflection.skills}\n\n`;
        md += `**TRANSFER:**\n${goal.reflection.transfer}\n\n`;
        md += `---\n\n`;
      });
    }

    // Second Half
    if (section.secondHalf.length > 0) {
      md += `## 📖 SECOND HALF\n\n`;
      section.secondHalf.forEach((goal, idx) => {
        md += `### 🎯 Learning Goal ${idx + 1}: ${goal.title}\n\n`;
        md += `**Rewritten Learning Outcome:**\n${goal.rewrittenOutcome}\n\n`;
        
        if (goal.learningActivities.length > 0) {
          md += `**🛠 Learning Activities:**\n`;
          goal.learningActivities.forEach(activity => {
            md += `- ${activity}\n`;
          });
          md += `\n`;
        }
        
        md += `**🧠 Reflection: Knowledge, Skills, Transfer**\n\n`;
        md += `**KNOWLEDGE:**\n${goal.reflection.knowledge}\n\n`;
        md += `**SKILLS:**\n${goal.reflection.skills}\n\n`;
        md += `**TRANSFER:**\n${goal.reflection.transfer}\n\n`;
        md += `---\n\n`;
      });
    }

    // Appendix
    if (section.appendixEvidence.length > 0) {
      md += `## 📎 Appendix: Evidence\n\n`;
      section.appendixEvidence.forEach(evidence => {
        md += `- ${evidence}\n`;
      });
      md += `\n`;
    }
    
    md += `---\n\n`;
  });

  // Final Appendix
  md += `# 📎 APPENDIX\n\n`;
  md += `[Attach folders and files here]\n`;

  return md;
};
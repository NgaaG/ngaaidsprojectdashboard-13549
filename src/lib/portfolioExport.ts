import { PortfolioData } from "./portfolioGenerator";

export const exportToPDF = () => {
  window.print();
};

export const exportToNotion = (data: PortfolioData): void => {
  const competencyEmojis: Record<string, string> = {
    Research: "🔍",
    Create: "🎨",
    Organize: "📊",
    Communicate: "💬",
    Learn: "📚"
  };

  let markdown = `# 🎓 Growth Portfolio\n\n`;
  markdown += `**${data.intro.period}**\n\n`;
  markdown += `${data.intro.overview}\n\n`;
  markdown += `---\n\n`;

  // Competency Matrix
  markdown += `## 📈 Competency Matrix\n\n`;
  data.competencyMatrix.forEach(({ competency, progress, keyOutcomes }) => {
    markdown += `### ${competencyEmojis[competency]} ${competency}\n\n`;
    markdown += `**Progress:** ${Math.round(progress)}%\n\n`;
    if (keyOutcomes.length > 0) {
      markdown += `**Key Outcomes:**\n`;
      keyOutcomes.forEach(outcome => {
        markdown += `- ${outcome}\n`;
      });
      markdown += `\n`;
    }
  });

  markdown += `---\n\n`;

  // Sections by Competency
  data.sections.forEach(section => {
    markdown += `# ${competencyEmojis[section.competency]} ${section.competency}\n\n`;
    
    section.learningGoals.forEach(goal => {
      markdown += `## 🎯 ${goal.title}\n\n`;
      markdown += `**Learning Outcome:**\n${goal.rewrittenOutcome}\n\n`;
      
      if (goal.learningActivities.length > 0) {
        markdown += `### 🛠️ Learning Activities\n\n`;
        goal.learningActivities.forEach(activity => {
          markdown += `- ${activity}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `### 🧠 Reflection\n\n`;
      markdown += `**KNOWLEDGE**\n${goal.reflection.knowledge}\n\n`;
      markdown += `**SKILLS**\n${goal.reflection.skills}\n\n`;
      markdown += `**TRANSFER**\n${goal.reflection.transfer}\n\n`;
      
      if (goal.appendixEvidence.length > 0) {
        markdown += `### 📎 Appendix: Evidence\n\n`;
        goal.appendixEvidence.forEach(evidence => {
          markdown += `- ${evidence}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
  });

  // Create and download file
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'growth-portfolio.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
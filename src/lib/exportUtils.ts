import { Reflection, MentorLog, CompetencyProgress } from "@/types";

export const exportToJSON = (data: any, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToCSV = (
  reflections: Reflection[],
  mentorLogs: MentorLog[],
  filename: string
) => {
  // Combine reflections and mentor logs
  const headers = [
    "Type",
    "Date",
    "Title/Mood",
    "Content",
    "Competency",
    "Progress",
  ];

  const rows = [
    headers.join(","),
    ...reflections.map((r) =>
      [
        "Reflection",
        new Date(r.timestamp).toLocaleDateString(),
        r.mood,
        `"${r.emotionalDump.replace(/"/g, '""')}"`,
        "-",
        `${r.progress}%`,
      ].join(",")
    ),
    ...mentorLogs.map((m) =>
      [
        "Mentor Log",
        m.date,
        `"${m.title.replace(/"/g, '""')}"`,
        `"${m.keyGoals.replace(/"/g, '""')}"`,
        m.competency,
        "-",
      ].join(",")
    ),
  ];

  const csv = rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const generateMentorReport = async (
  mentorLogs: MentorLog[],
  competencyProgress: CompetencyProgress
) => {
  // Get last 3 sessions
  const recentLogs = mentorLogs.slice(0, 3);

  // Create simple HTML report
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Mentor Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
          }
          h1 { color: #6366f1; }
          h2 { color: #8b5cf6; margin-top: 30px; }
          .session {
            background: #f3f4f6;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
          }
          .competency {
            display: inline-block;
            background: #e0e7ff;
            padding: 5px 10px;
            border-radius: 5px;
            margin: 5px 5px 5px 0;
          }
          .progress {
            background: #dbeafe;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <h1>ADHD Creative Studio - Mentor Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h2>Competency Progress</h2>
        <div class="progress">
          ${Object.entries(competencyProgress)
            .map(([key, value]) => `<div><strong>${key}:</strong> ${value}%</div>`)
            .join("")}
        </div>

        <h2>Recent Mentor Sessions</h2>
        ${recentLogs
          .map(
            (log) => `
          <div class="session">
            <h3>${log.title}</h3>
            <p><strong>Date:</strong> ${log.date}</p>
            <span class="competency">${log.competency}</span>
            <p><strong>Key Goals:</strong> ${log.keyGoals}</p>
            <p><strong>Outcomes:</strong> ${log.outcomes}</p>
          </div>
        `
          )
          .join("")}
      </body>
    </html>
  `;

  // Open in new window for printing
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
};

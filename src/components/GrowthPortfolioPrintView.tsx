import { PortfolioData } from "@/lib/portfolioGenerator";

interface GrowthPortfolioPrintViewProps {
  data: PortfolioData;
}

export const GrowthPortfolioPrintView = ({ data }: GrowthPortfolioPrintViewProps) => {
  const competencyEmojis: Record<string, string> = {
    Research: "🔍",
    Create: "🎨",
    Organize: "📊",
    Communicate: "💬",
    Learn: "📚"
  };

  return (
    <div className="hidden print:block">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #000;
            background: #fff;
          }
          
          .print-page {
            page-break-after: always;
          }
          
          .print-heading-1 {
            font-size: 32px;
            font-weight: 700;
            margin: 40px 0 20px 0;
            color: #000;
          }
          
          .print-heading-2 {
            font-size: 24px;
            font-weight: 600;
            margin: 30px 0 15px 0;
            color: #000;
          }
          
          .print-heading-3 {
            font-size: 18px;
            font-weight: 600;
            margin: 20px 0 10px 0;
            color: #333;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          .print-table th,
          .print-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          
          .print-table th {
            background-color: #f5f5f5;
            font-weight: 600;
          }
          
          .print-bullet {
            margin-left: 20px;
            margin-bottom: 8px;
          }
          
          .print-section {
            margin-bottom: 40px;
          }
          
          .print-cover {
            text-align: center;
            padding: 100px 0;
          }
          
          .print-cover-title {
            font-size: 48px;
            font-weight: 700;
            margin: 20px 0;
          }
        }
      `}</style>

      {/* Cover Page */}
      <div className="print-page print-cover">
        <div style={{ fontSize: '72px', marginBottom: '20px' }}>🎓</div>
        <h1 className="print-cover-title">GROWTH PORTFOLIO</h1>
        <p style={{ fontSize: '24px', margin: '20px 0' }}>{data.intro.name}</p>
        <p style={{ fontSize: '18px', color: '#666' }}>{data.intro.studentNumber}</p>
        <p style={{ fontSize: '18px', color: '#666', marginTop: '40px' }}>{data.intro.period}</p>
      </div>

      {/* About Me */}
      <div className="print-section">
        <h1 className="print-heading-1">🧘🏾 ABOUT ME</h1>
        <p>{data.intro.aboutMe || '[To be completed]'}</p>
      </div>

      {/* Table of Contents */}
      <div className="print-section">
        <h1 className="print-heading-1">📑 TABLE OF CONTENTS</h1>
        {data.tableOfContents.map((item, idx) => (
          <div key={idx} className="print-bullet" style={{ marginLeft: '20px' }}>
            • {item}
          </div>
        ))}
      </div>

      {/* Competency Matrix */}
      <div className="print-section print-page">
        <h1 className="print-heading-1">📊 COMPETENCY MATRIX</h1>
        <table className="print-table">
          <thead>
            <tr>
              <th>Competency</th>
              <th>Mid-Semester ECs Requested</th>
              <th>Mid-Semester ECs Earned</th>
              <th>End-Semester ECs Earned</th>
              <th>End-Semester ECs Desired</th>
            </tr>
          </thead>
          <tbody>
            {data.competencyMatrix.map(({ competency, midSemester, endSemester }) => (
              <tr key={competency}>
                <td>{competencyEmojis[competency]} {competency}</td>
                <td>{midSemester.ecsRequested || '[TBD]'}</td>
                <td>{midSemester.ecsEarned || '[TBD]'}</td>
                <td>{endSemester.ecsEarned || '[TBD]'}</td>
                <td>{endSemester.ecsDesired || '[TBD]'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* All Learning Goals Summarized */}
      <div className="print-section">
        <h1 className="print-heading-1">🎯 ALL LEARNING GOALS SUMMARIZED</h1>
        {data.allGoalsSummary.map(({ competency, goals }) => (
          <div key={competency} style={{ marginBottom: '20px' }}>
            <h2 className="print-heading-2">
              {competencyEmojis[competency]} {competency.toUpperCase()}
            </h2>
            {goals.length > 0 ? (
              goals.map((goal, idx) => (
                <div key={idx} className="print-bullet">• {goal}</div>
              ))
            ) : (
              <p>[No learning goals yet]</p>
            )}
          </div>
        ))}
      </div>

      {/* Competency Sections */}
      {data.sections.map((section) => (
        <div key={section.competency} className="print-page">
          <h1 className="print-heading-1">
            {competencyEmojis[section.competency]} {section.competency.toUpperCase()}
          </h1>

          {/* Feedback Summary */}
          <div className="print-section">
            <h2 className="print-heading-2">📝 Feedback Summary (Previous Assessment)</h2>
            <p>{section.feedbackSummary || '[To be completed]'}</p>
          </div>

          {/* Reflection on Feedback */}
          <div className="print-section">
            <h2 className="print-heading-2">💭 My Reflection on the Feedback</h2>
            <p>{section.reflectionOnFeedback || '[To be completed]'}</p>
          </div>

          {/* Learning Goals */}
          <div className="print-section">
            <h2 className="print-heading-2">🎯 Learning Goals</h2>
            {section.learningGoals.length > 0 ? (
              section.learningGoals.map((goal, idx) => (
                <div key={idx} className="print-bullet">• {goal}</div>
              ))
            ) : (
              <p>[No learning goals yet]</p>
            )}
          </div>

          {/* Learning Activities */}
          <div className="print-section">
            <h2 className="print-heading-2">🛠 Learning Activities</h2>
            {section.learningActivities.length > 0 ? (
              section.learningActivities.map((activity, idx) => (
                <div key={idx} style={{ marginBottom: '15px' }}>
                  <h3 className="print-heading-3">{activity.name}</h3>
                  <p style={{ fontSize: '12px', color: '#666' }}>Project: {activity.projectName}</p>
                  {activity.description && <p>{activity.description}</p>}
                </div>
              ))
            ) : (
              <p>[No learning activities yet]</p>
            )}
          </div>

          {/* Reflections */}
          <div className="print-section">
            <h2 className="print-heading-2">💭 Reflections</h2>
            {section.reflections.length > 0 ? (
              section.reflections.map((reflection, idx) => (
                <div key={idx} style={{ marginBottom: '20px' }}>
                  <h3 className="print-heading-3">Project: {reflection.projectName}</h3>
                  {reflection.sections.map((sec, sIdx) => (
                    <div key={sIdx} style={{ marginBottom: '15px' }}>
                      <h4 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px', color: '#666' }}>
                        {sec.heading}
                      </h4>
                      {sec.content.map((content, cIdx) => (
                        <div key={cIdx} className="print-bullet">• {content}</div>
                      ))}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p>[No reflections yet]</p>
            )}
          </div>

          {/* Appendix - Files and Links */}
          <div className="print-section">
            <h2 className="print-heading-2">📎 Appendix: Files and Evidence</h2>
            
            {section.appendixFiles.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 className="print-heading-3">Files to Upload</h3>
                {section.appendixFiles.map((file, idx) => (
                  <div key={idx} style={{ marginBottom: '10px', fontSize: '12px' }}>
                    <p style={{ fontWeight: 600 }}>{file.name}</p>
                    <p style={{ color: '#666' }}>From: {file.taskName}</p>
                    <p style={{ color: '#666' }}>URL: {file.url}</p>
                    <p style={{ fontStyle: 'italic' }}>[Insert image/file here]</p>
                  </div>
                ))}
              </div>
            )}
            
            {section.appendixLinks.length > 0 && (
              <div>
                <h3 className="print-heading-3">Links</h3>
                {section.appendixLinks.map((link, idx) => (
                  <div key={idx} className="print-bullet">
                    • {link.title} - {link.url} (from {link.taskName})
                  </div>
                ))}
              </div>
            )}
            
            {section.appendixFiles.length === 0 && section.appendixLinks.length === 0 && (
              <p>[No files or links to attach]</p>
            )}
          </div>
        </div>
      ))}

      {/* Final Appendix */}
      <div className="print-page">
        <h1 className="print-heading-1">📎 APPENDIX</h1>
        <p>[Attach folders and files here]</p>
      </div>
    </div>
  );
};
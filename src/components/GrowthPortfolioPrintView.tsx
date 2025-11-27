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

          {/* First Half Learning Goals */}
          {section.firstHalf.length > 0 && (
            <div className="print-section">
              <h2 className="print-heading-2">📖 FIRST HALF</h2>
              {section.firstHalf.map((goal, idx) => (
                <div key={idx} style={{ marginBottom: '30px' }}>
                  <h3 className="print-heading-3">🎯 Learning Goal {idx + 1}: {goal.title}</h3>
                  
                  <h4 style={{ fontWeight: 600, marginTop: '15px' }}>Rewritten Learning Outcome:</h4>
                  <p>{goal.rewrittenOutcome || '[To be completed]'}</p>
                  
                  {goal.learningActivities.length > 0 && (
                    <>
                      <h4 style={{ fontWeight: 600, marginTop: '15px' }}>🛠 Learning Activities:</h4>
                      {goal.learningActivities.map((activity, aIdx) => (
                        <div key={aIdx} className="print-bullet">• {activity}</div>
                      ))}
                    </>
                  )}
                  
                  <h4 style={{ fontWeight: 600, marginTop: '15px' }}>🧠 Reflection</h4>
                  <div style={{ marginLeft: '20px' }}>
                    <p><strong>WHAT I DID:</strong> <span style={{ whiteSpace: 'pre-line' }}>{goal.reflection.whatIDid || '[To be completed]'}</span></p>
                    <p style={{ marginTop: '10px' }}><strong>WHAT I LEARNED:</strong> <span style={{ whiteSpace: 'pre-line' }}>{goal.reflection.whatILearned || '[To be completed]'}</span></p>
                    <p style={{ marginTop: '10px' }}><strong>CHALLENGES & SOLUTIONS:</strong> <span style={{ whiteSpace: 'pre-line' }}>{goal.reflection.challengesAndSolutions || '[To be completed]'}</span></p>
                    <p style={{ marginTop: '10px' }}><strong>WHERE I WANT TO FILL THE GAPS:</strong> <span style={{ whiteSpace: 'pre-line' }}>{goal.reflection.fillTheGaps || '[To be completed]'}</span></p>
                    <p style={{ marginTop: '10px' }}><strong>NEXT STEPS:</strong> <span style={{ whiteSpace: 'pre-line' }}>{goal.reflection.nextSteps || '[To be completed]'}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Second Half Learning Goals */}
          {section.secondHalf.length > 0 && (
            <div className="print-section">
              <h2 className="print-heading-2">📖 SECOND HALF</h2>
              {section.secondHalf.map((goal, idx) => (
                <div key={idx} style={{ marginBottom: '30px' }}>
                  <h3 className="print-heading-3">🎯 Learning Goal {idx + 1}: {goal.title}</h3>
                  
                  <h4 style={{ fontWeight: 600, marginTop: '15px' }}>Rewritten Learning Outcome:</h4>
                  <p>{goal.rewrittenOutcome || '[To be completed]'}</p>
                  
                  {goal.learningActivities.length > 0 && (
                    <>
                      <h4 style={{ fontWeight: 600, marginTop: '15px' }}>🛠 Learning Activities:</h4>
                      {goal.learningActivities.map((activity, aIdx) => (
                        <div key={aIdx} className="print-bullet">• {activity}</div>
                      ))}
                    </>
                  )}
                  
                  <h4 style={{ fontWeight: 600, marginTop: '15px' }}>🧠 Reflection</h4>
                  <div style={{ marginLeft: '20px' }}>
                    <p><strong>WHAT I DID:</strong> <span style={{ whiteSpace: 'pre-line' }}>{goal.reflection.whatIDid || '[To be completed]'}</span></p>
                    <p style={{ marginTop: '10px' }}><strong>WHAT I LEARNED:</strong> <span style={{ whiteSpace: 'pre-line' }}>{goal.reflection.whatILearned || '[To be completed]'}</span></p>
                    <p style={{ marginTop: '10px' }}><strong>CHALLENGES & SOLUTIONS:</strong> <span style={{ whiteSpace: 'pre-line' }}>{goal.reflection.challengesAndSolutions || '[To be completed]'}</span></p>
                    <p style={{ marginTop: '10px' }}><strong>WHERE I WANT TO FILL THE GAPS:</strong> <span style={{ whiteSpace: 'pre-line' }}>{goal.reflection.fillTheGaps || '[To be completed]'}</span></p>
                    <p style={{ marginTop: '10px' }}><strong>NEXT STEPS:</strong> <span style={{ whiteSpace: 'pre-line' }}>{goal.reflection.nextSteps || '[To be completed]'}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Appendix */}
          {section.appendixEvidence.length > 0 && (
            <div className="print-section">
              <h2 className="print-heading-2">📎 Appendix: Evidence</h2>
              {section.appendixEvidence.map((evidence, idx) => (
                <div key={idx} className="print-bullet">• {evidence}</div>
              ))}
            </div>
          )}
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
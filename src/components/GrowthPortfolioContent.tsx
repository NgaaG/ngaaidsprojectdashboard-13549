import { PortfolioData } from "@/lib/portfolioGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface GrowthPortfolioContentProps {
  data: PortfolioData;
}

export const GrowthPortfolioContent = ({ data }: GrowthPortfolioContentProps) => {
  const competencyEmojis: Record<string, string> = {
    Research: "🔍",
    Create: "🎨",
    Organize: "📊",
    Communicate: "💬",
    Learn: "📚"
  };

  return (
    <div className="portfolio-content space-y-8 print:hidden">
      {/* Cover Page */}
      <Card className="border-2">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="text-6xl mb-4">🎓</div>
          <CardTitle className="text-4xl font-bold">
            GROWTH PORTFOLIO
          </CardTitle>
          <div className="space-y-1">
            <p className="text-lg font-medium">{data.intro.name}</p>
            <p className="text-sm text-muted-foreground">{data.intro.studentNumber}</p>
            <p className="text-base text-muted-foreground mt-2">{data.intro.period}</p>
          </div>
        </CardHeader>
      </Card>

      {/* About Me */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">🧘🏾 About Me</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{data.intro.aboutMe}</p>
        </CardContent>
      </Card>

      {/* Table of Contents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">📑 Table of Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.tableOfContents.map((item, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Competency Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">📊 Competency Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Competency</th>
                  <th className="text-left p-3 font-semibold">Mid-Semester ECs Requested</th>
                  <th className="text-left p-3 font-semibold">Mid-Semester ECs Earned</th>
                  <th className="text-left p-3 font-semibold">End-Semester ECs Earned</th>
                  <th className="text-left p-3 font-semibold">End-Semester ECs Desired</th>
                </tr>
              </thead>
              <tbody>
                {data.competencyMatrix.map(({ competency, midSemester, endSemester }) => (
                  <tr key={competency} className="border-b">
                    <td className="p-3">
                      {competencyEmojis[competency]} {competency}
                    </td>
                    <td className="p-3">{midSemester.ecsRequested || '[TBD]'}</td>
                    <td className="p-3">{midSemester.ecsEarned || '[TBD]'}</td>
                    <td className="p-3">{endSemester.ecsEarned || '[TBD]'}</td>
                    <td className="p-3">{endSemester.ecsDesired || '[TBD]'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* All Learning Goals Summarized */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">🎯 All Learning Goals Summarized</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.allGoalsSummary.map(({ competency, goals }) => (
            <div key={competency}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                {competencyEmojis[competency]} {competency.toUpperCase()}
              </h3>
              {goals.length > 0 ? (
                <ul className="space-y-1 ml-6">
                  {goals.map((goal, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-sm">{goal}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground ml-6">[No learning goals yet]</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Competency Sections */}
      {data.sections.map((section) => (
        <div key={section.competency} className="space-y-6">
          <Card className="border-2">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-3xl flex items-center gap-3">
                <span>{competencyEmojis[section.competency]}</span>
                {section.competency.toUpperCase()}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Feedback Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">📝 Feedback Summary (Previous Assessment)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{section.feedbackSummary}</p>
            </CardContent>
          </Card>

          {/* Reflection on Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">💭 My Reflection on the Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{section.reflectionOnFeedback}</p>
            </CardContent>
          </Card>

          {/* First Half */}
          {section.firstHalf.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">📖 FIRST HALF</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {section.firstHalf.map((goal, idx) => (
                  <div key={idx} className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      🎯 Learning Goal {idx + 1}: {goal.title}
                    </h3>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                        Rewritten Learning Outcome:
                      </h4>
                      <p className="text-sm">{goal.rewrittenOutcome}</p>
                    </div>

                    {goal.learningActivities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          🛠 Learning Activities:
                        </h4>
                        <ul className="space-y-1 ml-6">
                          {goal.learningActivities.map((activity, aIdx) => (
                            <li key={aIdx} className="flex gap-2">
                              <span className="text-primary">•</span>
                              <span className="text-sm">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        🧠 Reflection: Knowledge, Skills, Transfer
                      </h4>
                      <div className="space-y-3 ml-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">KNOWLEDGE</p>
                          <p className="text-sm">{goal.reflection.knowledge}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">SKILLS</p>
                          <p className="text-sm">{goal.reflection.skills}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">TRANSFER</p>
                          <p className="text-sm">{goal.reflection.transfer}</p>
                        </div>
                      </div>
                    </div>

                    {idx < section.firstHalf.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Second Half */}
          {section.secondHalf.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">📖 SECOND HALF</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {section.secondHalf.map((goal, idx) => (
                  <div key={idx} className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      🎯 Learning Goal {idx + 1}: {goal.title}
                    </h3>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                        Rewritten Learning Outcome:
                      </h4>
                      <p className="text-sm">{goal.rewrittenOutcome}</p>
                    </div>

                    {goal.learningActivities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          🛠 Learning Activities:
                        </h4>
                        <ul className="space-y-1 ml-6">
                          {goal.learningActivities.map((activity, aIdx) => (
                            <li key={aIdx} className="flex gap-2">
                              <span className="text-primary">•</span>
                              <span className="text-sm">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        🧠 Reflection: Knowledge, Skills, Transfer
                      </h4>
                      <div className="space-y-3 ml-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">KNOWLEDGE</p>
                          <p className="text-sm">{goal.reflection.knowledge}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">SKILLS</p>
                          <p className="text-sm">{goal.reflection.skills}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">TRANSFER</p>
                          <p className="text-sm">{goal.reflection.transfer}</p>
                        </div>
                      </div>
                    </div>

                    {idx < section.secondHalf.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Appendix Evidence */}
          {section.appendixEvidence.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">📎 Appendix: Evidence</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {section.appendixEvidence.map((evidence, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-xs text-muted-foreground">{evidence}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      ))}

      {/* Final Appendix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">📎 APPENDIX</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">[Attach folders and files here]</p>
        </CardContent>
      </Card>
    </div>
  );
};
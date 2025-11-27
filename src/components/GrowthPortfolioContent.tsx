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

          {/* Learning Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">🎯 Learning Goals</CardTitle>
            </CardHeader>
            <CardContent>
              {section.learningGoals.length > 0 ? (
                <ul className="space-y-2">
                  {section.learningGoals.map((goal, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-sm">{goal}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">[No learning goals yet]</p>
              )}
            </CardContent>
          </Card>

          {/* Learning Activities (Key Tasks) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">🛠 Learning Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.learningActivities.length > 0 ? (
                section.learningActivities.map((activity, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="font-semibold text-sm">{activity.name}</h4>
                    <p className="text-xs text-muted-foreground">Project: {activity.projectName}</p>
                    {activity.description && (
                      <p className="text-sm">{activity.description}</p>
                    )}
                    {idx < section.learningActivities.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">[No learning activities yet]</p>
              )}
            </CardContent>
          </Card>

          {/* Reflections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">💭 Reflections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {section.reflections.emotionalDump.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Emotional Dump</h4>
                  <ul className="space-y-1 ml-4">
                    {section.reflections.emotionalDump.map((content, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary text-xs">•</span>
                        <span className="text-sm">{content}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {section.reflections.whatIDid.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">What I Did</h4>
                  <ul className="space-y-1 ml-4">
                    {section.reflections.whatIDid.map((content, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary text-xs">•</span>
                        <span className="text-sm">{content}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {section.reflections.whatILearned.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">What I Learned</h4>
                  <ul className="space-y-1 ml-4">
                    {section.reflections.whatILearned.map((content, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary text-xs">•</span>
                        <span className="text-sm">{content}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {section.reflections.challengesFaced.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Challenges Faced</h4>
                  <ul className="space-y-1 ml-4">
                    {section.reflections.challengesFaced.map((content, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary text-xs">•</span>
                        <span className="text-sm">{content}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {section.reflections.solutions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Solutions</h4>
                  <ul className="space-y-1 ml-4">
                    {section.reflections.solutions.map((content, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary text-xs">•</span>
                        <span className="text-sm">{content}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {section.reflections.fillTheGaps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Fill the Gaps</h4>
                  <ul className="space-y-1 ml-4">
                    {section.reflections.fillTheGaps.map((content, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary text-xs">•</span>
                        <span className="text-sm">{content}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {section.reflections.nextSteps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Next Steps</h4>
                  <ul className="space-y-1 ml-4">
                    {section.reflections.nextSteps.map((content, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary text-xs">•</span>
                        <span className="text-sm">{content}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {!section.reflections.emotionalDump.length && 
               !section.reflections.whatIDid.length && 
               !section.reflections.whatILearned.length && 
               !section.reflections.challengesFaced.length && 
               !section.reflections.solutions.length && 
               !section.reflections.fillTheGaps.length && 
               !section.reflections.nextSteps.length && (
                <p className="text-sm text-muted-foreground">[No reflections yet]</p>
              )}
            </CardContent>
          </Card>

          {/* Appendix - Files and Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">📎 Appendix: Files and Evidence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.appendixFiles.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Files to Upload</h4>
                  <ul className="space-y-2">
                    {section.appendixFiles.map((file, idx) => (
                      <li key={idx} className="text-xs space-y-1">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-muted-foreground">From: {file.taskName}</p>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          View File
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {section.appendixLinks.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Links</h4>
                  <ul className="space-y-1">
                    {section.appendixLinks.map((link, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary text-xs">•</span>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          {link.title} <span className="text-muted-foreground">(from {link.taskName})</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {section.appendixFiles.length === 0 && section.appendixLinks.length === 0 && (
                <p className="text-sm text-muted-foreground">[No files or links to attach]</p>
              )}
            </CardContent>
          </Card>
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
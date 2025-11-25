import { PortfolioData } from "@/lib/portfolioGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
    <div className="portfolio-content space-y-8 print:space-y-6">
      {/* Cover Page */}
      <Card className="border-2">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="text-6xl mb-4">🎓</div>
          <CardTitle className="text-4xl font-bold">
            Growth Portfolio
          </CardTitle>
          <p className="text-xl text-muted-foreground">{data.intro.period}</p>
          <p className="text-base max-w-2xl mx-auto">{data.intro.overview}</p>
        </CardHeader>
      </Card>

      {/* Competency Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">📈 Competency Matrix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.competencyMatrix.map(({ competency, progress, keyOutcomes }) => (
            <div key={competency} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span>{competencyEmojis[competency]}</span>
                  {competency}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              {keyOutcomes.length > 0 && (
                <ul className="text-sm space-y-1 ml-6">
                  {keyOutcomes.map((outcome, idx) => (
                    <li key={idx} className="list-disc text-muted-foreground">
                      {outcome}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Learning Goals by Competency */}
      {data.sections.map((section, sectionIdx) => (
        <div key={section.competency} className="space-y-6 page-break">
          <Card className="border-2">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-3xl flex items-center gap-3">
                <span>{competencyEmojis[section.competency]}</span>
                {section.competency}
              </CardTitle>
            </CardHeader>
          </Card>

          {section.learningGoals.map((goal, goalIdx) => (
            <Card key={goalIdx} className="space-y-4">
              <CardHeader>
                <CardTitle className="text-xl">
                  🎯 {goal.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rewritten Outcome */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase">
                    Learning Outcome
                  </h4>
                  <p className="text-base">{goal.rewrittenOutcome}</p>
                </div>

                <Separator />

                {/* Learning Activities */}
                {goal.learningActivities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <span>🛠️</span> Learning Activities
                    </h4>
                    <ul className="space-y-2">
                      {goal.learningActivities.map((activity, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-sm">{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

                {/* Reflection */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span>🧠</span> Reflection
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        KNOWLEDGE
                      </p>
                      <p className="text-sm">{goal.reflection.knowledge}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        SKILLS
                      </p>
                      <p className="text-sm">{goal.reflection.skills}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        TRANSFER
                      </p>
                      <p className="text-sm">{goal.reflection.transfer}</p>
                    </div>
                  </div>
                </div>

                {/* Evidence */}
                {goal.appendixEvidence.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <span>📎</span> Appendix: Evidence
                      </h4>
                      <ul className="space-y-1">
                        {goal.appendixEvidence.map((evidence, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground">
                            {evidence}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
};
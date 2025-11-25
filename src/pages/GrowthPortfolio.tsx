import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePortfolio, PortfolioData } from "@/lib/portfolioGenerator";
import { GrowthPortfolioContent } from "@/components/GrowthPortfolioContent";
import { GrowthPortfolioPrintView } from "@/components/GrowthPortfolioPrintView";
import { ExportDialog } from "@/components/ExportDialog";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const GrowthPortfolio = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setIsLoading(true);

      // Fetch lecturer-mode reflections
      const { data: reflections, error: reflectionsError } = await supabase
        .from('reflections')
        .select('*')
        .eq('mode', 'lecturer');

      if (reflectionsError) throw reflectionsError;

      // Fetch all mentor logs
      const { data: mentorLogs, error: mentorLogsError } = await supabase
        .from('mentor_logs')
        .select('*');

      if (mentorLogsError) throw mentorLogsError;

      // Fetch lecturer-mode projects (exclude file URLs)
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, competencies, completion, learning_goals, learning_goals_achievements, mode, description')
        .eq('mode', 'lecturer');

      if (projectsError) throw projectsError;

      // Generate portfolio
      const portfolio = await generatePortfolio(
        reflections || [],
        mentorLogs || [],
        projects || []
      );

      setPortfolioData(portfolio);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Generating your portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No portfolio data available</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header with Export Button */}
          <div className="flex items-center justify-between print:hidden">
            <div>
              <h1 className="text-3xl font-bold">Growth Portfolio</h1>
              <p className="text-muted-foreground">
                Auto-generated from your Lecture Mode learning journey
              </p>
            </div>
            <ExportDialog portfolioData={portfolioData} />
          </div>

          {/* Portfolio Content */}
          <GrowthPortfolioContent data={portfolioData} />
        </div>
      </div>

      {/* Print View (hidden, only for PDF export) */}
      <GrowthPortfolioPrintView data={portfolioData} />
    </>
  );
};

export default GrowthPortfolio;
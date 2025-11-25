import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, FileText } from "lucide-react";
import { exportToPDF, exportToNotion } from "@/lib/portfolioExport";
import { PortfolioData } from "@/lib/portfolioGenerator";
import { toast } from "@/hooks/use-toast";

interface ExportDialogProps {
  portfolioData: PortfolioData;
}

export const ExportDialog = ({ portfolioData }: ExportDialogProps) => {
  const handlePDFExport = () => {
    exportToPDF();
    toast({
      title: "PDF Export",
      description: "Opening print dialog...",
    });
  };

  const handleNotionExport = () => {
    exportToNotion(portfolioData);
    toast({
      title: "Notion Export",
      description: "Markdown file downloaded! Import it into Notion.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" className="gap-2">
          <Download className="h-4 w-4" />
          Export Growth Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Growth Portfolio</DialogTitle>
          <DialogDescription>
            Choose your export format
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Button
            onClick={handlePDFExport}
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
          >
            <FileText className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Download as PDF</div>
              <div className="text-sm text-muted-foreground">
                Print-formatted version matching Notion layout
              </div>
            </div>
          </Button>
          
          <Button
            onClick={handleNotionExport}
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
          >
            <FileText className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Export to Notion</div>
              <div className="text-sm text-muted-foreground">
                Download as Markdown (import into Notion)
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
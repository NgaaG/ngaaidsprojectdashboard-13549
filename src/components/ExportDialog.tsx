import { useState } from "react";
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
import { PortfolioData } from "@/lib/portfolioGenerator";
import { exportToPDF, generateNotionMarkdown } from "@/lib/portfolioExport";
import { MarkdownExportDialog } from "./MarkdownExportDialog";
import { toast } from "@/hooks/use-toast";

interface ExportDialogProps {
  portfolioData: PortfolioData;
}

export const ExportDialog = ({ portfolioData }: ExportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [markdownDialogOpen, setMarkdownDialogOpen] = useState(false);

  const handlePDFExport = () => {
    exportToPDF();
    setOpen(false);
    toast({
      title: "Print dialog opened",
      description: "Save as PDF or print your portfolio.",
    });
  };

  const handleNotionExport = () => {
    const markdown = generateNotionMarkdown(portfolioData);
    setMarkdownDialogOpen(true);
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="gap-2">
            <Download className="h-4 w-4" />
            Export Portfolio
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Growth Portfolio</DialogTitle>
            <DialogDescription>
              Choose how you'd like to export your portfolio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-4">
            <Button
              onClick={handlePDFExport}
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
            >
              <Download className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Download as PDF</div>
                <div className="text-xs text-muted-foreground">
                  Print-formatted portfolio matching Notion design
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
                <div className="text-xs text-muted-foreground">
                  Copy markdown to paste into Notion with full formatting
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MarkdownExportDialog
        open={markdownDialogOpen}
        onOpenChange={setMarkdownDialogOpen}
        markdown={generateNotionMarkdown(portfolioData)}
      />
    </>
  );
};
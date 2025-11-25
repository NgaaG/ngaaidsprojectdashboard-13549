import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MarkdownExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  markdown: string;
}

export const MarkdownExportDialog = ({ open, onOpenChange, markdown }: MarkdownExportDialogProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Paste this into a new Notion page to preserve all formatting.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please manually select and copy the text.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'growth-portfolio.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your markdown file is downloading.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export to Notion</DialogTitle>
          <DialogDescription>
            Copy the markdown below and paste it into a new Notion page. All formatting will be preserved.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button onClick={handleCopy} className="gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
          <Button onClick={handleDownload} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download .md
          </Button>
        </div>

        <ScrollArea className="flex-1 border rounded-lg">
          <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-words">
            {markdown}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
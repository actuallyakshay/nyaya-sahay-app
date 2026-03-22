import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface PdfViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileUrl?: string;
}

export const PdfViewer = ({ open, onOpenChange, fileName, fileUrl }: PdfViewerProps) => {
  // Mock URL for demo — in production this would be a real file URL
  const url = fileUrl || '/placeholder.svg';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-base truncate pr-8">{fileName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <div className="h-full rounded-lg border bg-muted flex flex-col items-center justify-center gap-4 text-center p-8">
            <div className="h-20 w-16 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive font-bold text-xs">
              PDF
            </div>
            <div>
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF preview will be available when connected to file storage
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Open in New Tab
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { DocumentList } from '@/components/DocumentList';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import type { CaseDocument } from '@/types';

interface DocumentsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: CaseDocument[];
  onUploadClick?: () => void;
}

export const DocumentsDrawer = ({ open, onOpenChange, documents, onUploadClick }: DocumentsDrawerProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="sm:max-w-md flex flex-col">
      <SheetHeader>
        <SheetTitle>Documents</SheetTitle>
        <SheetDescription>All files attached to this case.</SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto py-4">
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded yet.</p>
        ) : (
          <DocumentList documents={documents} />
        )}
      </div>

      {onUploadClick && (
        <div className="border-t pt-4 shrink-0">
          <Button variant="outline" className="w-full" onClick={onUploadClick}>
            <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Document
          </Button>
        </div>
      )}
    </SheetContent>
  </Sheet>
);

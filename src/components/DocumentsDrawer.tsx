import { DocumentList } from '@/components/DocumentList';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { CaseDocument } from '@/types';
import { Upload } from 'lucide-react';

interface DocumentsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: CaseDocument[];
  onUploadClick?: () => void;
}

export const DocumentsDrawer = ({
  open,
  onOpenChange,
  documents,
  onUploadClick,
}: DocumentsDrawerProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="flex flex-col sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Documents</SheetTitle>
        <SheetDescription>All files attached to this case.</SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto py-4">
        {documents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No documents uploaded yet.
          </p>
        ) : (
          <DocumentList documents={documents} />
        )}
      </div>

      {onUploadClick && (
        <div className="shrink-0 border-t pt-4">
          <Button variant="outline" className="w-full" onClick={onUploadClick}>
            <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Document
          </Button>
        </div>
      )}
    </SheetContent>
  </Sheet>
);

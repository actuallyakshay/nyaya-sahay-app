import { getCaseDocuments } from '@/api-client';
import { DocumentList } from '@/components/DocumentList';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { buildGenericQueryParams } from '@/lib/helpers';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PaginationControls } from './PaginationControls';

interface DocumentsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadClick?: () => void;
  caseClientName?: string;
  caseLawyerName?: string;
  loading?: boolean;
}

export const DocumentsDrawer = ({
  open,
  onOpenChange,
  onUploadClick,
  caseClientName,
  caseLawyerName,
  loading,
}: DocumentsDrawerProps) => {
  const { id } = useParams();
  const [page, setPage] = useState(1);

  const { data } = useQuery({
    queryKey: ['case-documents', page],
    queryFn: async () => {
      const params = buildGenericQueryParams(page);
      const response = await getCaseDocuments(id, params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const documents = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  return (
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
            <DocumentList
              documents={documents}
              caseClientName={caseClientName}
              caseLawyerName={caseLawyerName}
            />
          )}

          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={total}
            onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
            onPrev={() => setPage((p) => Math.max(p - 1, 1))}
            onPageChange={setPage}
          />
        </div>

        {onUploadClick && (
          <div className="shrink-0 pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={onUploadClick}
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="mr-1.5 h-3.5 w-3.5" />
              )}
              Upload Document
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

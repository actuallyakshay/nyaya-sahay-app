import { getAdminCaseDocuments, getCaseDocuments } from '@/api-client';
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
import { CaseStatus } from '@/types';
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
  isAdmin?: boolean;
  caseStatus: CaseStatus;
}

export const DocumentsDrawer = ({
  open,
  onOpenChange,
  onUploadClick,
  caseClientName,
  caseLawyerName,
  loading,
  isAdmin,
  caseStatus,
}: DocumentsDrawerProps) => {
  const { id } = useParams();
  const [page, setPage] = useState(1);

  const queryKey = isAdmin
    ? ['admin-case-documents', page]
    : ['case-documents', page];

  const queryFn = isAdmin ? getAdminCaseDocuments : getCaseDocuments;

  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = buildGenericQueryParams(page);
      const response = await queryFn(id, params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const documents = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const isCaseClosed = caseStatus === 'closed' || caseStatus === 'rejected';

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
        </div>

        <div className="shrink-0">
          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={total}
            onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
            onPrev={() => setPage((p) => Math.max(p - 1, 1))}
            onPageChange={setPage}
            className="pt-0"
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={onUploadClick}
            disabled={loading || isCaseClosed}
          >
            {loading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-3.5 w-3.5" />
            )}
            Upload Document
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

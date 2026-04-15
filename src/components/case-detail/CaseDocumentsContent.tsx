import { getAdminCaseDocuments, getCaseDocuments } from '@/api-client';
import { DocumentList } from '@/components/DocumentList';
import { PaginationControls } from '@/components/PaginationControls';
import { Button } from '@/components/ui/button';
import { buildGenericQueryParams } from '@/lib/helpers';
import { CaseStatus } from '@/types';
import { keepPreviousData, QueryKey, useQuery } from '@tanstack/react-query';
import { Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export interface CaseDocumentsContentProps {
  caseClientName?: string;
  caseLawyerName?: string;
  loading?: boolean;
  isAdmin?: boolean;
  caseStatus?: CaseStatus;
  onUploadClick?: (queryKey: QueryKey) => void;
}

export function CaseDocumentsContent({
  caseClientName,
  caseLawyerName,
  loading,
  isAdmin,
  caseStatus,
  onUploadClick,
}: CaseDocumentsContentProps) {
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
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

      <div className="shrink-0 pt-4">
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
          className="mt-3 w-full"
          onClick={() => {
            if (onUploadClick) onUploadClick(queryKey);
          }}
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
    </div>
  );
}

import { getAdminCaseDocuments } from '@/api-client';
import { FileViewer } from '@/components/FileViewer';
import { GenericTooltip } from '@/components/GenericTooltip';
import { PaginationControls } from '@/components/PaginationControls';
import { CaseDetailSkeleton } from '@/components/skeletons/CaseDetailSkeleton';
import { Button } from '@/components/ui/button';
import { path } from '@/constants';
import { useAdminCaseDetails } from '@/hooks/useAdminCaseDetails';
import { useCaseDocumentUpload } from '@/hooks/useCaseDocumentUpload';
import { AdminLayout } from '@/layouts/AdminLayout';
import { buildGenericQueryParams, getFileType, CASE_DOCUMENT_ACCEPT } from '@/lib/helpers';
import { queryClient } from '@/lib/query-client';
import { CaseDocument } from '@/types';
import { keepPreviousData, QueryKey, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Download,
  Eye,
  File,
  FileSpreadsheet,
  FileText,
  Loader2,
  Presentation,
  Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

const roleColorMap: Record<string, { bg: string; label: string; textColor: string }> = {
  user: { bg: 'bg-blue-50', label: 'Client', textColor: 'text-blue-700' },
  lawyer: { bg: 'bg-amber-50', label: 'Lawyer', textColor: 'text-amber-700' },
  admin: { bg: 'bg-purple-50', label: 'Admin', textColor: 'text-purple-700' },
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const isImageFile = (fileName: string, assetType: string): boolean => {
  const type = getFileType(fileName);
  if (type === 'image') return true;
  return ['image', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'].includes(
    assetType?.toLowerCase()
  );
};

const FileTypeIcon = ({ fileName }: { fileName: string }) => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (ext === 'pdf')
    return <FileText className="h-5 w-5 text-red-500" />;
  if (['doc', 'docx'].includes(ext || ''))
    return <FileText className="h-5 w-5 text-blue-600" />;
  if (['xls', 'xlsx'].includes(ext || ''))
    return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
  if (['ppt', 'pptx'].includes(ext || ''))
    return <Presentation className="h-5 w-5 text-orange-500" />;

  return <File className="h-5 w-5 text-muted-foreground" />;
};

const FileTypeLabel = ({ fileName }: { fileName: string }) => {
  const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
  return (
    <span className="mt-1 text-[10px] font-bold tracking-wider text-muted-foreground">
      {ext}
    </span>
  );
};

const DocumentMediaCard = ({
  document,
  onView,
}: {
  document: CaseDocument;
  onView: (doc: CaseDocument) => void;
}) => {
  const roleInfo = roleColorMap[document.author] || roleColorMap.admin;
  const fileName = document.assetName || `Untitled.${document.assetType}`;
  const isImage = isImageFile(fileName, document.assetType);

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-md hover:border-border/60"
      onClick={() => onView(document)}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {isImage ? (
          <img
            src={document.assetUrl}
            alt={fileName}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1">
            <FileTypeIcon fileName={fileName} />
            <FileTypeLabel fileName={fileName} />
          </div>
        )}

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="h-6 w-6 rounded-full shadow-sm"
            onClick={(e) => { e.stopPropagation(); onView(document); }}
            title="View"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-6 w-6 rounded-full shadow-sm"
            onClick={(e) => { e.stopPropagation(); window.open(document.assetUrl, '_blank'); }}
            title="Download"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>

        {/* Role badge on thumbnail */}
        <span
          className={`absolute right-1 top-1 inline-flex items-center rounded-full px-1 py-px text-[8px] font-semibold shadow-sm ${roleInfo.bg} ${roleInfo.textColor}`}
        >
          {roleInfo.label}
        </span>
      </div>

      {/* File Info */}
      <div className="px-1.5 py-1.5">
        <p className="truncate text-[11px] font-medium text-foreground" title={fileName}>
          {fileName}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {formatTimeAgo(document.createdAt)}
        </p>
      </div>
    </div>
  );
};

const AdminCaseDocuments = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { data: caseData, isLoading: isCaseLoading } = useAdminCaseDetails(id);
  const documentUploadInputRef = useRef<HTMLInputElement>(null);
  const [queryKey, setQueryKey] = useState<QueryKey | null>(null);
  const [page, setPage] = useState(1);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CaseDocument | null>(null);

  const { isUploadingDocument, uploadFromSource } = useCaseDocumentUpload(id, 'admin');

  const caseTitle = searchParams.get('title') || caseData?.title || 'Documents';
  const shortCaseTitle = caseTitle.length > 25 ? `${caseTitle.slice(0, 25)}…` : caseTitle;
  const backLink = path.adminCase(id || '');

  const documentsQueryKey = ['admin-case-documents', id, page];
  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery({
    queryKey: documentsQueryKey,
    queryFn: async () => {
      const params = buildGenericQueryParams(page, 10);
      const response = await getAdminCaseDocuments(id, params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const documents = documentsData?.data ?? [];
  const pagination = documentsData?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await uploadFromSource(file, 'Documents page');
    await queryClient.invalidateQueries({ queryKey: documentsQueryKey });
  };

  const handleViewDocument = (doc: CaseDocument) => {
    setSelectedDoc(doc);
    setViewerOpen(true);
  };

  if (isCaseLoading) {
    return (
      <AdminLayout>
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <CaseDetailSkeleton isLawyer />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-6 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
            asChild
          >
            <Link to={backLink} aria-label="Back to case">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <GenericTooltip
            content={`Case Documents - ${caseTitle}`}
            side="bottom"
            className="min-w-0 flex-1"
          >
            <h1 className="text-sm font-semibold leading-none text-foreground truncate">
              Case Documents - {shortCaseTitle}
            </h1>
          </GenericTooltip>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">
                  Case Documents{total > 0 ? ` (${total})` : ''}
                </h2>
              </div>
              <Button
                onClick={() => {
                  if (isUploadingDocument) return;
                  documentUploadInputRef.current?.click();
                  setQueryKey(documentsQueryKey);
                }}
                disabled={isUploadingDocument || caseData?.status === 'closed' || caseData?.status === 'rejected'}
                className="gap-2"
              >
                {isUploadingDocument ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload Document
              </Button>
            </div>

            {/* Grid */}
            {isDocumentsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No documents uploaded yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your first document to get started
                </p>
                <Button
                  onClick={() => documentUploadInputRef.current?.click()}
                  disabled={isUploadingDocument}
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                {documents.map((document) => (
                  <DocumentMediaCard
                    key={document.id}
                    document={document}
                    onView={handleViewDocument}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-6 pt-4 border-t border-border">
              <PaginationControls
                page={page}
                totalPages={totalPages}
                total={total}
                onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
                onPrev={() => setPage((p) => Math.max(p - 1, 1))}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>

        <input
          ref={documentUploadInputRef}
          type="file"
          accept={CASE_DOCUMENT_ACCEPT}
          className="hidden"
          onChange={handleDocumentUpload}
        />

        {selectedDoc && (
          <FileViewer
            open={viewerOpen}
            onOpenChange={setViewerOpen}
            fileName={selectedDoc.assetName || selectedDoc.assetType}
            fileUrl={selectedDoc.assetUrl}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCaseDocuments;

import { getFileIcon } from '@/lib/helpers';
import type { CaseDocument } from '@/types';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { FileViewer } from './FileViewer';

export const roleColorMap: Record<string, { bg: string; label: string }> = {
  user: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Client' },
  lawyer: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'Lawyer',
  },
  admin: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    label: 'Admin',
  },
};

interface DocumentListProps {
  documents: CaseDocument[];
  caseClientName?: string;
  caseLawyerName?: string;
}

export const DocumentList = ({
  documents,
  caseClientName,
  caseLawyerName,
}: DocumentListProps) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CaseDocument | null>(null);

  const openDoc = (doc: CaseDocument) => {
    setSelectedDoc(doc);
    setViewerOpen(true);
  };

  return (
    <>
      <div className="space-y-2">
        {documents.map((d) => {
          const isClient = d.author === 'user';
          const isLawyer = d.author === 'lawyer';
          const isAdmin = d.author === 'admin';
          const roleInfo = isClient
            ? roleColorMap.user
            : isLawyer
              ? roleColorMap.lawyer
              : roleColorMap.admin;

          return (
            <div
              key={d.id}
              className="group cursor-pointer rounded-lg bg-muted p-2.5 transition-colors hover:bg-muted/80"
              onClick={() => openDoc(d)}
            >
              <div className="flex items-center gap-2.5">
                {getFileIcon(d.assetName || d.assetType)}
                <span className="flex-1 truncate text-sm">
                  {d.assetName || d.assetType}
                </span>
                <Eye className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="ml-6 mt-1.5 flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${roleInfo.bg}`}
                >
                  {roleInfo.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {isClient
                    ? caseClientName
                    : isLawyer
                      ? caseLawyerName
                      : 'Admin'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDoc && (
        <FileViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          fileName={selectedDoc.assetName || selectedDoc.assetType}
          fileUrl={selectedDoc.assetUrl}
        />
      )}
    </>
  );
};

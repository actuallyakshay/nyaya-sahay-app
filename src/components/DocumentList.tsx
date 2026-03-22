import { FileText, Eye } from 'lucide-react';
import { useState } from 'react';
import { PdfViewer } from './PdfViewer';
import type { CaseDocument } from '@/types';

const roleColorMap: Record<string, { bg: string; label: string }> = {
  user: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Client' },
  lawyer: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Lawyer' },
  admin: { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Admin' },
};

interface DocumentListProps {
  documents: CaseDocument[];
}

export const DocumentList = ({ documents }: DocumentListProps) => {
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
          const roleInfo = roleColorMap[d.uploadedByRole] || roleColorMap.user;
          return (
            <div
              key={d.id}
              className="rounded-lg bg-muted p-2.5 cursor-pointer hover:bg-muted/80 transition-colors group"
              onClick={() => openDoc(d)}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate flex-1">{d.name}</span>
                <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <div className="mt-1.5 flex items-center gap-2 ml-6">
                <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${roleInfo.bg}`}>
                  {roleInfo.label}
                </span>
                <span className="text-[11px] text-muted-foreground">{d.uploadedByName}</span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDoc && (
        <PdfViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          fileName={selectedDoc.name}
        />
      )}
    </>
  );
};

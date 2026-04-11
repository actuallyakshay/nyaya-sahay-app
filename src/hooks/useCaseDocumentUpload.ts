import { uploadAsset, uploadCaseDocument } from '@/api-client';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/query-client';
import {
  getApiErrorMessage,
  normalizeCaseDocumentAssetType,
} from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';

export type CaseDocumentAuthor = 'lawyer' | 'user' | 'admin';

export function useCaseDocumentUpload(
  caseId: string | undefined,
  author: CaseDocumentAuthor
) {
  const { toast } = useToast();

  const { mutateAsync: uploadSingleDocument, isPending: isUploadingDocument } =
    useMutation({
      mutationFn: async (file: File) => {
        const { data } = await uploadAsset(file);
        await uploadCaseDocument(caseId, {
          assetUrl: data.assetUrl,
          assetType: normalizeCaseDocumentAssetType(data.assetType, file),
          assetName: data.assetName,
          author,
        });
      },
    });

  const uploadFromSource = async (
    file: File,
    source: 'Chat' | 'Documents drawer'
  ) => {
    try {
      await uploadSingleDocument(file);
      await queryClient.invalidateQueries({ queryKey: ['case-documents'] });
      toast({
        title: 'Document uploaded',
        description: `${file.name} uploaded from ${source}.`,
      });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: getApiErrorMessage(err),
        variant: 'destructive',
      });
    }
  };

  return { isUploadingDocument, uploadFromSource, uploadSingleDocument };
}

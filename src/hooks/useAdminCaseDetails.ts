import { getAdminCaseById } from '@/api-client';
import type { CaseDetails } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const adminCaseDetailsQueryKey = (caseId: string | undefined) =>
  ['admin-case-details', caseId] as const;

export function useAdminCaseDetails(caseId: string | undefined) {
  return useQuery({
    queryKey: adminCaseDetailsQueryKey(caseId),
    queryFn: async () => {
      const response = await getAdminCaseById(caseId);
      return response.data as CaseDetails;
    },
    enabled: Boolean(caseId),
    refetchOnWindowFocus: false,
  });
}

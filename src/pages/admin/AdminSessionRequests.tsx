import { getAdminSessionRequests } from '@/api-client';
import { PaginationControls } from '@/components/PaginationControls';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PAGE_SIZE } from '@/lib/mock-data';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  CheckCircle,
  Eye,
  MessageSquare,
  Phone,
  Video,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

const mockSessionRequests = [
  {
    id: 'sr1',
    caseNumber: 'LSP-2024-001',
    userName: 'Rajesh Kumar',
    lawyerName: 'Adv. Priya Sharma',
    type: 'video',
    date: '2024-09-15',
    time: '10:00 AM',
    status: 'pending',
    createdAt: '2024-09-10T09:00:00',
  },
  {
    id: 'sr2',
    caseNumber: 'LSP-2024-003',
    userName: 'Meera Patel',
    lawyerName: 'Adv. Vikram Desai',
    type: 'phone',
    date: '2024-09-16',
    time: '2:00 PM',
    status: 'pending',
    createdAt: '2024-09-11T14:00:00',
  },
];

const typeIcons = { video: Video, phone: Phone, chat: MessageSquare };

export const buildSessionRequestsQueryParams = (page: number) => {
  const params: Record<string, string | number> = {
    page,
    limit: PAGE_SIZE,
    orderBy: 'createdAt',
    order: 'DESC',
  };

  return params;
};

const AdminSessionRequests = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);

  const { data, isFetching } = useQuery({
    queryKey: ['session-requests', page],
    queryFn: async () => {
      const params = buildSessionRequestsQueryParams(page);
      const response = await getAdminSessionRequests(params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const sessionRequests = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Session Booking Requests</h1>
          <p className="mt-1 text-muted-foreground">
            Review and approve consultation session requests from users.
          </p>
        </div>

        {sessionRequests.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              No pending session requests.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessionRequests.map((req) => {
              const Icon =
                typeIcons[req?.callType as keyof typeof typeIcons] || Video;
              return (
                <div key={req.id} className="rounded-xl border bg-card p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {req?.case?.caseCode}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                          <Icon className="h-3 w-3" />
                          {req?.callType}
                        </span>
                        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                          Pending
                        </span>
                      </div>
                      <div className="mt-1 space-y-0.5 text-sm">
                        <p>
                          <span className="text-muted-foreground">User:</span>{' '}
                          <span className="font-medium">
                            {req.case?.user?.fullName}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Lawyer:</span>{' '}
                          <span className="font-medium">
                            {req.case?.assignedLawyer?.user?.fullName}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Requested on:
                          </span>{' '}
                          {new Date(req?.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="link" size="sm">
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          toast({
                            title: 'Session Approved',
                            description: `Session for ${req?.case?.caseCode} approved. Google Meet link will be generated and shared.`,
                          })
                        }
                      >
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          toast({
                            title: 'Session Rejected',
                            description: `Session request for ${req?.case?.caseCode} has been rejected.`,
                          })
                        }
                      >
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
    </AdminLayout>
  );
};

export default AdminSessionRequests;

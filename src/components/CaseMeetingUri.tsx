import { getFirstLetterCapitalized } from '@/lib/helpers';
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  ExternalLink,
  Video,
  XCircle,
} from 'lucide-react';

type CaseSessionRequest = {
  requestedDate?: string;
  requestedTime?: string;
  callType?: string;
  meetingUri?: string | null;
  status?: string | null;
  approvedBy?: string | null;
  raisedBy?: string | null;
  createdAt?: string;
};

type CaseMeetingUriProps = {
  sessionRequest?: CaseSessionRequest | null;
};

const normalizeStatus = (status?: string | null) =>
  (status ?? '').trim().toLowerCase();

export const CaseMeetingUri = ({ sessionRequest }: CaseMeetingUriProps) => {
  const meetingLink = sessionRequest?.meetingUri?.trim() || null;
  const statusNorm = normalizeStatus(sessionRequest?.status);

  const isPending = statusNorm === 'pending';
  const isAccepted =
    statusNorm === 'accepted' ||
    statusNorm === 'approved' ||
    statusNorm === 'confirmed';
  const isRejected = statusNorm === 'rejected' || statusNorm === 'declined';

  const requestedAt =
    sessionRequest?.requestedDate && sessionRequest?.requestedTime
      ? new Date(
          `${sessionRequest.requestedDate}T${sessionRequest.requestedTime}`
        )
      : null;

  const isUpcoming = requestedAt ? requestedAt.getTime() > Date.now() : null;

  const scheduledFormatted = requestedAt
    ? requestedAt.toLocaleString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const callTypeLabel =
    getFirstLetterCapitalized(sessionRequest?.callType ?? '') || null;

  const statusConfig = (() => {
    if (isRejected)
      return {
        icon: <XCircle className="h-3.5 w-3.5" />,
        label:
          getFirstLetterCapitalized(sessionRequest?.status ?? '') || 'Rejected',
        className:
          'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300',
      };
    if (isPending)
      return {
        icon: <Clock className="h-3.5 w-3.5" />,
        label: 'Pending approval',
        className:
          'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-200',
      };
    if (isAccepted)
      return {
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        label:
          getFirstLetterCapitalized(sessionRequest?.status ?? '') || 'Accepted',
        className:
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      };
    return null;
  })();

  const borderAccent = 'border-border';

  const statusHint = (() => {
    if (isRejected)
      return 'This session was not approved. You can book a new slot anytime.';
    if (isPending)
      return 'Waiting for approval — a Google Meet link will appear here once confirmed.';
    if (isAccepted && !meetingLink)
      return 'Session confirmed. The Meet link will appear here before your scheduled time.';
    return null;
  })();

  return (
    <div
      className={`w-full min-w-0 overflow-hidden rounded-xl border bg-card ${borderAccent}`}
    >
      {/* Main content row */}
      <div className="flex min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Left: session info */}
        <div className="flex min-w-0 flex-col gap-2">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold">
              <Video className="h-3.5 w-3.5 shrink-0" />
              {isUpcoming === true
                ? 'Upcoming'
                : isUpcoming === false
                  ? 'Past session'
                  : 'Consultation'}
              {callTypeLabel ? ` · ${callTypeLabel}` : ''}
            </span>

            {statusConfig && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.className}`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            )}
          </div>

          {/* Scheduled date */}
          {scheduledFormatted && (
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 shrink-0 text-gold" />
              <span className="text-sm font-semibold text-foreground sm:text-base">
                {scheduledFormatted}
              </span>
            </div>
          )}
        </div>

        {/* Right: CTA */}
        {meetingLink && isAccepted ? (
          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-gold/90 sm:w-auto sm:self-center"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            Join Google Meet
          </a>
        ) : isAccepted && !isRejected && !isPending ? (
          <span className="shrink-0 rounded-lg border border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground sm:self-center">
            Link pending
          </span>
        ) : null}
      </div>

      {/* Status hint strip */}
      {statusHint && (
        <div
          className={`border-t px-4 py-2.5 text-xs leading-relaxed ${
            isRejected
              ? 'border-red-200/60 bg-red-50/50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300'
              : isPending
                ? 'border-amber-200/60 bg-amber-50/50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200'
                : 'border-border bg-muted/30 text-muted-foreground'
          }`}
        >
          {statusHint}
        </div>
      )}
    </div>
  );
};

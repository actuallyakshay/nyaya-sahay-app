import { getFirstLetterCapitalized } from '@/lib/helpers';
import { CalendarClock, ExternalLink, UserCheck, Video } from 'lucide-react';

type CaseSessionRequest = {
  requestedDate?: string;
  requestedTime?: string;
  callType?: string;
  meetingUri?: string;
  status?: string;
  approvedBy?: string;
  raisedBy?: string;
};

type CaseMeetingUriProps = {
  sessionRequest?: CaseSessionRequest | null;
};

export const CaseMeetingUri = ({ sessionRequest }: CaseMeetingUriProps) => {
  const meetingLink = sessionRequest?.meetingUri ?? '';
  if (!meetingLink) return null;

  const requestedAt =
    sessionRequest?.requestedDate && sessionRequest?.requestedTime
      ? new Date(
          `${sessionRequest.requestedDate}T${sessionRequest.requestedTime}`
        )
      : null;

  const sessionTimingLabel = requestedAt
    ? requestedAt.getTime() > Date.now()
      ? 'Upcoming session'
      : 'Past session'
    : 'Consultation session';

  const formattedCallType = getFirstLetterCapitalized(sessionRequest?.callType)
    ? getFirstLetterCapitalized(sessionRequest?.callType)
    : null;

  const formattedStatus = getFirstLetterCapitalized(sessionRequest?.status);

  return (
    <div className="rounded-xl border border-gold/30 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold">
              <Video className="h-3.5 w-3.5" />
              {sessionTimingLabel}
            </span>
            {formattedStatus && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                {formattedStatus}
              </span>
            )}
            {formattedCallType && (
              <span className="rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground">
                {formattedCallType}
              </span>
            )}
          </div>

          <div className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
            {requestedAt && (
              <p className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" />
                <span>
                  <span className="font-medium text-foreground">
                    Scheduled:
                  </span>{' '}
                  {requestedAt.toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            )}
            {sessionRequest?.approvedBy && (
              <p className="inline-flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5" />
                <span>
                  <span className="font-medium text-foreground">
                    Approved by:
                  </span>{' '}
                  {sessionRequest.approvedBy}
                </span>
              </p>
            )}
            {sessionRequest?.raisedBy && (
              <p>
                <span className="font-medium text-foreground">Raised by:</span>{' '}
                {sessionRequest.raisedBy}
              </p>
            )}
          </div>
        </div>

        <a
          href={meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gold px-3 py-2 text-sm font-medium text-black transition hover:bg-gold/90"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Join Google Meet
        </a>
      </div>
    </div>
  );
};

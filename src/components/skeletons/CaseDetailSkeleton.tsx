import { Skeleton } from '@/components/ui/skeleton';

export const CaseDetailSkeleton = () => (
  <div className="space-y-4">
    {/* Header */}
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-7 w-3/5" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-1 h-4 w-2/5" />
    </div>

    {/* Action bar */}
    <div className="flex flex-wrap items-center gap-2">
      <Skeleton className="h-7 w-36 rounded-full" />
      <Skeleton className="h-4 w-24" />
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-md" />
        ))}
      </div>
    </div>

    {/* Chat section */}
    <div
      className="flex flex-col rounded-xl border bg-card"
      style={{ height: '600px' }}
    >
      {/* Chat header */}
      <div className="flex shrink-0 items-center justify-between border-b p-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Chat messages area */}
      <div className="flex-1 space-y-4 overflow-hidden p-4">
        {/* Left-aligned message */}
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-16 w-56 rounded-xl" />
          </div>
        </div>
        {/* Right-aligned message */}
        <div className="flex flex-row-reverse gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="ml-auto h-3 w-16" />
            <Skeleton className="h-12 w-48 rounded-xl" />
          </div>
        </div>
        {/* Left-aligned message */}
        <div className="flex gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-20 w-64 rounded-xl" />
          </div>
        </div>
        {/* Right-aligned message */}
        <div className="flex flex-row-reverse gap-3">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="ml-auto h-3 w-16" />
            <Skeleton className="h-14 w-52 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Chat input bar */}
      <div className="flex shrink-0 gap-2 border-t p-3">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    </div>
  </div>
);

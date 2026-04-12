import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export const GenericTooltip = ({
  content,
  className,
}: {
  content?: string | null;
  className?: string;
}) => {
  const text = content ?? '';
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <p
            className={cn(
              'mt-2 line-clamp-2 cursor-pointer text-xs text-muted-foreground',
              className
            )}
          >
            {text}
          </p>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs whitespace-pre-wrap bg-black text-xs text-white">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

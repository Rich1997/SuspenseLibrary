import React from 'react';
import { cn } from '@/lib/utils';
import {
  getFormattedLibraryLastUpdated,
  getFormattedNextScheduledUpdate,
} from '@/lib/updateSchedule';

export interface LibraryUpdateInfoProps {
  className?: string;
  variant?: 'compact' | 'block';
  showNextUpdate?: boolean;
}

export const LibraryUpdateInfo: React.FC<LibraryUpdateInfoProps> = ({
  className,
  variant = 'compact',
  showNextUpdate = true,
}) => {
  const lastUpdated = getFormattedLibraryLastUpdated();
  const nextUpdate = getFormattedNextScheduledUpdate();

  if (lastUpdated === 'Unknown') return null;

  if (variant === 'compact') {
    return (
      <div className={cn('px-2 pt-1.5 text-[10px] text-muted-foreground text-center space-y-0.5', className)}>
        <div>
          Last library update: <span className="text-foreground">{lastUpdated}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1 text-xs text-muted-foreground', className)}>
      <p>
        Last library update: <span className="text-foreground">{lastUpdated}</span>
      </p>
      {showNextUpdate && (
        <p>
          Next scheduled update: <span className="text-foreground">{nextUpdate}</span>
        </p>
      )}
    </div>
  );
};

export default LibraryUpdateInfo;

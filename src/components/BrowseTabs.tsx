import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const BrowseTabs: React.FC = () => {
  const { pathname } = useLocation();

  const navButtons = [
    {
      label: 'Library',
      path: '/episodes',
      isActive: pathname === '/episodes',
    },
    {
      label: 'Authors',
      path: '/authors',
      isActive: pathname === '/authors',
    },
    {
      label: 'Series',
      path: '/series',
      isActive: pathname === '/series',
    },
  ];

  return (
    <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar py-1 mb-4">
      {navButtons.map((btn) => {
        return (
          <Link
            key={btn.path}
            to={btn.path}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0',
              btn.isActive
                ? 'bg-foreground text-background font-bold shadow-xs'
                : 'bg-muted/70 text-foreground hover:bg-muted border border-border/40'
            )}
          >
            <span>{btn.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BrowseTabs;

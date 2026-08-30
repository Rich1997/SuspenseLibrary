import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Library, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useMobileNavSettings } from '@/hooks/useMobileNavSettings';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';

export const MobileBottomNav: React.FC = () => {
  const { isMobile, isLoading } = useIsMobile();
  const { pathname } = useLocation();
  const { activeTabConfig } = useMobileNavSettings();
  const { profileName } = useUserProfile();

  if (isLoading || !isMobile) {
    return null;
  }

  const avatarInitial = profileName.trim().charAt(0).toUpperCase() || 'G';
  const CustomIcon = activeTabConfig.icon;

  const navItems = [
    {
      label: 'Home',
      path: '/',
      exact: true,
      icon: Home,
    },
    {
      label: 'Library',
      path: '/episodes',
      exact: false,
      icon: Library,
    },
    {
      label: activeTabConfig.label,
      path: activeTabConfig.path,
      exact: false,
      icon: CustomIcon,
    },
    {
      label: 'Profile',
      path: '/profile',
      exact: false,
      icon: User,
      avatar: avatarInitial,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-2 py-1 md:hidden select-none"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-4 items-center h-13">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.path
            : pathname.startsWith(item.path);

          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.avatar && isActive ? (
                <div className="size-5 rounded-full bg-primary text-primary-foreground font-bold text-[11px] flex items-center justify-center shadow-xs">
                  {item.avatar}
                </div>
              ) : item.avatar ? (
                <div className="size-5 rounded-full bg-muted-foreground/20 text-muted-foreground font-bold text-[11px] flex items-center justify-center">
                  {item.avatar}
                </div>
              ) : (
                <IconComponent className={cn('size-5', isActive && 'stroke-[2.5]')} />
              )}
              <span className="text-[10px] tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

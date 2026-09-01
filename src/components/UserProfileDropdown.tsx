import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Heart,
  Clock,
  FolderPlus,
  Settings,
  Info,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useLibrary } from '@/hooks/useLibrary';
import { useLastBackup } from '@/lib/backupStorage';
import { LibraryUpdateInfo } from '@/components/LibraryUpdateInfo';

export const UserProfileDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { profileName } = useUserProfile();
  const { favorites, watchLater, customLists } = useLibrary();
  const { formattedLastBackup } = useLastBackup();

  const avatarInitial = profileName.trim().charAt(0).toUpperCase() || 'G';

  interface MenuItemConfig {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    onClick: () => void;
  }

  const menuSections: { id: string; items: MenuItemConfig[] }[] = [
    {
      id: 'library',
      items: [
        { label: 'History', icon: History, onClick: () => navigate('/history') },
        { label: 'Favorites', icon: Heart, count: favorites.length, onClick: () => navigate('/favorites') },
        { label: 'Watch Later', icon: Clock, count: watchLater.length, onClick: () => navigate('/watch-later') },
        { label: 'Lists', icon: FolderPlus, count: customLists.length, onClick: () => navigate('/lists') },
      ],
    },
    {
      id: 'preferences',
      items: [
        { label: 'Settings', icon: Settings, onClick: () => navigate('/settings') },
      ],
    },
    {
      id: 'info',
      items: [
        { label: "What's New", icon: Sparkles, onClick: () => navigate('/whats-new') },
        { label: 'About', icon: Info, onClick: () => navigate('/about') },
      ],
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative rounded-full size-7.5 bg-primary/20 text-foreground hover:bg-primary/30 hover:text-foreground ml-2"
        title={`Profile: ${profileName}`}>
        {avatarInitial}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-2 space-y-1">
        {/* Local Profile Header */}
        <div className="p-2 flex items-center gap-2.5">
          <div className="size-10 rounded-full bg-primary/20 text-primary font-bold text-base flex items-center justify-center shrink-0">
            {avatarInitial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-foreground truncate leading-tight">
              {profileName}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              Last backup: {formattedLastBackup}
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {menuSections.map((section, sectionIdx) => (
          <React.Fragment key={section.id}>
            {sectionIdx > 0 && <DropdownMenuSeparator />}

            {section.items.map(({ label, icon: Icon, count, onClick }) => (
              <DropdownMenuItem
                key={label}
                onClick={onClick}
                className="gap-2.5 py-2 font-medium text-xs cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="size-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
                {typeof count === 'number' && (
                  <Badge
                    variant="muted"
                    className="px-1.5 py-0 text-[10px] font-semibold h-4 min-w-4 justify-center rounded-full ml-auto"
                  >
                    {count}
                  </Badge>
                )}
              </DropdownMenuItem>
            ))}
          </React.Fragment>
        ))}

        {/* Library Update Info Footer */}
        <DropdownMenuSeparator />
        <LibraryUpdateInfo variant="compact" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;

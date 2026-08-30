import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  History,
  Heart,
  Clock,
  FolderPlus,
  Settings,
  Info,
  ChevronRight,
  Play,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useLibrary } from '@/hooks/useLibrary';
import { getRecentlyPlayedVideos } from '@/lib/recentlyPlayed';
import { useLastBackup } from '@/lib/backupStorage';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { VideoItem } from '@/types/playlist';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

export const ProfilePage: React.FC = () => {
  useDocumentTitle('Profile');
  const navigate = useNavigate();
  const { isMobile, isLoading } = useIsMobile();
  const { profileName } = useUserProfile();
  const { favorites, watchLater, customLists } = useLibrary();
  const { formattedLastBackup } = useLastBackup();

  const [recentVideos, setRecentVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    const loadHistory = () => {
      setRecentVideos(getRecentlyPlayedVideos(10));
    };
    loadHistory();

    window.addEventListener('recently_played_updated', loadHistory);
    window.addEventListener('storage', loadHistory);
    return () => {
      window.removeEventListener('recently_played_updated', loadHistory);
      window.removeEventListener('storage', loadHistory);
    };
  }, []);

  // On desktop viewports, redirect to /
  if (!isLoading && !isMobile) {
    return <Navigate to="/" replace />;
  }

  const avatarInitial = profileName.trim().charAt(0).toUpperCase() || 'G';

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto w-full min-w-0">
      {/* YouTube Style Profile Header */}
      <div className="flex items-center gap-4 pt-2 px-1">
        <div className="size-16 rounded-full bg-primary/20 text-primary font-bold text-2xl flex items-center justify-center shrink-0 shadow-md">
          {avatarInitial}
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <h1 className="text-xl font-extrabold text-foreground truncate leading-tight">
            {profileName}
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            Last backup: {formattedLastBackup}
          </p>
        </div>
      </div>

      {/* History Carousel Section (YouTube Mobile Style) */}
      <div className="space-y-3 w-[calc(100dvw-32px)] min-w-0">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <History className="size-4 text-muted-foreground" />
            <h2 className="text-base font-bold text-foreground">History</h2>
          </div>
          {recentVideos.length > 0 && (
            <Link
              to="/history"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
            >
              See all
              <ChevronRight className="size-3.5" />
            </Link>
          )}
        </div>

        {recentVideos.length > 0 ? (
          <Carousel
            opts={{
              align: 'start',
              dragFree: true,
            }}
            className="relative left-1/2 w-screen -translate-x-1/2"
          >
            <CarouselContent className="pb-2 pt-1 pl-4">
              {recentVideos.map((video) => {
                const actualAuthors = (video.authors || []).filter(
                  (a) => !a.role || a.role.toLowerCase() !== 'translator'
                );
                const isMultipleAuthors = actualAuthors.length > 1;
                const authorName = isMultipleAuthors
                  ? 'Various'
                  : actualAuthors.length === 1
                    ? actualAuthors[0].name
                    : video.authors && video.authors.length > 0
                      ? video.authors[0].name
                      : null;

                return (
                  <CarouselItem key={video.videoId} className="basis-45 last:pr-4">
                    <div
                      onClick={() => navigate(`/${video.videoId}`)}
                      className="group relative w-full space-y-1.5 cursor-pointer"
                    >
                      <div className="relative aspect-video rounded-md overflow-hidden bg-muted border border-border/50 group-hover:border-primary/50 transition-colors">
                        <img
                          src={video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="size-8 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg">
                            <Play className="size-4 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-0.5 px-0.5">
                        <h3 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                          {video.title}
                        </h3>
                        {authorName && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {authorName}
                          </p>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        ) : (
          <div className="bg-card/50 border border-dashed rounded-xl p-5 text-center space-y-2">
            <p className="text-xs text-muted-foreground">No recently played episodes found.</p>
            <Link to="/episodes">
              <Button size="xs" variant="outline">
                Browse Library
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Library Quick Access */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
          Playlists &amp; Collection
        </h2>

        <div className="border rounded-xl overflow-hidden divide-y divide-border">
          <Link
            to="/favorites"
            className="flex items-center justify-between p-3.5 hover:bg-accent/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                <Heart className="size-4" />
              </div>
              <span className="text-xs font-semibold text-foreground">Favorites</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="muted" className="px-2 py-0.5 text-[10px]">
                {favorites.length}
              </Badge>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </Link>

          <Link
            to="/watch-later"
            className="flex items-center justify-between p-3.5 hover:bg-accent/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                <Clock className="size-4" />
              </div>
              <span className="text-xs font-semibold text-foreground">Watch Later</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="muted" className="px-2 py-0.5 text-[10px]">
                {watchLater.length}
              </Badge>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </Link>

          <Link
            to="/lists"
            className="flex items-center justify-between p-3.5 hover:bg-accent/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                <FolderPlus className="size-4" />
              </div>
              <span className="text-xs font-semibold text-foreground">Custom Lists</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="muted" className="px-2 py-0.5 text-[10px]">
                {customLists.length}
              </Badge>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </div>

      {/* Account Settings & App Options */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
          Preferences &amp; App Info
        </h2>

        <div className="border rounded-xl overflow-hidden divide-y divide-border">
          <Link
            to="/settings"
            className="flex items-center justify-between p-3.5 hover:bg-accent/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                <Settings className="size-4" />
              </div>
              <span className="text-xs font-semibold text-foreground">Settings</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>

          <Link
            to="/about"
            className="flex items-center justify-between p-3.5 hover:bg-accent/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                <Info className="size-4" />
              </div>
              <span className="text-xs font-semibold text-foreground">About</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

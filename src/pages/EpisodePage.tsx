import { useParams, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { getVideoById } from '@/lib/playlist';
import { addRecentlyPlayedVideo } from '@/lib/recentlyPlayed';
import { VideoPlayer } from '@/components/VideoPlayer';
import { LibraryActions } from '@/components/LibraryActions';
import { EpisodeOverview } from '@/components/EpisodeOverview';
import { Recommended } from '@/components/Recommended';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const EpisodePage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const video = videoId ? getVideoById(videoId) : undefined;

  useDocumentTitle(video ? video.title : '404 - Page Not Found');

  if (!video) {
    return <NotFoundPage />;
  }

  const handlePlay = () => {
    addRecentlyPlayedVideo(video.videoId);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Player & Details) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Video Player */}
          <VideoPlayer videoId={video.videoId} title={video.title} onPlay={handlePlay} />

          {/* Episode Title & Actions Header */}
          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
              {video.title}
            </h1>

            <div className='flex md:items-center items-start justify-between gap-4 md:flex-row flex-col'>
              {video.authors && video.authors.length > 0 && (
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pt-0.5">
                  <div
                    className="rounded-full bg-muted-foreground/20 size-7 flex items-center justify-center shrink-0"
                    title="Author(s)"
                  >
                    <User className="size-3.5 text-primary shrink-0" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 font-medium text-foreground">
                    {video.authors.map((a, idx) => (
                      <span
                        key={idx}
                        onClick={() => navigate(`/episodes?q=${encodeURIComponent(a.name)}&scope=author`)}
                        className="hover:text-primary hover:underline cursor-pointer"
                        title={a.name}
                      >
                        {a.name}
                        {idx < (video.authors?.length || 0) - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-1 flex-nowrap">
                <LibraryActions videoId={video.videoId} title={video.title} />
              </div>
            </div>
          </div>

          {/* YouTube-style Expandable Episode Overview */}
          <EpisodeOverview video={video} />
        </div>

        {/* Sidebar: Recommended Episodes (Series & Author based) */}
        <div className="lg:col-span-1">
          <Recommended currentVideo={video} count={5} />
        </div>
      </div>
    </div>
  );
};

export default EpisodePage;

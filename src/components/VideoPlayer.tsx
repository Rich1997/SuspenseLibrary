import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onPlay?: () => void;
}

export const VideoPlayer = ({ videoId, title, onPlay }: VideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onPlayRef = useRef(onPlay);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    onPlayRef.current = onPlay;
  }, [onPlay]);

  useEffect(() => {
    hasTriggeredRef.current = false;

    const handlePlayTrigger = () => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        onPlayRef.current?.();
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (!event.origin || !event.origin.includes('youtube.com')) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        // Check all formats sent by YouTube JS API for PLAYING state (1)
        const isPlaying =
          (data.event === 'onStateChange' && data.info === 1) ||
          data.info?.playerState === 1 ||
          data.playerState === 1 ||
          data.info === 1;

        if (isPlaying) {
          handlePlayTrigger();
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);

    // Send listening handshake to YouTube iframe
    const timer = setTimeout(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'listening', id: videoId }),
          '*'
        );
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', handleMessage);
    };
  }, [videoId]);

  const handleContainerClick = () => {
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      onPlayRef.current?.();
    }
  };

  const originParam = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${originParam}`;

  return (
    <div
      onClick={handleContainerClick}
      className="relative aspect-video w-full overflow-hidden rounded-md bg-zinc-950 border border-border shadow-lg"
    >
      <iframe
        ref={iframeRef}
        key={videoId}
        className="h-full w-full border-0"
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Film, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('404 - Page Not Found');

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 text-center">
      {/* Background Decorative Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 sm:size-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-lg w-full space-y-6 bg-card/60 backdrop-blur-md border border-border/80 p-8 sm:p-10 rounded-md shadow-xl">
        {/* Icon & 404 Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="size-20 sm:size-24 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
            <SearchX className="size-10 sm:size-12 text-primary animate-pulse" />
          </div>
          <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[11px] font-bold font-mono px-2 py-0.5 rounded-full shadow">
            404
          </span>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Page Not Found
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <Button size="default" className="w-full sm:w-auto gap-2 font-medium">
              <Home className="size-4" />
              Back to Home
            </Button>
          </Link>

          <Link to="/episodes" className="w-full sm:w-auto">
            <Button variant="outline" size="default" className="w-full sm:w-auto gap-2 font-medium">
              <Film className="size-4" />
              Browse Episodes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

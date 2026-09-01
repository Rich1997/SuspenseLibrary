import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { AuthorsPage } from '@/pages/AuthorsPage';
import { SeriesPage } from '@/pages/SeriesPage';
import { EpisodePage } from '@/pages/EpisodePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { WatchLaterPage } from '@/pages/WatchLaterPage';
import { ListsPage } from '@/pages/ListsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AboutPage } from '@/pages/AboutPage';
import { WhatsNewPage } from '@/pages/WhatsNewPage';
import { UnassignedPage } from '@/pages/UnassignedPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ScrollArea } from './components/ui/scroll-area';
import { useRef, useEffect } from 'react';

function AppContent() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { pathname, search } = useLocation();

  useEffect(() => {
    const viewport =
      viewportRef.current?.querySelector('[data-slot="scroll-area-viewport"]') ||
      viewportRef.current?.querySelector("[data-id*='viewport']");

    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, search]);

  return (
    <div className="min-h-patch bg-background text-foreground flex flex-col font-sans overflow-hidden">
      <Navbar />

      <ScrollArea
        className="md:h-[calc(100dvh-57px)] h-[calc(100dvh-119px)]"
        ref={viewportRef}
        scrollbarClassName="md:data-vertical:w-4 data-vertical:w-2.5"
      >
        <div className="min-h-full flex flex-col flex-1">
          <main className="flex-1 container mx-auto px-4 py-6 min-w-0 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/episodes" element={<CatalogPage />} />
              <Route path="/authors" element={<AuthorsPage />} />
              <Route path="/series" element={<SeriesPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/watch-later" element={<WatchLaterPage />} />
              <Route path="/lists" element={<ListsPage />} />
              <Route path="/lists/:listId" element={<ListsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/whats-new" element={<WhatsNewPage />} />
              <Route path="/unassigned" element={<Navigate to="/unassigned/missing-authors" replace />} />
              <Route path="/unassigned/:tab" element={<UnassignedPage />} />
              <Route path="/:videoId" element={<EpisodePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </ScrollArea>

      <MobileBottomNav />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
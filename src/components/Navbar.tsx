import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import Logo from '@/assets/Logo';
import { SearchBar } from '@/components/SearchBar';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useIsMobile';

const NAV_LINKS = [
  { label: 'Library', path: '/episodes' },
  { label: 'Authors', path: '/authors' },
  { label: 'Series', path: '/series' },
];

export const Navbar = () => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { pathname } = useLocation();
  const { isMobile } = useIsMobile();

  // Automatically collapse search bar on route change
  useEffect(() => {
    setIsSearchExpanded(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between gap-3 px-4">
        {/* Expanded Mobile SearchBar */}
        {isSearchExpanded ? (
          <div className="flex items-center gap-2 w-full md:hidden animate-in fade-in-50 duration-150">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsSearchExpanded(false)}
              aria-label="Close search"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <SearchBar
              className="flex-1"
              autoFocus
              onClose={() => setIsSearchExpanded(false)}
            />
          </div>
        ) : (
          <>
            <Link
              to="/"
              className="flex items-center gap-2 font-bold text-foreground hover:opacity-90 transition-opacity w-54.5"
            >
              <Logo width={isMobile ? 140 : 180} />
            </Link>

            <div className="hidden md:block flex-1 max-w-md mx-4">
              <SearchBar />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchExpanded(true)}
                aria-label="Open Search"
                className="md:hidden text-muted-foreground hover:text-foreground -mr-1"
              >
                <Search className="size-5" />
              </Button>

              <div className='flex items-center gap-0 md:w-54.5 w-fit md:mr-0 -mr-2'>
                {NAV_LINKS.map((link) => (
                  <Link key={link.path} to={link.path} className="hidden md:inline-flex">
                    <Button
                      variant={'ghost'}
                      className="gap-2 text-xs font-semibold"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}

                <div className="hidden md:block">
                  <UserProfileDropdown />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
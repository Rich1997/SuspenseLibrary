import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { LibraryUpdateInfo } from '@/components/LibraryUpdateInfo';

interface ChangelogGroup {
  date: string;
  items: string[];
}

const CHANGELOG: ChangelogGroup[] = [
  {
    date: 'September 2, 2026',
    items: [
      'What\'s New section to easily catch up on recent features and improvements.',
      'Library update indicator showing when new episodes were last synced.',
      'Added sitemap and search engine indexing optimization.',
    ],
  },
  {
    date: 'September 1, 2026',
    items: [
      'Library updates',
    ]
  },
  {
    date: 'August 31, 2026',
    items: [
      'Sort by Most Popular added.',
      'View and like count statistics shown on episode cards.'
    ],
  },
  {
    date: 'August 30, 2026 - Official Launch',
    items: [
      'Dedicated About page with project information.'
    ],
  },
  {
    date: 'August 29, 2026',
    items: [
      'Smoother navigation across desktop and mobile devices.',
      'Added missing episodes.',
    ]
  },
  {
    date: 'Earlier',
    items: [
      'Search filtering to search specifically by Title, Author, or Series.',
      'Custom Playlists with full backup and restore support.',
      'Sunday Suspense episode catalogue and web player.',
      'Search, stream, favorite, and save episodes to Watch Later.',
      'Author and Series pages to explore collections by your favorite authors or story series.',
      'Listening history to easily resume recently played stories.',
      'Sorting options to discover episodes by Newest or Oldest'
    ]
  }
];

export const WhatsNewPage: React.FC = () => {
  useDocumentTitle('What\'s New');

  return (
    <div className="space-y-8 pb-16 max-w-xl mx-auto">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          What&apos;s New
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Feature updates and recent additions to Suspense Library.
        </p>
        <LibraryUpdateInfo variant='block' />
      </div>

      <hr className="border-border" />

      {/* Text-based Changelog Groups */}
      <div className="space-y-8">
        {CHANGELOG.map((group, index) => (
          <section key={group.date || index} className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground border-b pb-2">
              {group.date}
            </h2>

            <ul className="space-y-2 text-sm sm:text-base leading-relaxed text-muted-foreground">
              {group.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2">
                  <span className="font-semibold select-none">–</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default WhatsNewPage;

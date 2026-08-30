import React from 'react';
import { RecentlyPlayed } from '@/components/sections/RecentlyPlayed';
import { PopularAuthors } from '@/components/sections/PopularAuthors';
import { LatestUploads } from '@/components/sections/LatestUploads';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const HomePage: React.FC = () => {
  useDocumentTitle('Home');

  return (
    <div className="space-y-10 pb-12">
      <RecentlyPlayed count={5} />
      <LatestUploads count={8} />
      <PopularAuthors count={8} />
    </div>
  );
};

export default HomePage;

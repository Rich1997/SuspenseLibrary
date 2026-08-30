import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { AppearanceSection } from '@/components/settings/AppearanceSection';
import { DataManagementSection } from '@/components/settings/DataManagementSection';

export const SettingsPage: React.FC = () => {
  useDocumentTitle('Settings');

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto overflow-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
        Settings
      </h1>

      <div className="space-y-8">
        <ProfileSection />
        <AppearanceSection />
        <DataManagementSection />
      </div>
    </div>
  );
};

export default SettingsPage;


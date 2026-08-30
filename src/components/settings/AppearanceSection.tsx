import React from 'react';
import { Palette, Smartphone } from 'lucide-react';
import { useMobileNavSettings, type CustomTabOption } from '@/hooks/useMobileNavSettings';
import { ThemeSelector } from '@/components/ThemeSelector';

export const AppearanceSection: React.FC = () => {
  const { customTab, setCustomTab, allTabConfigs } = useMobileNavSettings();

  return (
    <section className="border text-card-foreground rounded-xl shadow-sm overflow-hidden divide-y divide-border">
      {/* Panel Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Palette className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Appearance</h2>
            <p className="text-xs text-muted-foreground">
              Customize app theme and mobile navigation preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-foreground">Theme Preference</h3>
            <p className="text-[11px] text-muted-foreground">
              Select light, dark, or system default color theme.
            </p>
          </div>
          <ThemeSelector />
        </div>
      </div>

      {/* Mobile Navigation Tab Setting */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <Smartphone className="size-4 text-primary shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-foreground">Mobile Navigation Custom Tab</h3>
            <p className="text-[11px] text-muted-foreground">
              Choose which library section appears on your mobile bottom navigation bar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 max-w-md pt-1">
          {allTabConfigs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = customTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCustomTab(tab.id as CustomTabOption)}
                className={`flex flex-col items-center justify-center p-3 rounded-md border text-xs font-medium transition-all gap-1.5 cursor-pointer ${isSelected
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-accent/40'
                  }`}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AppearanceSection;

import { useState, useEffect } from 'react';
import { Heart, Clock, FolderPlus, type LucideIcon } from 'lucide-react';

export type CustomTabOption = 'favorites' | 'watch-later' | 'lists';

export interface TabConfig {
  id: CustomTabOption;
  label: string;
  icon: LucideIcon;
  path: string;
}

export const CUSTOM_TAB_CONFIGS: Record<CustomTabOption, TabConfig> = {
  favorites: {
    id: 'favorites',
    label: 'Favorites',
    icon: Heart,
    path: '/favorites',
  },
  'watch-later': {
    id: 'watch-later',
    label: 'Watch Later',
    icon: Clock,
    path: '/watch-later',
  },
  lists: {
    id: 'lists',
    label: 'Lists',
    icon: FolderPlus,
    path: '/lists',
  },
};

const STORAGE_KEY = 'suspense_custom_bottom_tab';
const DEFAULT_TAB: CustomTabOption = 'favorites';
const EVENT_NAME = 'suspense-bottom-tab-updated';

export function getStoredCustomTab(): CustomTabOption {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as CustomTabOption;
    if (stored && (stored === 'favorites' || stored === 'watch-later' || stored === 'lists')) {
      return stored;
    }
    return DEFAULT_TAB;
  } catch {
    return DEFAULT_TAB;
  }
}

export function setStoredCustomTab(tab: CustomTabOption): void {
  try {
    localStorage.setItem(STORAGE_KEY, tab);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: tab }));
  } catch (err) {
    console.error('Failed to save custom bottom tab setting:', err);
  }
}

export function useMobileNavSettings() {
  const [customTab, setCustomTabState] = useState<CustomTabOption>(getStoredCustomTab);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CustomTabOption>;
      if (customEvent.detail) {
        setCustomTabState(customEvent.detail);
      } else {
        setCustomTabState(getStoredCustomTab());
      }
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const setCustomTab = (tab: CustomTabOption) => {
    setStoredCustomTab(tab);
  };

  return {
    customTab,
    setCustomTab,
    activeTabConfig: CUSTOM_TAB_CONFIGS[customTab] || CUSTOM_TAB_CONFIGS.favorites,
    allTabConfigs: Object.values(CUSTOM_TAB_CONFIGS),
  };
}

export default useMobileNavSettings;

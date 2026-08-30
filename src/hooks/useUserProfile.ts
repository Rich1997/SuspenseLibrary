import { useState, useEffect } from 'react';

const STORAGE_KEY = 'suspense_profile_name';
const DEFAULT_NAME = 'Guest Listener';
const PROFILE_EVENT = 'suspense-profile-updated';

export function getStoredProfileName(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && stored.trim() ? stored.trim() : DEFAULT_NAME;
  } catch {
    return DEFAULT_NAME;
  }
}

export function setStoredProfileName(newName: string): void {
  const cleanName = newName.trim() || DEFAULT_NAME;
  try {
    localStorage.setItem(STORAGE_KEY, cleanName);
    window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: cleanName }));
  } catch (err) {
    console.error('Failed to save profile name:', err);
  }
}

export function useUserProfile() {
  const [profileName, setProfileNameState] = useState<string>(getStoredProfileName);

  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setProfileNameState(customEvent.detail);
      } else {
        setProfileNameState(getStoredProfileName());
      }
    };

    window.addEventListener(PROFILE_EVENT, handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener(PROFILE_EVENT, handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const updateProfileName = (name: string) => {
    setStoredProfileName(name);
  };

  return {
    profileName,
    updateProfileName,
  };
}

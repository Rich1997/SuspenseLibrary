import React, { useState, useEffect } from 'react';
import { User, CheckCircle2 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const ProfileSection: React.FC = () => {
  const { profileName, updateProfileName } = useUserProfile();
  const [nameInput, setNameInput] = useState(profileName);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setNameInput(profileName);
  }, [profileName]);

  const isDirty = nameInput.trim() !== profileName && nameInput.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    updateProfileName(nameInput.trim());
    setSavedSuccess(true);

    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <section className="border text-card-foreground rounded-xl shadow-sm overflow-hidden divide-y divide-border">
      {/* Panel Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Profile</h2>
            <p className="text-xs text-muted-foreground">
              Set local profile name used for backup and restore.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="profile-name-input" className="text-xs font-semibold text-foreground block">
              Profile Name
            </label>
            <Input
              id="profile-name-input"
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (savedSuccess) setSavedSuccess(false);
              }}
              placeholder="Enter your profile name..."
              maxLength={32}
              className="text-xs sm:text-sm h-9"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={!isDirty}
              className="text-xs font-semibold"
            >
              Save Changes
            </Button>

            {savedSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in-50">
                <CheckCircle2 className="size-4" />
                Profile name saved!
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};



import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { useLibrary } from '@/hooks/useLibrary';
import { getRecentlyPlayedVideoIds } from '@/lib/recentlyPlayed';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  downloadBackupFile,
  validateBackupContent,
  applyBackupData,
  resetAllStorage,
  useLastBackup,
  type ValidationResult,
  type BackupDomain,
} from '@/lib/backupStorage';

export const DataManagementSection: React.FC = () => {
  const { favorites, watchLater, customLists } = useLibrary();
  const historyIds = getRecentlyPlayedVideoIds();
  const { formattedLastBackup } = useLastBackup();

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importValidation, setImportValidation] = useState<ValidationResult | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [selectedDomains, setSelectedDomains] = useState<BackupDomain[]>([
    'profile',
    'favorites',
    'watchLater',
    'customLists',
    'history',
  ]);
  const [importFeedback, setImportFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Danger Zone State
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateBackupContent(content);
      setImportValidation(validation);
      setImportFeedback(null);
      if (!validation.valid && validation.error) {
        setImportFeedback({ type: 'error', message: validation.error });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!importValidation?.backup) return;

    const result = applyBackupData(importValidation.backup, {
      mode: importMode,
      domains: selectedDomains,
    });

    if (result.success) {
      setImportFeedback({ type: 'success', message: result.message });
      setImportValidation(null);
    } else {
      setImportFeedback({ type: 'error', message: result.message });
    }
  };

  const toggleDomain = (domain: BackupDomain) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const handleResetStorage = () => {
    resetAllStorage();
    setShowResetConfirm(false);
    setImportFeedback({ type: 'success', message: 'All local library data has been reset.' });
  };

  return (
    <div className="space-y-6">
      {/* Global Status Banner */}
      {importFeedback && (
        <div
          className={`p-4 rounded-md border flex items-start gap-3 text-xs leading-relaxed animate-in fade-in-50 ${importFeedback.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}
        >
          {importFeedback.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{importFeedback.message}</div>
          <button
            onClick={() => setImportFeedback(null)}
            className="text-muted-foreground hover:text-foreground p-0.5 rounded-full"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* SINGULAR UNIFIED DATA MANAGEMENT PANEL */}
      <section className="border text-card-foreground rounded-xl shadow-sm overflow-hidden divide-y divide-border">
        {/* Panel Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Database className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Data &amp; Storage Management</h2>
              <p className="text-xs text-muted-foreground">
                Export, import, or reset your saved library items, custom lists, and listening history.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-section 1: Library Overview */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-foreground">Library Overview</h3>
            <p className="text-[11px] text-muted-foreground">
              Summary of stored items in your local browser library.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="bg-muted/40 border border-border/60 rounded-lg p-3 text-center space-y-0.5">
              <div className="text-base sm:text-lg font-bold text-foreground">{favorites.length}</div>
              <div className="text-[11px] font-medium text-muted-foreground">Favorites</div>
            </div>
            <div className="bg-muted/40 border border-border/60 rounded-lg p-3 text-center space-y-0.5">
              <div className="text-base sm:text-lg font-bold text-foreground">{watchLater.length}</div>
              <div className="text-[11px] font-medium text-muted-foreground">Watch Later</div>
            </div>
            <div className="bg-muted/40 border border-border/60 rounded-lg p-3 text-center space-y-0.5">
              <div className="text-base sm:text-lg font-bold text-foreground">{customLists.length}</div>
              <div className="text-[11px] font-medium text-muted-foreground">Custom Lists</div>
            </div>
            <div className="bg-muted/40 border border-border/60 rounded-lg p-3 text-center space-y-0.5">
              <div className="text-base sm:text-lg font-bold text-foreground">{historyIds.length}</div>
              <div className="text-[11px] font-medium text-muted-foreground">History Items</div>
            </div>
          </div>
        </div>

        {/* Sub-section 2: Backup & Restore */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-foreground">Backup &amp; Restore</h3>
            <p className="text-[11px] text-muted-foreground">
              Export a backup JSON file or restore from a previously saved backup file.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Button
              onClick={() => downloadBackupFile()}
              size="sm"
              className="gap-2 text-xs font-semibold"
            >
              <Download className="size-4" />
              Export Data for Backup
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 text-xs font-semibold"
            >
              <Upload className="size-4 text-primary" />
              Import Library Backup
            </Button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
            <Clock className="size-3.5 text-primary shrink-0" />
            <span>
              Last backup: <strong className="font-semibold text-foreground">{formattedLastBackup}</strong>
            </span>
          </div>
        </div>

        {/* Sub-section 3: Reset Local Data */}
        <div className="p-4 space-y-3 bg-destructive/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Trash2 className="size-3.5 text-destructive shrink-0" />
                <h3 className="text-xs font-bold text-destructive">Reset All Local Data</h3>
              </div>
              <p className="text-[11px] text-muted-foreground max-w-md leading-relaxed">
                Permanently clears your profile name, favorites, watch later items, custom lists, and listening history from this browser.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs shrink-0 font-semibold"
            >
              Reset All Local Data
            </Button>
          </div>
        </div>
      </section>

      {/* IMPORT PREVIEW & SAFETY DIALOG */}
      {importValidation?.valid && importValidation.summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="bg-card border text-card-foreground max-w-lg w-full rounded-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setImportValidation(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-full p-1"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3 border-b pb-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Confirm Data Import</h3>
                <p className="text-xs text-muted-foreground">Valid backup file loaded. Select options below.</p>
              </div>
            </div>

            {/* Summary badges */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-foreground">Backup Contents:</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {importValidation.summary.profileName && (
                  <Badge variant="outline" className="gap-1">
                    Profile: {importValidation.summary.profileName}
                  </Badge>
                )}
                <Badge variant="muted">{importValidation.summary.favoritesCount} Favorites</Badge>
                <Badge variant="muted">{importValidation.summary.watchLaterCount} Watch Later</Badge>
                <Badge variant="muted">{importValidation.summary.customListsCount} Custom Lists</Badge>
                <Badge variant="muted">{importValidation.summary.historyCount} History Items</Badge>
              </div>
            </div>

            {/* Mode selection: Merge vs Replace */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-foreground">Import Strategy:</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`p-3 rounded-md border text-left transition-all cursor-pointer ${importMode === 'merge'
                    ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                    : 'border-border bg-muted/20 text-muted-foreground hover:border-foreground/30'
                    }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    Merge Data
                    {importMode === 'merge' && <CheckCircle2 className="size-3.5 text-primary" />}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Combines items with your existing library without overwriting current data.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`p-3 rounded-md border text-left transition-all cursor-pointer ${importMode === 'replace'
                    ? 'border-destructive bg-destructive/10 text-foreground ring-1 ring-destructive'
                    : 'border-border bg-muted/20 text-muted-foreground hover:border-foreground/30'
                    }`}
                >
                  <div className="text-xs font-bold text-destructive flex items-center justify-between">
                    Replace Data
                    {importMode === 'replace' && <AlertCircle className="size-3.5 text-destructive" />}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Overwrites selected categories with the backup file items.
                  </div>
                </button>
              </div>
            </div>

            {/* Domains selection */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-foreground">Select Categories to Import:</div>
              <div className="space-y-1.5 bg-muted/20 p-3 rounded-md border">
                {(
                  [
                    { id: 'profile', label: 'Profile Name' },
                    { id: 'favorites', label: 'Favorites' },
                    { id: 'watchLater', label: 'Watch Later' },
                    { id: 'customLists', label: 'Custom Lists' },
                    { id: 'history', label: 'Listening History' },
                  ] as const
                ).map(({ id, label }) => (
                  <label key={id} className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDomains.includes(id)}
                      onChange={() => toggleDomain(id)}
                      className="rounded border-muted-foreground/40 text-primary focus:ring-primary"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dialog Footer Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" size="sm" onClick={() => setImportValidation(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant={importMode === 'replace' ? 'destructive' : 'default'}
                onClick={handleConfirmImport}
                disabled={selectedDomains.length === 0}
                className="gap-1.5"
              >
                <FileCheck className="size-4" />
                Confirm &amp; {importMode === 'merge' ? 'Merge' : 'Replace'} Data
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="bg-card border text-card-foreground max-w-sm w-full rounded-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-md bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Reset All Local Storage?</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently clear all local data from this browser? Your profile, favorites, lists, and history will be reset.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleResetStorage}>
                Yes, Reset All Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

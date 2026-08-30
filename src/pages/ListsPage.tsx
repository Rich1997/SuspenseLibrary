import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  FolderPlus,
  Plus,
  Trash2,
  Pencil,
  ArrowLeft,
  Film,
  AlertCircle,
  FolderOpen,
  Calendar,
} from 'lucide-react';
import type { VideoItem } from '@/types/playlist';
import { getVideoById } from '@/lib/playlist';
import { useLibrary } from '@/hooks/useLibrary';
import { EpisodeCardHorizontal } from '@/components/EpisodeCardHorizontal';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const PAGE_SIZE = 10;

export const ListsPage: React.FC = () => {
  const { listId } = useParams<{ listId?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    customLists,
    createCustomList,
    deleteCustomList,
    renameCustomList,
  } = useLibrary();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Active selected list (if listId is provided in URL)
  const activeList = useMemo(() => {
    if (!listId) return null;
    return customLists.find((l) => l.id === listId) || null;
  }, [listId, customLists]);

  useDocumentTitle(activeList ? activeList.name : 'Lists');

  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // Resolve video items for active list
  const activeListVideos = useMemo(() => {
    if (!activeList) return [];
    const list: VideoItem[] = [];
    for (const id of activeList.videoIds) {
      const v = getVideoById(id);
      if (v) list.push(v);
    }
    return list;
  }, [activeList]);

  const totalItems = activeListVideos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedVideos = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return activeListVideos.slice(startIndex, startIndex + PAGE_SIZE);
  }, [activeListVideos, safeCurrentPage]);

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      const newList = createCustomList(newListName.trim());
      setNewListName('');
      setShowCreateModal(false);
      navigate(`/lists/${newList.id}`);
    }
  };

  const handleDeleteList = (idToDelete: string) => {
    deleteCustomList(idToDelete);
    setDeleteTargetId(null);
    if (listId === idToDelete) {
      navigate('/lists');
    }
  };

  const handleStartRename = (id: string, currentName: string) => {
    setRenameTarget({ id, name: currentName });
    setRenameValue(currentName);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameTarget && renameValue.trim()) {
      renameCustomList(renameTarget.id, renameValue.trim());
      setRenameTarget(null);
      setRenameValue('');
    }
  };

  // --- DETAIL VIEW: Viewing a Specific Custom List (/lists/:listId) ---
  if (listId) {
    if (!activeList) {
      return (
        <div className="text-center py-16 space-y-4 max-w-xl mx-auto bg-card/40 rounded-md border border-dashed p-6">
          <div className="size-14 rounded-full bg-muted mx-auto flex items-center justify-center">
            <FolderOpen className="size-7 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">List Not Found</h3>
            <p className="text-xs text-muted-foreground">
              The list you are looking for does not exist or may have been deleted.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/lists">
              <Button size="sm" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to All Lists
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 pb-12 max-w-5xl mx-auto">
        <div className="space-y-3 border-b pb-5">
          <Link
            to="/lists"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="size-3.5" /> All Lists
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                <FolderOpen className="size-7 text-primary" />
                {activeList.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {activeListVideos.length} {activeListVideos.length === 1 ? 'episode' : 'episodes'} saved in this list.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartRename(activeList.id, activeList.name)}
                className="w-fit text-xs gap-1.5"
              >
                <Pencil className="size-3.5" />
                Rename List
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTargetId(activeList.id)}
                className="w-fit text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/40"
              >
                <Trash2 className="size-3.5" />
                Delete List
              </Button>
            </div>
          </div>
        </div>

        {activeListVideos.length > 0 ? (
          <>
            <div className="flex flex-col gap-7.5">
              {paginatedVideos.map((video) => (
                <EpisodeCardHorizontal
                  key={video.videoId}
                  video={video}
                />
              ))}
            </div>

            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          /* Empty List State */
          <div className="text-center py-16 space-y-4 bg-card/40 rounded-md border border-dashed p-6">
            <div className="size-14 rounded-full bg-muted mx-auto flex items-center justify-center text-muted-foreground">
              <FolderPlus className="size-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">This List is Currently Empty</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Add episodes to "{activeList.name}" by clicking the list icon on any episode card.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/episodes">
                <Button size="sm" className="gap-2">
                  <Film className="size-4" />
                  Browse Episode Catalog
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Rename List Modal */}
        <Dialog open={Boolean(renameTarget)} onOpenChange={(open) => { if (!open) setRenameTarget(null); }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Pencil className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">Rename List</DialogTitle>
                  <DialogDescription className="text-xs">Enter a new name for this list.</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSaveRename} className="space-y-4 pt-1">
              <Input
                type="text"
                placeholder="List name..."
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
                className="text-xs sm:text-sm"
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRenameTarget(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={!renameValue.trim()}>
                  Save Name
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete List Modal */}
        <Dialog open={Boolean(deleteTargetId)} onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-md bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">Delete List?</DialogTitle>
                  <DialogDescription className="text-xs">This action cannot be undone.</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <p className="text-xs text-muted-foreground leading-relaxed">
              "{activeList.name}" and its {activeList.videoIds.length} saved references will be permanently removed.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTargetId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteList(activeList.id)}
              >
                Yes, Delete List
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- OVERVIEW VIEW: All Custom Lists (/lists) ---
  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          Lists
        </h1>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="w-fit text-xs gap-1.5"
        >
          <Plus className="size-4" />
          Create New List
        </Button>
      </div>

      {customLists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {customLists.map((list) => {
            const formattedDate = new Date(list.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={list.id}
                onClick={() => navigate(`/lists/${list.id}`)}
                className="group relative flex flex-col justify-between p-4 rounded-xl border bg-card/60 hover:bg-card hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <FolderOpen className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {list.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {list.videoIds.length} {list.videoIds.length === 1 ? 'episode' : 'episodes'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRename(list.id, list.name);
                      }}
                      title="Rename list"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTargetId(list.id);
                      }}
                      title="Delete list"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" /> Created {formattedDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 space-y-4 bg-card/40 rounded-md border border-dashed p-6">
          <div className="size-14 rounded-full bg-muted mx-auto flex items-center justify-center text-muted-foreground">
            <FolderPlus className="size-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">No Lists Created Yet</h3>
          </div>
          <div className="pt-2">
            <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="size-4" />
              Create Your First List
            </Button>
          </div>
        </div>
      )}

      {/* Create New List Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FolderPlus className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Create List</DialogTitle>
                <DialogDescription className="text-xs">Give your new playlist a name.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateList} className="space-y-4 pt-1">
            <Input
              type="text"
              placeholder="e.g. Favorite Dark Thrillers, Sunday Classics..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              autoFocus
              className="text-xs sm:text-sm"
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!newListName.trim()}>
                Create List
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename List Modal */}
      <Dialog open={Boolean(renameTarget)} onOpenChange={(open) => { if (!open) setRenameTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Pencil className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Rename List</DialogTitle>
                <DialogDescription className="text-xs">Enter a new name for this list.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveRename} className="space-y-4 pt-1">
            <Input
              type="text"
              placeholder="List name..."
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
              className="text-xs sm:text-sm"
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRenameTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!renameValue.trim()}>
                Save Name
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete List Modal */}
      <Dialog open={Boolean(deleteTargetId)} onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-md bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertCircle className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Delete List?</DialogTitle>
                <DialogDescription className="text-xs">This action cannot be undone.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <p className="text-xs text-muted-foreground leading-relaxed">
            This list and its saved references will be permanently deleted.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTargetId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteTargetId && handleDeleteList(deleteTargetId)}
            >
              Yes, Delete List
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListsPage;

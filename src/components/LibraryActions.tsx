import React, { useState } from 'react';
import { Heart, Clock, FolderPlus, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLibrary } from '@/hooks/useLibrary';

interface LibraryActionsProps {
  videoId: string;
  title: string;
  variant?: 'compact' | 'full';
}

export const LibraryActions: React.FC<LibraryActionsProps> = ({
  videoId,
  title,
  variant = 'compact',
}) => {
  const {
    isFavorite,
    isInWatchLater,
    customLists,
    isVideoInList,
    toggleFavorite,
    toggleWatchLater,
    createCustomList,
    toggleVideoInList,
  } = useLibrary();

  const [feedback, setFeedback] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [newListName, setNewListName] = useState('');

  const favorited = isFavorite(videoId);
  const watchLater = isInWatchLater(videoId);
  const inAnyCustomList = customLists.some((l) => l.videoIds.includes(videoId));

  const triggerFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => {
      setFeedback(null);
    }, 2500);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleFavorite(videoId);
    triggerFeedback(added ? 'Added to Favorites' : 'Removed from Favorites');
  };

  const handleWatchLaterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWatchLater(videoId);
    triggerFeedback(added ? 'Added to Watch Later' : 'Removed from Watch Later');
  };

  const handleCustomListModalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDialog(true);
  };

  const handleToggleCustomList = (listId: string, listName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleVideoInList(listId, videoId);
    triggerFeedback(added ? `Added to "${listName}"` : `Removed from "${listName}"`);
  };

  const handleCreateNewList = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newListName.trim()) {
      const newList = createCustomList(newListName.trim());
      toggleVideoInList(newList.id, videoId);
      triggerFeedback(`Created & added to "${newList.name}"`);
      setNewListName('');
    }
  };

  if (variant === 'compact') {
    return (
      <div className="relative inline-flex items-center gap-1 -ml-1">
        <Button
          variant="ghost"
          size="icon-xs"
          title={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
          onClick={handleFavoriteClick}
          className={
            favorited
              ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10'
              : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
          }
        >
          <Heart className={`size-3.5 ${favorited ? 'fill-current' : ''}`} />
        </Button>

        <Button
          variant="ghost"
          size="icon-xs"
          title={watchLater ? 'Remove from Watch Later' : 'Watch Later'}
          onClick={handleWatchLaterClick}
          className={
            watchLater
              ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-500/10'
              : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10'
          }
        >
          <Clock className="size-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon-xs"
          title="Add to List"
          onClick={handleCustomListModalClick}
          className={
            inAnyCustomList
              ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10'
              : 'text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10'
          }
        >
          <FolderPlus className="size-3.5" />
        </Button>

        {feedback && (
          <span className="absolute bottom-full mb-1 right-0 z-50 text-[10px] font-medium whitespace-nowrap bg-foreground text-background px-2 py-0.5 rounded shadow-lg animate-in fade-in zoom-in-95">
            {feedback}
          </span>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle className="text-sm font-bold">Save to Custom List</DialogTitle>
              <DialogDescription className="text-xs line-clamp-1 font-medium">
                {title}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-48 h-48 py-1 pr-1">
              <div className="space-y-1 pr-2">
                {customLists.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-1">
                    No custom lists created yet.
                  </p>
                ) : (
                  customLists.map((list) => {
                    const inList = isVideoInList(list.id, videoId);
                    return (
                      <button
                        key={list.id}
                        type="button"
                        onClick={(e) => handleToggleCustomList(list.id, list.name, e)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-left"
                      >
                        <span className="truncate font-medium">{list.name}</span>
                        {inList ? (
                          <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                            <Check className="size-3.5" /> Saved
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">+ Add</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <form onSubmit={handleCreateNewList} className="pt-2 border-t space-y-2">
              <div className="text-[11px] font-semibold text-muted-foreground">Create New List</div>
              <div className="flex gap-2 items-center">
                <Input
                  type="text"
                  placeholder="List name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="h-8 text-xs flex-1"
                />
                <Button type="submit" disabled={!newListName.trim()}>
                  <Plus className="size-3.5" />Add
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      <Button
        variant={favorited ? 'default' : 'outline'}
        size="sm"
        onClick={handleFavoriteClick}
        className={favorited ? 'bg-secondary hover:bg-secondary/50 text-white' : 'hover:text-secondary'}
      >
        <Heart className={`size-4 mr-1.5 ${favorited ? 'fill-current text-white' : 'text-secondary'}`} />
        {favorited ? 'Favorited' : 'Favorites'}
      </Button>

      <Button
        variant={watchLater ? 'default' : 'outline'}
        size="sm"
        onClick={handleWatchLaterClick}
        className={watchLater ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:text-blue-500'}
      >
        <Clock className={`size-4 mr-1.5 ${watchLater ? 'fill-current text-white' : 'text-blue-500'}`} />
        {watchLater ? 'In Watch Later' : 'Watch Later'}
      </Button>

      <Button
        variant={inAnyCustomList ? 'default' : 'outline'}
        size="sm"
        onClick={handleCustomListModalClick}
        className={inAnyCustomList ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'hover:text-emerald-500'}
      >
        <FolderPlus className={`size-4 mr-1.5 ${inAnyCustomList ? 'fill-current text-white' : 'text-emerald-500'}`} />
        Custom Lists
      </Button>

      {feedback && (
        <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-md border border-primary/20 animate-in fade-in">
          {feedback}
        </span>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Save to Custom List</DialogTitle>
            <DialogDescription className="text-xs line-clamp-1">
              {title}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-52 h-52 py-1 pr-1">
            <div className="space-y-1.5 pr-2">
              {customLists.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-1">
                  No custom lists created yet.
                </p>
              ) : (
                customLists.map((list) => {
                  const inList = isVideoInList(list.id, videoId);
                  return (
                    <button
                      key={list.id}
                      type="button"
                      onClick={(e) => handleToggleCustomList(list.id, list.name, e)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs hover:bg-accent transition-colors cursor-pointer text-left"
                    >
                      <span className="font-medium text-foreground truncate">{list.name}</span>
                      {inList ? (
                        <span className="flex items-center gap-1 text-emerald-500 font-bold">
                          <Check className="size-4" /> Saved
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">+ Add</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <form onSubmit={handleCreateNewList} className="pt-3 border-t space-y-2">
            <div className="text-xs font-semibold text-muted-foreground">Create New List</div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="New list name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="h-9 text-xs flex-1"
              />
              <Button type="submit" size="sm" disabled={!newListName.trim()}>
                Create & Add
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};


// Usage:
//   npm run remove:videos -- <videoId1> <videoId2> ...
//   npm run remove:videos -- --private          (Removes all private/deleted video entries)
//   npm run remove:videos -- --dry-run <ids...>  (Previews removals without editing playlist.json)
//   npm run remove:videos -- --no-backup <ids...> (Skips backup creation)

import { readFileSync, writeFileSync, copyFileSync, renameSync, existsSync } from 'fs';
import { resolve } from 'path';

const DATA_FILE = resolve(process.cwd(), 'src/data/playlist.json');
const BACKUP_FILE = resolve(process.cwd(), 'src/data/playlist.json.bak');
const TMP_FILE = `${DATA_FILE}.tmp`;

function isPrivateOrDeleted(v) {
  if (!v || !v.title) return true;
  const t = (v.title || '').toLowerCase().trim();
  const d = (v.description || '').toLowerCase().trim();
  return (
    t === 'private video' ||
    t.includes('private video') ||
    t.includes('deleted video') ||
    d.includes('this video is private') ||
    Boolean(v.removedFromPlaylist)
  );
}

function printHelp() {
  console.log(`
Usage: npm run remove:videos -- [options] [videoId1 videoId2 ...]

Options:
  --private, --deleted   Remove all entries marked as Private or Deleted video
  --dry-run              Preview entries to be removed without editing playlist.json
  --no-backup            Do not create playlist.json.bak backup before writing
  --help, -h             Show this help message

Examples:
  npm run remove:videos -- dQw4w9WgXcQ
  npm run remove:videos -- videoId1 videoId2 videoId3
  npm run remove:videos -- --private
  npm run remove:videos -- --dry-run --private
`);
}

function run() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const isDryRun = args.includes('--dry-run');
  const removePrivate = args.includes('--private') || args.includes('--deleted');
  const skipBackup = args.includes('--no-backup');

  // Filter out flag parameters to get video IDs
  const targetIds = args.filter((a) => !a.startsWith('--') && !a.startsWith('-'));

  if (!removePrivate && targetIds.length === 0) {
    console.error('Error: Please specify video ID(s) or use --private / --deleted flag.');
    printHelp();
    process.exit(1);
  }

  if (!existsSync(DATA_FILE)) {
    console.error(`Error: Data file not found at ${DATA_FILE}`);
    process.exit(1);
  }

  const raw = readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(raw);
  const initialVideos = data.videos || [];
  const targetIdSet = new Set(targetIds);

  const retainedVideos = [];
  const removedVideos = [];

  for (const video of initialVideos) {
    let shouldRemove = false;

    if (video.videoId && targetIdSet.has(video.videoId)) {
      shouldRemove = true;
    } else if (removePrivate && isPrivateOrDeleted(video)) {
      shouldRemove = true;
    }

    if (shouldRemove) {
      removedVideos.push(video);
    } else {
      retainedVideos.push(video);
    }
  }

  if (removedVideos.length === 0) {
    console.log('\nNo matching entries found to remove.');
    console.log(`Total videos in playlist: ${initialVideos.length}\n`);
    process.exit(0);
  }

  console.log('\n==================================================');
  console.log(isDryRun ? '       PLAYLIST REMOVAL PREVIEW (DRY-RUN)        ' : '           PLAYLIST REMOVAL SUMMARY              ');
  console.log('==================================================');
  console.log(`Total initial entries : ${initialVideos.length}`);
  console.log(`Entries to remove     : ${removedVideos.length}`);
  console.log(`Entries remaining     : ${retainedVideos.length}`);
  console.log('--------------------------------------------------');
  console.log('Removed Videos:');
  removedVideos.forEach((v, idx) => {
    console.log(`  ${idx + 1}. [${v.videoId || 'NO_ID'}] ${v.title || 'Untitled'}`);
  });
  console.log('--------------------------------------------------');

  if (isDryRun) {
    console.log('\n[DRY RUN] No changes were written to playlist.json.\n');
    process.exit(0);
  }

  // Backup existing file before writing
  if (!skipBackup) {
    copyFileSync(DATA_FILE, BACKUP_FILE);
    console.log(`Backup created at: ${BACKUP_FILE}`);
  }

  // Atomic file update
  data.videos = retainedVideos;
  data.updatedAt = new Date().toISOString();

  writeFileSync(TMP_FILE, JSON.stringify(data, null, 2));
  renameSync(TMP_FILE, DATA_FILE);

  console.log(`Successfully updated playlist.json (${retainedVideos.length} videos remaining).\n`);
}

run();

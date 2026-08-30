import { readFileSync, writeFileSync, renameSync } from 'fs';

const DATA_FILE = 'src/data/playlist.json';

const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
const initialCount = data.videos.length;

const seenIds = new Set();
const uniqueVideos = [];
let duplicatesCount = 0;

for (const video of data.videos) {
  if (!video.videoId) {
    uniqueVideos.push(video);
    continue;
  }

  if (seenIds.has(video.videoId)) {
    duplicatesCount++;
    // If the existing video entry in uniqueVideos has less metadata (e.g. empty authors/series) 
    // while this duplicate has populated metadata, merge/update them.
    const existingIndex = uniqueVideos.findIndex((v) => v.videoId === video.videoId);
    if (existingIndex !== -1) {
      const existing = uniqueVideos[existingIndex];
      const existingHasAuthors = existing.authors && existing.authors.length > 0;
      const newHasAuthors = video.authors && video.authors.length > 0;
      const existingHasSeries = existing.series && existing.series.length > 0;
      const newHasSeries = video.series && video.series.length > 0;

      // Merge non-empty fields into the retained item
      uniqueVideos[existingIndex] = {
        ...existing,
        authors: existingHasAuthors ? existing.authors : (newHasAuthors ? video.authors : []),
        series: existingHasSeries ? existing.series : (newHasSeries ? video.series : []),
        originalDate: existing.originalDate || video.originalDate || '',
        externalLinks: existing.externalLinks?.length ? existing.externalLinks : (video.externalLinks?.length ? video.externalLinks : []),
      };
    }
  } else {
    seenIds.add(video.videoId);
    uniqueVideos.push(video);
  }
}


data.videos = uniqueVideos;

const tmpFile = `${DATA_FILE}.tmp`;
writeFileSync(tmpFile, JSON.stringify(data, null, 2));
renameSync(tmpFile, DATA_FILE);

console.log(`Deduplication complete:`);
console.log(`- Initial videos: ${initialCount}`);
console.log(`- Duplicates removed: ${duplicatesCount}`);
console.log(`- Final unique videos: ${data.videos.length}`);

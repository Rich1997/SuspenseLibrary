import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const DATA_FILE = resolve(process.cwd(), 'src/data/playlist.json');

/**
 * Helper function to identify private or deleted videos
 * Matches criteria used in src/lib/playlist.ts
 */
function isPrivateVideo(v) {
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

function getStats() {
  if (!existsSync(DATA_FILE)) {
    console.error(`Error: Could not find playlist data at ${DATA_FILE}`);
    process.exit(1);
  }

  const raw = readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(raw);

  const rawVideos = data.videos || [];
  const totalRawCount = rawVideos.length;

  let privateCount = 0;
  const activeVideos = [];
  const videoIdSet = new Set();
  let duplicateVideoIdCount = 0;

  for (const v of rawVideos) {
    if (isPrivateVideo(v)) {
      privateCount++;
    } else {
      if (v.videoId) {
        if (videoIdSet.has(v.videoId)) {
          duplicateVideoIdCount++;
        } else {
          videoIdSet.add(v.videoId);
        }
      }
      activeVideos.push(v);
    }
  }

  const totalActiveCount = activeVideos.length;
  let filledAuthorsCount = 0;
  let emptyAuthorsCount = 0;
  let totalAuthorTags = 0;
  const authorCounts = new Map();

  let filledSeriesCount = 0;
  let emptySeriesCount = 0;
  const seriesCounts = new Map();

  let earliestDate = null;
  let latestDate = null;

  for (const v of activeVideos) {
    // Author breakdown
    const authors = Array.isArray(v.authors)
      ? v.authors.filter((a) => a && a.name && a.name.trim() !== '')
      : [];

    if (authors.length > 0) {
      filledAuthorsCount++;
      totalAuthorTags += authors.length;
      for (const a of authors) {
        const name = a.name.trim();
        authorCounts.set(name, (authorCounts.get(name) || 0) + 1);
      }
    } else {
      emptyAuthorsCount++;
    }

    // Series breakdown
    const series = Array.isArray(v.series)
      ? v.series.filter((s) => s && s.trim() !== '')
      : [];

    if (series.length > 0) {
      filledSeriesCount++;
      for (const s of series) {
        const sName = s.trim();
        seriesCounts.set(sName, (seriesCounts.get(sName) || 0) + 1);
      }
    } else {
      emptySeriesCount++;
    }

    // Date range
    if (v.publishedAt) {
      const d = new Date(v.publishedAt);
      if (!isNaN(d.getTime())) {
        if (!earliestDate || d < earliestDate) earliestDate = d;
        if (!latestDate || d > latestDate) latestDate = d;
      }
    }
  }

  const sortedAuthors = Array.from(authorCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  const sortedSeries = Array.from(seriesCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  const activePct = totalRawCount
    ? ((totalActiveCount / totalRawCount) * 100).toFixed(1)
    : '0';
  const privatePct = totalRawCount
    ? ((privateCount / totalRawCount) * 100).toFixed(1)
    : '0';

  const filledAuthorsPct = totalActiveCount
    ? ((filledAuthorsCount / totalActiveCount) * 100).toFixed(1)
    : '0';
  const emptyAuthorsPct = totalActiveCount
    ? ((emptyAuthorsCount / totalActiveCount) * 100).toFixed(1)
    : '0';

  const filledSeriesPct = totalActiveCount
    ? ((filledSeriesCount / totalActiveCount) * 100).toFixed(1)
    : '0';

  console.log('\n==================================================');
  console.log('            PLAYLIST STATISTICS REPORT            ');
  console.log('==================================================');
  console.log(`Last Updated (File) : ${data.updatedAt || 'N/A'}`);
  console.log('--------------------------------------------------');
  console.log(`📹 VIDEO SUMMARY:`);
  console.log(`   • Total Raw Items in JSON  : ${totalRawCount}`);
  console.log(`   • Private / Removed Videos : ${privateCount} (${privatePct}%)`);
  console.log(`   • Active / Valid Videos    : ${totalActiveCount} (${activePct}%)`);
  if (duplicateVideoIdCount > 0) {
    console.log(`   • Duplicate Video IDs      : ${duplicateVideoIdCount}`);
  }
  console.log('--------------------------------------------------');
  console.log(`✍️  AUTHOR METADATA (Active Videos):`);
  console.log(`   • Authors Data Filled In   : ${filledAuthorsCount} (${filledAuthorsPct}%)`);
  console.log(`   • Empty Authors            : ${emptyAuthorsCount} (${emptyAuthorsPct}%)`);
  console.log(`   • Total Author Tags        : ${totalAuthorTags}`);
  console.log(`   • Unique Authors Count     : ${authorCounts.size}`);

  if (sortedAuthors.length > 0) {
    console.log('\n   Top 5 Authors by Video Count:');
    sortedAuthors.slice(0, 5).forEach(([name, count], idx) => {
      console.log(`     ${idx + 1}. ${name} (${count} videos)`);
    });
  }

  console.log('--------------------------------------------------');
  console.log(`📺 SERIES METADATA (Active Videos):`);
  console.log(`   • Series Data Filled In    : ${filledSeriesCount} (${filledSeriesPct}%)`);
  console.log(`   • Empty Series             : ${emptySeriesCount}`);
  console.log(`   • Unique Series Count      : ${seriesCounts.size}`);

  if (sortedSeries.length > 0) {
    console.log('\n   Top 5 Series by Video Count:');
    sortedSeries.slice(0, 5).forEach(([name, count], idx) => {
      console.log(`     ${idx + 1}. ${name} (${count} videos)`);
    });
  }

  if (earliestDate && latestDate) {
    console.log('--------------------------------------------------');
    console.log(`📅 PUBLISH DATE RANGE:`);
    console.log(`   • Earliest Video Published : ${earliestDate.toISOString().split('T')[0]}`);
    console.log(`   • Latest Video Published   : ${latestDate.toISOString().split('T')[0]}`);
  }

  console.log('==================================================\n');
}

getStats();

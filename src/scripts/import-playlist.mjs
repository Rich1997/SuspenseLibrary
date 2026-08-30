// Usage: npm run import:playlist -- PLxxxxxxxxxxxx
import "dotenv/config";
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from "fs";

const API_KEY = process.env.YOUTUBE_API_KEY;
const PLAYLIST_ID = process.argv[2];
const DATA_FILE = "src/data/playlist.json";

const YOUTUBE_FIELDS = ["title", "description", "thumbnail", "publishedAt", "viewCount", "likeCount"];

const CUSTOM_FIELD_DEFAULTS = {
    authors: [],
    series: [],
    originalDate: "",
    externalLinks: [],
    viewCount: 0,
    likeCount: 0,
};

if (!API_KEY) {
    console.error("Missing YOUTUBE_API_KEY env var");
    process.exit(1);
}
if (!PLAYLIST_ID) {
    console.error("Usage: npm run import:playlist -- <PLAYLIST_ID>");
    process.exit(1);
}

async function fetchPlaylistItems(playlistId) {
    let items = [];
    let pageToken = "";

    do {
        const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
        url.searchParams.set("part", "snippet,contentDetails");
        url.searchParams.set("playlistId", playlistId);
        url.searchParams.set("maxResults", "50");
        url.searchParams.set("key", API_KEY);
        if (pageToken) url.searchParams.set("pageToken", pageToken);

        const res = await fetch(url);
        if (!res.ok) throw new Error(`YouTube API error: ${res.status} ${await res.text()}`);
        const data = await res.json();

        items = items.concat(
            data.items.map((item) => ({
                videoId: item.contentDetails.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url,
                publishedAt: item.snippet.publishedAt,
            }))
        );

        pageToken = data.nextPageToken ?? "";
    } while (pageToken);

    return items;
}

function loadExisting() {
    if (!existsSync(DATA_FILE)) return new Map();

    const raw = readFileSync(DATA_FILE, "utf-8").trim();
    if (!raw) throw new Error(`${DATA_FILE} exists but is empty. Refusing to continue.`);

    try {
        const parsed = JSON.parse(raw);
        return new Map(parsed.videos.map((v) => [v.videoId, v]));
    } catch (err) {
        throw new Error(`${DATA_FILE} isn't valid JSON. Refusing to continue. ${err.message}`);
    }
}

async function fetchVideoStatistics(items) {
    const BATCH_SIZE = 50;
    const statsMap = new Map();

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE).map((it) => it.videoId);
        const url = new URL("https://www.googleapis.com/youtube/v3/videos");
        url.searchParams.set("part", "statistics");
        url.searchParams.set("id", batch.join(","));
        url.searchParams.set("key", API_KEY);

        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        if (data.items) {
            for (const item of data.items) {
                statsMap.set(item.id, {
                    viewCount: parseInt(item.statistics?.viewCount ?? "0", 10),
                    likeCount: parseInt(item.statistics?.likeCount ?? "0", 10),
                });
            }
        }
    }

    return items.map((item) => {
        const stats = statsMap.get(item.videoId) ?? { viewCount: 0, likeCount: 0 };
        return { ...item, ...stats };
    });
}

const rawItems = await fetchPlaylistItems(PLAYLIST_ID);
const fresh = await fetchVideoStatistics(rawItems);
const existingMap = loadExisting();

let added = 0;
let updated = 0;

for (const item of fresh) {
    const existing = existingMap.get(item.videoId);

    if (!existing) {
        existingMap.set(item.videoId, {
            ...item,
            ...CUSTOM_FIELD_DEFAULTS,
            sourcePlaylistIds: [PLAYLIST_ID],
            tracked: false, // one-off import — exempt from removedFromPlaylist checks forever
            removedFromPlaylist: false,
        });
        added++;
    } else {
        // Already present (e.g. also in your main tracked playlist, or a
        // previous import) — refresh only YouTube-owned fields, leave the
        // rest, including `tracked`, exactly as-is.
        const merged = { ...existing };
        for (const field of YOUTUBE_FIELDS) {
            merged[field] = item[field];
        }
        if (!merged.sourcePlaylistIds?.includes(PLAYLIST_ID)) {
            merged.sourcePlaylistIds = [...(merged.sourcePlaylistIds ?? []), PLAYLIST_ID];
        }
        existingMap.set(item.videoId, merged);
        updated++;
    }
}

mkdirSync("src/data", { recursive: true });

const output = { updatedAt: new Date().toISOString(), videos: [...existingMap.values()] };

const tmpFile = `${DATA_FILE}.tmp`;
writeFileSync(tmpFile, JSON.stringify(output, null, 2));
renameSync(tmpFile, DATA_FILE);

console.log(`Imported from ${PLAYLIST_ID}: ${added} added, ${updated} already present (refreshed).`);
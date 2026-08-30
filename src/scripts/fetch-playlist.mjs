import "dotenv/config";
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from "fs";

const API_KEY = process.env.YOUTUBE_API_KEY;
const PLAYLIST_IDS = (process.env.YOUTUBE_PLAYLIST_IDS ?? process.env.YOUTUBE_PLAYLIST_ID ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
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

if (!API_KEY || PLAYLIST_IDS.length === 0) {
    console.error("Missing YOUTUBE_API_KEY or YOUTUBE_PLAYLIST_IDS env vars");
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
        if (!res.ok) throw new Error(`YouTube API error (${playlistId}): ${res.status} ${await res.text()}`);
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

async function fetchAllPlaylists(playlistIds) {
    const byId = new Map();

    for (const playlistId of playlistIds) {
        const items = await fetchPlaylistItems(playlistId);
        for (const item of items) {
            const existing = byId.get(item.videoId);
            if (existing) {
                existing.sourcePlaylistIds.push(playlistId);
            } else {
                byId.set(item.videoId, { ...item, sourcePlaylistIds: [playlistId] });
            }
        }
    }

    const uniqueItems = [...byId.values()];
    return await fetchVideoStatistics(uniqueItems);
}

function loadExisting() {
    if (!existsSync(DATA_FILE)) return new Map();

    const raw = readFileSync(DATA_FILE, "utf-8").trim();
    if (!raw) {
        throw new Error(
            `${DATA_FILE} exists but is empty. Refusing to continue — ` +
            `restore it from git history (git checkout -- ${DATA_FILE}) or delete it manually if it's safe to start fresh.`
        );
    }

    try {
        const parsed = JSON.parse(raw);
        return new Map(parsed.videos.map((v) => [v.videoId, v]));
    } catch (err) {
        throw new Error(
            `${DATA_FILE} exists but isn't valid JSON. Refusing to continue — ` +
            `restore it from git history (git checkout -- ${DATA_FILE}) before rerunning. Original error: ${err.message}`
        );
    }
}

function mergeVideo(fresh, existing) {
    if (!existing) {
        return { ...fresh, ...CUSTOM_FIELD_DEFAULTS, tracked: true, removedFromPlaylist: false };
    }
    const merged = { ...existing };
    for (const field of YOUTUBE_FIELDS) {
        merged[field] = fresh[field];
    }
    merged.sourcePlaylistIds = fresh.sourcePlaylistIds;
    merged.tracked = true; // confirmed present in an actively tracked playlist
    merged.removedFromPlaylist = false;
    return merged;
}

const fresh = await fetchAllPlaylists(PLAYLIST_IDS);
const existingMap = loadExisting();
const freshIds = new Set(fresh.map((v) => v.videoId));

const merged = fresh.map((v) => mergeVideo(v, existingMap.get(v.videoId)));

for (const [id, video] of existingMap) {
    if (freshIds.has(id)) continue; // already merged above

    if (video.tracked === false) {
        // One-off import — never subject to removal tracking, leave untouched
        merged.push(video);
    } else {
        merged.push({ ...video, removedFromPlaylist: true });
    }
}

mkdirSync("src/data", { recursive: true });

const output = { updatedAt: new Date().toISOString(), videos: merged };

const tmpFile = `${DATA_FILE}.tmp`;
writeFileSync(tmpFile, JSON.stringify(output, null, 2));
renameSync(tmpFile, DATA_FILE);

console.log(`Wrote ${merged.length} videos from ${PLAYLIST_IDS.length} playlist(s) to ${DATA_FILE}`);
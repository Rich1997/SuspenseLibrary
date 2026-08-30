// Usage:
//   npm run import:videos -- <videoId1> <videoId2> <youtubeUrl1> ...
//   npm run import:videos -- --file <path-to-file-with-urls-or-ids.txt>
import "dotenv/config";
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from "fs";

const API_KEY = process.env.YOUTUBE_API_KEY;
const DATA_FILE = "src/data/playlist.json";

const YOUTUBE_FIELDS = ["title", "description", "thumbnail", "publishedAt"];

const CUSTOM_FIELD_DEFAULTS = {
    authors: [],
    series: [],
    originalDate: "",
    externalLinks: [],
};

if (!API_KEY) {
    console.error("Missing YOUTUBE_API_KEY env var");
    process.exit(1);
}

function extractVideoId(input) {
    if (!input) return null;
    const str = input.trim();
    if (!str || str.startsWith("#") || str.startsWith("//")) return null;

    // Handle YouTube URLs (watch?v=, youtu.be/, shorts/, embed/)
    const urlMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (urlMatch) return urlMatch[1];

    // Handle direct 11-character video ID
    if (/^[\w-]{11}$/.test(str)) return str;

    return null;
}

function getRequestedVideoIds() {
    const rawArgs = process.argv.slice(2);
    if (rawArgs.length === 0) {
        console.error("Usage:");
        console.error("  npm run import:videos -- <videoIdOrUrl1> <videoIdOrUrl2> ...");
        console.error("  npm run import:videos -- --file <path-to-list-file.txt>");
        process.exit(1);
    }

    const videoIds = new Set();
    const invalidInputs = [];

    for (let i = 0; i < rawArgs.length; i++) {
        const arg = rawArgs[i];

        if (arg === "--file" || arg === "-f") {
            const filePath = rawArgs[i + 1];
            if (!filePath || !existsSync(filePath)) {
                console.error(`Error: File not found "${filePath}"`);
                process.exit(1);
            }
            i++; // skip file path arg
            const lines = readFileSync(filePath, "utf-8").split(/\r?\n/);
            for (const line of lines) {
                const id = extractVideoId(line);
                if (id) {
                    videoIds.add(id);
                } else if (line.trim() && !line.trim().startsWith("#")) {
                    invalidInputs.push(line.trim());
                }
            }
        } else {
            const id = extractVideoId(arg);
            if (id) {
                videoIds.add(id);
            } else {
                invalidInputs.push(arg);
            }
        }
    }

    if (invalidInputs.length > 0) {
        console.warn(`\n⚠️  Warning: Could not parse ${invalidInputs.length} input(s):`);
        invalidInputs.forEach((item) => console.warn(`   - ${item}`));
    }

    return [...videoIds];
}

async function fetchVideoDetails(videoIds) {
    const items = [];
    const BATCH_SIZE = 50;

    for (let i = 0; i < videoIds.length; i += BATCH_SIZE) {
        const batch = videoIds.slice(i, i + BATCH_SIZE);
        const url = new URL("https://www.googleapis.com/youtube/v3/videos");
        url.searchParams.set("part", "snippet");
        url.searchParams.set("id", batch.join(","));
        url.searchParams.set("key", API_KEY);

        const res = await fetch(url);
        if (!res.ok) throw new Error(`YouTube API error: ${res.status} ${await res.text()}`);
        const data = await res.json();

        if (data.items) {
            for (const item of data.items) {
                items.push({
                    videoId: item.id,
                    title: item.snippet.title,
                    description: item.snippet.description,
                    thumbnail: item.snippet.thumbnails?.medium?.url ?? item.snippet.thumbnails?.default?.url ?? "",
                    publishedAt: item.snippet.publishedAt,
                });
            }
        }
    }

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

async function main() {
    const videoIds = getRequestedVideoIds();

    if (videoIds.length === 0) {
        console.error("No valid video IDs found to import.");
        process.exit(1);
    }

    console.log(`\nFetching details for ${videoIds.length} video(s) from YouTube API...`);
    const freshItems = await fetchVideoDetails(videoIds);
    const fetchedIds = new Set(freshItems.map((item) => item.videoId));

    const missingIds = videoIds.filter((id) => !fetchedIds.has(id));
    if (missingIds.length > 0) {
        console.warn(`\n⚠️  Warning: ${missingIds.length} video(s) were not returned by YouTube API (may be private or deleted):`);
        missingIds.forEach((id) => console.warn(`   - ${id}`));
    }

    const existingMap = loadExisting();
    let added = 0;
    let updated = 0;

    for (const item of freshItems) {
        const existing = existingMap.get(item.videoId);

        if (!existing) {
            existingMap.set(item.videoId, {
                ...item,
                ...CUSTOM_FIELD_DEFAULTS,
                tracked: false, // one-off import — exempt from playlist removal tracking
                removedFromPlaylist: false,
            });
            added++;
        } else {
            // Already present — refresh YouTube fields only, preserve custom fields & tracked status
            const merged = { ...existing };
            for (const field of YOUTUBE_FIELDS) {
                merged[field] = item[field];
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

    console.log(`\n✅ Success!`);
    console.log(`- ${added} new video(s) added`);
    console.log(`- ${updated} existing video(s) refreshed`);
    console.log(`- Total library videos: ${existingMap.size}\n`);
}

main().catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
});

// Usage: npm run update:stats
import "dotenv/config";
import { readFileSync, writeFileSync, renameSync, existsSync } from "fs";

const API_KEY = process.env.YOUTUBE_API_KEY;
const DATA_FILE = "src/data/playlist.json";

if (!API_KEY) {
    console.error("Error: Missing YOUTUBE_API_KEY environment variable.");
    process.exit(1);
}

if (!existsSync(DATA_FILE)) {
    console.error(`Error: ${DATA_FILE} does not exist.`);
    process.exit(1);
}

const raw = readFileSync(DATA_FILE, "utf-8").trim();
if (!raw) {
    console.error(`Error: ${DATA_FILE} is empty.`);
    process.exit(1);
}

const data = JSON.parse(raw);
const videos = data.videos || [];

if (videos.length === 0) {
    console.log("No videos found in playlist.json.");
    process.exit(0);
}

console.log(`Fetching YouTube statistics (viewCount & likeCount) for ${videos.length} video(s)...`);

const BATCH_SIZE = 50;
const statsMap = new Map();

for (let i = 0; i < videos.length; i += BATCH_SIZE) {
    const chunk = videos.slice(i, i + BATCH_SIZE).map((v) => v.videoId);
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "statistics");
    url.searchParams.set("id", chunk.join(","));
    url.searchParams.set("key", API_KEY);

    const res = await fetch(url);
    if (!res.ok) {
        console.error(`YouTube API error on batch ${i / BATCH_SIZE + 1}: ${res.status} ${await res.text()}`);
        continue;
    }

    const responseData = await res.json();
    if (responseData.items) {
        for (const item of responseData.items) {
            statsMap.set(item.id, {
                viewCount: parseInt(item.statistics?.viewCount ?? "0", 10),
                likeCount: parseInt(item.statistics?.likeCount ?? "0", 10),
            });
        }
    }
}

let updatedCount = 0;
const updatedVideos = videos.map((video) => {
    const stats = statsMap.get(video.videoId);
    if (stats) {
        updatedCount++;
        return {
            ...video,
            viewCount: stats.viewCount,
            likeCount: stats.likeCount,
        };
    }
    return {
        ...video,
        viewCount: video.viewCount ?? 0,
        likeCount: video.likeCount ?? 0,
    };
});

const output = {
    ...data,
    updatedAt: new Date().toISOString(),
    videos: updatedVideos,
};

const tmpFile = `${DATA_FILE}.tmp`;
writeFileSync(tmpFile, JSON.stringify(output, null, 2));
renameSync(tmpFile, DATA_FILE);

console.log(`\n✅ Success! Updated statistics for ${updatedCount} / ${videos.length} video(s).`);

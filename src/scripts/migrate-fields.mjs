import { readFileSync, writeFileSync, renameSync } from "fs";

const DATA_FILE = "src/data/playlist.json";

const data = JSON.parse(readFileSync(DATA_FILE, "utf-8"));

data.videos = data.videos.map((video) => {
    const { tags, difficulty, addedBy, notes, ...rest } = video;
    return {
        ...rest,
        externalLinks: [],
    };
});

const tmpFile = `${DATA_FILE}.tmp`;
writeFileSync(tmpFile, JSON.stringify(data, null, 2));
renameSync(tmpFile, DATA_FILE);

console.log(`Migrated ${data.videos.length} videos to the new field schema.`);
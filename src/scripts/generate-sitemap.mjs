import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = 'https://suspenselibrary.netlify.app';
const DATA_FILE = resolve(process.cwd(), 'src/data/playlist.json');
const PUBLIC_DIR = resolve(process.cwd(), 'public');
const SITEMAP_FILE = resolve(PUBLIC_DIR, 'sitemap.xml');
const ROBOTS_FILE = resolve(PUBLIC_DIR, 'robots.txt');

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

function formatDate(isoString) {
  if (!isoString) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSitemap() {
  if (!existsSync(DATA_FILE)) {
    console.error(`Error: Data file not found at ${DATA_FILE}`);
    process.exit(1);
  }

  const raw = readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(raw);
  const rawVideos = data.videos || [];

  const activeVideos = rawVideos.filter((v) => v && v.videoId && !isPrivateVideo(v));

  const staticPages = [
    { url: '/', changefreq: 'daily', priority: '1.0' },
    { url: '/episodes', changefreq: 'daily', priority: '0.9' },
    { url: '/authors', changefreq: 'weekly', priority: '0.8' },
    { url: '/series', changefreq: 'weekly', priority: '0.8' },
    { url: '/whats-new', changefreq: 'weekly', priority: '0.7' },
    { url: '/about', changefreq: 'monthly', priority: '0.6' },
  ];

  const todayStr = formatDate(data.updatedAt || new Date().toISOString());

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static Pages
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
    xml += `    <lastmod>${todayStr}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Active Video Episode Pages
  for (const video of activeVideos) {
    const lastmod = formatDate(video.publishedAt);
    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}/${escapeXml(video.videoId)}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(SITEMAP_FILE, xml, 'utf-8');
  console.log(`✅ Successfully generated sitemap.xml with ${staticPages.length + activeVideos.length} URLs at ${SITEMAP_FILE}`);

  // Create robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;
  writeFileSync(ROBOTS_FILE, robotsTxt, 'utf-8');
  console.log(`✅ Successfully updated robots.txt at ${ROBOTS_FILE}`);
}

generateSitemap();

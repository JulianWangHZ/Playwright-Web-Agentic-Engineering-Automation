// Post-process the smart-report so failure videos play inline on Cloudflare Pages:
// copy referenced .webm into dist/videos/ and turn file:// anchors into <video> players.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const htmlPath = "dist/index.html";
if (!existsSync(htmlPath)) process.exit(0);

let html = readFileSync(htmlPath, "utf8");
const videosDir = "dist/videos";
const fileUrlRe = /file:\/\/([^"']+?\.webm)/g;

const relByAbs = new Map();
for (const [, abs] of html.matchAll(fileUrlRe)) {
  if (relByAbs.has(abs)) continue;
  if (!existsSync(abs)) {
    relByAbs.set(abs, null);
    continue;
  }
  if (!existsSync(videosDir)) mkdirSync(videosDir, { recursive: true });
  const name = `${basename(dirname(abs))}-${basename(abs)}`;
  copyFileSync(abs, join(videosDir, name));
  relByAbs.set(abs, `videos/${name}`);
}

html = html.replace(fileUrlRe, (full, abs) => relByAbs.get(abs) ?? full);

// Replace the "Open Video" / "Video" anchors (now relative) with an inline player.
html = html.replace(
  /<a\s+href="(videos\/[^"]+\.webm)"[^>]*>[\s\S]*?<\/a>/g,
  (_full, rel) =>
    `<video src="${rel}" controls preload="metadata" style="max-width:100%;border-radius:6px"></video>`,
);

writeFileSync(htmlPath, html);
const embedded = [...relByAbs.values()].filter(Boolean).length;
console.log(`embed-report-videos: embedded ${embedded} video(s)`);

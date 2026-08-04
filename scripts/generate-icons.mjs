import { mkdirSync } from "node:fs";
import sharp from "sharp";

const outDir = "public/icons";
mkdirSync(outDir, { recursive: true });

const jobs = [
  { src: "public/icons/icon.svg", out: "public/icons/icon-192x192.png", size: 192 },
  { src: "public/icons/icon.svg", out: "public/icons/icon-512x512.png", size: 512 },
  { src: "public/icons/icon-maskable.svg", out: "public/icons/maskable-512x512.png", size: 512 },
  { src: "public/icons/icon.svg", out: "public/icons/apple-touch-icon.png", size: 180 },
];

for (const job of jobs) {
  await sharp(job.src).resize(job.size, job.size).png().toFile(job.out);
  console.log("generated", job.out);
}

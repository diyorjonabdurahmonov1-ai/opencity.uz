import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, "..", "public", "icon.svg");
const outDir = join(__dirname, "..", "public");

const sizes = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "favicon-32.png", size: 32 },
];

for (const { file, size } of sizes) {
  await sharp(src, { density: 384 }).resize(size, size).png().toFile(join(outDir, file));
  console.log(`wrote ${file} (${size}x${size})`);
}

// Maskable variant with safe-area padding (icon content within inner ~80%)
await sharp({
  create: { width: 512, height: 512, channels: 4, background: { r: 30, g: 136, b: 168, alpha: 1 } },
})
  .composite([{ input: await sharp(src, { density: 384 }).resize(360, 360).toBuffer(), gravity: "center" }])
  .png()
  .toFile(join(outDir, "icon-maskable-512.png"));
console.log("wrote icon-maskable-512.png (512x512)");

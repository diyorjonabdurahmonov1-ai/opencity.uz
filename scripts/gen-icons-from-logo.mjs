import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = "C:/Users/admin/Downloads/5275982773699159275 (4).jpg";
const outDir = join(__dirname, "..", "public");

// Faqat pin+xarita belgisini kesib olamiz (pastdagi "OpenCity" yozuvisiz) —
// kichik o'lchamlarda (favicon, ilova belgisi) matn o'qilmay qoladi.
const cropped = sharp(src).extract({ left: 195, top: 10, width: 820, height: 820 });

const sizes = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "favicon-32.png", size: 32 },
  { file: "brand-mark.png", size: 256 },
];

for (const { file, size } of sizes) {
  await cropped.clone().resize(size, size).png().toFile(join(outDir, file));
  console.log(`wrote ${file} (${size}x${size})`);
}

// Maskable: qora fon allaqachon to'liq to'ldiradi, shuning uchun to'g'ridan-to'g'ri resize qilamiz.
await cropped.clone().resize(512, 512).png().toFile(join(outDir, "icon-maskable-512.png"));
console.log("wrote icon-maskable-512.png (512x512)");

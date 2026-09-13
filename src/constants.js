import {
  TrafficCone, Lightbulb, Trash2, Droplet, Bus, Trees, Footprints,
  Building2, AlertTriangle, Leaf, MoreHorizontal,
} from "lucide-react";
import { REGIONS } from "./data/regions";

export { REGIONS };
export const REGION_NAMES = REGIONS.map((r) => r.name);
export function districtsOf(regionName) {
  return REGIONS.find((r) => r.name === regionName)?.districts || [];
}

export const CATEGORIES = [
  { id: "roads", label: "Yo'llar va chuqurliklar", icon: TrafficCone },
  { id: "lighting", label: "Ko'cha yoritilishi", icon: Lightbulb },
  { id: "waste", label: "Chiqindi va axlat", icon: Trash2 },
  { id: "water", label: "Suv va kanalizatsiya", icon: Droplet },
  { id: "transport", label: "Jamoat transporti", icon: Bus },
  { id: "parks", label: "Bog' va yashil hudud", icon: Trees },
  { id: "sidewalks", label: "Piyodalar yo'lkasi", icon: Footprints },
  { id: "buildings", label: "Jamoat binolari", icon: Building2 },
  { id: "safety", label: "Yo'l harakati xavfsizligi", icon: AlertTriangle },
  { id: "environment", label: "Ekologiya", icon: Leaf },
  { id: "other", label: "Boshqa", icon: MoreHorizontal },
];

export const TASHKENT_CENTER = [41.3111, 69.2797];
export const UZBEKISTAN_CENTER = [41.3775, 64.5853];

export const STATUS = {
  submitted: { label: "Yuborildi", color: "#5B7A99" },
  under_review: { label: "Ko'rib chiqilmoqda", color: "#C98A2B" },
  assigned: { label: "Bo'limga yuborildi", color: "#8759B3" },
  in_progress: { label: "Bajarilmoqda", color: "#1E88A8" },
  waiting_info: { label: "Ma'lumot kutilmoqda", color: "#B2492A" },
  resolved: { label: "Hal qilindi", color: "#2E9A5C" },
  neglected: { label: "E'tiborsiz qoldirilgan", color: "#8A97A2" },
  rejected: { label: "Rad etildi", color: "#A33A3A" },
  closed: { label: "Yopildi", color: "#5B6772" },
};
export const DONE_STATUSES = ["resolved", "closed"];

export const PRIORITY = {
  low: { label: "Past", color: "#7A8A99" },
  normal: { label: "Oddiy", color: "#1E88A8" },
  high: { label: "Yuqori", color: "#C98A2B" },
  urgent: { label: "Shoshilinch", color: "#B2402A" },
};

export const ORG_TYPES = [
  "Xususiy kompaniya", "Tozalash kompaniyasi", "Qurilish kompaniyasi", "Kommunal xizmat",
  "Transport kompaniyasi", "Ekologik tashkilot", "Favqulodda xizmat", "Boshqa",
];

export const HOT_VOTES = 3;
export const RESOLUTION_PHOTOS_REQUIRED = 3;
export const REOPEN_VOTES_REQUIRED = 5;

export const now = () => new Date().toISOString();
export const fmtDate = (iso) =>
  new Date(iso).toLocaleString("uz-UZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function haversine(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Berilgan GPS nuqtasiga eng yaqin tuman/shaharni (va uning viloyatini) butun mamlakat bo'yicha topadi.
export function nearestLocation(lat, lng) {
  let best = null, bestDist = Infinity;
  for (const region of REGIONS) {
    for (const d of region.districts) {
      const dist = haversine({ lat, lng }, d);
      if (dist < bestDist) { bestDist = dist; best = { region: region.name, district: d.name }; }
    }
  }
  return best;
}

// Rasmni canvas orqali kichraytirib, Supabase Storage'ga yuklash uchun Blob qaytaradi.
export function compressImage(file, maxDim = 640, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = (height * maxDim) / width; width = maxDim; }
        else if (height > maxDim) { width = (width * maxDim) / height; height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("compress failed"))), "image/jpeg", quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

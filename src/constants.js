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
  { id: "roads", icon: TrafficCone },
  { id: "lighting", icon: Lightbulb },
  { id: "waste", icon: Trash2 },
  { id: "water", icon: Droplet },
  { id: "transport", icon: Bus },
  { id: "parks", icon: Trees },
  { id: "sidewalks", icon: Footprints },
  { id: "buildings", icon: Building2 },
  { id: "safety", icon: AlertTriangle },
  { id: "environment", icon: Leaf },
  { id: "other", icon: MoreHorizontal },
];

export const TASHKENT_CENTER = [41.3111, 69.2797];
export const UZBEKISTAN_CENTER = [41.3775, 64.5853];

export const STATUS = {
  submitted: { color: "#5B7A99" },
  under_review: { color: "#C98A2B" },
  assigned: { color: "#8759B3" },
  in_progress: { color: "#1E88A8" },
  waiting_info: { color: "#B2492A" },
  resolved: { color: "#2E9A5C" },
  neglected: { color: "#8A97A2" },
  rejected: { color: "#A33A3A" },
  closed: { color: "#5B6772" },
};
export const DONE_STATUSES = ["resolved", "closed"];

export const PRIORITY = {
  low: { color: "#7A8A99" },
  normal: { color: "#1E88A8" },
  high: { color: "#C98A2B" },
  urgent: { color: "#B2402A" },
};

export const ORG_TYPES = [
  "private", "cleaning", "construction", "utility",
  "transport", "ecological", "emergency", "other",
];

export const HOT_VOTES = 3;
export const RESOLUTION_PHOTOS_REQUIRED = 3;
export const REOPEN_VOTES_REQUIRED = 5;

export const now = () => new Date().toISOString();

const DATE_LOCALE = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" };
export function fmtDate(iso, lang = "uz") {
  return new Date(iso).toLocaleString(DATE_LOCALE[lang] || "uz-UZ", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

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

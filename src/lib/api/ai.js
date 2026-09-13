// AI yordamchi funksiyalar (/api/analyze-photo — OpenAI kaliti faqat serverda saqlanadi).
// Ishlamay qolsa ham asosiy oqim buzilmasin deb har doim null qaytaradi, xato tashlamaydi.

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function analyze(task, image) {
  try {
    const resp = await fetch("/api/analyze-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, image }),
    });
    const data = await resp.json();
    if (data.error) return null;
    return data;
  } catch {
    return null;
  }
}

// Rasmga qarab eng mos turkumni taklif qiladi. Muvaffaqiyatsiz bo'lsa null qaytaradi.
export async function suggestCategory(blob) {
  const image = await blobToDataUrl(blob);
  const result = await analyze("categorize", image);
  return result?.category || null;
}

// Rasm haqiqiy joydan olinganga o'xshaydimi yoki sun'iy intellekt bilan
// yasalgan/mos kelmaydiganga o'xshaydimi — tekshiradi. Muvaffaqiyatsiz bo'lsa null.
export async function verifyPhoto(blob) {
  const image = await blobToDataUrl(blob);
  return analyze("verify", image);
}

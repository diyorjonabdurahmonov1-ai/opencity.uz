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

// Yangi hisobot rasmi bilan mavjud hisobotning rasmini solishtirib, bir xil
// muammo ekanligini taxmin qiladi (takroriy yuborishning oldini olish uchun).
// Muvaffaqiyatsiz bo'lsa null qaytaradi (bu holda chaqiruvchi tomon kandidatni
// ko'rsatishda davom etishi kerak — xatolik dublikatni yashirib qo'ymasin).
export async function compareIssuePhotos(newBlob, existingPhotoUrl) {
  if (!existingPhotoUrl) return null;
  try {
    const image = await blobToDataUrl(newBlob);
    const resp = await fetch("/api/analyze-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "compare", image, imageB: existingPhotoUrl }),
    });
    const data = await resp.json();
    if (data.error) return null;
    return data;
  } catch {
    return null;
  }
}

// Dastlabki muammo rasmini "hal qilindi" deb yuborilgan rasm bilan solishtirib,
// bir xil joy ekanligini va muammo chindan ham tuzatilganga o'xshashini tekshiradi.
// Muvaffaqiyatsiz bo'lsa null qaytaradi — bu holda chaqiruvchi ogohlantirishni
// ko'rsatmasligi kerak (xatoni haqiqiy muammo deb ko'rsatmaslik uchun).
export async function checkBeforeAfter(beforePhotoUrl, afterPhotoUrl) {
  if (!beforePhotoUrl || !afterPhotoUrl) return null;
  try {
    const resp = await fetch("/api/analyze-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "before_after", image: beforePhotoUrl, imageB: afterPhotoUrl }),
    });
    const data = await resp.json();
    if (data.error) return null;
    return data;
  } catch {
    return null;
  }
}

// Yordamchi chat-bot: qisqa suhbat tarixini yuborib, joriy tilda javob oladi.
// Muvaffaqiyatsiz bo'lsa null qaytaradi.
export async function askAssistant(messages, language) {
  try {
    const resp = await fetch("/api/ai-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "chat", messages, language }),
    });
    const data = await resp.json();
    if (data.error) return null;
    return data.reply || null;
  } catch {
    return null;
  }
}

// Foydalanuvchi yozgan matnni (hisobot/e'lon tavsifi) berilgan tilga tarjima qiladi.
// Muvaffaqiyatsiz bo'lsa null qaytaradi.
export async function translateText(text, targetLanguage) {
  if (!text?.trim()) return null;
  try {
    const resp = await fetch("/api/ai-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: "translate", text, targetLanguage }),
    });
    const data = await resp.json();
    if (data.error) return null;
    return data.translated || null;
  } catch {
    return null;
  }
}

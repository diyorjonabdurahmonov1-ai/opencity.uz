// Vercel serverless function (Node runtime). Keeps OPENAI_API_KEY server-side —
// never exposed to the browser bundle. Matnga asoslangan AI: yordamchi chat va tarjima.

const LANG_NAMES = { uz: "Uzbek", ru: "Russian", en: "English" };

async function callOpenAI(messages, extra = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages, max_tokens: 500, ...extra }),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`OpenAI error ${resp.status}: ${text.slice(0, 300)}`);
  }
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");
  return content;
}

const ASSISTANT_KNOWLEDGE = `
OpenCity is a civic-issue-reporting web app for Uzbekistan. What it does, by portal:

Citizen portal (sidebar): "My neighborhood map" (home, shows local active issues), "Whole city map",
"My reports" (reports the citizen submitted, can delete their own), "Voting" (upvote issues you think
matter; 3+ votes marks an issue "hot" and shows it red on the map), "Announcements" (government-posted
street closures and utility outages, tap one to see it on the map), "Completed work" (resolved issues;
if wrongly closed, vote to reopen it, 5 votes reopens it), "Notifications", "Profile" (shows detected
area, lets you change interface language, and apply for organization access if you represent a
government department or private company).

Reporting a problem (the wizard): pick a category (roads, lighting, waste, water, transport, parks,
sidewalks, buildings, traffic safety, environment, other) -> optionally add up to 5 photos (AI may
suggest a better category based on the photo) -> pick location (GPS "use my location" or tap the map)
-> if similar active reports already exist nearby, you're shown them and encouraged to vote instead of
duplicating (AI compares your photo to theirs to narrow this down) -> title + description -> review and
submit. The report is automatically routed to the correct government department based on region,
district and category.

Organization portal: for staff of a government department or an approved private company. Shows
reports assigned to that organization; staff can start work, mark neglected, or mark resolved (requires
at least 3 proof photos, AI checks those photos aren't AI-generated/fake and that they plausibly show
the original problem now fixed). Government orgs can also post announcements (street closures shown as
a red line with an optional green detour route, or utility outage zones shown as a circle).

Admin portal: platform-wide overview and management — all reports, organization applications (approve/
reject), organizations (edit, deactivate, upload logo, assign staff by email), and users (change role,
ban/unban).

Getting organization access: either an admin manually assigns your account to an organization, or you
apply yourself from Profile -> "Apply for organization access" as either a government department
employee or a private company representative; an admin reviews and approves/rejects it.
`;

async function chat(messages, language) {
  const langName = LANG_NAMES[language] || "Uzbek";
  const systemMsg = {
    role: "system",
    content:
      `You are the in-app help assistant for OpenCity, embedded in the product itself. ` +
      `Answer ONLY questions about how to use OpenCity, based on the knowledge below. ` +
      `Be concise (2-4 short sentences, no markdown headers). If asked something unrelated to using ` +
      `the app, politely say you can only help with OpenCity itself. ALWAYS reply in ${langName}, ` +
      `regardless of what language the user writes in.\n\n${ASSISTANT_KNOWLEDGE}`,
  };
  const trimmed = messages.slice(-8).map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: String(m.content || "").slice(0, 1000),
  }));
  return callOpenAI([systemMsg, ...trimmed], { max_tokens: 300 });
}

async function translate(text, targetLanguage) {
  const langName = LANG_NAMES[targetLanguage] || "Uzbek";
  const result = await callOpenAI([
    {
      role: "system",
      content:
        `Translate the user's text into ${langName}. Output ONLY the translation, no quotes, no ` +
        `explanation. If the text is already in ${langName}, output it unchanged.`,
    },
    { role: "user", content: String(text || "").slice(0, 2000) },
  ], { max_tokens: 400 });
  return result.trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { task, messages, language, text, targetLanguage } = req.body || {};
    if (task === "chat") {
      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "Missing messages" });
        return;
      }
      const reply = await chat(messages, language);
      res.status(200).json({ reply });
    } else if (task === "translate") {
      if (!text || typeof text !== "string") {
        res.status(400).json({ error: "Missing text" });
        return;
      }
      const translated = await translate(text, targetLanguage);
      res.status(200).json({ translated });
    } else {
      res.status(400).json({ error: "Unknown task" });
    }
  } catch (err) {
    res.status(200).json({ error: err.message || "AI request failed" });
  }
}

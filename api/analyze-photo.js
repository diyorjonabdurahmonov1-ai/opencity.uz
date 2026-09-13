// Vercel serverless function (Node runtime). Keeps OPENAI_API_KEY server-side —
// never exposed to the browser bundle (must NOT be prefixed with VITE_).

const CATEGORY_HINTS = {
  roads: "roads, potholes, cracked asphalt, damaged pavement",
  lighting: "street lighting, lamp posts, broken or missing streetlights",
  waste: "garbage, trash, illegal dumping, overflowing bins",
  water: "water leaks, sewage, flooding, broken pipes/drains",
  transport: "public transport stops, buses, damaged transit infrastructure",
  parks: "parks, green areas, damaged trees or lawns",
  sidewalks: "sidewalks, pedestrian paths, broken tiles/curbs",
  buildings: "public buildings, facades, structural damage",
  safety: "traffic safety, signage, crosswalks, dangerous intersections",
  environment: "pollution, environmental hazards, smoke, dumped chemicals",
  other: "anything that doesn't clearly fit the categories above",
};

async function callOpenAI(messages, extra = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
      max_tokens: 300,
      ...extra,
    }),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`OpenAI error ${resp.status}: ${text.slice(0, 300)}`);
  }
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");
  return JSON.parse(content);
}

async function categorize(image) {
  const list = Object.entries(CATEGORY_HINTS).map(([id, hint]) => `- ${id}: ${hint}`).join("\n");
  const result = await callOpenAI([
    {
      role: "system",
      content:
        "You classify a civic-issue-report photo into exactly one category id. " +
        "Respond with strict JSON: {\"category\": \"<id>\"}. If nothing matches well, use \"other\".\n" +
        `Categories:\n${list}`,
    },
    {
      role: "user",
      content: [
        { type: "text", text: "Which category best matches this photo?" },
        { type: "image_url", image_url: { url: image } },
      ],
    },
  ]);
  const category = typeof result.category === "string" ? result.category : null;
  return { category: category && CATEGORY_HINTS[category] ? category : null };
}

async function verify(image) {
  const result = await callOpenAI([
    {
      role: "system",
      content:
        "You review a photo submitted as proof that a civic repair (road, lighting, water, etc.) was " +
        "physically completed on site. Decide if the photo looks like a genuine on-site smartphone photo, " +
        "or if it looks AI-generated, a stock image, a screenshot, or otherwise not a real photo of a " +
        "physical repair site. Respond with strict JSON: " +
        "{\"suspicious\": true|false, \"reason\": \"<short reason, one sentence>\"}.",
    },
    {
      role: "user",
      content: [
        { type: "text", text: "Does this look like a genuine on-site repair photo?" },
        { type: "image_url", image_url: { url: image } },
      ],
    },
  ]);
  return {
    suspicious: !!result.suspicious,
    reason: typeof result.reason === "string" ? result.reason : "",
  };
}

async function compare(imageA, imageB) {
  const result = await callOpenAI([
    {
      role: "system",
      content:
        "You compare two photos submitted to a civic-issue-reporting app to judge whether they show " +
        "the SAME real-world physical issue at the same spot (e.g. the same pothole, the same broken " +
        "streetlight, the same pile of garbage) rather than merely a similar-looking but different issue. " +
        "Respond with strict JSON: {\"same\": true|false, \"confidence\": \"high\"|\"medium\"|\"low\"}.",
    },
    {
      role: "user",
      content: [
        { type: "text", text: "Photo A (new report):" },
        { type: "image_url", image_url: { url: imageA } },
        { type: "text", text: "Photo B (existing report):" },
        { type: "image_url", image_url: { url: imageB } },
        { type: "text", text: "Do Photo A and Photo B show the same physical issue at the same spot?" },
      ],
    },
  ]);
  return {
    same: !!result.same,
    confidence: ["high", "medium", "low"].includes(result.confidence) ? result.confidence : "low",
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { task, image, imageB } = req.body || {};
    if (!image || typeof image !== "string") {
      res.status(400).json({ error: "Missing image" });
      return;
    }
    if (task === "categorize") {
      res.status(200).json(await categorize(image));
    } else if (task === "verify") {
      res.status(200).json(await verify(image));
    } else if (task === "compare") {
      if (!imageB || typeof imageB !== "string") {
        res.status(400).json({ error: "Missing imageB" });
        return;
      }
      res.status(200).json(await compare(image, imageB));
    } else {
      res.status(400).json({ error: "Unknown task" });
    }
  } catch (err) {
    res.status(200).json({ error: err.message || "AI analysis failed" });
  }
}

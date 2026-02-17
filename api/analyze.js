export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing URL" });
  }

  const prompt = `
You are a fraud detection engine for e-commerce products.

Analyze the product URL and estimate fraud risk using these rules:

1) Price Check:
- Price < 50% of expected => +30 risk
- Price < 70% of expected => +20 risk

2) Rating vs Reviews mismatch:
- Rating > 4.5 and reviews < 20 => +20 risk
- Rating > 4.0 and reviews < 10 => +15 risk

3) Reviews Count:
- reviews < 5 => +25 risk
- reviews < 20 => +15 risk
- reviews < 50 => +8 risk

4) Seller suspicious:
- seller contains numbers/special chars => +15 risk
- seller length < 4 => +10 risk

5) Spam words:
"100% original", "best quality", "limited offer", "cheap price", "guaranteed",
"lowest price", "no return", "free gift"
Each keyword => +5 risk

6) Discount scam:
If contains 90% or 80% off => +20 risk

7) Rating low:
- rating < 2.5 => +30 risk
- rating < 3.5 => +15 risk

Final Verdict:
- riskScore <= 30 => SAFE
- riskScore 31-70 => RISKY
- riskScore > 70 => FAKE

IMPORTANT:
Return ONLY valid JSON. No explanation text.

JSON format must be exactly:
{
  "riskScore": number,
  "verdict": "SAFE" | "RISKY" | "FAKE",
  "finalMessage": "string",
  "reasons": ["string"],
  "breakdown": {
    "priceScore": number,
    "sellerScore": number,
    "contentScore": number
  },
  "sources": [
    { "title": "string", "uri": "string" }
  ]
}

Analyze this URL:
${url}
`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    const resultText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.status(200).json({ result: resultText });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

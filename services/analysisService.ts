import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';
import { mockAnalyzeProduct } from './mockAnalyzeProduct';

export const analyzeProduct = async (url: string): Promise<AnalysisResult> => {
  let normalizedUrl = url.toLowerCase().trim();
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = 'gemini-3-flash-preview';
    
    const systemInstruction = `You are the 'Verify Your Cart' Forensic Engine. 
    Analyze the provided URL and calculate a Risk Score (0-100) based on these 7 STRICT RULES:

    1. PRICE CHECK: If price < 50% of market MSRP (+30 risk). If < 70% (+20 risk).
    2. RATING MISMATCH: Rating > 4.5 but reviews < 20 (+20 risk).
    3. REVIEW VOLUME: < 5 reviews (+25 risk), < 20 (+15 risk), < 50 (+8 risk).
    4. SELLER IDENTITY: Name contains random chars/numbers or looks like bot (e.g. XJH_Store) (+15 risk).
    5. SPAM KEYWORDS: Description uses "100% original", "lowest price", "no return", "free gift", "guaranteed" (+5 risk per keyword).
    6. DISCOUNT ANCHOR: Claims of "90% off" or "80% off" (+20 risk).
    7. QUALITY BASELINE: Rating < 2.5 (+30 risk), < 3.5 (+15 risk).

    FINAL VERDICT:
    0-30 Risk: SAFE (Verdict: Safe)
    31-70 Risk: RISKY (Verdict: Risky)
    >70 Risk: FAKE (Verdict: Fake)

    IMPORTANT: Do not mention 'Gemini' or your internal processes. Return only the final audit report in JSON.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Perform a Forensic Audit on this URL: ${normalizedUrl}. Research the current market price and seller reputation using search tools.`,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ["REAL", "FAKE", "SUSPICIOUS"] },
            safetyScore: { type: Type.NUMBER, description: "Final 0-100 Risk Score" },
            reason: { type: Type.STRING, description: "Summary of the findings" },
            reasons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific bullet points of detected issues" },
            finalMessage: { type: Type.STRING, description: "Recommendation text" },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                priceScore: { type: Type.NUMBER },
                sellerScore: { type: Type.NUMBER },
                contentScore: { type: Type.NUMBER },
                technicalScore: { type: Type.NUMBER }
              },
              required: ["priceScore", "sellerScore", "contentScore", "technicalScore"]
            }
          },
          required: ["status", "safetyScore", "reason", "reasons", "finalMessage", "breakdown"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Audit service unavailable.");
    const data = JSON.parse(resultText);

    return {
      ...data,
      url: normalizedUrl,
      timestamp: new Date().toISOString(),
    };

  } catch (error: any) {
    console.warn("AI service fallback to local heuristics.");
    return await mockAnalyzeProduct(normalizedUrl);
  }
};
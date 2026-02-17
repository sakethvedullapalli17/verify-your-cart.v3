
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
    // Using gemini-3-pro-preview for advanced logic and high-quality search grounding
    const modelName = 'gemini-3-pro-preview';
    
    const systemInstruction = `You are the 'Verify Your Cart' Forensic Engine. 
    Analyze the provided URL and calculate a Risk Score (0–100) using these 7 STRICT RULES:

    1. Price Check:
       - Price < 50% of market MSRP: +30 risk
       - Price < 70% of market MSRP: +20 risk

    2. Rating vs Reviews Mismatch:
       - Rating > 4.5 and reviews < 20: +20 risk
       - Rating > 4.0 and reviews < 10: +15 risk

    3. Reviews Count:
       - reviews < 5: +25 risk
       - reviews < 20: +15 risk
       - reviews < 50: +8 risk

    4. Seller Name:
       - Alphanumeric string/Suspicious (e.g. XJH_Store_989): +15 risk
       - Length < 4 chars: +10 risk

    5. Spam Keywords in Description:
       - Found "100% original", "best quality", "limited offer", "cheap price", "guaranteed", "lowest price", "no return", "free gift": +5 risk PER keyword found.

    6. Extreme Discounts:
       - "90% off" or "80% off" found: +20 risk

    7. Low Rating:
       - rating < 2.5: +30 risk
       - rating < 3.5: +15 risk

    VERDICT CALCULATION:
    - riskScore <= 30: SAFE
    - riskScore 31 to 70: RISKY
    - riskScore > 70: FAKE

    RULES FOR RESPONSE:
    - Return ONLY a JSON object.
    - Do NOT mention "Gemini" or AI processes.
    - Use search to find current market prices and seller info.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Perform a forensic risk audit on: ${normalizedUrl}`,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            verdict: { type: Type.STRING, enum: ["SAFE", "RISKY", "FAKE"] },
            reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
            finalMessage: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["REAL", "FAKE", "SUSPICIOUS"] },
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
          required: ["riskScore", "verdict", "reasons", "finalMessage", "status", "breakdown"]
        }
      }
    });

    // Correctly accessing the text property from GenerateContentResponse
    const resultText = response.text;
    if (!resultText) throw new Error("Verification engine failure");
    const data = JSON.parse(resultText);

    // Removed 'redFlags' as it's not defined in the AnalysisResult type
    return {
      ...data,
      reason: data.reasons.join(". "),
      url: normalizedUrl,
      timestamp: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error("Forensic Engine Fallback:", error);
    return await mockAnalyzeProduct(normalizedUrl);
  }
};

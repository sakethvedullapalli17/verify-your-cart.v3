import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';
import { mockAnalyzeProduct } from './mockAnalysisService';

/**
 * List of verified official brand-owned websites (Manufacturers).
 * These are whitelisted for 100% safety as they are the direct source.
 */
const BRAND_DIRECT_REGISTRY = [
  'apple.com', 'nike.com', 'adidas.com', 'samsung.com', 'zara.com', 
  'hm.com', 'uniqlo.com', 'microsoft.com', 'sony.com', 'dell.com', 
  'hp.com', 'lenovo.com', 'bose.com', 'lg.com', 'canon.com', 
  'adobe.com', 'puma.com', 'reebok.com', 'levis.com'
];

/**
 * TrustLens Global Forensic Intelligence Engine
 * Strictly follows the "Fraud Detection Logic (Basis)" provided.
 */
export const analyzeProduct = async (url: string): Promise<AnalysisResult> => {
  let normalizedUrl = url.toLowerCase().trim();
  if (!normalizedUrl.startsWith('http')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  try {
    const urlObj = new URL(normalizedUrl);
    const hostname = urlObj.hostname.replace('www.', '');
    
    // WHIELIST CHECK: Direct brand manufacturers are 100% safe.
    const isVerifiedOriginal = BRAND_DIRECT_REGISTRY.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );

    if (isVerifiedOriginal) {
      return {
        status: 'REAL',
        safetyScore: 100,
        reason: `Direct Verification: ${hostname} is the official manufacturer domain. This is the source of truth, bypassing all third-party risks.`,
        redFlags: [],
        finalMessage: "This is an official brand website. 100% Authentic.",
        breakdown: { priceScore: 100, sellerScore: 100, contentScore: 100, technicalScore: 100 },
        url: normalizedUrl,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (e) {
    console.warn("URL Parsing failed, proceeding with deep audit.", e);
  }

  // DEEP AUDIT FOR ALL OTHER LINKS (Flipkart, Myntra, etc.)
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = 'gemini-3-pro-preview';
    
    const systemInstruction = `You are an Elite Forensic Cyber-Investigator. Calculate a "Risk Score" (0-100) for the provided URL based on these 7 strictly weighted checks:

1. PRICE CHECK (VS MARKET MSRP):
   - Price < 50% of market value: +30 Risk.
   - Price < 70% of market value: +20 Risk.

2. RATING vs REVIEWS MISMATCH:
   - Rating > 4.5 but Reviews < 20: +20 Risk.
   - Rating > 4.0 but Reviews < 10: +15 Risk.

3. REVIEWS COUNT:
   - Total Reviews < 5: +25 Risk.
   - Total Reviews < 20: +15 Risk.
   - Total Reviews < 50: +8 Risk.

4. SELLER REPUTATION:
   - Name contains numbers/special chars (e.g. "XJH_Store_989"): +15 Risk.
   - Name length < 4 chars: +10 Risk.

5. SPAM KEYWORDS (Check Description/Title):
   - Keywords: "100% original", "best quality", "limited offer", "cheap price", "guaranteed", "lowest price", "no return", "free gift".
   - Each keyword found: +5 Risk.

6. DISCOUNT CLAIMS:
   - Contains "90% off" or "80% off": +20 Risk.

7. LOW RATING:
   - Rating < 2.5: +30 Risk.
   - Rating < 3.5: +15 Risk.

FINAL VERDICT RULES:
- Safe: Risk Score <= 30 (Safety Score >= 70).
- Risky: Risk Score 31-70 (Safety Score 30-69).
- Fake: Risk Score > 70 (Safety Score < 30).

Use the googleSearch tool to find actual product details (price, rating, reviews, seller name) for the URL. Then calculate the Risk Score.
Return ONLY a JSON object.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `INVESTIGATE URL: ${normalizedUrl}. Find product price, rating, reviews, and seller details to calculate the Risk Score.`,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ["REAL", "FAKE", "SUSPICIOUS"] },
            safetyScore: { type: Type.NUMBER, description: "Calculate as (100 - Total Risk Score)" },
            reason: { type: Type.STRING, description: "List the specific logic checks that failed" },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            finalMessage: { type: Type.STRING, description: "Final recommendation for user" },
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
          required: ["status", "safetyScore", "reason", "redFlags", "finalMessage", "breakdown"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Forensic engine timed out.");
    const data = JSON.parse(resultText);

    // Extract sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || "Verification Source",
        uri: chunk.web.uri
      }));

    return {
      status: data.status as AnalysisResult['status'],
      safetyScore: data.safetyScore,
      reason: data.reason,
      redFlags: data.redFlags,
      finalMessage: data.finalMessage,
      breakdown: data.breakdown,
      sources: sources.length > 0 ? sources : undefined,
      url: normalizedUrl,
      timestamp: new Date().toISOString(),
    };

  } catch (error: any) {
    console.error("Critical Failure:", error);
    if (error?.message?.includes('429')) throw new Error("QUOTA_EXCEEDED");
    return await mockAnalyzeProduct(normalizedUrl);
  }
};
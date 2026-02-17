
import { AnalysisResult } from '../types';

export const mockAnalyzeProduct = async (url: string): Promise<AnalysisResult> => {
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 2500));

    const urlLower = url.toLowerCase();
    let riskScore = 0;
    const detectedReasons: string[] = [];

    // Rule 1: Price Check (Simulated)
    if (urlLower.includes('sale') || urlLower.includes('discount') || urlLower.includes('80-off')) {
        riskScore += 30;
        detectedReasons.push("Price is extremely low compared to normal market values");
    }

    // Rule 5: Spam Keywords
    const spamWords = ['original', 'guaranteed', 'limited', 'gift'];
    spamWords.forEach(w => {
        if (urlLower.includes(w)) {
            riskScore += 5;
        }
    });
    if (urlLower.includes('limited')) detectedReasons.push("Spam keywords found in description");

    // Rule 4: Seller Check
    if (urlLower.length > 80 || urlLower.includes('store-')) {
        riskScore += 15;
        detectedReasons.push("Seller handle looks suspicious or auto-generated");
    }

    // Default verdict
    let verdict: AnalysisResult['verdict'] = 'SAFE';
    let message = "Safe to buy. Verified marketplace signals detected.";
    let status: AnalysisResult['status'] = 'REAL';

    if (riskScore > 70) {
        verdict = 'FAKE';
        status = 'FAKE';
        message = "Avoid buying: High risk pattern detected. Countersignature failure.";
    } else if (riskScore > 30) {
        verdict = 'RISKY';
        status = 'SUSPICIOUS';
        message = "Caution advised: Audit suggests unverified seller or pricing mismatch.";
    }

    // Fixed: Removed 'redFlags' as it is not present in AnalysisResult type to satisfy TS compiler
    return {
        status,
        riskScore: Math.min(100, riskScore || 15),
        verdict,
        reason: detectedReasons.join(". "),
        reasons: detectedReasons.length > 0 ? detectedReasons : ["No significant risks identified"],
        finalMessage: message,
        url,
        timestamp: new Date().toISOString(),
        breakdown: {
            priceScore: Math.max(0, 100 - (riskScore * 0.8)),
            sellerScore: Math.max(0, 100 - (riskScore * 0.6)),
            contentScore: Math.max(0, 100 - riskScore),
            technicalScore: 100
        }
    };
};

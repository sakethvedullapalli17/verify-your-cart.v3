import { AnalysisResult } from '../types';

export const mockAnalyzeProduct = async (url: string): Promise<AnalysisResult> => {
    // Simulate forensic scan time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const urlLower = url.toLowerCase();
    let riskScore = 0;
    const detectedReasons: string[] = [];

    // Rule 1: Price (Simulated detection)
    if (urlLower.includes('sale') || urlLower.includes('discount')) {
        riskScore += 20;
        detectedReasons.push("Price is significantly lower than market average");
    }

    // Rule 4: Seller Name Check
    if (urlLower.length > 80) {
        riskScore += 15;
        detectedReasons.push("Seller identity markers look suspicious or auto-generated");
    }

    // Rule 5: Spam Keywords (Check URL for common scam strings)
    const keywords = ['cheap', 'gift', 'free', 'original', 'offer'];
    let keywordsFound = 0;
    keywords.forEach(kw => {
        if (urlLower.includes(kw)) {
            riskScore += 5;
            keywordsFound++;
        }
    });
    if (keywordsFound > 0) detectedReasons.push(`Spam marketing keywords found in listing metadata`);

    // Final Mapping
    let status: AnalysisResult['status'] = 'REAL';
    let message = "Safe to buy. Verified marketplace signals detected.";

    if (riskScore > 70) {
        status = 'FAKE';
        message = "Avoid buying: High risk pattern detected. Likely a counterfeit or scam.";
    } else if (riskScore > 30) {
        status = 'SUSPICIOUS';
        message = "Caution advised: Unverified seller or price anomalies detected.";
    }

    // Fixed: Added missing 'redFlags' property required by AnalysisResult
    return {
        status,
        safetyScore: riskScore,
        reason: detectedReasons.join('. ') || "No major red flags found in preliminary domain scan.",
        reasons: detectedReasons.length > 0 ? detectedReasons : ["No significant risks identified"],
        redFlags: detectedReasons.length > 0 ? detectedReasons : [],
        finalMessage: message,
        url,
        timestamp: new Date().toISOString(),
        breakdown: {
            priceScore: 100 - riskScore,
            sellerScore: 100 - (riskScore * 0.8),
            contentScore: 100 - (riskScore * 0.5),
            technicalScore: 100
        }
    };
};
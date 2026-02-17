
import { AnalysisResult } from '../types';

/**
 * Mocks the Analysis Logic.
 * Updated to reflect Safety Score logic.
 */
export const mockAnalyzeProduct = async (url: string): Promise<AnalysisResult> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const urlLower = url.toLowerCase();
    let score = 55; 
    let status: AnalysisResult['status'] = 'SUSPICIOUS';
    let advice = "Caution: This domain is not in our verified authentic registry.";
    
    const trustedDomains = [
        'amazon', 'flipkart', 'myntra', 'apple', 'nike', 'adidas', 
        'samsung', 'bestbuy', 'walmart', 'target', 'ebay', 'meesho',
        'ajio', 'tatacliq', 'jiomart', 'zara', 'h&m', 'uniqlo'
    ];
    
    const scamKeywords = [
        'free', 'giveaway', 'winner', '70-off', '80-off', '90-off',
        'lucky-draw', 'wheel-spin', 'claim-now', 'urgent', 'limited-time',
        'store', 'shop', 'discount'
    ];

    const isTrusted = trustedDomains.some(d => urlLower.includes(d));
    const isScam = scamKeywords.some(k => urlLower.includes(k) && !isTrusted);

    if (isTrusted) {
        score = 95;
        status = 'REAL';
        advice = "Trusted Retailer. This domain is verified and secure for shopping.";
    } else if (isScam) {
        score = 15;
        status = 'FAKE';
        advice = "High Risk detected. URL patterns match known scam/counterfeit signatures.";
    }

    return {
        status,
        safetyScore: score,
        reason: isTrusted ? "Verified marketplace with high security standards." : (isScam ? "Suspicious domain name and keyword patterns detected." : "Unknown domain with no verifiable trust history."),
        redFlags: isTrusted ? ["No significant red flags"] : ["Unverified Seller", "Suspicious Price Point", "Unknown Domain Age"],
        finalMessage: advice,
        url,
        timestamp: new Date().toISOString(),
        breakdown: {
            priceScore: score,
            sellerScore: score,
            contentScore: score,
            technicalScore: score
        }
    };
};
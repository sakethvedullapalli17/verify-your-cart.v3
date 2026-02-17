export interface AnalysisResult {
  status: 'REAL' | 'FAKE' | 'SUSPICIOUS';
  safetyScore: number; // 0-100 Risk Score
  reason: string;
  reasons: string[]; // Specific bullet points of logic flags
  redFlags: string[];
  finalMessage: string;
  url: string;
  timestamp: string;
  breakdown?: {
    priceScore: number;
    sellerScore: number;
    contentScore: number;
    technicalScore: number;
  };
  sources?: {
    title: string;
    uri: string;
  }[];
}

export enum ViewMode {
  ANALYZER = 'ANALYZER',
  EXPLANATION = 'EXPLANATION',
  BACKEND_CODE = 'BACKEND_CODE',
}
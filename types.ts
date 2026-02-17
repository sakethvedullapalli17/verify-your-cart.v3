
export interface AnalysisResult {
  status: 'REAL' | 'FAKE' | 'SUSPICIOUS';
  safetyScore: number; // 0-100 (0 = Fraud, 100 = Authentic)
  reason: string;
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

export interface AnalysisResult {
  status: 'REAL' | 'FAKE' | 'SUSPICIOUS';
  riskScore: number;
  verdict: 'SAFE' | 'RISKY' | 'FAKE';
  reason: string;
  reasons: string[];
  finalMessage: string;
  url: string;
  timestamp: string;
  breakdown: {
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

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isSearching?: boolean;
}

export enum ViewMode {
  ANALYZER = 'ANALYZER',
  EXPLANATION = 'EXPLANATION',
  BACKEND_CODE = 'BACKEND_CODE',
}

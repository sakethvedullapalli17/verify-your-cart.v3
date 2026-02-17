import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, Globe, Sparkles, Shield, ExternalLink, Flag, Search, SearchCode, ShieldAlert, ShieldOff, Clock, ArrowRight, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { AnalysisResult } from '../types';
import { analyzeProduct } from '../services/analysisService';

export const Analyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http')) {
        processedUrl = `https://${processedUrl}`;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeProduct(processedUrl);
      setResult(data);
    } catch (err: any) {
      setError("Forensic engine error. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getVerdict = (score: number) => {
    if (score > 70) return { text: 'FAKE', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', icon: <ShieldOff className="text-rose-600" /> };
    if (score > 30) return { text: 'RISKY', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: <AlertTriangle className="text-amber-600" /> };
    return { text: 'SAFE', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 className="text-emerald-600" /> };
  };

  return (
    <div className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-white">
      {/* Background Accents */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 mb-16">
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Verify <span className="text-blue-600">Your Cart</span>
            </h1>
            <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">
              Fraud Detection Engine
            </p>
          </div>

          {/* Centered Search Box */}
          <div className="w-full max-w-3xl">
            <form onSubmit={handleAnalyze} className="relative group">
              <div className="relative flex items-center bg-slate-50 hover:bg-white rounded-[2rem] shadow-sm hover:shadow-xl border-2 border-slate-100 hover:border-blue-200 transition-all duration-300 p-2">
                <div className="flex-grow flex items-center px-6">
                  <Globe size={20} className="text-slate-400 mr-4" />
                  <input
                    id="product-url-input"
                    type="text"
                    placeholder="Ask forensic engine to audit a product URL..."
                    className="w-full py-5 text-lg bg-transparent focus:outline-none placeholder:text-slate-400 text-slate-800 font-bold"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !url}
                  className="bg-slate-900 text-white p-5 rounded-full font-black hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <ArrowRight size={24} />
                  )}
                </button>
              </div>

              {error && (
                  <div className="mt-4 text-center text-rose-500 font-bold text-sm">
                      {error}
                  </div>
              )}
            </form>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
             <div className="flex flex-col items-center justify-center py-20 space-y-6">
                 <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldCheck size={28} className="text-blue-500 animate-pulse" />
                    </div>
                 </div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Running Forensic Logic...</p>
             </div>
        )}

        {/* Results Section */}
        {result && !loading && (
          <div ref={resultRef} className="animate-fade-in-up">
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Shield size={16} /> Audit Status
                    </h3>
                    <div className="flex items-center gap-4">
                        <span className={`text-6xl font-black ${getVerdict(result.safetyScore).color}`}>
                            {result.safetyScore}
                        </span>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Risk Score</p>
                            <p className={`text-xl font-black ${getVerdict(result.safetyScore).color}`}>
                                VERDICT: {getVerdict(result.safetyScore).text}
                            </p>
                        </div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-4 px-8 py-4 rounded-2xl border-2 ${getVerdict(result.safetyScore).border} ${getVerdict(result.safetyScore).bg}`}>
                    {getVerdict(result.safetyScore).icon}
                    <span className={`font-black text-lg ${getVerdict(result.safetyScore).color}`}>
                        {getVerdict(result.safetyScore).text}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Info size={14} /> Analysis Summary
                        </h4>
                        <p className="text-lg font-bold text-slate-800 leading-relaxed italic">
                            "{result.finalMessage}"
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <AlertCircle size={14} /> Detection Log
                        </h4>
                        {result.reasons && result.reasons.map((r, i) => (
                            <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 border border-slate-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                                {r}
                            </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
                    <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-8">Forensic Breakdown</h4>
                    <div className="space-y-6">
                        <AuditBar label="Price Integrity" value={result.breakdown?.priceScore || 0} />
                        <AuditBar label="Seller Verification" value={result.breakdown?.sellerScore || 0} />
                        <AuditBar label="Content Authenticity" value={result.breakdown?.contentScore || 0} />
                        <AuditBar label="Technical Safety" value={result.breakdown?.technicalScore || 0} />
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <div className="flex items-center gap-3 text-white/60 mb-4">
                            <Clock size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Audit Timestamp: {new Date().toLocaleTimeString()}</span>
                        </div>
                        <button onClick={() => setResult(null)} className="w-full py-4 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-400 hover:text-white transition-all">
                            New Audit
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AuditBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-white/60">
            <span>{label}</span>
            <span>{Math.round(value)}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-[2000ms] ${value < 50 ? 'bg-rose-500' : 'bg-blue-400'}`} 
                style={{ width: `${value}%` }}
            ></div>
        </div>
    </div>
);
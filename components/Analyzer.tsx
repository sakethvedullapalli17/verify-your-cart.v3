import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, CheckCircle, ShieldCheck, Globe, Sparkles, BrainCircuit, Shield, ExternalLink, Flag, Search, SearchCode, ShieldAlert, ShieldOff, Brain, ListChecks, Link as LinkIcon, Fingerprint, Clock } from 'lucide-react';
import { AnalysisResult } from '../types';
import { analyzeProduct } from '../services/analysisService';
import { ScoreGauge } from './ScoreGauge';

const SCAN_STEPS = [
  "Initializing deep forensic trace...",
  "Auditing price against market MSRP...",
  "Analyzing review-to-rating ratios...",
  "Checking for seller name anomalies...",
  "Scanning description for spam keywords...",
  "Synthesizing final risk score..."
];

export const Analyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<{ message: string; isQuota: boolean } | null>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setStepIdx((prev) => Math.min(prev + 1, SCAN_STEPS.length - 1));
      }, 2000);
    } else {
      setStepIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (result && !loading && resultRef.current) {
      const timer = setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [result, loading]);

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
      const isQuota = err.message?.includes('QUOTA_EXCEEDED');
      setError({
        message: isQuota 
          ? "API limit reached. Please wait 60 seconds before scanning another link." 
          : "Audit interrupted. The forensic engine encountered an anomaly.",
        isQuota
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
        case 'REAL': return { text: 'AUTHENTIC', icon: <ShieldCheck className="w-7 h-7"/>, banner: 'bg-emerald-600', emoji: '🛡️' };
        case 'FAKE': return { text: 'FAKE / SCAM', icon: <ShieldOff className="w-7 h-7"/>, banner: 'bg-rose-600', emoji: '🚨' };
        default: return { text: 'RISKY / SUSPICIOUS', icon: <ShieldAlert className="w-7 h-7"/>, banner: 'bg-amber-500', emoji: '⚠️' };
    }
  };

  return (
    <div className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden bg-slate-50/50">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-blue-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-indigo-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <div className="animate-float">
            <div className="relative p-6 bg-white rounded-[2.5rem] shadow-2xl border border-white relative z-20 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <SearchCode size={48} className="text-blue-600 relative z-10" />
                <Sparkles size={16} className="absolute top-4 right-4 text-amber-400 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] animate-fade-in-up">
              Verify <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">Your Cart</span>
            </h1>
            <p className="text-lg md:text-xl font-bold text-slate-500 animate-fade-in-up animation-delay-200 uppercase tracking-widest">
              AI-Powered Forensic Risk Audit
            </p>
          </div>

          <div className="w-full max-w-2xl mx-auto mt-6 animate-fade-in-up animation-delay-300">
            <form onSubmit={handleAnalyze} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              
              <div className="relative flex flex-col md:flex-row gap-2 bg-white rounded-[1.8rem] shadow-xl p-2.5 border border-slate-100">
                <div className="flex-grow flex items-center px-5">
                  <Globe size={22} className="text-slate-400 mr-4" />
                  <input
                    id="product-url-input"
                    type="text"
                    placeholder="Paste marketplace product link..."
                    className="w-full py-4 text-lg bg-transparent focus:outline-none placeholder:text-slate-400 text-slate-800 font-bold"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !url}
                  className="bg-slate-900 text-white px-10 py-4 rounded-[1.4rem] font-black text-lg hover:bg-blue-600 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>ANALYZING...</span>
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      <span>CHECK NOW</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                  <div className={`mt-4 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 border animate-shake-strong ${error.isQuota ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                      {error.isQuota ? <Clock size={18} /> : <AlertTriangle size={18} />} 
                      {error.message}
                  </div>
              )}
            </form>
          </div>
        </div>

        {loading && (
             <div className="flex flex-col items-center justify-center py-20 animate-fade-in max-w-md mx-auto">
                 <div className="relative mb-8">
                     <div className="w-24 h-24 rounded-full border-[6px] border-slate-100 border-t-blue-500 animate-spin"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                         <BrainCircuit size={32} className="text-blue-500 animate-pulse" />
                     </div>
                 </div>
                 <div className="h-10 overflow-hidden text-center w-full">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">
                        {SCAN_STEPS[stepIdx]}
                    </p>
                 </div>
                 <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-4">
                    <div className="bg-blue-500 h-full animate-[shimmer_2.5s_infinite] w-full origin-left"></div>
                 </div>
             </div>
        )}

        {result && !loading && (
          <div ref={resultRef} className="animate-scale-in">
            <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 max-w-5xl mx-auto">
              {/* Verdict Banner */}
              <div className={`${getStatusConfig(result.status).banner} text-white px-8 md:px-12 py-8 flex flex-col md:flex-row justify-between items-center gap-6`}>
                  <div className="flex items-center gap-5">
                      <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                        {getStatusConfig(result.status).icon}
                      </div>
                      <div>
                        <h3 className="font-black text-2xl tracking-tight uppercase">Result: {getStatusConfig(result.status).text}</h3>
                        <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Logic Basis Audit • {new Date().toLocaleTimeString()}</p>
                      </div>
                  </div>
                  <div className="text-4xl filter drop-shadow-md hidden md:block">{getStatusConfig(result.status).emoji}</div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                {/* Score Section */}
                <div className="lg:col-span-5 p-10 bg-slate-50/50">
                    <div className="flex flex-col items-center">
                        <ScoreGauge score={result.safetyScore} />
                        
                        {result.breakdown && (
                            <div className="mt-12 w-full space-y-6 px-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-200 pb-3 mb-6">7-Point Risk Vectors</h4>
                                <div className="space-y-5">
                                    <BreakdownBar label="Price Authenticity" value={result.breakdown.priceScore} color={result.breakdown.priceScore < 50 ? "bg-rose-500" : "bg-emerald-500"} />
                                    <BreakdownBar label="Seller Reputation" value={result.breakdown.sellerScore} color={result.breakdown.sellerScore < 50 ? "bg-rose-500" : "bg-blue-500"} />
                                    <BreakdownBar label="Technical Signals" value={result.breakdown.technicalScore} color={result.breakdown.technicalScore < 50 ? "bg-rose-500" : "bg-indigo-500"} />
                                    <BreakdownBar label="Content Fidelity" value={result.breakdown.contentScore} color={result.breakdown.contentScore < 50 ? "bg-rose-500" : "bg-violet-500"} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Audit Details */}
                <div className="lg:col-span-7 p-10 md:p-14">
                    <div className="space-y-12">
                        {/* Advice */}
                        <div>
                            <div className="flex items-center gap-3 mb-5">
                                <div className={`w-2 h-8 rounded-full ${result.safetyScore < 30 ? 'bg-rose-500' : (result.safetyScore < 70 ? 'bg-amber-500' : 'bg-emerald-500')}`}></div>
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Recommendation</h4>
                            </div>
                            <div className={`p-8 rounded-[2rem] border-2 leading-relaxed font-bold text-lg ${result.safetyScore < 30 ? 'bg-rose-50 border-rose-100 text-rose-900' : 'bg-slate-50 border-slate-100 text-slate-800'}`}>
                                "{result.finalMessage}"
                            </div>
                        </div>

                        {/* Reason / Logic */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <BrainCircuit size={16} /> Reasoning (Based on Audit)
                            </h4>
                            <p className="text-slate-600 leading-relaxed font-medium italic text-lg whitespace-pre-line">
                                {result.reason}
                            </p>
                        </div>

                        {/* Red Flags */}
                        {result.redFlags && result.redFlags.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-rose-600">
                                    <Flag size={16} /> High Risk Markers Found
                                </h4>
                                <div className="grid gap-3">
                                    {result.redFlags.map((flag, idx) => (
                                        <div key={idx} className="flex items-start gap-4 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-900 text-sm font-bold shadow-sm">
                                            <div className="mt-0.5 bg-rose-500 text-white rounded-full p-1"><AlertTriangle size={12} /></div>
                                            {flag}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Grounding Sources */}
                        {result.sources && result.sources.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Globe size={16} /> Market Research Evidence
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {result.sources.map((source, idx) => (
                                        <a 
                                            key={idx} 
                                            href={source.uri} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between gap-3 px-5 py-4 bg-slate-50 hover:bg-white hover:shadow-xl border border-slate-200 rounded-2xl text-xs font-black text-slate-600 transition-all group"
                                        >
                                            <span className="truncate">{source.title}</span>
                                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-slate-50 px-12 py-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4 text-slate-400">
                      <Shield size={20} className="text-blue-500" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Verify Your Cart Engine</p>
                  </div>
                  <div className="flex gap-4">
                      <button onClick={() => window.print()} className="px-8 py-3 bg-white border-2 border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:border-slate-300 transition-all">
                          Export Case Report
                      </button>
                      <button onClick={() => setResult(null)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-blue-600 transition-all shadow-lg">
                          Verify New Link
                      </button>
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BreakdownBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-tighter">
            <span>{label}</span>
            <span>{value}%</span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all duration-[2000ms] ease-out`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);
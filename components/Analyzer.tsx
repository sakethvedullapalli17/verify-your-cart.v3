import React, { useState, useRef } from "react";
import {
  Globe,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  AlertCircle,
  RefreshCcw,
  Search,
  Sparkles,
  BrainCircuit,
  Info,
  SearchCode,
  History
} from "lucide-react";

import { AnalysisResult } from "../types";

export const Analyzer: React.FC = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (e: React.FormEvent | string) => {
    if (typeof e !== "string") e.preventDefault();
    const targetUrl = typeof e === "string" ? e : url;

    if (!targetUrl) return;

    let processedUrl = targetUrl.trim();
    if (!processedUrl.startsWith("http")) {
      processedUrl = `https://${processedUrl}`;
    }

    setUrl(processedUrl);
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: processedUrl })
      });

      const data = await res.json();

      let parsed: any;

      try {
        parsed = JSON.parse(data.result);
      } catch (err) {
        parsed = {
          riskScore: 50,
          verdict: "RISKY",
          finalMessage: data.result || "Invalid response from verification engine.",
          reasons: ["Unable to parse response properly."],
          breakdown: {
            priceScore: 0,
            sellerScore: 0,
            contentScore: 0
          },
          sources: []
        };
      }

      setResult(parsed);

      if (!history.includes(processedUrl)) {
        setHistory((prev) => [processedUrl, ...prev].slice(0, 5));
      }
    } catch (err: any) {
      setError("Audit failed. The forensic engine encountered an anomaly.");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictUI = (verdict: string) => {
    switch (verdict) {
      case "FAKE":
        return {
          color: "text-rose-600",
          bg: "bg-rose-50",
          border: "border-rose-100",
          icon: <ShieldOff size={32} className="text-rose-600" />,
          emoji: "❌"
        };
      case "RISKY":
        return {
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-100",
          icon: <ShieldAlert size={32} className="text-amber-600" />,
          emoji: "⚠️"
        };
      default:
        return {
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          icon: <ShieldCheck size={32} className="text-emerald-600" />,
          emoji: "✅"
        };
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 bg-white selection:bg-blue-100 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-50 rounded-full blur-[100px] opacity-60"></div>
      </div>

      {/* Header */}
      {!result && !loading && (
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-slate-900 text-white p-2.5 rounded-2xl shadow-xl">
              <SearchCode size={32} />
            </div>
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight mb-4">
            Forensic <span className="text-blue-600">Product Search</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">
            Powered by Smart Verification Engine
          </p>
        </div>
      )}

      {/* Main Search Experience */}
      <div
        className={`w-full transition-all duration-700 ease-in-out ${
          result || loading ? "max-w-6xl" : "max-w-2xl"
        }`}
      >
        <form onSubmit={handleAnalyze} className="relative group mb-12">
          <div
            className={`relative flex items-center bg-white border-2 rounded-[1.5rem] md:rounded-[3rem] p-2 transition-all duration-500 shadow-sm ${
              loading
                ? "border-blue-500 shadow-2xl scale-[1.01]"
                : "border-slate-100 hover:border-blue-200 hover:shadow-xl focus-within:border-blue-500 focus-within:shadow-xl"
            }`}
          >
            <div className="flex-grow flex items-center px-6">
              <Search size={22} className="text-slate-300 mr-4" />
              <input
                id="product-url-input"
                type="text"
                placeholder="Paste link (Amazon, eBay, etc.) to scan..."
                className="w-full py-5 text-lg bg-transparent focus:outline-none placeholder:text-slate-300 text-slate-800 font-bold"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !url}
              className="bg-slate-900 text-white p-5 rounded-full font-black hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="hidden md:inline pl-2">Audit Listing</span>
                  <ArrowRight
                    size={24}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="mt-4 text-center text-rose-500 font-bold text-xs uppercase tracking-widest animate-bounce">
              {error}
            </p>
          )}
        </form>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center py-24 space-y-10 animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BrainCircuit size={32} className="text-blue-500 animate-pulse" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white p-2 rounded-xl shadow-lg border border-slate-100">
                <Search size={16} className="text-slate-400 animate-bounce" />
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-xs font-black text-slate-800 uppercase tracking-[0.4em]">
                Scanning live web sources...
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Validating price, seller records, and sentiment
              </p>
            </div>
          </div>
        )}

        {/* Results Experience */}
        {result && !loading && (
          <div ref={resultRef} className="animate-fade-in-up space-y-10 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Verdict Sidepanel */}
              <div className="lg:col-span-4 bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all"></div>

                <div className="flex flex-col items-center text-center space-y-8 relative z-10">
                  <div
                    className={`p-6 rounded-[2rem] ${
                      getVerdictUI(result.verdict).bg
                    } border-2 ${
                      getVerdictUI(result.verdict).border
                    } shadow-inner`}
                  >
                    {getVerdictUI(result.verdict).icon}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Forensic Risk Score
                    </span>
                    <h3
                      className={`text-7xl font-black ${
                        getVerdictUI(result.verdict).color
                      }`}
                    >
                      {result.riskScore}
                    </h3>
                    <p
                      className={`text-xl font-black uppercase tracking-tight flex items-center gap-2 justify-center mt-2 ${
                        getVerdictUI(result.verdict).color
                      }`}
                    >
                      {getVerdictUI(result.verdict).emoji} Verdict:{" "}
                      {result.verdict}
                    </p>
                  </div>

                  <div className="w-full space-y-6 pt-10 border-t border-white/5">
                    <AuditMetric
                      label="Market Price Logic"
                      value={result.breakdown?.priceScore || 0}
                    />
                    <AuditMetric
                      label="Seller Reputation"
                      value={result.breakdown?.sellerScore || 0}
                    />
                    <AuditMetric
                      label="Content Sentiment"
                      value={result.breakdown?.contentScore || 0}
                    />
                  </div>

                  <button
                    onClick={() => {
                      setUrl("");
                      setResult(null);
                    }}
                    className="w-full py-5 mt-6 bg-white/5 hover:bg-white text-slate-400 hover:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border border-white/10"
                  >
                    <RefreshCcw size={14} /> Clear Scan
                  </button>
                </div>
              </div>

              {/* Forensic Details */}
              <div className="lg:col-span-8 space-y-10">
                <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 relative group overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles size={120} />
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 mb-6">
                    <Info size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      AI Forensic Summary
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight">
                    "{result.finalMessage}"
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      Search Logic Violations
                    </h4>
                    <span className="text-[10px] font-bold text-slate-300">
                      Grounding Active
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {result.reasons &&
                      result.reasons.map((reason, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-5 p-6 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:shadow-xl transition-all group"
                        >
                          <div
                            className={`p-2.5 rounded-xl shrink-0 ${
                              result.riskScore > 70
                                ? "bg-rose-50 text-rose-500"
                                : result.riskScore > 30
                                ? "bg-amber-50 text-amber-500"
                                : "bg-emerald-50 text-emerald-500"
                            }`}
                          >
                            <AlertCircle size={18} />
                          </div>
                          <p className="text-base md:text-lg font-bold text-slate-700 leading-snug">
                            {reason}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Sources if available */}
                {result.sources && result.sources.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                      Web Sources
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {result.sources.map((s, i) => (
                        <a
                          key={i}
                          href={s.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:shadow-md transition-all"
                        >
                          <Globe size={12} className="text-blue-500" />
                          {s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Pills & History */}
      {!loading && !result && (
        <div className="w-full max-w-2xl mt-12 animate-fade-in-up [animation-delay:400ms]">
          {history.length > 0 && (
            <div className="mb-8">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <History size={12} /> Recent Audits
              </h5>
              <div className="flex flex-wrap gap-2">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnalyze(h)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 truncate max-w-[200px]"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <SuggestionPill text="iPhone Price Audit" icon={<Sparkles size={14} />} />
            <SuggestionPill text="Seller Verification" icon={<Search size={14} />} />
            <SuggestionPill text="Sentiment Analysis" icon={<Info size={14} />} />
          </div>
        </div>
      )}
    </div>
  );
};

const AuditMetric: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="w-full space-y-2.5">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
      <span>{label}</span>
      <span className="text-white">{Math.round(value)}%</span>
    </div>
    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-1000 ease-out rounded-full ${
          value < 40 ? "bg-rose-500" : "bg-blue-400"
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const SuggestionPill: React.FC<{ text: string; icon: React.ReactNode }> = ({ text, icon }) => (
  <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full text-xs font-bold text-slate-500 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group">
    <span className="text-slate-300 group-hover:text-blue-500 transition-colors">
      {icon}
    </span>
    {text}
  </div>
);

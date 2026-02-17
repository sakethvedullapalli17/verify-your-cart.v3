
import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Check, Info, X, HelpCircle, ShieldAlert } from 'lucide-react';

interface ScoreVisualizerProps {
    score: number;
}

const THRESHOLDS = [
    { range: '80–100%', label: 'Authentic Store', color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Listing data is verified and consistent with official standards.' },
    { range: '40–79%', label: 'Suspicious / Unknown', color: 'text-yellow-600', bg: 'bg-yellow-50', desc: 'Generally risky; missing significant trust signals or unverified history.' },
    { range: '0–39%', label: 'Fraud / Fake', color: 'text-red-600', bg: 'bg-red-50', desc: 'DANGER: Patterns strongly match known fraud and counterfeit signatures.' },
];

export const ScoreGauge: React.FC<ScoreVisualizerProps> = ({ score }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const [barWidth, setBarWidth] = useState(0);
    const [showGuide, setShowGuide] = useState(false);
    const guideRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setDisplayScore(0);
        setBarWidth(0);

        const timer = setTimeout(() => setBarWidth(score), 100);

        let start = 0;
        const duration = 1500;
        const startTime = performance.now();

        const animateNumber = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(Math.floor(start + (score - start) * ease));
            if (progress < 1) requestAnimationFrame(animateNumber);
        };
        requestAnimationFrame(animateNumber);
        return () => clearTimeout(timer);
    }, [score]);

    let config = {
        color: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        bgLight: 'bg-emerald-50',
        icon: <ShieldCheck size={28} className="text-white" />,
        label: 'Safe to Buy',
        emoji: '🛡️',
        advice: "The listing data is consistent with authentic retailers."
    };

    if (score < 40) {
        config = {
            color: 'bg-red-600',
            textColor: 'text-red-700',
            borderColor: 'border-red-200',
            bgLight: 'bg-red-50',
            icon: <ShieldAlert size={28} className="text-white" />,
            label: 'High Risk',
            emoji: '🚨',
            advice: "Warning: High probability of a counterfeit or scam listing."
        };
    } else if (score < 80) {
        config = {
            color: 'bg-yellow-500',
            textColor: 'text-yellow-800',
            borderColor: 'border-yellow-200',
            bgLight: 'bg-yellow-50',
            icon: <AlertTriangle size={28} className="text-white" />,
            label: 'Suspicious',
            emoji: '⚠️',
            advice: "Unverified seller or price anomalies. Caution advised."
        };
    }

    return (
        <div className={`w-full max-w-md mx-auto relative`}>
            <div className="flex items-end justify-between mb-4">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Authenticity Score</span>
                    <div className="flex items-center gap-3">
                        <h3 className={`text-4xl md:text-5xl font-extrabold ${config.textColor} tracking-tight tabular-nums`}>
                            {displayScore}%
                        </h3>
                        <span className="text-3xl filter drop-shadow-sm">{config.emoji}</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 relative">
                    <button 
                        onClick={() => setShowGuide(!showGuide)}
                        className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors rounded-full"
                    >
                        <HelpCircle size={18} />
                    </button>

                    {showGuide && (
                        <div ref={guideRef} className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-[100] animate-scale-in origin-top-right">
                            <h4 className="text-sm font-extrabold text-slate-900 uppercase mb-4">Authenticity Metrics</h4>
                            <div className="space-y-4">
                                {THRESHOLDS.map((t, idx) => (
                                    <div key={idx} className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${t.bg} ${t.color}`}>{t.range}</span>
                                            <span className={`text-[11px] font-bold ${t.color}`}>{t.label}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 leading-tight">{t.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
                <div className={`h-full ${config.color} rounded-full transition-all duration-[1500ms] ease-out`} style={{ width: `${barWidth}%` }}></div>
            </div>

            <div className="mt-6 flex items-start gap-4 bg-white/60 p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className={`p-3 rounded-xl ${config.color} text-white`}>
                    {config.icon}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Safety Logic</h4>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">{config.advice}</p>
                </div>
            </div>
        </div>
    );
};
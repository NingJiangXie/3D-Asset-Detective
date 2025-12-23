
import React, { useState, useEffect } from 'react';
import { Box, Scan, Activity, Cpu } from './Icons';
import { Language } from '../types';

interface LoadingStateProps {
  query: string;
  lang: Language;
}

const translations = {
  zh: {
    analyzing: "核心协议分析中",
    active: "ANALYSIS_MODE_ENGAGED",
    messages: [
      "SYNCHRONIZING GLOBAL REPOSITORIES...",
      "FETCHING METADATA: SKETCHFAB / UNITY...",
      "PARSING TOPOLOGY DATA...",
      "SIMULATING RENDER VISUALS...",
      "EXTRACTING DIRECT DOWNLOAD NODES...",
      "VERIFYING ASSET INTEGRITY...",
      "COMPILING ANALYTICS REPORT..."
    ]
  },
  en: {
    analyzing: "PROTOCOL ANALYSIS",
    active: "ANALYSIS_MODE_ENGAGED",
    messages: [
      "SYNCHRONIZING GLOBAL REPOSITORIES...",
      "FETCHING METADATA: SKETCHFAB / UNITY...",
      "PARSING TOPOLOGY DATA...",
      "SIMULATING RENDER VISUALS...",
      "EXTRACTING DIRECT DOWNLOAD NODES...",
      "VERIFYING ASSET INTEGRITY...",
      "COMPILING ANALYTICS REPORT..."
    ]
  }
};

const LoadingState: React.FC<LoadingStateProps> = ({ query, lang }) => {
  const [currentMsg, setCurrentMsg] = useState(0);
  const [progress, setProgress] = useState(0);
  const t = translations[lang];

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setCurrentMsg((prev) => (prev + 1) % t.messages.length);
    }, 2000);

    const progInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        return prev + Math.random() * 3;
      });
    }, 200);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, [t.messages.length]);

  return (
    <div className="relative w-full py-28 flex flex-col items-center justify-center overflow-hidden rounded-[4rem] bg-slate-950/40 border border-slate-800 border-dashed backdrop-blur-xl">
      <div className="absolute inset-0 grid-lines opacity-20" />
      
      {/* 全息环 */}
      <div className="relative mb-20 h-56 w-56 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-ping [animation-duration:3s]" />
        <div className="absolute inset-0 border border-purple-500/30 rounded-full animate-spin [animation-duration:10s]" />
        <div className="absolute inset-4 border border-cyan-500/40 rounded-full border-dashed animate-spin [animation-duration:15s]" />
        
        <div className="relative z-10 p-12 bg-slate-900 border border-cyan-400 shadow-[0_0_60px_rgba(34,211,238,0.3)] rounded-full animate-float-gentle">
          <Box className="w-20 h-20 text-cyan-400" />
        </div>
        
        {/* 雷达扫描针 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-cyan-500/10 rounded-full pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-36 bg-gradient-to-t from-cyan-400 to-transparent origin-bottom animate-spin [animation-duration:4s]" />
        </div>
      </div>

      <div className="text-center space-y-8 max-w-xl relative z-10 px-8">
        <div>
          <h3 className="text-[11px] font-black text-cyan-500 mb-3 tracking-[0.6em] mono uppercase">
            {t.analyzing}
          </h3>
          <p className="text-3xl sm:text-4xl font-black text-white tracking-tech uppercase font-display italic">
            "{query}"
          </p>
        </div>
        
        <div className="h-6 flex items-center justify-center">
          <p className="text-[13px] text-slate-500 mono tracking-[0.15em] font-bold">
            > {t.messages[currentMsg]}
          </p>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-4">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/30 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 bg-[length:200%_100%] animate-shimmer transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] mono font-black uppercase tracking-tech">
            <div className="flex items-center gap-2 text-cyan-500/60">
              <Cpu className="w-3.5 h-3.5 animate-pulse" />
              {t.active}
            </div>
            <span className="text-purple-400">{Math.floor(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;

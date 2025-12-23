
import React from 'react';
import { ModelData, Language } from '../types';
import { 
  ExternalLink, 
  FileCode, 
  Zap,
  FileJson,
  Scan,
  Activity,
  Cpu
} from './Icons';

interface ModelCardProps {
  model: ModelData;
  index: number;
  lang: Language;
}

const translations = {
  zh: {
    details: "接入源站",
    export: "数据导出",
    free: "FREE / 公有",
    appearance: "AI 视觉分析报告",
    verified: "VERIFIED_ASSET",
    confidence: "CONFIDENCE",
    tech: "核心参数"
  },
  en: {
    details: "Live Access",
    export: "Export JSON",
    free: "FREE / PUBLIC",
    appearance: "AI VISUAL REPORT",
    verified: "VERIFIED_ASSET",
    confidence: "CONFIDENCE",
    tech: "CORE SPECS"
  }
};

const ModelCardSkeleton: React.FC = () => (
  <div className="relative bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden border border-slate-800 h-[480px] flex flex-col p-6 gap-6">
    <div className="flex justify-between">
      <div className="w-24 h-4 bg-slate-800 rounded animate-pulse" />
      <div className="w-12 h-4 bg-slate-800 rounded animate-pulse" />
    </div>
    <div className="w-3/4 h-8 bg-slate-800 rounded animate-pulse" />
    <div className="flex-1 bg-slate-800/20 rounded-xl" />
    <div className="w-full h-20 bg-slate-800/40 rounded-xl" />
    <div className="flex justify-between">
      <div className="w-20 h-6 bg-slate-800 rounded" />
      <div className="w-32 h-10 bg-slate-800 rounded" />
    </div>
  </div>
);

const ModelCard: React.FC<ModelCardProps> & { Skeleton: typeof ModelCardSkeleton } = ({ model, index, lang }) => {
  const t = translations[lang];
  const name = model.name[lang] || model.name['en'] || 'Unknown Entity';
  const description = model.description[lang] || model.description['en'] || '';
  const visualSummary = model.visualSummary[lang] || model.visualSummary['en'] || '';
  const confidence = model.qualityScore ? Math.min(model.qualityScore * 10, 99) : 85;

  const handleExport = () => {
    const data = { ...model, analyzed_at: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `3D_Analysis_${model.id}.json`;
    link.click();
  };

  return (
    <div 
      className="group relative flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-7 transition-all duration-500 hover:border-cyan-500/40 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(34,211,238,0.2)] animate-fadeInUp"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="scan-line" />
      
      {/* 顶部元数据 */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mono">
            {model.domain || model.platform}
          </span>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mono">{t.confidence}</div>
          <div className={`text-base font-black mono text-glow-cyan ${confidence > 90 ? 'text-emerald-400' : 'text-cyan-400'}`}>
            {confidence}%
          </div>
        </div>
      </div>

      {/* 主体标题 */}
      <div className="mb-6 cyber-corner p-2">
        <h3 className="text-lg font-bold text-white leading-tight mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2 uppercase font-display tracking-wide">
          {name}
        </h3>
        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 italic mono font-medium">
          // {description}
        </p>
      </div>

      {/* 核心参数 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5 text-cyan-400/80" />
          <span className="text-[11px] font-black text-slate-300 mono tracking-tight truncate uppercase">{model.format || 'N/A'}</span>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-xl flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-purple-400/80" />
          <span className="text-[11px] font-black text-slate-300 mono tracking-tight truncate uppercase">
            {model.technicalSpecs?.[0]?.[lang] || 'STANDARD'}
          </span>
        </div>
      </div>

      {/* 视觉分析报告 */}
      <div className="flex-1 mb-8 relative">
        <div className="absolute -top-3 left-3 px-2 bg-slate-900 text-[9px] font-black text-cyan-500/80 tracking-[0.4em] mono">
          {t.appearance}
        </div>
        <div className="w-full h-full bg-slate-950/50 rounded-xl border border-slate-800/80 p-5 pt-6 text-[13px] text-slate-400 leading-relaxed line-clamp-5 hover:line-clamp-none transition-all cursor-default overflow-hidden font-medium tracking-[0.02em]">
          {visualSummary}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="mt-auto flex items-center justify-between gap-4 pt-6 border-t border-slate-800/50">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mono">EST_VALUE</span>
          <span className="text-emerald-400 font-black text-xl mono tracking-tighter">
            {model.price && (model.price.toLowerCase().includes('free') || model.price === '0') ? t.free : (model.price || t.free)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-purple-400 rounded-xl transition-all border border-slate-700 shadow-md"
            title={t.export}
          >
            <FileJson className="w-4.5 h-4.5" />
          </button>
          <a 
            href={model.downloadUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group/btn relative flex items-center gap-3 px-6 py-4 bg-white hover:bg-cyan-400 text-slate-950 rounded-xl transition-all font-black text-[10px] active:scale-95 overflow-hidden shadow-xl mono tracking-tech uppercase"
          >
            <span className="relative z-10">{t.details}</span>
            <ExternalLink className="w-3 h-3 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </a>
        </div>
      </div>

      {/* 认证标签 */}
      <div className="absolute top-4 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
          <Scan className="w-3 h-3 text-emerald-400" />
          <span className="text-[9px] font-black text-emerald-400 font-display tracking-[0.2em]">{t.verified}</span>
        </div>
      </div>
    </div>
  );
};

ModelCard.Skeleton = ModelCardSkeleton;

export default ModelCard;

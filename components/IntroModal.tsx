
import React from 'react';
import { X, Sparkles, Scan, ShieldCheck, Globe, Zap } from './Icons';
import { Language } from '../types';

interface IntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const translations = {
  zh: {
    title: "系统功能指南",
    subtitle: "欢迎使用 3D 模型侦探 v2.5",
    features: [
      {
        icon: <Globe className="w-6 h-6 text-cyan-400" />,
        title: "全球资产追踪",
        desc: "整合 Sketchfab, Unity, CGTrader 等十余个主流平台，实时穿透搜索。"
      },
      {
        icon: <Scan className="w-6 h-6 text-purple-400" />,
        title: "AI 深度分析",
        desc: "不仅仅是搜索，系统会自动分析模型的拓扑结构、视觉风格与应用场景。"
      },
      {
        icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
        title: "真实性验证",
        desc: "利用 Google Search Grounding 技术，确保每一个下载链接均真实有效。"
      },
      {
        icon: <Zap className="w-6 h-6 text-yellow-400" />,
        title: "专家模式 (Pro)",
        desc: "接入 Gemini 3 Pro 引擎，提供更精准的分析报告与更高阶的搜索逻辑。"
      }
    ],
    cta: "开始探索",
    footer: "由 YuJunping 开发的高级资产分析终端"
  },
  en: {
    title: "SYSTEM GUIDE",
    subtitle: "Welcome to 3D Asset Detective v2.5",
    features: [
      {
        icon: <Globe className="w-6 h-6 text-cyan-400" />,
        title: "GLOBAL TRACKING",
        desc: "Real-time search across Sketchfab, Unity, CGTrader, and 10+ major platforms."
      },
      {
        icon: <Scan className="w-6 h-6 text-purple-400" />,
        title: "AI DEEP ANALYSIS",
        desc: "Beyond searching: automated analysis of topology, style, and use cases."
      },
      {
        icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
        title: "SOURCE VERIFIED",
        desc: "Google Search Grounding ensures every download link is verified and active."
      },
      {
        icon: <Zap className="w-6 h-6 text-yellow-400" />,
        title: "PRO MODE",
        desc: "Powered by Gemini 3 Pro for superior precision and advanced reasoning."
      }
    ],
    cta: "INITIALIZE",
    footer: "Advanced Analysis Terminal by YuJunping"
  }
};

const IntroModal: React.FC<IntroModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;
  const t = translations[lang];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-fadeIn" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[3rem] shadow-[0_0_100px_rgba(34,211,238,0.15)] overflow-hidden animate-zoomIn">
        <div className="absolute inset-0 grid-lines opacity-20 pointer-events-none" />
        <div className="scan-line" />
        
        <div className="relative p-8 sm:p-12">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mono">System Update</span>
            </div>
            <h2 className="text-3xl font-brand font-bold text-white mb-2 tracking-tight">{t.title}</h2>
            <p className="text-slate-400 italic mono text-xs tracking-wider uppercase opacity-60">{t.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            {t.features.map((f, i) => (
              <div key={i} className="group p-6 bg-slate-950/50 border border-slate-800/50 rounded-3xl hover:border-cyan-500/30 transition-all">
                <div className="mb-4">{f.icon}</div>
                <h4 className="text-white font-bold mb-2 tracking-tight">{f.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-6">
            <button
              onClick={onClose}
              className="w-full py-5 bg-white hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-2xl tracking-[0.3em] uppercase mono active:scale-95"
            >
              {t.cta}
            </button>
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mono">
              {t.footer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroModal;

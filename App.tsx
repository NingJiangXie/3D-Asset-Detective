
import React, { useState, useMemo, useEffect } from 'react';
import SearchInput from './components/SearchInput';
import ModelCard from './components/ModelCard';
import LoadingState from './components/LoadingState';
import IntroModal from './components/IntroModal';
import { search3DModels } from './services/gemini';
import { SearchState, SearchResponse, Language, ModelData, ModelType, HistoryItem } from './types';
import { 
  Cpu, Filter, Box, Languages, ExternalLink, Loader2, 
  ChevronDown, Activity, Zap, Star, History, Clock, Trash2, X, Info 
} from './components/Icons';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const translations = {
  zh: {
    title: "3D 模型侦探",
    subtitle: "AI 驱动的实时资产分析系统. 智能感知全球 3D 资源。",
    error: "搜索失败。请检查 API Key 或尝试更具体的词汇。",
    keyRequired: "Pro 专家模式需要您选择自己的付费 API Key 以解锁高阶分析能力。",
    selectKey: "配置 API Key",
    filterLabel: "格式筛选:",
    filterAll: "全部",
    startMessage: "输入关键词开始探索...",
    noResults: "未发现有效资源。请尝试更换关键词。",
    sourcesTitle: "数据来源验证 (Google Grounding)",
    searchMore: "加载更多资源",
    searchingMore: "正在分析更多模型...",
    noMore: "已加载所有发现的资源",
    entityNotFound: "API Key 无效或未找到实体，请重新配置。",
    modelFlash: "标准 (Flash)",
    modelPro: "专家 (Pro)",
    modelTip: "Flash 速度快；Pro 分析更精准，需自备 Key。",
    historyTitle: "搜索历史",
    clearHistory: "清空记录",
    emptyHistory: "暂无搜索历史",
    recent: "最近搜索",
    introTip: "功能介绍"
  },
  en: {
    title: "3D Asset Detective",
    subtitle: "AI-driven real-time asset analysis system. Sensing global 3D resources.",
    error: "Search failed. Check your API Key or try a different keyword.",
    keyRequired: "Pro Mode requires your own paid API Key to unlock advanced analysis features.",
    selectKey: "Configure API Key",
    filterLabel: "Filter:",
    filterAll: "All",
    startMessage: "Enter keywords to begin exploring...",
    noResults: "No assets found. Try different keywords.",
    sourcesTitle: "Verified Sources (Google Grounding)",
    searchMore: "Load More Assets",
    searchingMore: "Analyzing more models...",
    noMore: "All discovered assets loaded",
    entityNotFound: "Invalid API Key or entity not found, please reconfigure.",
    modelFlash: "Standard (Flash)",
    modelPro: "Expert (Pro)",
    modelTip: "Flash is faster; Pro is more accurate (Key Required).",
    historyTitle: "Search History",
    clearHistory: "Clear All",
    emptyHistory: "No search history",
    recent: "Recent Searches",
    introTip: "Feature Guide"
  }
};

const STORAGE_KEY = '3d_detective_history';
const INTRO_SHOWN_KEY = '3d_detective_intro_shown';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [modelType, setModelType] = useState<ModelType>('flash');
  const [hasKey, setHasKey] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [state, setState] = useState<SearchState & { isLoadingMore: boolean }>({
    isLoading: false,
    isLoadingMore: false,
    results: [],
    error: null,
    hasSearched: false,
    noMoreResults: false,
  });
  
  const [currentQuery, setCurrentQuery] = useState('');
  const [sources, setSources] = useState<Array<{title: string, uri: string}>>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');

  const t = translations[lang];

  useEffect(() => {
    // Check search history
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    // Check intro auto-open
    const introShown = localStorage.getItem(INTRO_SHOWN_KEY);
    if (!introShown) {
      setShowIntro(true);
      localStorage.setItem(INTRO_SHOWN_KEY, 'true');
    }

    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addToHistory = (query: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      query: query.trim(),
      timestamp: Date.now(),
      modelType
    };

    setHistory(prev => {
      const filtered = prev.filter(item => item.query.toLowerCase() !== query.toLowerCase());
      return [newItem, ...filtered].slice(0, 15);
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const toggleLanguage = () => setLang(prev => prev === 'zh' ? 'en' : 'zh');

  const handleSearch = async (query: string) => {
    if (modelType === 'pro' && window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await handleSelectKey();
    }

    setCurrentQuery(query);
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      results: [], 
      error: null, 
      hasSearched: false,
      noMoreResults: false 
    }));
    setSources([]);
    setSelectedFormat('ALL');
    addToHistory(query);

    try {
      const response: SearchResponse = await search3DModels(query, 12, [], modelType);
      setState(prev => ({
        ...prev,
        isLoading: false,
        results: response.models,
        hasSearched: true,
        error: response.models.length === 0 ? t.noResults : null,
        noMoreResults: response.models.length < 6
      }));
      setSources(response.groundingSources);
    } catch (error: any) {
      console.error("Search Fail:", error);
      let errorMsg = t.error;
      if (error?.message?.includes("Requested entity was not found")) {
        errorMsg = t.entityNotFound;
        setHasKey(false);
      }
      setState(prev => ({ ...prev, isLoading: false, error: errorMsg, hasSearched: true }));
    }
  };

  const handleSearchMore = async () => {
    if (state.isLoadingMore || state.noMoreResults) return;
    setState(prev => ({ ...prev, isLoadingMore: true, error: null }));

    const existingNames = state.results.slice(-30).map(m => m.name.en);

    try {
      const response: SearchResponse = await search3DModels(currentQuery, 6, existingNames, modelType);
      
      if (response.models.length === 0) {
        setState(prev => ({
          ...prev,
          isLoadingMore: false,
          noMoreResults: true
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        isLoadingMore: false,
        results: [...prev.results, ...response.models],
        noMoreResults: response.models.length < 3
      }));
      
      setSources(prev => {
        const existingUris = new Set(prev.map(s => s.uri));
        const newSources = response.groundingSources.filter(s => !existingUris.has(s.uri));
        return [...prev, ...newSources];
      });
    } catch (error: any) {
      console.error("Load More Fail:", error);
      setState(prev => ({ ...prev, isLoadingMore: false }));
    }
  };

  const availableFormats = useMemo(() => {
    const formats = new Set<string>();
    state.results.forEach(model => {
      if (model.format) {
        const parts = model.format.split(/[,/ ]+/);
        parts.forEach(p => {
          const clean = p.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          if (clean && clean.length >= 2 && clean.length < 8) formats.add(clean);
        });
      }
    });
    return Array.from(formats).sort();
  }, [state.results]);

  const filteredModels = useMemo(() => {
    if (selectedFormat === 'ALL') return state.results;
    return state.results.filter(model => 
      model.format && model.format.toUpperCase().includes(selectedFormat)
    );
  }, [state.results, selectedFormat]);

  return (
    <div className={`min-h-screen text-slate-100 selection:bg-cyan-500/30 transition-colors duration-700 ${modelType === 'pro' ? 'bg-[#0a0a16]' : 'bg-[#0f172a]'}`}>
      
      <IntroModal isOpen={showIntro} onClose={() => setShowIntro(false)} lang={lang} />

      {showHistory && (
        <div 
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={() => setShowHistory(false)}
        />
      )}

      <div className={`fixed top-0 right-0 z-[70] h-full w-full max-w-sm bg-slate-950 border-l border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] transition-transform duration-500 ease-out ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white uppercase mono tracking-tech">{t.historyTitle}</h2>
            </div>
            <button 
              onClick={() => setShowHistory(false)}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 opacity-30">
                <Clock className="w-16 h-16 mb-4 text-slate-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mono">{t.emptyHistory}</p>
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setModelType(item.modelType);
                    handleSearch(item.query);
                    setShowHistory(false);
                  }}
                  className="w-full text-left p-5 rounded-[1.5rem] bg-slate-900/40 border border-slate-800 hover:bg-slate-800 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1 text-lg">{item.query}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase mono ${item.modelType === 'pro' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
                      {item.modelType}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-600 flex items-center gap-1.5 mono">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </button>
              ))
            )}
          </div>

          {history.length > 0 && (
            <div className="p-8 border-t border-slate-800 bg-slate-900/20">
              <button 
                onClick={clearHistory}
                className="w-full py-4 flex items-center justify-center gap-2 bg-slate-900/50 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-2xl transition-all border border-slate-800 hover:border-red-500/30 font-black text-xs tracking-[0.2em] uppercase mono"
              >
                <Trash2 className="w-4 h-4" />
                {t.clearHistory}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-black text-white group cursor-default">
            <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors ${modelType === 'pro' ? 'group-hover:border-purple-500/50' : 'group-hover:border-cyan-500/50'}`}>
              <Cpu className={`w-5 h-5 transition-colors ${modelType === 'pro' ? 'text-purple-400' : 'text-cyan-400'}`} />
            </div>
            <span className="hidden sm:inline font-brand text-xl font-bold group-hover:text-cyan-400 transition-colors tracking-tight">{t.title}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowIntro(true)}
              className="p-3 bg-slate-900/50 hover:bg-slate-800 text-slate-500 hover:text-cyan-400 rounded-xl transition-all border border-slate-800 shadow-inner"
              title={t.introTip}
            >
              <Info className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setShowHistory(true)}
              className="p-3 bg-slate-900/50 hover:bg-slate-800 text-slate-500 hover:text-cyan-400 rounded-xl transition-all border border-slate-800 relative shadow-inner"
              title={t.historyTitle}
            >
              <History className="w-5 h-5" />
              {history.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />}
            </button>

            <div className="w-px h-6 bg-slate-800 mx-1" />

            <div className="flex bg-slate-950 p-1.5 rounded-[1.2rem] border border-slate-800 shadow-xl">
              <button 
                onClick={() => setModelType('flash')}
                className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all tracking-[0.15em] uppercase mono ${modelType === 'flash' ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)]' : 'text-slate-600 hover:text-slate-400'}`}
              >
                {t.modelFlash}
              </button>
              <button 
                onClick={() => setModelType('pro')}
                className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all flex items-center gap-2 tracking-[0.15em] uppercase mono ${modelType === 'pro' ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'text-slate-600 hover:text-slate-400'}`}
              >
                {t.modelPro}
                <Star className={`w-2.5 h-2.5 ${modelType === 'pro' ? 'fill-white' : ''}`} />
              </button>
            </div>

            <div className="w-px h-6 bg-slate-800 mx-1" />

            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800 rounded-xl text-[10px] font-black transition-all border border-slate-800 tracking-widest mono"
            >
              <Languages className="w-4 h-4 text-slate-500" />
              {lang === 'zh' ? 'EN' : 'ZH'}
            </button>
          </div>
        </div>
      </div>

      <main className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-slate-900/80 border border-slate-800 mb-8 backdrop-blur-md shadow-2xl">
            <Activity className={`w-3.5 h-3.5 ${modelType === 'pro' ? 'text-purple-400' : 'text-cyan-400'}`} />
            <span className="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase mono">{t.modelTip}</span>
          </div>
          <h1 className={`text-6xl sm:text-8xl lg:text-9xl font-bold mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b transition-all duration-1000 ${modelType === 'pro' ? 'from-white via-white/80 to-purple-500' : 'from-white via-white/90 to-slate-500'}`}>
            {t.title}
          </h1>
          <p className="text-slate-400 max-w-4xl mx-auto text-lg sm:text-xl leading-relaxed tracking-tight opacity-70 font-medium">
            {t.subtitle}
          </p>
        </div>

        {modelType === 'pro' && !hasKey && (
          <div className="max-w-2xl mx-auto mb-20 p-12 bg-purple-500/5 border border-purple-500/20 rounded-[3rem] text-center backdrop-blur-xl shadow-[0_0_80px_rgba(168,85,247,0.1)]">
            <Zap className="w-14 h-14 text-purple-400 mx-auto mb-6 animate-pulse" />
            <p className="text-purple-100/80 mb-8 text-base leading-relaxed font-semibold tracking-wide uppercase">
              {t.keyRequired}
            </p>
            <button 
              onClick={handleSelectKey}
              className="px-12 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-black transition-all shadow-2xl shadow-purple-900/40 tracking-[0.3em] uppercase mono"
            >
              {t.selectKey}
            </button>
          </div>
        )}

        <div className="mb-20">
          <SearchInput onSearch={handleSearch} isLoading={state.isLoading} lang={lang} />
          
          {history.length > 0 && !state.isLoading && !state.hasSearched && (
            <div className="mt-12 flex flex-col items-center gap-6">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.6em] mono">{t.recent}</span>
              <div className="flex flex-wrap justify-center gap-3">
                {history.slice(0, 6).map(item => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setModelType(item.modelType);
                      handleSearch(item.query);
                    }}
                    className="px-6 py-3 bg-slate-900/40 hover:bg-slate-800 border border-slate-800 rounded-2xl text-[11px] font-bold text-slate-500 hover:text-cyan-400 transition-all active:scale-95 shadow-lg tracking-[0.1em] uppercase"
                  >
                    {item.query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {state.isLoading && (
          <div className="space-y-20">
            <LoadingState query={currentQuery} lang={lang} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-2">
              {[...Array(12)].map((_, i) => <ModelCard.Skeleton key={i} />)}
            </div>
          </div>
        )}

        {!state.isLoading && (
          <>
            {state.error && (
              <div className="max-w-3xl mx-auto mb-16 p-8 bg-red-500/5 border border-red-500/20 rounded-[2.5rem] flex items-start gap-6 backdrop-blur-md shadow-2xl animate-shake">
                <Activity className="w-8 h-8 text-red-500 shrink-0" />
                <p className="text-sm text-red-200/80 leading-relaxed font-semibold tracking-wider uppercase italic">{state.error}</p>
              </div>
            )}

            {state.hasSearched && (
              <div className="space-y-16">
                {availableFormats.length > 0 && (
                  <div className="flex items-center gap-5 overflow-x-auto pb-6 custom-scrollbar border-b border-white/5">
                    <div className="flex items-center text-slate-600 text-[9px] font-black uppercase tracking-[0.4em] whitespace-nowrap mono">
                      <Filter className="w-4 h-4 mr-3 text-slate-700" /> {t.filterLabel}
                    </div>
                    <button
                      onClick={() => setSelectedFormat('ALL')}
                      className={`px-6 py-2.5 rounded-2xl text-[10px] font-black transition-all border tracking-[0.2em] uppercase mono ${
                        selectedFormat === 'ALL' ? 'bg-slate-800 text-white border-slate-600 shadow-2xl scale-105' : 'bg-slate-950/40 text-slate-600 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {t.filterAll}
                    </button>
                    {availableFormats.map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setSelectedFormat(fmt)}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black transition-all border tracking-[0.2em] uppercase mono ${
                          selectedFormat === fmt ? (modelType === 'pro' ? 'bg-purple-600 border-purple-400' : 'bg-cyan-600 border-cyan-400') + ' text-white shadow-2xl scale-105' : 'bg-slate-950/40 text-slate-600 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-2">
                  {filteredModels.map((model, index) => (
                    <ModelCard key={`${model.id}-${index}`} model={model} index={index} lang={lang} />
                  ))}
                  
                  {state.isLoadingMore && (
                    [...Array(6)].map((_, i) => <ModelCard.Skeleton key={`skeleton-${i}`} />)
                  )}
                </div>

                {filteredModels.length === 0 && !state.error && !state.isLoadingMore && (
                   <div className="text-center py-32 bg-slate-900/10 rounded-[4rem] border border-dashed border-slate-800/60">
                    <Box className="w-20 h-20 mx-auto mb-8 text-slate-800 opacity-40" />
                    <p className="text-slate-600 font-bold uppercase tracking-widest text-lg">{t.noResults}</p>
                  </div>
                )}

                {state.results.length > 0 && selectedFormat === 'ALL' && !state.isLoadingMore && (
                  <div className="flex flex-col items-center gap-10 py-16">
                    {state.noMoreResults ? (
                      <div className="px-12 py-6 bg-slate-900/30 border border-slate-800 rounded-3xl flex items-center gap-5 shadow-inner">
                        <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mono">{t.noMore}</span>
                        <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse" />
                      </div>
                    ) : (
                      <button
                        onClick={handleSearchMore}
                        className="group relative flex items-center gap-6 px-12 py-6 bg-slate-900/50 hover:bg-slate-800 text-slate-100 rounded-[3rem] border border-slate-800 hover:border-cyan-500/40 transition-all shadow-[0_15px_40px_rgba(0,0,0,0.3)] active:scale-95 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <ChevronDown className={`w-5 h-5 transition-colors group-hover:translate-y-1 duration-300 ${modelType === 'pro' ? 'text-purple-400' : 'text-cyan-400'}`} />
                        <span className="text-lg font-black tracking-[0.15em] uppercase mono">{t.searchMore}</span>
                      </button>
                    )}
                  </div>
                )}

                {sources.length > 0 && (
                  <div className="pt-24 border-t border-white/5">
                    <h3 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.6em] mb-12 mono">
                      {t.sourcesTitle}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {sources.map((s, i) => (
                        <a 
                          key={i} 
                          href={s.uri} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="group p-6 bg-slate-900/30 hover:bg-slate-800/60 rounded-[1.8rem] border border-slate-800 transition-all flex flex-col justify-between h-32 shadow-lg hover:shadow-cyan-900/20"
                        >
                          <span className="text-[13px] font-bold text-slate-300 line-clamp-2 leading-relaxed group-hover:text-cyan-300 transition-colors tracking-tight uppercase">
                            {s.title}
                          </span>
                          <span className="text-[10px] text-slate-600 mono truncate tracking-tighter italic">{s.uri}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!state.hasSearched && (
              <div className="flex flex-col items-center justify-center py-48">
                <Box className={`w-40 h-40 opacity-10 animate-pulse transition-colors duration-1000 ${modelType === 'pro' ? 'text-purple-400' : 'text-slate-600'}`} />
                <p className="text-slate-700 font-black uppercase tracking-[0.8em] text-[10px] mt-12 mono">{t.startMessage}</p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 text-center">
        <p className="text-slate-700 text-[9px] font-black tracking-[0.6em] uppercase mono">
          © 2025 3D ASSET ANALYST · INFRASTRUCTURE BY YuJunping
        </p>
      </footer>
    </div>
  );
};

export default App;

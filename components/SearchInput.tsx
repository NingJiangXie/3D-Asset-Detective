
import React, { useState } from 'react';
import { Search, Loader2, Zap } from './Icons';
import { Language } from '../types';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  lang: Language;
}

const translations = {
  zh: {
    placeholder: "输入扫描参数进行深度分析...",
    button: "执行分析",
    label: "目标资产名称"
  },
  en: {
    placeholder: "Initialize scanning sequence...",
    button: "EXEC ANALYZE",
    label: "TARGET ASSET"
  }
};

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, isLoading, lang }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto relative">
      <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-20 transition-opacity duration-500 ${isFocused ? 'opacity-40' : 'opacity-10'}`} />
      
      <div className="relative glass rounded-2xl p-1.5 flex items-center gap-2 overflow-hidden">
        <div className="pl-5">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />
          ) : (
            <Search className={`h-5 w-5 transition-colors ${isFocused ? 'text-cyan-400' : 'text-slate-500'}`} />
          )}
        </div>
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.placeholder}
            className="block w-full py-5 bg-transparent border-none text-slate-100 placeholder-slate-600 focus:outline-none text-xl font-semibold tracking-wide"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="group relative px-10 py-5 bg-slate-100 hover:bg-cyan-400 text-slate-900 font-black text-[11px] rounded-xl transition-all disabled:opacity-30 disabled:grayscale active:scale-95 flex items-center gap-3 tracking-tech uppercase mono shadow-lg"
        >
          <Zap className={`w-3.5 h-3.5 transition-transform duration-500 ${isFocused ? 'rotate-12' : ''}`} />
          <span>{t.button}</span>
        </button>
      </div>
      
      <div className="mt-4 flex justify-between px-3">
        <span className="text-[10px] font-black text-slate-500/80 uppercase tracking-[0.5em] mono">{t.label}</span>
        <span className="text-[10px] font-black text-cyan-500/60 uppercase tracking-[0.5em] mono animate-pulse">ANALYSIS_STATION_v2.5</span>
      </div>
    </form>
  );
};

export default SearchInput;

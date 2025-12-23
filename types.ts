
export type Language = 'zh' | 'en';
export type ModelType = 'flash' | 'pro';

export interface LocalizedText {
  zh: string;
  en: string;
}

export interface HistoryItem {
  id: string;
  query: string;
  timestamp: number;
  modelType: ModelType;
}

export interface ModelData {
  id: string;
  name: LocalizedText;
  platform: string;
  domain?: string;
  description: LocalizedText;
  visualSummary: LocalizedText;
  downloadUrl: string;
  sourceUri?: string;
  price?: string;
  format?: string;
  qualityScore?: number;
  technicalSpecs?: LocalizedText[];
}

export interface SearchState {
  isLoading: boolean;
  results: ModelData[];
  error: string | null;
  hasSearched: boolean;
  noMoreResults?: boolean;
}

export interface SearchResponse {
  models: ModelData[];
  groundingSources: Array<{
    title: string;
    uri: string;
  }>;
}

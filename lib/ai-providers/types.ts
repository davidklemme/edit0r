export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'vertex-ai'
  | 'azure-openai'
  | 'generic';

export interface ProviderDetectionResult {
  provider: AIProvider;
  confidence: number; // 0-1
  indicators: string[]; // What matched
}

export interface ProviderConfig {
  name: string;
  displayName: string;
  color: string; // For UI theming
  icon?: string;
}

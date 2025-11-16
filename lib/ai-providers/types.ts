export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'vertex-ai'
  | 'azure-openai'
  | 'groq'
  | 'together-ai'
  | 'fireworks'
  | 'anyscale'
  | 'perplexity'
  | 'openrouter'
  | 'replicate'
  | 'local-ai'
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

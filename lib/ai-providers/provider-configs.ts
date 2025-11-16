import type { AIProvider } from './types'

/**
 * Provider visual configuration
 */
export interface ProviderVisualConfig {
  displayName: string
  badgeStyles: string
  editorBorderColor: string
  editorShadow: string
  description: string
}

/**
 * Centralized provider configuration mapping
 * No switch statements - just lookup by provider key
 */
export const PROVIDER_VISUAL_CONFIGS: Record<AIProvider, ProviderVisualConfig> = {
  openai: {
    displayName: 'OpenAI',
    badgeStyles: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    editorBorderColor: 'rgb(34, 197, 94)', // green-500
    editorShadow: '0 0 0 3px rgba(34, 197, 94, 0.1), inset 0 0 100px rgba(34, 197, 94, 0.03)',
    description: 'OpenAI GPT models with function calling',
  },
  anthropic: {
    displayName: 'Anthropic',
    badgeStyles: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    editorBorderColor: 'rgb(249, 115, 22)', // orange-500
    editorShadow: '0 0 0 3px rgba(249, 115, 22, 0.1), inset 0 0 100px rgba(249, 115, 22, 0.03)',
    description: 'Anthropic Claude models with tools',
  },
  'vertex-ai': {
    displayName: 'Vertex AI',
    badgeStyles: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    editorBorderColor: 'rgb(59, 130, 246)', // blue-500
    editorShadow: '0 0 0 3px rgba(59, 130, 246, 0.1), inset 0 0 100px rgba(59, 130, 246, 0.03)',
    description: 'Google Gemini models on Vertex AI',
  },
  'azure-openai': {
    displayName: 'Azure OpenAI',
    badgeStyles: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    editorBorderColor: 'rgb(168, 85, 247)', // purple-500
    editorShadow: '0 0 0 3px rgba(168, 85, 247, 0.1), inset 0 0 100px rgba(168, 85, 247, 0.03)',
    description: 'Azure-hosted OpenAI models',
  },
  groq: {
    displayName: 'Groq',
    badgeStyles: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    editorBorderColor: 'rgb(239, 68, 68)', // red-500
    editorShadow: '0 0 0 3px rgba(239, 68, 68, 0.1), inset 0 0 100px rgba(239, 68, 68, 0.03)',
    description: 'Groq LPU ultra-fast inference',
  },
  'together-ai': {
    displayName: 'Together AI',
    badgeStyles: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    editorBorderColor: 'rgb(20, 184, 166)', // teal-500
    editorShadow: '0 0 0 3px rgba(20, 184, 166, 0.1), inset 0 0 100px rgba(20, 184, 166, 0.03)',
    description: 'Together AI open source models',
  },
  fireworks: {
    displayName: 'Fireworks',
    badgeStyles: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    editorBorderColor: 'rgb(245, 158, 11)', // amber-500
    editorShadow: '0 0 0 3px rgba(245, 158, 11, 0.1), inset 0 0 100px rgba(245, 158, 11, 0.03)',
    description: 'Fireworks high-performance inference',
  },
  anyscale: {
    displayName: 'Anyscale',
    badgeStyles: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    editorBorderColor: 'rgb(6, 182, 212)', // cyan-500
    editorShadow: '0 0 0 3px rgba(6, 182, 212, 0.1), inset 0 0 100px rgba(6, 182, 212, 0.03)',
    description: 'Anyscale Ray-based scaling',
  },
  perplexity: {
    displayName: 'Perplexity',
    badgeStyles: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    editorBorderColor: 'rgb(99, 102, 241)', // indigo-500
    editorShadow: '0 0 0 3px rgba(99, 102, 241, 0.1), inset 0 0 100px rgba(99, 102, 241, 0.03)',
    description: 'Perplexity search-augmented LLMs',
  },
  openrouter: {
    displayName: 'OpenRouter',
    badgeStyles: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
    editorBorderColor: 'rgb(139, 92, 246)', // violet-500
    editorShadow: '0 0 0 3px rgba(139, 92, 246, 0.1), inset 0 0 100px rgba(139, 92, 246, 0.03)',
    description: 'OpenRouter multi-provider gateway',
  },
  replicate: {
    displayName: 'Replicate',
    badgeStyles: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    editorBorderColor: 'rgb(236, 72, 153)', // pink-500
    editorShadow: '0 0 0 3px rgba(236, 72, 153, 0.1), inset 0 0 100px rgba(236, 72, 153, 0.03)',
    description: 'Replicate open source model marketplace',
  },
  'local-ai': {
    displayName: 'LocalAI',
    badgeStyles: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
    editorBorderColor: 'rgb(100, 116, 139)', // slate-500
    editorShadow: '0 0 0 3px rgba(100, 116, 139, 0.1), inset 0 0 100px rgba(100, 116, 139, 0.03)',
    description: 'LocalAI self-hosted OpenAI API',
  },
  generic: {
    displayName: 'Generic',
    badgeStyles: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    editorBorderColor: 'rgb(156, 163, 175)', // gray-400
    editorShadow: '0 0 0 3px rgba(156, 163, 175, 0.05)',
    description: 'Generic JSON configuration',
  },
}

/**
 * Get provider configuration with fallback to generic
 */
export function getProviderConfig(provider: AIProvider): ProviderVisualConfig {
  return PROVIDER_VISUAL_CONFIGS[provider] || PROVIDER_VISUAL_CONFIGS.generic
}

/**
 * Get all supported providers
 */
export function getSupportedProviders(): AIProvider[] {
  return Object.keys(PROVIDER_VISUAL_CONFIGS) as AIProvider[]
}

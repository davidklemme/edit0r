import { AIProvider, ProviderConfig } from './types';

export const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  openai: {
    name: 'openai',
    displayName: 'OpenAI',
    color: '#10a37f',
    icon: '🤖',
  },
  anthropic: {
    name: 'anthropic',
    displayName: 'Anthropic',
    color: '#d97757',
    icon: '🔮',
  },
  'vertex-ai': {
    name: 'vertex-ai',
    displayName: 'Vertex AI',
    color: '#4285f4',
    icon: '🔷',
  },
  'azure-openai': {
    name: 'azure-openai',
    displayName: 'Azure OpenAI',
    color: '#0078d4',
    icon: '☁️',
  },
  groq: {
    name: 'groq',
    displayName: 'Groq',
    color: '#ef4444',
    icon: '⚡',
  },
  'together-ai': {
    name: 'together-ai',
    displayName: 'Together AI',
    color: '#14b8a6',
    icon: '🤝',
  },
  fireworks: {
    name: 'fireworks',
    displayName: 'Fireworks',
    color: '#f59e0b',
    icon: '🎆',
  },
  anyscale: {
    name: 'anyscale',
    displayName: 'Anyscale',
    color: '#06b6d4',
    icon: '☄️',
  },
  perplexity: {
    name: 'perplexity',
    displayName: 'Perplexity',
    color: '#6366f1',
    icon: '🔍',
  },
  openrouter: {
    name: 'openrouter',
    displayName: 'OpenRouter',
    color: '#8b5cf6',
    icon: '🔀',
  },
  replicate: {
    name: 'replicate',
    displayName: 'Replicate',
    color: '#ec4899',
    icon: '🦙',
  },
  'local-ai': {
    name: 'local-ai',
    displayName: 'LocalAI',
    color: '#64748b',
    icon: '🏠',
  },
  generic: {
    name: 'generic',
    displayName: 'Generic',
    color: '#6b7280',
    icon: '📄',
  },
};

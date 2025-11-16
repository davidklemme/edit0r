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
  generic: {
    name: 'generic',
    displayName: 'Generic',
    color: '#6b7280',
    icon: '📄',
  },
};

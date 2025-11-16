import { ProviderDetectionResult } from './types';
import { getLogger } from '../logger';

const logger = getLogger('ProviderDetector');

/**
 * Detects AI provider from config JSON structure
 * Uses pattern matching on common fields
 */
export class ProviderDetector {
  /**
   * Detect provider from config object
   */
  detect(content: string): ProviderDetectionResult {
    logger.debug('Detecting provider from config', {
      contentLength: content.length,
    });

    try {
      const config = JSON.parse(content);
      const result = this.detectFromObject(config);

      logger.info('Provider detected', {
        provider: result.provider,
        confidence: result.confidence,
        indicators: result.indicators,
      });

      return result;
    } catch (error) {
      logger.warn('Invalid JSON - treating as generic', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        provider: 'generic',
        confidence: 1.0,
        indicators: ['Invalid JSON - treating as generic text'],
      };
    }
  }

  private detectFromObject(config: unknown): ProviderDetectionResult {
    // Type guard: ensure config is an object
    if (typeof config !== 'object' || config === null || Array.isArray(config)) {
      return {
        provider: 'generic',
        confidence: 1.0,
        indicators: ['Not a valid config object'],
      };
    }

    const configObj = config as Record<string, unknown>;
    const results: ProviderDetectionResult[] = [
      // Check specific providers first (higher confidence)
      this.detectGroq(configObj),
      this.detectTogetherAI(configObj),
      this.detectFireworks(configObj),
      this.detectAnyscale(configObj),
      this.detectPerplexity(configObj),
      this.detectOpenRouter(configObj),
      this.detectReplicate(configObj),
      this.detectLocalAI(configObj),
      this.detectAnthropic(configObj),
      this.detectVertexAI(configObj),
      this.detectAzureOpenAI(configObj),
      // Check generic OpenAI last (fallback for OpenAI-compatible)
      this.detectOpenAI(configObj),
    ];

    // Sort by confidence, return highest
    results.sort((a, b) => b.confidence - a.confidence);

    const best = results[0];

    // If confidence too low, default to generic
    if (best.confidence < 0.3) {
      return {
        provider: 'generic',
        confidence: 1.0,
        indicators: ['No strong provider signals detected'],
      };
    }

    return best;
  }

  private detectOpenAI(config: Record<string, unknown>): ProviderDetectionResult {
    const indicators: string[] = [];
    let score = 0;

    // Model names
    if (config.model && typeof config.model === 'string') {
      if (config.model.startsWith('gpt-')) {
        indicators.push(`Model: ${config.model}`);
        score += 0.5;
      }
      if (config.model.includes('openai')) {
        indicators.push('OpenAI in model name');
        score += 0.3;
      }
    }

    // Functions field (OpenAI function calling)
    if (Array.isArray(config.functions)) {
      indicators.push('functions array present');
      score += 0.3;

      // Check function structure
      if (config.functions[0]?.parameters) {
        indicators.push('OpenAI function schema structure');
        score += 0.2;
      }
    }

    // function_call field (OpenAI specific)
    if (config.function_call !== undefined) {
      indicators.push('function_call field');
      score += 0.4;
    }

    // response_format (OpenAI specific)
    const responseFormat = config.response_format as Record<string, unknown> | undefined;
    if (responseFormat && typeof responseFormat === 'object' && responseFormat.type === 'json_object') {
      indicators.push('response_format.type = json_object');
      score += 0.2;
    }

    return {
      provider: 'openai',
      confidence: Math.min(score, 1.0),
      indicators,
    };
  }

  private detectAnthropic(config: Record<string, unknown>): ProviderDetectionResult {
    const indicators: string[] = [];
    let score = 0;

    // Model names
    if (config.model && typeof config.model === 'string') {
      if (config.model.startsWith('claude-')) {
        indicators.push(`Model: ${config.model}`);
        score += 0.6;
      }
      if (config.model.includes('anthropic')) {
        indicators.push('Anthropic in model name');
        score += 0.3;
      }
    }

    // Tools field (Anthropic format)
    if (Array.isArray(config.tools)) {
      indicators.push('tools array present');
      score += 0.3;

      // Check for input_schema (Anthropic specific)
      if (config.tools[0]?.input_schema) {
        indicators.push('Anthropic tools schema (input_schema)');
        score += 0.3;
      }
    }

    // tool_choice (Anthropic format)
    if (config.tool_choice !== undefined) {
      indicators.push('tool_choice field');
      score += 0.2;
    }

    // max_tokens (required in Anthropic, optional in OpenAI)
    if (config.max_tokens && !config.max_completion_tokens) {
      indicators.push('max_tokens field (Anthropic style)');
      score += 0.1;
    }

    return {
      provider: 'anthropic',
      confidence: Math.min(score, 1.0),
      indicators,
    };
  }

  private detectVertexAI(config: Record<string, unknown>): ProviderDetectionResult {
    const indicators: string[] = [];
    let score = 0;

    // Model names
    if (config.model && typeof config.model === 'string') {
      if (config.model.includes('gemini')) {
        indicators.push(`Model: ${config.model}`);
        score += 0.6;
      }
      if (config.model.includes('vertex')) {
        indicators.push('Vertex in model name');
        score += 0.3;
      }
    }

    // function_declarations (Vertex AI specific)
    if (Array.isArray(config.function_declarations)) {
      indicators.push('function_declarations array');
      score += 0.5;
    }

    // generation_config (Vertex AI specific)
    if (config.generation_config) {
      indicators.push('generation_config object');
      score += 0.3;
    }

    return {
      provider: 'vertex-ai',
      confidence: Math.min(score, 1.0),
      indicators,
    };
  }

  private detectAzureOpenAI(config: Record<string, unknown>): ProviderDetectionResult {
    const indicators: string[] = [];
    let score = 0;

    // Azure-specific fields
    const apiBase = config.api_base;
    if (config.azure_endpoint || (typeof apiBase === 'string' && apiBase.includes('azure'))) {
      indicators.push('Azure endpoint detected');
      score += 0.6;
    }

    if (config.api_version) {
      indicators.push('api_version field (Azure style)');
      score += 0.2;
    }

    // Deployment name instead of model
    if (config.deployment_id) {
      indicators.push('deployment_id field');
      score += 0.3;
    }

    // If it looks like OpenAI but has Azure indicators
    const openaiResult = this.detectOpenAI(config);
    if (openaiResult.confidence > 0.3 && score > 0) {
      indicators.push(...openaiResult.indicators);
      score += 0.2;
    }

    return {
      provider: 'azure-openai',
      confidence: Math.min(score, 1.0),
      indicators,
    };
  }

  private detectGroq(config: Record<string, unknown>): ProviderDetectionResult {
    const indicators: string[] = [];
    let score = 0;

    // Model names (Groq-specific)
    if (config.model && typeof config.model === 'string') {
      const model = config.model.toLowerCase();
      if (model.includes('llama') || model.includes('mixtral') || model.includes('gemma')) {
        indicators.push(`Model: ${config.model}`);
        score += 0.7;
      }
      if (model.includes('groq')) {
        indicators.push('Groq in model name');
        score += 0.8;
      }
    }

    // Groq uses OpenAI-compatible format
    if (Array.isArray(config.functions) || config.function_call !== undefined) {
      indicators.push('OpenAI-compatible format');
      score += 0.2;
    }

    return {
      provider: 'groq',
      confidence: Math.min(score, 1.0),
      indicators,
    };
  }

  private detectTogetherAI(config: Record<string, unknown>): ProviderDetectionResult {
    const indicators: string[] = [];
    let score = 0;

    // Model names (Together AI patterns)
    if (config.model && typeof config.model === 'string') {
      const model = config.model.toLowerCase();
      if (model.includes('together') || model.includes('togethercomputer')) {
        indicators.push(`Model: ${config.model}`);
        score += 0.8;
      }
      // Common open source models on Together
      if (model.match(/llama.*-chat|mixtral|qwen|dbrx|yi-/)) {
        indicators.push('Open source model');
        score += 0.5;
      }
    }

    // Together uses OpenAI-compatible format
    if (Array.isArray(config.functions)) {
      indicators.push('OpenAI-compatible format');
      score += 0.2;
    }

    return {
      provider: 'together-ai',
      confidence: Math.min(score, 1.0),
      indicators,
    };
  }

  private detectFireworks(config: Record<string, unknown>): ProviderDetectionResult {
    const indicators: string[] = [];
    let score = 0;

    // Model names (Fireworks patterns)
    if (config.model && typeof config.model === 'string') {
      const model = config.model.toLowerCase();
      if (model.includes('fireworks') || model.includes('fw-')) {
        indicators.push(`Model: ${config.model}`);
        score += 0.8;
      }
      if (model.includes('accounts/fireworks')) {
        indicators.push('Fireworks account path');
        score += 0.9;
      }
    }

    // Fireworks uses OpenAI-compatible format
    if (Array.isArray(config.functions)) {
      indicators.push('OpenAI-compatible format');
      score += 0.2;
    }

    return {
      provider: 'fireworks',
      confidence: Math.min(score, 1.0),
      indicators,
    };
  }

  private detectAnyscale(config: Record<string, unknown>): ProviderDetectionResult {
    const indicators: string[] = [];
    let score = 0;

    // Model names (Anyscale patterns)
    if (config.model && typeof config.model === 'string') {
      const model = config.model.toLowerCase();
      if (model.includes('anyscale') || model.includes('ray-')) {
        indicators.push(`Model: ${config.model}`);
        score += 0.8;
      }
      // Anyscale often uses meta-llama prefix
      if (model.includes('meta-llama')) {
        indicators.push('Meta Llama model');
        score += 0.5;
      }
    }

    // Anyscale uses OpenAI-compatible format
    if (Array.isArray(config.functions)) {
      indicators.push('OpenAI-compatible format');
      score += 0.2;
    }

    return {
      provider: 'anyscale',
      confidence: Math.min(score, 1.0),
      indicators,
    };
  }

  private detectPerplexity(config: Record<string, unknown>): ProviderDetectionResult {
    const indicators: string[] = [];
    let score = 0;

    // Model names (Perplexity patterns)
    if (config.model && typeof config.model === 'string') {
      const model = config.model.toLowerCase();
      if (model.includes('pplx') || model.includes('perplexity')) {
        indicators.push(`Model: ${config.model}`);
        score += 0.9;
      }
      // Perplexity models: sonar, codellama
      if (model.includes('sonar')) {
        indicators.push('Perplexity Sonar model');
        score += 0.8;
      }
    }

    // Perplexity uses OpenAI-compatible format
    if (Array.isArray(config.messages)) {
      indicators.push('OpenAI-compatible format');
      score += 0.1;
    }

    return {
      provider: 'perplexity',
      confidence: Math.min(score, 1.0),
      indicators,
    };
  }

  private detectOpenRouter(config: Record<string, unknown>): ProviderDetectionResult {
    const indicators: string[] = [];
    let score = 0;

    // Model names (OpenRouter patterns)
    if (config.model && typeof config.model === 'string') {
      const model = config.model.toLowerCase();
      if (model.includes('openrouter')) {
        indicators.push(`Model: ${config.model}`);
        score += 0.9;
      }
      // OpenRouter uses provider/model format
      if (model.match(/^[a-z-]+\/[a-z0-9-]+/)) {
        indicators.push('Provider/model format');
        score += 0.6;
      }
    }

    // OpenRouter uses OpenAI-compatible format
    if (Array.isArray(config.functions)) {
      indicators.push('OpenAI-compatible format');
      score += 0.1;
    }

    return {
      provider: 'openrouter',
      confidence: Math.min(score, 1.0),
      indicators,
    };
  }

  private detectReplicate(config: Record<string, unknown>): ProviderDetectionResult {
    const indicators: string[] = [];
    let score = 0;

    // Model names (Replicate patterns)
    if (config.model && typeof config.model === 'string') {
      const model = config.model.toLowerCase();
      if (model.includes('replicate')) {
        indicators.push(`Model: ${config.model}`);
        score += 0.8;
      }
      // Replicate uses owner/model:version format
      if (model.match(/[a-z0-9-]+\/[a-z0-9-]+:[a-z0-9]+/)) {
        indicators.push('Replicate owner/model:version format');
        score += 0.9;
      }
    }

    // Replicate may use version field
    if (config.version && typeof config.version === 'string') {
      indicators.push('version field (Replicate style)');
      score += 0.3;
    }

    return {
      provider: 'replicate',
      confidence: Math.min(score, 1.0),
      indicators,
    };
  }

  private detectLocalAI(config: Record<string, unknown>): ProviderDetectionResult {
    const indicators: string[] = [];
    let score = 0;

    // Model names (LocalAI patterns)
    if (config.model && typeof config.model === 'string') {
      const model = config.model.toLowerCase();
      if (model.includes('local') || model.includes('ggml') || model.includes('gguf')) {
        indicators.push(`Model: ${config.model}`);
        score += 0.7;
      }
    }

    // LocalAI specific fields
    const apiBase = config.api_base;
    if (typeof apiBase === 'string') {
      const base = apiBase.toLowerCase();
      if (base.includes('localhost') || base.includes('127.0.0.1') || base.includes('local')) {
        indicators.push('Local endpoint detected');
        score += 0.6;
      }
    }

    // LocalAI uses OpenAI-compatible format
    if (Array.isArray(config.functions)) {
      indicators.push('OpenAI-compatible format');
      score += 0.2;
    }

    return {
      provider: 'local-ai',
      confidence: Math.min(score, 1.0),
      indicators,
    };
  }
}

// Singleton instance
export const providerDetector = new ProviderDetector();

import { ProviderDetectionResult } from './types';

/**
 * Detects AI provider from config JSON structure
 * Uses pattern matching on common fields
 */
export class ProviderDetector {
  /**
   * Detect provider from config object
   */
  detect(content: string): ProviderDetectionResult {
    try {
      const config = JSON.parse(content);
      return this.detectFromObject(config);
    } catch {
      // Invalid JSON, return generic
      return {
        provider: 'generic',
        confidence: 1.0,
        indicators: ['Invalid JSON - treating as generic text'],
      };
    }
  }

  private detectFromObject(config: unknown): ProviderDetectionResult {
    const results: ProviderDetectionResult[] = [
      this.detectOpenAI(config),
      this.detectAnthropic(config),
      this.detectVertexAI(config),
      this.detectAzureOpenAI(config),
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
    if (config.response_format?.type === 'json_object') {
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
    if (config.azure_endpoint || config.api_base?.includes('azure')) {
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
}

// Singleton instance
export const providerDetector = new ProviderDetector();

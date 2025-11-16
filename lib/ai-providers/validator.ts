import type { AIProvider } from './types'

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
  line?: number
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

/**
 * Validates AI config against provider-specific schemas
 */
export class ProviderValidator {
  validate(config: unknown, provider: AIProvider): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []

    // Type guard
    if (typeof config !== 'object' || config === null || Array.isArray(config)) {
      errors.push({
        field: 'root',
        message: 'Config must be a valid JSON object',
        severity: 'error',
      })
      return { valid: false, errors, warnings }
    }

    const configObj = config as Record<string, unknown>

    // Validate based on provider
    switch (provider) {
      case 'openai':
      case 'groq':
      case 'together-ai':
      case 'fireworks':
      case 'anyscale':
      case 'perplexity':
      case 'openrouter':
      case 'local-ai':
        this.validateOpenAICompatible(configObj, provider, errors, warnings)
        break
      case 'anthropic':
        this.validateAnthropic(configObj, errors, warnings)
        break
      case 'vertex-ai':
        this.validateVertexAI(configObj, errors, warnings)
        break
      case 'azure-openai':
        this.validateAzureOpenAI(configObj, errors, warnings)
        break
      case 'replicate':
        this.validateReplicate(configObj, errors, warnings)
        break
      case 'generic':
        // No specific validation for generic
        break
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  private validateOpenAICompatible(
    config: Record<string, unknown>,
    provider: AIProvider,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // Required: model
    if (!config.model) {
      errors.push({
        field: 'model',
        message: 'Missing required field: model',
        severity: 'error',
      })
    } else if (typeof config.model !== 'string') {
      errors.push({
        field: 'model',
        message: 'Field "model" must be a string',
        severity: 'error',
      })
    }

    // Required: messages
    if (!config.messages) {
      errors.push({
        field: 'messages',
        message: 'Missing required field: messages',
        severity: 'error',
      })
    } else if (!Array.isArray(config.messages)) {
      errors.push({
        field: 'messages',
        message: 'Field "messages" must be an array',
        severity: 'error',
      })
    } else {
      // Validate message structure
      config.messages.forEach((msg, index) => {
        if (typeof msg !== 'object' || msg === null) {
          errors.push({
            field: `messages[${index}]`,
            message: 'Message must be an object',
            severity: 'error',
          })
          return
        }

        const message = msg as Record<string, unknown>
        if (!message.role) {
          errors.push({
            field: `messages[${index}].role`,
            message: 'Missing required field: role',
            severity: 'error',
          })
        } else if (!['system', 'user', 'assistant', 'function', 'tool'].includes(message.role as string)) {
          errors.push({
            field: `messages[${index}].role`,
            message: `Invalid role: "${message.role}". Must be system, user, assistant, function, or tool`,
            severity: 'error',
          })
        }

        if (!message.content && !message.function_call && !message.tool_calls) {
          errors.push({
            field: `messages[${index}].content`,
            message: 'Missing required field: content (or function_call/tool_calls)',
            severity: 'error',
          })
        }
      })
    }

    // Provider-specific model validation
    if (config.model && typeof config.model === 'string') {
      const model = config.model.toLowerCase()
      switch (provider) {
        case 'groq':
          if (!model.includes('llama') && !model.includes('mixtral') && !model.includes('gemma')) {
            warnings.push({
              field: 'model',
              message: 'Model name doesn\'t match typical Groq models (llama, mixtral, gemma)',
              severity: 'warning',
            })
          }
          break
        case 'perplexity':
          if (!model.includes('sonar') && !model.includes('pplx')) {
            warnings.push({
              field: 'model',
              message: 'Model name doesn\'t match typical Perplexity models (sonar, pplx)',
              severity: 'warning',
            })
          }
          break
        case 'openrouter':
          if (!model.includes('/')) {
            warnings.push({
              field: 'model',
              message: 'OpenRouter models typically use "provider/model" format',
              severity: 'warning',
            })
          }
          break
      }
    }

    // Optional but common fields
    if (config.temperature !== undefined) {
      if (typeof config.temperature !== 'number') {
        errors.push({
          field: 'temperature',
          message: 'Field "temperature" must be a number',
          severity: 'error',
        })
      } else if (config.temperature < 0 || config.temperature > 2) {
        warnings.push({
          field: 'temperature',
          message: 'Temperature should be between 0 and 2',
          severity: 'warning',
        })
      }
    }

    if (config.max_tokens !== undefined && typeof config.max_tokens !== 'number') {
      errors.push({
        field: 'max_tokens',
        message: 'Field "max_tokens" must be a number',
        severity: 'error',
      })
    }
  }

  private validateAnthropic(
    config: Record<string, unknown>,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // Required: model
    if (!config.model) {
      errors.push({
        field: 'model',
        message: 'Missing required field: model',
        severity: 'error',
      })
    } else if (typeof config.model === 'string' && !config.model.startsWith('claude-')) {
      warnings.push({
        field: 'model',
        message: 'Anthropic models typically start with "claude-"',
        severity: 'warning',
      })
    }

    // Required: max_tokens (Anthropic requires this)
    if (!config.max_tokens) {
      errors.push({
        field: 'max_tokens',
        message: 'Missing required field: max_tokens (required by Anthropic)',
        severity: 'error',
      })
    }

    // Required: messages
    if (!config.messages) {
      errors.push({
        field: 'messages',
        message: 'Missing required field: messages',
        severity: 'error',
      })
    }

    // Tools validation (Anthropic-specific)
    if (config.tools && !Array.isArray(config.tools)) {
      errors.push({
        field: 'tools',
        message: 'Field "tools" must be an array',
        severity: 'error',
      })
    } else if (Array.isArray(config.tools)) {
      config.tools.forEach((tool, index) => {
        if (typeof tool === 'object' && tool !== null) {
          const toolObj = tool as Record<string, unknown>
          if (!toolObj.input_schema) {
            errors.push({
              field: `tools[${index}].input_schema`,
              message: 'Anthropic tools require "input_schema" (not "parameters")',
              severity: 'error',
            })
          }
        }
      })
    }
  }

  private validateVertexAI(
    config: Record<string, unknown>,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // Required: model
    if (!config.model) {
      errors.push({
        field: 'model',
        message: 'Missing required field: model',
        severity: 'error',
      })
    } else if (typeof config.model === 'string' && !config.model.includes('gemini')) {
      warnings.push({
        field: 'model',
        message: 'Vertex AI models typically include "gemini"',
        severity: 'warning',
      })
    }

    // Vertex AI uses "contents" not "messages"
    if (config.messages && !config.contents) {
      warnings.push({
        field: 'contents',
        message: 'Vertex AI uses "contents" field (not "messages")',
        severity: 'warning',
      })
    }

    // Function declarations validation
    if (config.function_declarations && !Array.isArray(config.function_declarations)) {
      errors.push({
        field: 'function_declarations',
        message: 'Field "function_declarations" must be an array',
        severity: 'error',
      })
    }
  }

  private validateAzureOpenAI(
    config: Record<string, unknown>,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // Azure uses deployment_id instead of model sometimes
    if (!config.model && !config.deployment_id) {
      warnings.push({
        field: 'model',
        message: 'Azure OpenAI typically uses "model" or "deployment_id"',
        severity: 'warning',
      })
    }

    // Validate as OpenAI-compatible
    this.validateOpenAICompatible(config, 'azure-openai', errors, warnings)
  }

  private validateReplicate(
    config: Record<string, unknown>,
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    // Required: model (in owner/model:version format)
    if (!config.model) {
      errors.push({
        field: 'model',
        message: 'Missing required field: model',
        severity: 'error',
      })
    } else if (typeof config.model === 'string') {
      if (!config.model.match(/[a-z0-9-]+\/[a-z0-9-]+:[a-z0-9]+/)) {
        warnings.push({
          field: 'model',
          message: 'Replicate models typically use "owner/model:version" format',
          severity: 'warning',
        })
      }
    }
  }
}

// Singleton instance
export const providerValidator = new ProviderValidator()

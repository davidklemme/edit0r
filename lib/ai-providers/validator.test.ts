import { describe, it, expect } from 'vitest';
import { ProviderValidator } from './validator';

describe('ProviderValidator', () => {
  const validator = new ProviderValidator();

  describe('OpenAI-compatible providers', () => {
    it('validates valid OpenAI config', () => {
      const config = {
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
      };

      const result = validator.validate(config, 'openai');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects missing model field', () => {
      const config = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const result = validator.validate(config, 'openai');
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'model',
          message: 'Missing required field: model',
          severity: 'error',
        })
      );
    });

    it('detects missing messages field', () => {
      const config = {
        model: 'gpt-4',
      };

      const result = validator.validate(config, 'openai');
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'messages',
          message: 'Missing required field: messages',
        })
      );
    });

    it('detects invalid message structure', () => {
      const config = {
        model: 'gpt-4',
        messages: [{ content: 'Hello' }], // missing role
      };

      const result = validator.validate(config, 'openai');
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'messages[0].role',
          message: 'Missing required field: role',
        })
      );
    });

    it('detects invalid role value', () => {
      const config = {
        model: 'gpt-4',
        messages: [{ role: 'invalid', content: 'Hello' }],
      };

      const result = validator.validate(config, 'openai');
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Invalid role');
    });

    it('warns about temperature out of range', () => {
      const config = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 5,
      };

      const result = validator.validate(config, 'openai');
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'temperature',
          message: 'Temperature should be between 0 and 2',
          severity: 'warning',
        })
      );
    });

    it('validates Groq-specific models', () => {
      const config = {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const result = validator.validate(config, 'groq');
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('warns about non-Groq model for Groq provider', () => {
      const config = {
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const result = validator.validate(config, 'groq');
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'model',
          message: expect.stringContaining('Groq models'),
        })
      );
    });

    it('validates Perplexity sonar models', () => {
      const config = {
        model: 'sonar-pro',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const result = validator.validate(config, 'perplexity');
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('validates OpenRouter provider/model format', () => {
      const config = {
        model: 'anthropic/claude-3-5-sonnet',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const result = validator.validate(config, 'openrouter');
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Anthropic validation', () => {
    it('validates valid Anthropic config', () => {
      const config = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const result = validator.validate(config, 'anthropic');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('requires max_tokens for Anthropic', () => {
      const config = {
        model: 'claude-3-5-sonnet-20241022',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const result = validator.validate(config, 'anthropic');
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'max_tokens',
          message: 'Missing required field: max_tokens (required by Anthropic)',
        })
      );
    });

    it('validates tools with input_schema', () => {
      const config = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hello' }],
        tools: [
          {
            name: 'get_weather',
            input_schema: {
              type: 'object',
              properties: {
                location: { type: 'string' },
              },
            },
          },
        ],
      };

      const result = validator.validate(config, 'anthropic');
      expect(result.valid).toBe(true);
    });

    it('detects missing input_schema in tools', () => {
      const config = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hello' }],
        tools: [
          {
            name: 'get_weather',
            parameters: { type: 'object' }, // Wrong field name
          },
        ],
      };

      const result = validator.validate(config, 'anthropic');
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'tools[0].input_schema',
          message: 'Anthropic tools require "input_schema" (not "parameters")',
        })
      );
    });

    it('warns about non-Claude model', () => {
      const config = {
        model: 'gpt-4',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const result = validator.validate(config, 'anthropic');
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'model',
          message: expect.stringContaining('claude-'),
        })
      );
    });
  });

  describe('Vertex AI validation', () => {
    it('validates valid Vertex AI config', () => {
      const config = {
        model: 'gemini-pro',
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Hello' }],
          },
        ],
      };

      const result = validator.validate(config, 'vertex-ai');
      expect(result.valid).toBe(true);
    });

    it('warns about using messages instead of contents', () => {
      const config = {
        model: 'gemini-pro',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const result = validator.validate(config, 'vertex-ai');
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'contents',
          message: 'Vertex AI uses "contents" field (not "messages")',
        })
      );
    });

    it('warns about non-Gemini model', () => {
      const config = {
        model: 'gpt-4',
        contents: [],
      };

      const result = validator.validate(config, 'vertex-ai');
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'model',
          message: expect.stringContaining('gemini'),
        })
      );
    });
  });

  describe('Replicate validation', () => {
    it('validates owner/model:version format', () => {
      const config = {
        model: 'meta/llama-2-70b:abc123',
      };

      const result = validator.validate(config, 'replicate');
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('warns about incorrect format', () => {
      const config = {
        model: 'llama-2-70b',
      };

      const result = validator.validate(config, 'replicate');
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'model',
          message: expect.stringContaining('owner/model:version'),
        })
      );
    });
  });

  describe('Edge cases', () => {
    it('handles invalid config type', () => {
      const result = validator.validate('not an object', 'openai');
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'root',
          message: 'Config must be a valid JSON object',
        })
      );
    });

    it('handles null config', () => {
      const result = validator.validate(null, 'openai');
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('root');
    });

    it('handles array config', () => {
      const result = validator.validate([], 'openai');
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('root');
    });

    it('skips validation for generic provider', () => {
      const config = { anything: 'goes' };
      const result = validator.validate(config, 'generic');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Complex validation scenarios', () => {
    it('validates multiple errors in single config', () => {
      const config = {
        messages: 'not-an-array',
        temperature: 10,
      };

      const result = validator.validate(config, 'openai');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'model' })
      );
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'messages' })
      );
    });

    it('validates messages array with mixed valid/invalid entries', () => {
      const config = {
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'Valid message' },
          { role: 'invalid-role', content: 'Invalid role' },
          { content: 'Missing role' },
        ],
      };

      const result = validator.validate(config, 'openai');
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'messages[1].role' })
      );
      expect(result.errors).toContainEqual(
        expect.objectContaining({ field: 'messages[2].role' })
      );
    });

    it('handles function_call and tool_calls in messages', () => {
      const config = {
        model: 'gpt-4',
        messages: [
          { role: 'assistant', function_call: { name: 'test' } }, // Valid
          { role: 'assistant', tool_calls: [] }, // Valid
        ],
      };

      const result = validator.validate(config, 'openai');
      expect(result.valid).toBe(true);
    });
  });
});

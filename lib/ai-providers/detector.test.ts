import { describe, it, expect } from 'vitest';
import { ProviderDetector } from './detector';

describe('ProviderDetector', () => {
  const detector = new ProviderDetector();

  describe('OpenAI Detection', () => {
    it('detects OpenAI from gpt-4 model', () => {
      const config = JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('openai');
      expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      expect(result.indicators).toContain('Model: gpt-4');
    });

    it('detects OpenAI from function calling schema', () => {
      const config = JSON.stringify({
        model: 'gpt-4',
        functions: [
          {
            name: 'get_weather',
            parameters: {
              type: 'object',
              properties: {
                location: { type: 'string' },
              },
            },
          },
        ],
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('openai');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.indicators).toContain('functions array present');
      expect(result.indicators).toContain('OpenAI function schema structure');
    });

    it('detects OpenAI from function_call field', () => {
      const config = JSON.stringify({
        model: 'gpt-3.5-turbo',
        function_call: 'auto',
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('openai');
      expect(result.indicators).toContain('function_call field');
    });

    it('detects OpenAI from response_format', () => {
      const config = JSON.stringify({
        model: 'gpt-4',
        response_format: { type: 'json_object' },
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('openai');
      expect(result.indicators).toContain('response_format.type = json_object');
    });
  });

  describe('Anthropic Detection', () => {
    it('detects Anthropic from claude model', () => {
      const config = JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hello' }],
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('anthropic');
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.indicators).toContain('Model: claude-3-opus-20240229');
    });

    it('detects Anthropic from tools schema', () => {
      const config = JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        tools: [
          {
            name: 'get_weather',
            description: 'Get weather',
            input_schema: {
              type: 'object',
              properties: {
                location: { type: 'string' },
              },
            },
          },
        ],
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('anthropic');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.indicators).toContain('tools array present');
      expect(result.indicators).toContain('Anthropic tools schema (input_schema)');
    });

    it('detects Anthropic from tool_choice field', () => {
      const config = JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        tool_choice: { type: 'auto' },
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('anthropic');
      expect(result.indicators).toContain('tool_choice field');
    });
  });

  describe('Vertex AI Detection', () => {
    it('detects Vertex AI from gemini model', () => {
      const config = JSON.stringify({
        model: 'gemini-pro',
        generation_config: {
          temperature: 0.7,
        },
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('vertex-ai');
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.indicators).toContain('Model: gemini-pro');
    });

    it('detects Vertex AI from function_declarations', () => {
      const config = JSON.stringify({
        model: 'gemini-pro',
        function_declarations: [
          {
            name: 'get_weather',
            description: 'Get weather',
            parameters: {
              type: 'object',
            },
          },
        ],
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('vertex-ai');
      expect(result.indicators).toContain('function_declarations array');
    });
  });

  describe('Azure OpenAI Detection', () => {
    it('detects Azure OpenAI from azure_endpoint', () => {
      const config = JSON.stringify({
        azure_endpoint: 'https://my-resource.openai.azure.com',
        model: 'gpt-4',
        api_version: '2024-02-01',
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('azure-openai');
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.indicators).toContain('Azure endpoint detected');
    });

    it('detects Azure OpenAI from deployment_id', () => {
      const config = JSON.stringify({
        deployment_id: 'my-gpt-4-deployment',
        api_version: '2024-02-01',
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('azure-openai');
      expect(result.indicators).toContain('deployment_id field');
    });
  });

  describe('Generic Detection', () => {
    it('returns generic for unknown config', () => {
      const config = JSON.stringify({
        some_field: 'value',
        another_field: 123,
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('generic');
      expect(result.confidence).toBe(1.0);
    });

    it('returns generic for invalid JSON', () => {
      const config = '{invalid json}';

      const result = detector.detect(config);

      expect(result.provider).toBe('generic');
      expect(result.indicators).toContain('Invalid JSON - treating as generic text');
    });

    it('returns generic for low confidence matches', () => {
      const config = JSON.stringify({
        // Only one weak indicator
        max_tokens: 100,
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('generic');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty object', () => {
      const config = JSON.stringify({});

      const result = detector.detect(config);

      expect(result.provider).toBe('generic');
    });

    it('handles empty string', () => {
      const result = detector.detect('');

      expect(result.provider).toBe('generic');
    });

    it('prioritizes higher confidence provider', () => {
      // Config with both OpenAI and weak Anthropic signals
      const config = JSON.stringify({
        model: 'gpt-4', // Strong OpenAI signal
        max_tokens: 100, // Weak Anthropic signal
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('openai');
    });

    it('detects complex real-world OpenAI config', () => {
      const config = JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What is the weather?' },
        ],
        functions: [
          {
            name: 'get_weather',
            description: 'Get the current weather for a location',
            parameters: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'City name',
                },
                unit: {
                  type: 'string',
                  enum: ['celsius', 'fahrenheit'],
                },
              },
              required: ['location'],
            },
          },
        ],
        function_call: 'auto',
        temperature: 0.7,
        max_tokens: 1000,
      });

      const result = detector.detect(config);

      expect(result.provider).toBe('openai');
      expect(result.confidence).toBeGreaterThan(0.9);
    });
  });
});

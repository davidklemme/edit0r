/**
 * Demo script showing how AI provider detection works
 * Run with: npx tsx examples/demo-detection.ts
 */

import { providerDetector } from '../lib/ai-providers';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 AI Provider Detection Demo\n');

// Example configs directory
const examplesDir = join(__dirname, 'ai-configs');

const examples = [
  {
    name: 'OpenAI Function Calling',
    file: 'openai-function-calling.json',
    description: 'OpenAI GPT-4 with function calling for weather',
  },
  {
    name: 'Anthropic Claude Tools',
    file: 'anthropic-tools.json',
    description: 'Claude 3.5 Sonnet with tools',
  },
  {
    name: 'Vertex AI Gemini',
    file: 'vertex-ai-gemini.json',
    description: 'Google Gemini Pro with function declarations',
  },
  {
    name: 'Azure OpenAI',
    file: 'azure-openai.json',
    description: 'Azure-hosted GPT-4',
  },
];

examples.forEach((example, index) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Example ${index + 1}: ${example.name}`);
  console.log(`Description: ${example.description}`);
  console.log('='.repeat(60));

  const filePath = join(examplesDir, example.file);
  const content = readFileSync(filePath, 'utf-8');

  // Run detection
  const result = providerDetector.detect(content);

  console.log('\n📊 Detection Result:');
  console.log(`   Provider: ${result.provider.toUpperCase()}`);
  console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  console.log(`   Indicators:`);
  result.indicators.forEach((indicator) => {
    console.log(`     ✓ ${indicator}`);
  });

  // Show snippet of config
  const preview = JSON.parse(content);
  console.log('\n📝 Config Preview:');
  console.log(`   Model: ${preview.model || 'N/A'}`);
  console.log(
    `   Has Functions/Tools: ${!!(preview.functions || preview.tools || preview.function_declarations)}`
  );
});

console.log('\n' + '='.repeat(60));
console.log('✨ Detection Complete!\n');

// Example: Testing with invalid JSON
console.log('Testing edge case: Invalid JSON');
console.log('='.repeat(60));
const invalidResult = providerDetector.detect('{invalid json}');
console.log(`Provider: ${invalidResult.provider}`);
console.log(`Confidence: ${(invalidResult.confidence * 100).toFixed(0)}%`);
console.log(`Indicators: ${invalidResult.indicators.join(', ')}`);

console.log('\n💡 How it works:');
console.log('1. Pattern matching on JSON structure');
console.log('2. Checks model names (gpt-*, claude-*, gemini-*)');
console.log('3. Looks for provider-specific fields:');
console.log('   - OpenAI: functions, function_call, response_format');
console.log('   - Anthropic: tools (with input_schema), tool_choice, max_tokens required');
console.log('   - Vertex AI: function_declarations, generation_config');
console.log('   - Azure: azure_endpoint, deployment_id, api_version');
console.log('4. Scores confidence based on number of matching indicators');
console.log('5. Returns highest confidence match (or "generic" if < 30%)');

#!/usr/bin/env node
/**
 * Test script for AI provider detection
 * Run with: node scripts/test-detection.js
 */

const fs = require('fs');
const path = require('path');

// Since we can't import TS directly, we'll inline a simple detector for testing
function detectProvider(content) {
  console.log('\n🔍 Starting detection...');
  console.log(`📏 Content length: ${content.length} characters`);

  let config;
  try {
    config = JSON.parse(content);
    console.log('✅ Valid JSON parsed');
  } catch (e) {
    console.log('❌ Invalid JSON:', e.message);
    return {
      provider: 'generic',
      confidence: 1.0,
      indicators: ['Invalid JSON - treating as generic text']
    };
  }

  const results = {
    openai: detectOpenAI(config),
    anthropic: detectAnthropic(config),
    vertexAI: detectVertexAI(config),
    azureOpenAI: detectAzureOpenAI(config)
  };

  console.log('\n📊 Detection Scores:');
  Object.entries(results).forEach(([provider, result]) => {
    console.log(`   ${provider}: ${(result.confidence * 100).toFixed(0)}% confidence`);
    if (result.indicators.length > 0) {
      result.indicators.forEach(ind => console.log(`      - ${ind}`));
    }
  });

  // Find highest confidence
  const sorted = Object.entries(results).sort((a, b) => b[1].confidence - a[1].confidence);
  const best = sorted[0][1];

  if (best.confidence < 0.3) {
    console.log('\n⚠️  Low confidence, returning generic');
    return {
      provider: 'generic',
      confidence: 1.0,
      indicators: ['No strong provider signals detected']
    };
  }

  return best;
}

function detectOpenAI(config) {
  const indicators = [];
  let score = 0;

  console.log('\n🔎 Checking OpenAI patterns...');

  if (config.model && typeof config.model === 'string') {
    if (config.model.startsWith('gpt-')) {
      indicators.push(`Model: ${config.model}`);
      score += 0.5;
      console.log(`   ✓ Found GPT model: ${config.model}`);
    }
  }

  if (Array.isArray(config.functions)) {
    indicators.push('functions array present');
    score += 0.3;
    console.log(`   ✓ Found functions array (${config.functions.length} functions)`);

    if (config.functions[0]?.parameters) {
      indicators.push('OpenAI function schema structure');
      score += 0.2;
      console.log('   ✓ Functions have parameters (OpenAI schema)');
    }
  }

  if (config.function_call !== undefined) {
    indicators.push('function_call field');
    score += 0.4;
    console.log(`   ✓ Found function_call: ${config.function_call}`);
  }

  if (config.response_format?.type === 'json_object') {
    indicators.push('response_format.type = json_object');
    score += 0.2;
    console.log('   ✓ Found response_format JSON mode');
  }

  return { provider: 'openai', confidence: Math.min(score, 1.0), indicators };
}

function detectAnthropic(config) {
  const indicators = [];
  let score = 0;

  console.log('\n🔎 Checking Anthropic patterns...');

  if (config.model && typeof config.model === 'string') {
    if (config.model.startsWith('claude-')) {
      indicators.push(`Model: ${config.model}`);
      score += 0.6;
      console.log(`   ✓ Found Claude model: ${config.model}`);
    }
  }

  if (Array.isArray(config.tools)) {
    indicators.push('tools array present');
    score += 0.3;
    console.log(`   ✓ Found tools array (${config.tools.length} tools)`);

    if (config.tools[0]?.input_schema) {
      indicators.push('Anthropic tools schema (input_schema)');
      score += 0.3;
      console.log('   ✓ Tools have input_schema (Anthropic format)');
    }
  }

  if (config.tool_choice !== undefined) {
    indicators.push('tool_choice field');
    score += 0.2;
    console.log(`   ✓ Found tool_choice: ${JSON.stringify(config.tool_choice)}`);
  }

  if (config.max_tokens && !config.max_completion_tokens) {
    indicators.push('max_tokens field (Anthropic style)');
    score += 0.1;
    console.log('   ✓ Found max_tokens (required in Anthropic)');
  }

  return { provider: 'anthropic', confidence: Math.min(score, 1.0), indicators };
}

function detectVertexAI(config) {
  const indicators = [];
  let score = 0;

  console.log('\n🔎 Checking Vertex AI patterns...');

  if (config.model && typeof config.model === 'string') {
    if (config.model.includes('gemini')) {
      indicators.push(`Model: ${config.model}`);
      score += 0.6;
      console.log(`   ✓ Found Gemini model: ${config.model}`);
    }
  }

  if (Array.isArray(config.function_declarations)) {
    indicators.push('function_declarations array');
    score += 0.5;
    console.log(`   ✓ Found function_declarations (${config.function_declarations.length} functions)`);
  }

  if (config.generation_config) {
    indicators.push('generation_config object');
    score += 0.3;
    console.log('   ✓ Found generation_config');
  }

  return { provider: 'vertex-ai', confidence: Math.min(score, 1.0), indicators };
}

function detectAzureOpenAI(config) {
  const indicators = [];
  let score = 0;

  console.log('\n🔎 Checking Azure OpenAI patterns...');

  if (config.azure_endpoint || config.api_base?.includes('azure')) {
    indicators.push('Azure endpoint detected');
    score += 0.6;
    console.log(`   ✓ Found Azure endpoint: ${config.azure_endpoint || config.api_base}`);
  }

  if (config.api_version) {
    indicators.push('api_version field (Azure style)');
    score += 0.2;
    console.log(`   ✓ Found api_version: ${config.api_version}`);
  }

  if (config.deployment_id) {
    indicators.push('deployment_id field');
    score += 0.3;
    console.log(`   ✓ Found deployment_id: ${config.deployment_id}`);
  }

  return { provider: 'azure-openai', confidence: Math.min(score, 1.0), indicators };
}

// Test all example configs
console.log('🧪 AI Provider Detection - Backend Test\n');
console.log('='.repeat(70));

const examplesDir = path.join(__dirname, '../examples/ai-configs');
const examples = [
  'openai-function-calling.json',
  'anthropic-tools.json',
  'vertex-ai-gemini.json',
  'azure-openai.json'
];

examples.forEach((filename, index) => {
  console.log(`\n\n${'='.repeat(70)}`);
  console.log(`TEST ${index + 1}: ${filename}`);
  console.log('='.repeat(70));

  const filepath = path.join(examplesDir, filename);
  const content = fs.readFileSync(filepath, 'utf-8');

  const result = detectProvider(content);

  console.log('\n\n🎯 FINAL RESULT:');
  console.log(`   Provider: ${result.provider.toUpperCase()}`);
  console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`);
  console.log(`   Indicators:`);
  result.indicators.forEach(ind => {
    console.log(`      ✓ ${ind}`);
  });
});

console.log('\n\n' + '='.repeat(70));
console.log('✨ All tests complete!\n');

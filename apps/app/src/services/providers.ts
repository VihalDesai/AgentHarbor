import type { ModelSettings, ProviderId } from '@/model/types';

export const DEFAULT_PROVIDER_ID: ProviderId = 'openai';

export type ProviderPreset = {
  id: ProviderId;
  name: string;
  description: string;
  endpoint: string;
  model: string;
  keyRequired: boolean;
  protocol: 'openai' | 'anthropic' | 'gemini';
};

export const providerPresets: ProviderPreset[] = [
  { id: 'openai', name: 'OpenAI', description: 'GPT models', endpoint: 'https://api.openai.com/v1', model: 'gpt-4.1-mini', keyRequired: true, protocol: 'openai' },
  { id: 'anthropic', name: 'Anthropic', description: 'Claude models', endpoint: 'https://api.anthropic.com/v1', model: 'claude-3-5-haiku-latest', keyRequired: true, protocol: 'anthropic' },
  { id: 'gemini', name: 'Google Gemini', description: 'Gemini models', endpoint: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-2.5-flash', keyRequired: true, protocol: 'gemini' },
  { id: 'openrouter', name: 'OpenRouter', description: 'Multiple model providers', endpoint: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4.1-mini', keyRequired: true, protocol: 'openai' },
  { id: 'groq', name: 'Groq', description: 'Fast hosted inference', endpoint: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile', keyRequired: true, protocol: 'openai' },
  { id: 'deepseek', name: 'DeepSeek', description: 'DeepSeek chat models', endpoint: 'https://api.deepseek.com/v1', model: 'deepseek-chat', keyRequired: true, protocol: 'openai' },
  { id: 'ollama', name: 'Ollama', description: 'Local models on your network', endpoint: 'http://localhost:11434/v1', model: 'qwen3:8b', keyRequired: false, protocol: 'openai' },
  { id: 'custom', name: 'Custom compatible API', description: 'Any OpenAI-compatible endpoint', endpoint: '', model: '', keyRequired: true, protocol: 'openai' },
];

export function isProviderId(value: unknown): value is ProviderId {
  return typeof value === 'string' && providerPresets.some((provider) => provider.id === value);
}

export function presetFor(id: ProviderId) {
  return providerPresets.find((provider) => provider.id === id) ?? providerPresets[0];
}

export function normalizeModelSettings(value: Partial<ModelSettings> | undefined): ModelSettings {
  const provider = isProviderId(value?.provider) ? value.provider : DEFAULT_PROVIDER_ID;
  const preset = presetFor(provider);
  return {
    provider,
    endpoint: typeof value?.endpoint === 'string' && value.endpoint.length <= 2048 ? value.endpoint : preset.endpoint,
    model: typeof value?.model === 'string' && value.model.length <= 256 ? value.model : preset.model,
  };
}

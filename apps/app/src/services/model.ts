import type { ModelSettings } from '@/model/types';
import { presetFor } from '@/services/providers';
import { getApiKey } from '@/services/credentials';

type ModelReply = { text: string; source: 'local' | 'provider' | 'preview' };

export async function askLocalModel(settings: ModelSettings, system: string, prompt: string): Promise<ModelReply> {
  const provider = presetFor(settings.provider);
  const desktop = (globalThis as typeof globalThis & { agentHarbor?: { complete: (payload: { settings: ModelSettings; system: string; prompt: string }) => Promise<string> } }).agentHarbor;
  if (desktop) {
    try { return { text: await desktop.complete({ settings, system, prompt }), source: settings.provider === 'ollama' ? 'local' : 'provider' }; }
    catch (error) { return { text: `Could not reach ${provider.name}. Check the provider settings and try again. ${safeError(error)}`, source: 'preview' }; }
  }

  const key = provider.keyRequired ? await getApiKey(settings.provider) : null;
  if (provider.keyRequired && !key) return { text: `Add an API key for ${provider.name} in Settings to enable live replies. This conversation is still saved on this device.`, source: 'preview' };

  const endpoint = settings.endpoint.trim().replace(/\/$/, '');
  if (!endpoint) return { text: 'Add a provider endpoint in Settings to enable live replies.', source: 'preview' };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = provider.protocol === 'anthropic'
      ? await fetch(`${endpoint}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': key ?? '', 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: settings.model, max_tokens: 2048, system, messages: [{ role: 'user', content: prompt }] }), signal: controller.signal })
      : provider.protocol === 'gemini'
        ? await fetch(`${endpoint}/models/${encodeURIComponent(settings.model)}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key ?? '' }, body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }] }), signal: controller.signal })
        : await fetch(`${endpoint}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify({ model: settings.model, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }], stream: false }), signal: controller.signal });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    const result = await response.json();
    const text = provider.protocol === 'anthropic'
      ? result?.content?.find((part: { type?: string }) => part.type === 'text')?.text
      : provider.protocol === 'gemini'
        ? result?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('')
        : result?.choices?.[0]?.message?.content;
    if (typeof text === 'string' && text.trim()) return { text: text.trim(), source: settings.provider === 'ollama' ? 'local' : 'provider' };
    throw new Error('Provider returned an empty response');
  } catch (error) {
    return { text: `Could not reach ${provider.name}. Check the provider settings and try again. ${safeError(error)}`, source: 'preview' };
  } finally {
    clearTimeout(timeout);
  }
}

function safeError(error: unknown) {
  if (error instanceof Error && error.name === 'AbortError') return 'The request timed out.';
  if (error instanceof Error && error.message.startsWith('Add an API key')) return error.message;
  return '';
}

import type { ModelSettings, ModelTurn } from '@/model/types';
import { isProviderId, openAICompatibleEndpoint, presetFor } from '@/services/providers';
import { getApiKey } from '@/services/credentials';

type ModelReply = { text: string; source: 'local' | 'provider' | 'preview' };

export async function askLocalModel(settings: ModelSettings, system: string, prompt: string | ModelTurn[]): Promise<ModelReply> {
  if (!isProviderId(settings.provider)) return { text: 'Choose a supported provider in Settings. Ollama is never selected automatically.', source: 'preview' };
  const provider = presetFor(settings.provider);
  const turns = (typeof prompt === 'string' ? [{ role: 'user' as const, content: prompt }] : prompt)
    .filter((turn): turn is ModelTurn => (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string')
    .slice(-20)
    .map((turn) => ({ ...turn, content: turn.content.slice(-8000) }));
  if (!turns.length) return { text: 'Enter a message to start the conversation.', source: 'preview' };
  const desktop = (globalThis as typeof globalThis & { agentHarbor?: { complete: (payload: { settings: ModelSettings; system: string; prompt: string | ModelTurn[] }) => Promise<string> } }).agentHarbor;
  if (desktop) {
    try { return { text: await desktop.complete({ settings, system, prompt: turns }), source: settings.provider === 'ollama' ? 'local' : 'provider' }; }
    catch (error) { return { text: `Could not reach ${provider.name}. ${safeError(error, false)}`, source: 'preview' }; }
  }

  const key = provider.keyRequired ? await getApiKey(settings.provider) : null;
  if (provider.keyRequired && !key) return { text: `No API key is saved for ${provider.name}. Add one in Settings → Providers & API to enable live replies. This conversation is still saved on this device.`, source: 'preview' };

  const endpoint = settings.endpoint.trim().replace(/\/$/, '');
  if (!endpoint) return { text: 'Add a provider endpoint in Settings to enable live replies.', source: 'preview' };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const parsedEndpoint = new URL(endpoint);
    if (parsedEndpoint.username || parsedEndpoint.password) throw new Error('Remove credentials from the endpoint URL and add the API key in secure settings.');
    if (parsedEndpoint.protocol !== 'https:' && parsedEndpoint.protocol !== 'http:') throw new Error('Use an HTTP or HTTPS provider endpoint.');
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(parsedEndpoint.hostname);
    if (key && parsedEndpoint.protocol !== 'https:' && !loopback) throw new Error('Use HTTPS for any endpoint that receives an API key.');
    const response = provider.protocol === 'anthropic'
      ? await fetch(`${endpoint}/messages`, { method: 'POST', redirect: 'error', headers: { 'Content-Type': 'application/json', 'x-api-key': key ?? '', 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: settings.model, max_tokens: 2048, system, messages: turns }), signal: controller.signal })
      : provider.protocol === 'gemini'
        ? await fetch(`${endpoint}/models/${encodeURIComponent(settings.model)}:generateContent`, { method: 'POST', redirect: 'error', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key ?? '' }, body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: turns.map((turn) => ({ role: turn.role === 'assistant' ? 'model' : 'user', parts: [{ text: turn.content }] })) }), signal: controller.signal })
        : await fetch(openAICompatibleEndpoint(endpoint), { method: 'POST', redirect: 'error', headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify({ model: settings.model, messages: [{ role: 'system', content: system }, ...turns], stream: false }), signal: controller.signal });
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
    return { text: `Could not reach ${provider.name}. ${safeError(error, true)}`, source: 'preview' };
  } finally {
    clearTimeout(timeout);
  }
}

function safeError(error: unknown, browserRequest: boolean) {
  if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) return 'The request timed out.';
  if (error instanceof Error && error.message.startsWith('Add an API key')) return error.message;
  if (error instanceof Error && (error.message.includes('HTTPS') || error.message.includes('HTTP or HTTPS') || error.message.includes('endpoint URL'))) return error.message;
  const status = error instanceof Error ? error.message.match(/(?:Provider|Model server) returned (\d{3})/)?.[1] : undefined;
  if (status === '401') return 'The provider rejected this API key. Check that it belongs to the selected provider.';
  if (status === '403') return 'The provider denied this request. Check the API key permissions and model access.';
  if (status === '404') return 'The model or endpoint was not found. Check the provider settings.';
  if (status === '429') return 'The provider rate limit was reached. Wait a moment, then try again.';
  const cause = error instanceof Error ? (error as Error & { cause?: { code?: string } }).cause : undefined;
  const code = cause?.code ?? (error instanceof Error ? (error as Error & { code?: string }).code : undefined);
  if (code === 'ECONNREFUSED') return 'The endpoint refused the connection. Check its host, port, and API path.';
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') return 'The endpoint host could not be found. Check the URL and network connection.';
  if (code === 'ETIMEDOUT' || code === 'ECONNRESET') return 'The network connection timed out or closed. Check the endpoint and try again.';
  if (typeof code === 'string' && (code.startsWith('ERR_TLS') || code.startsWith('CERT_'))) return 'The endpoint’s TLS certificate could not be verified. Check its HTTPS certificate.';
  if (error instanceof TypeError) return browserRequest
    ? 'The browser could not reach this endpoint. It may block requests from browser apps (CORS); use the desktop or Android app, or an endpoint that allows this browser origin.'
    : 'Check the endpoint host, network connection, and provider availability.';
  return 'Check the endpoint URL, model name, API key, and network connection.';
}

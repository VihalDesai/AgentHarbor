import type { ModelSettings } from '@/model/types';

export async function askLocalModel(settings: ModelSettings, system: string, prompt: string): Promise<{ text: string; local: boolean }> {
  const desktopBridge = (globalThis as typeof globalThis & { agentHarbor?: { complete: (payload: { settings: ModelSettings; system: string; prompt: string }) => Promise<string> } }).agentHarbor;
  if (desktopBridge) {
    try { return { text: await desktopBridge.complete({ settings, system, prompt }), local: true }; }
    catch { return { text: 'I saved your request in this conversation. I could not reach the local model yet. Check the model URL and connection in Settings, then try again.', local: false }; }
  }
  const endpoint = settings.endpoint.trim().replace(/\/$/, '');
  if (endpoint) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: settings.model, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }], stream: false }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Model server returned ${response.status}`);
      const result = await response.json();
      const text = result?.choices?.[0]?.message?.content;
      if (typeof text === 'string' && text.trim()) return { text: text.trim(), local: true };
      throw new Error('Model server returned an empty response');
    } catch {
      return { text: 'I saved your request in this conversation. I could not reach the local model yet. Check the model URL and connection in Settings, then try again.', local: false };
    } finally {
      clearTimeout(timeout);
    }
  }
  return { text: 'I saved your request in this conversation. Add a local OpenAI-compatible model URL in Settings to turn on live responses.', local: false };
}

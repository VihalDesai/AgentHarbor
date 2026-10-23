import { Platform } from 'react-native';
import type { ProviderId } from '@/model/types';

type DesktopBridge = {
  hasApiKey: (provider: ProviderId) => Promise<boolean>;
  setApiKey: (provider: ProviderId, key: string) => Promise<void>;
  removeApiKey: (provider: ProviderId) => Promise<void>;
  complete: (payload: { settings: import('@/model/types').ModelSettings; system: string; prompt: string }) => Promise<string>;
};

function desktopBridge(): DesktopBridge | undefined {
  return (globalThis as typeof globalThis & { agentHarbor?: DesktopBridge }).agentHarbor;
}

const webKey = (provider: ProviderId) => `agent-harbor.provider-key.${provider}`;

export async function getApiKey(provider: ProviderId): Promise<string | null> {
  if (Platform.OS === 'web') return globalThis.sessionStorage?.getItem(webKey(provider)) ?? null;
  const SecureStore = await import('expo-secure-store');
  return SecureStore.getItemAsync(webKey(provider));
}

export async function hasApiKey(provider: ProviderId): Promise<boolean> {
  const bridge = desktopBridge();
  if (bridge) return bridge.hasApiKey(provider);
  return Boolean(await getApiKey(provider));
}

export async function saveApiKey(provider: ProviderId, key: string): Promise<void> {
  const bridge = desktopBridge();
  if (bridge) return bridge.setApiKey(provider, key);
  if (Platform.OS === 'web') {
    if (key) globalThis.sessionStorage?.setItem(webKey(provider), key);
    else globalThis.sessionStorage?.removeItem(webKey(provider));
    return;
  }
  const SecureStore = await import('expo-secure-store');
  if (key) await SecureStore.setItemAsync(webKey(provider), key);
  else await SecureStore.deleteItemAsync(webKey(provider));
}

export async function removeApiKey(provider: ProviderId): Promise<void> {
  const bridge = desktopBridge();
  if (bridge) return bridge.removeApiKey(provider);
  if (Platform.OS === 'web') {
    globalThis.sessionStorage?.removeItem(webKey(provider));
    return;
  }
  const SecureStore = await import('expo-secure-store');
  await SecureStore.deleteItemAsync(webKey(provider));
}

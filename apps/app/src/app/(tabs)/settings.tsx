import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActionButton, Brand, Card, FieldLabel, Screen, WorkspaceHeader } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';
import { hasApiKey, removeApiKey, saveApiKey } from '@/services/credentials';
import { DEFAULT_PROVIDER_ID, presetFor, providerPresets } from '@/services/providers';
import { askLocalModel } from '@/services/model';
import type { ModelSettings, ProviderId } from '@/model/types';

export default function SettingsScreen() {
  const { model, ready, saveModel, resetWorkspace } = useWorkspace();
  const [provider, setProvider] = useState<ProviderId>(model.provider);
  const [endpoint, setEndpoint] = useState(model.endpoint);
  const [modelName, setModelName] = useState(model.model);
  const [apiKey, setApiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState('');
  const currentProvider = presetFor(provider);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setProvider(model.provider);
      setEndpoint(model.endpoint);
      setModelName(model.model);
    });
    return () => { active = false; };
  }, [ready, model.provider, model.endpoint, model.model]);

  useEffect(() => {
    let active = true;
    hasApiKey(provider).then((present) => { if (active) setKeySaved(present); }).catch(() => { if (active) setKeySaved(false); });
    return () => { active = false; };
  }, [provider]);

  const chooseProvider = (id: ProviderId) => {
    const next = presetFor(id);
    setProvider(id);
    setEndpoint(next.endpoint);
    setModelName(next.model);
    setApiKey('');
    setSaved(false);
    setNotice('');
  };

  const persist = async () => {
    const next: ModelSettings = { provider, endpoint: endpoint.trim(), model: modelName.trim() };
    try {
      if (currentProvider.keyRequired && apiKey.trim()) {
        await saveApiKey(provider, apiKey.trim());
        setApiKey('');
        setKeySaved(true);
      }
      saveModel(next);
      setSaved(true);
      setNotice(`Provider settings saved. New agent replies use ${currentProvider.name} directly.`);
      return true;
    } catch {
      setSaved(false);
      setNotice('Could not save the API key. Check secure storage permissions, then try again.');
      return false;
    }
  };

  const clearKey = async () => {
    try {
      await removeApiKey(provider);
      setApiKey('');
      setKeySaved(false);
      setNotice('Saved API key removed.');
    } catch {
      setNotice('Could not remove the saved key. Check secure storage permissions and try again.');
    }
  };

  const tryConnection = async () => {
    setChecking(true);
    try {
      const saved = await persist();
      if (!saved) return;
      if (currentProvider.keyRequired && !apiKey.trim() && !keySaved) {
        setNotice(`Add an API key for ${currentProvider.name} before testing the connection.`);
        return;
      }
      const result = await askLocalModel({ provider, endpoint: endpoint.trim(), model: modelName.trim() }, 'Reply with a brief connection confirmation.', 'Say Connected.');
      setNotice(result.text);
    } catch {
      setNotice('The connection check failed. Review the endpoint, model and API key, then try again.');
    } finally {
      setChecking(false);
    }
  };

  const reset = () => {
    const run = async () => { await resetWorkspace(); const defaults = presetFor(DEFAULT_PROVIDER_ID); setProvider(defaults.id); setEndpoint(defaults.endpoint); setModelName(defaults.model); setApiKey(''); setKeySaved(false); };
    if (Platform.OS === 'web') { if (globalThis.confirm('Reset this workspace to its starter state?')) void run(); }
    else Alert.alert('Reset workspace?', 'This removes your saved agents, chats and routines from this device.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: () => void run() }]);
  };

  return <Screen wide style={styles.page}>
    <View style={styles.settingsLayout}>
      <View style={styles.settingsRail}>
        <Pressable onPress={() => router.push('/(tabs)')}><Brand /></Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.railBack}><Ionicons name="arrow-back" size={16} color={palette.muted} /><Text style={styles.railText}>Back</Text></Pressable>
        <View style={styles.railGroup}><Text style={styles.railHeading}>Workspace</Text>
          <Pressable onPress={() => router.push('/(tabs)/agents')} style={styles.railItem}><Ionicons name="people-outline" size={16} color={palette.muted} /><Text style={styles.railText}>Agents</Text></Pressable>
          <Pressable onPress={() => router.push('/(tabs)/routines')} style={styles.railItem}><Ionicons name="repeat-outline" size={16} color={palette.muted} /><Text style={styles.railText}>Routines</Text></Pressable>
        </View>
        <View style={styles.railGroup}><Text style={styles.railHeading}>Settings</Text>
          <View style={[styles.railItem, styles.railItemSelected]}><Ionicons name="hardware-chip-outline" size={16} color={palette.text} /><Text style={[styles.railText, styles.railTextSelected]}>Providers & API</Text></View>
        </View>
        <Text style={styles.railFooter}>AgentHarbor · Open source</Text>
      </View>
      <View style={styles.settingsMain}>
        <WorkspaceHeader menuOnly />
        <View style={styles.settingsContent}>
          <View style={styles.pageHeading}><Text style={styles.pageTitle}>Providers & API</Text><Text style={styles.pageSubtitle}>Choose where your agent responses come from. API keys stay on this device and are never added to workspace exports.</Text></View>

          <Card style={styles.providerCard}>
      <View style={styles.cardHeading}><View><Text style={styles.cardTitle}>AI provider</Text><Text style={styles.help}>Connect a provider you already use. Keys and requests stay under your control.</Text></View><View style={styles.providerIcon}><Ionicons name="hardware-chip-outline" size={18} color={palette.amber} /></View></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.providerList}>
        {providerPresets.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: provider === item.id }} onPress={() => chooseProvider(item.id)} style={[styles.providerOption, provider === item.id && styles.providerSelected]}><Text style={[styles.providerName, provider === item.id && styles.providerNameSelected]}>{item.name}</Text><Text style={styles.providerDescription}>{item.description}</Text></Pressable>)}
      </ScrollView>
      <FieldLabel>Provider endpoint</FieldLabel>
      <TextInput value={endpoint} onChangeText={(value) => { setEndpoint(value); setSaved(false); }} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="https://api.example.com/v1" placeholderTextColor={palette.quiet} style={styles.input} />
      <FieldLabel>Model</FieldLabel>
      <TextInput value={modelName} onChangeText={(value) => { setModelName(value); setSaved(false); }} autoCapitalize="none" autoCorrect={false} placeholder={currentProvider.model || 'model-name'} placeholderTextColor={palette.quiet} style={styles.input} />
      {currentProvider.keyRequired && <>
        <FieldLabel>API key</FieldLabel>
        <TextInput value={apiKey} onChangeText={(value) => { setApiKey(value); setSaved(false); }} autoCapitalize="none" autoCorrect={false} secureTextEntry placeholder={keySaved ? 'A key is saved securely · enter a new key to replace it' : 'Paste your provider API key'} placeholderTextColor={palette.quiet} style={styles.input} />
        <View style={styles.secretNote}><Ionicons name="lock-closed-outline" size={14} color={palette.mint} /><Text style={styles.help}>Stored in the device’s secure storage. Desktop uses encrypted OS storage; Android uses the system keystore.</Text></View>
        {keySaved && <Pressable onPress={() => void clearKey()}><Text style={styles.removeKey}>Remove saved API key</Text></Pressable>}
      </>}
      {!currentProvider.keyRequired && <Text style={styles.help}>Ollama runs on your own device or network and does not need an API key.</Text>}
      <View style={styles.buttonRow}><ActionButton title={saved ? 'Saved' : 'Save provider'} icon="checkmark" onPress={() => void persist()} style={styles.flex} /><ActionButton title={checking ? 'Checking…' : 'Test connection'} icon="flash-outline" tone="secondary" disabled={checking} onPress={() => void tryConnection()} style={styles.flex} /></View>
      {checking && <ActivityIndicator color={palette.amber} />}
      {!!notice && <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text>}
      <Text style={styles.savedStatus}>{keySaved && currentProvider.keyRequired ? 'API key saved' : 'No API key saved'} · {currentProvider.protocol === 'anthropic' ? 'Anthropic Messages API' : currentProvider.protocol === 'gemini' ? 'Gemini API' : 'OpenAI-compatible API'}</Text>
          </Card>

          <Card><Text style={styles.cardTitle}>Privacy and storage</Text><Text style={styles.help}>Agents, conversations and routines stay in local app storage. Provider requests go directly from your device to the provider you selected. AgentHarbor does not operate a relay service.</Text><View style={styles.rule} /><Text style={styles.cardTitle}>Open source</Text><Text style={styles.help}>Community-built under the MIT license.</Text></Card>
          <ActionButton title="Reset this device’s workspace" tone="secondary" onPress={reset} />
        </View>
      </View>
    </View>
  </Screen>;
}

const styles = StyleSheet.create({ page: { width: '100%', maxWidth: '100%', padding: 0, paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0, gap: 0 }, settingsLayout: { flex: 1, width: '100%', minHeight: '100%', flexDirection: Platform.OS === 'web' ? 'row' : 'column' }, settingsRail: { display: Platform.OS === 'web' ? 'flex' : 'none', width: 255, backgroundColor: palette.surface, borderRightWidth: 1, borderRightColor: palette.border, paddingHorizontal: 23, paddingTop: 24, paddingBottom: 18, gap: 24 }, railBack: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 }, railGroup: { gap: 4 }, railHeading: { color: palette.quiet, fontSize: 10, fontWeight: '700', letterSpacing: 0.5, paddingHorizontal: 10, marginBottom: 5, textTransform: 'uppercase' }, railItem: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, borderRadius: 7 }, railItemSelected: { backgroundColor: palette.raised }, railText: { color: palette.muted, fontSize: 12 }, railTextSelected: { color: palette.text, fontWeight: '600' }, railFooter: { color: palette.quiet, fontSize: 10, marginTop: 'auto' }, settingsMain: { position: 'relative', flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: Platform.OS === 'web' ? 24 : 18, paddingTop: 42, paddingBottom: 26 }, settingsContent: { width: '100%', maxWidth: 680, gap: 10 }, pageHeading: { gap: 6, marginTop: -2, marginBottom: 5 }, pageTitle: { color: palette.text, fontSize: 28, lineHeight: 34, fontWeight: '400', letterSpacing: -0.4 }, pageSubtitle: { color: palette.muted, fontSize: 12, lineHeight: 18 }, cardHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 }, providerIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: palette.raised, alignItems: 'center', justifyContent: 'center' }, providerCard: { borderColor: '#363636', backgroundColor: palette.surface }, cardTitle: { color: palette.text, fontSize: 15, fontWeight: '700' }, help: { color: palette.muted, fontSize: 12, lineHeight: 18, flexShrink: 1 }, providerList: { gap: 8, paddingVertical: 2 }, providerOption: { minWidth: 138, borderRadius: 10, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background, paddingVertical: 11, paddingHorizontal: 12, gap: 4 }, providerSelected: { borderColor: '#777777', backgroundColor: '#252525' }, providerName: { color: palette.text, fontSize: 12, fontWeight: '700' }, providerNameSelected: { color: palette.text }, providerDescription: { color: palette.quiet, fontSize: 10 }, input: { minHeight: 46, borderRadius: 9, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background, color: palette.text, paddingHorizontal: 14, fontSize: 13 }, secretNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, removeKey: { color: palette.rose, fontSize: 12, fontWeight: '700' }, buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, flex: { flexGrow: 1, flexBasis: 150 }, notice: { color: palette.mint, fontSize: 12, lineHeight: 18 }, savedStatus: { color: palette.quiet, fontSize: 10 }, rule: { height: 1, backgroundColor: palette.border, marginVertical: 3 } });

import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, Brand, Card, Eyebrow, FieldLabel, Heading, Screen } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';
import { hasApiKey, removeApiKey, saveApiKey } from '@/services/credentials';
import { presetFor, providerPresets } from '@/services/providers';
import { askLocalModel } from '@/services/model';
import type { ModelSettings, ProviderId } from '@/model/types';

export default function SettingsScreen() {
  const { model, saveModel, resetWorkspace } = useWorkspace();
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
    saveModel(next);
    if (currentProvider.keyRequired && apiKey.trim()) {
      await saveApiKey(provider, apiKey.trim());
      setApiKey('');
      setKeySaved(true);
    }
    setSaved(true);
    setNotice('Provider settings saved on this device.');
  };

  const clearKey = async () => {
    await removeApiKey(provider);
    setApiKey('');
    setKeySaved(false);
    setNotice('Saved API key removed.');
  };

  const tryConnection = async () => {
    await persist();
    setChecking(true);
    const result = await askLocalModel({ provider, endpoint: endpoint.trim(), model: modelName.trim() }, 'Reply with a brief connection confirmation.', 'Say Connected.');
    setNotice(result.text);
    setChecking(false);
  };

  const reset = () => {
    const run = async () => { await resetWorkspace(); const defaults = presetFor('ollama'); setProvider(defaults.id); setEndpoint(defaults.endpoint); setModelName(defaults.model); };
    if (Platform.OS === 'web') { if (globalThis.confirm('Reset this workspace to its starter state?')) void run(); }
    else Alert.alert('Reset workspace?', 'This removes your saved agents, chats and routines from this device.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: () => void run() }]);
  };

  return <Screen>
    <View style={styles.top}><Brand /><View style={styles.topIcon}><Ionicons name="options-outline" size={19} color={palette.amber} /></View></View>
    <Eyebrow>WORKSPACE PREFERENCES</Eyebrow>
    <Heading subtitle="Choose where your agent responses come from. API keys stay on this device and are never added to workspace exports.">Settings</Heading>

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
  </Screen>;
}

const styles = StyleSheet.create({ top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, topIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#28221D', alignItems: 'center', justifyContent: 'center' }, cardHeading: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 }, providerIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#31271E', alignItems: 'center', justifyContent: 'center' }, providerCard: { borderColor: '#504231', backgroundColor: '#1B1A18' }, cardTitle: { color: palette.text, fontSize: 15, fontWeight: '700' }, help: { color: palette.muted, fontSize: 12, lineHeight: 18, flexShrink: 1 }, providerList: { gap: 8, paddingVertical: 2 }, providerOption: { minWidth: 138, borderRadius: 13, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background, paddingVertical: 11, paddingHorizontal: 12, gap: 4 }, providerSelected: { borderColor: palette.amber, backgroundColor: '#30271F' }, providerName: { color: palette.text, fontSize: 12, fontWeight: '700' }, providerNameSelected: { color: '#F5C27A' }, providerDescription: { color: palette.quiet, fontSize: 10 }, input: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background, color: palette.text, paddingHorizontal: 14, fontSize: 13 }, secretNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 }, removeKey: { color: palette.rose, fontSize: 12, fontWeight: '700' }, buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, flex: { flexGrow: 1, flexBasis: 150 }, notice: { color: palette.mint, fontSize: 12, lineHeight: 18 }, savedStatus: { color: palette.quiet, fontSize: 10 }, rule: { height: 1, backgroundColor: palette.border, marginVertical: 3 } });

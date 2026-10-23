import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton, Brand, Card, FieldLabel, Heading, Screen } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';

export default function SettingsScreen() {
  const { model, saveModel, resetWorkspace } = useWorkspace();
  const [endpoint, setEndpoint] = useState(model.endpoint);
  const [modelName, setModelName] = useState(model.model);
  const [saved, setSaved] = useState(false);
  const reset = () => {
    const run = async () => { await resetWorkspace(); setEndpoint('http://localhost:11434/v1'); setModelName('qwen3:8b'); };
    if (Platform.OS === 'web') { if (globalThis.confirm('Reset this workspace to its starter state?')) void run(); }
    else Alert.alert('Reset workspace?', 'This removes your saved agents, chats and routines from this device.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: () => void run() }]);
  };
  return <Screen>
    <Brand />
    <Heading subtitle="AgentHarbor keeps workspace data on this device.">Settings</Heading>
    <Card><Text style={styles.cardTitle}>Local model connection</Text><Text style={styles.help}>Connect an OpenAI-compatible endpoint such as Ollama. Chat history stays on this device.</Text><FieldLabel>Base URL</FieldLabel><TextInput value={endpoint} onChangeText={setEndpoint} autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="http://localhost:11434/v1" placeholderTextColor={palette.quiet} style={styles.input} /><FieldLabel>Model name</FieldLabel><TextInput value={modelName} onChangeText={setModelName} autoCapitalize="none" placeholder="qwen3:8b" placeholderTextColor={palette.quiet} style={styles.input} /><ActionButton title={saved ? 'Settings saved' : 'Save connection'} icon="checkmark" onPress={() => { saveModel({ endpoint, model: modelName }); setSaved(true); }} /></Card>
    <Card><Text style={styles.cardTitle}>Privacy and storage</Text><Text style={styles.help}>Agents, conversations and routines are stored in this app’s local storage. Model requests go only to the endpoint you configure.</Text><View style={styles.rule} /><Text style={styles.cardTitle}>Open source</Text><Text style={styles.help}>AgentHarbor is a community-built, MIT-licensed starter workspace. No subscription or pricing screens are included.</Text></Card>
    <ActionButton title="Reset this device’s workspace" tone="secondary" onPress={reset} />
  </Screen>;
}

const styles = StyleSheet.create({ cardTitle: { color: palette.text, fontSize: 14, fontWeight: '700' }, help: { color: palette.muted, fontSize: 12, lineHeight: 18 }, input: { minHeight: 45, borderRadius: 11, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background, color: palette.text, paddingHorizontal: 13, fontSize: 13 }, rule: { height: 1, backgroundColor: palette.border, marginVertical: 3 } });

import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton, AgentAvatar, Card, FieldLabel, Heading, Screen, WorkspaceHeader } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';
import { characters } from '@/services/characters';
import { presetFor } from '@/services/providers';
import { hasApiKey } from '@/services/credentials';
import { defaultAgentPhases, type CharacterId } from '@/model/types';

const colors = [palette.lavender, palette.mint, palette.amber, palette.rose, palette.blue];

export default function CreateAgentScreen() {
  const { createAgent, model, ready } = useWorkspace();
  const [name, setName] = useState('');
  const [role, setRole] = useState('Personal assistant');
  const [goal, setGoal] = useState('Help me make steady progress on my priorities.');
  const [color, setColor] = useState(colors[0]);
  const [character, setCharacter] = useState<CharacterId>('sprout');
  const [phasesText, setPhasesText] = useState(defaultAgentPhases.join('\n'));
  const [keyReady, setKeyReady] = useState(false);
  const currentProvider = presetFor(model.provider);
  useEffect(() => {
    let active = true;
    if (ready) hasApiKey(model.provider).then((present) => { if (active) setKeyReady(present); }).catch(() => { if (active) setKeyReady(false); });
    return () => { active = false; };
  }, [model.provider, ready]);
  const create = () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const phases = phasesText.split(/\r?\n/).map((phase) => phase.trim()).filter(Boolean).slice(0, 6);
    const id = createAgent({ name: cleanName, role: role.trim() || 'Personal assistant', goal: goal.trim() || 'Help me move work forward.', color, character, phases });
    router.replace(`/agent/${id}`);
  };
  return <Screen>
    <WorkspaceHeader back />
    <Heading subtitle="Choose its character, purpose, and the steps it should follow.">Create an agent</Heading>
    <Card style={styles.card}>
      <FieldLabel>Character</FieldLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.characters}>
        {characters.map((item) => <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: character === item.id }} accessibilityLabel={`Choose ${item.name}`} onPress={() => setCharacter(item.id)} style={[styles.characterOption, character === item.id && styles.characterSelected]}><AgentAvatar name={item.name} character={item.id} color={item.color} size={54} /><Text style={styles.characterName}>{item.name}</Text></Pressable>)}
      </ScrollView>
      <FieldLabel>Name</FieldLabel><TextInput value={name} onChangeText={setName} autoFocus placeholder="e.g. Studio partner" placeholderTextColor={palette.quiet} style={styles.input} />
      <FieldLabel>Role</FieldLabel><TextInput value={role} onChangeText={setRole} placeholder="Personal assistant" placeholderTextColor={palette.quiet} style={styles.input} />
      <FieldLabel>What should it help with?</FieldLabel><TextInput value={goal} onChangeText={setGoal} multiline textAlignVertical="top" placeholder="Describe the agent’s focus" placeholderTextColor={palette.quiet} style={[styles.input, styles.multiline]} />
      <FieldLabel>Work phases · one per line</FieldLabel><TextInput value={phasesText} onChangeText={setPhasesText} multiline textAlignVertical="top" placeholder="Understand the goal\nPlan the next steps\nDeliver a clear result" placeholderTextColor={palette.quiet} style={[styles.input, styles.phaseInput]} />
      <FieldLabel>Accent color</FieldLabel><View style={styles.colors}>{colors.map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: color === item }} accessibilityLabel={`Choose accent ${item}`} onPress={() => setColor(item)} style={[styles.swatch, { backgroundColor: item }, color === item && styles.selected]} />)}</View>
      <View style={styles.providerCard}><View style={styles.providerIcon}><Ionicons name="hardware-chip-outline" size={16} color={palette.amber} /></View><View style={styles.providerCopy}><Text style={styles.providerName}>{currentProvider.name} · {model.model || currentProvider.model}</Text><Text style={styles.providerHelp}>{currentProvider.keyRequired ? keyReady ? `Your ${currentProvider.name} key is saved. Replies go directly to this provider.` : `No ${currentProvider.name} API key is saved yet. Add it in Settings before the first reply.` : 'This agent uses Ollama only because it is selected. It will not switch to another provider.'}</Text></View><Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/settings')}><Text style={styles.changeProvider}>Change</Text></Pressable></View>
      <ActionButton title="Create agent" icon="sparkles" onPress={create} disabled={!name.trim()} />
    </Card>
  </Screen>;
}

const styles = StyleSheet.create({ card: { width: '100%', maxWidth: 640 }, input: { minHeight: 45, borderRadius: 11, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background, color: palette.text, paddingHorizontal: 13, fontSize: 13 }, multiline: { minHeight: 92, paddingTop: 12 }, phaseInput: { minHeight: 84, paddingTop: 12, lineHeight: 21 }, colors: { flexDirection: 'row', gap: 12 }, swatch: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' }, selected: { borderColor: palette.text }, characters: { gap: 9, paddingVertical: 2 }, characterOption: { minWidth: 74, padding: 8, alignItems: 'center', gap: 6, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' }, characterSelected: { borderColor: palette.text, backgroundColor: palette.raised }, characterName: { color: palette.muted, fontSize: 10, fontWeight: '600' }, providerCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background, padding: 11 }, providerIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: palette.raised }, providerCopy: { flex: 1, gap: 3 }, providerName: { color: palette.text, fontSize: 11, fontWeight: '700' }, providerHelp: { color: palette.muted, fontSize: 10, lineHeight: 15 }, changeProvider: { color: palette.text, fontSize: 10, fontWeight: '700', padding: 5 } });

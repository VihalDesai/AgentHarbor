import { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton, Card, FieldLabel, Heading, Screen, WorkspaceHeader } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';

const colors = [palette.lavender, palette.mint, palette.amber, palette.rose, palette.blue];

export default function CreateAgentScreen() {
  const { createAgent } = useWorkspace();
  const [name, setName] = useState('');
  const [role, setRole] = useState('Personal assistant');
  const [goal, setGoal] = useState('Help me make steady progress on my priorities.');
  const [color, setColor] = useState(colors[0]);
  const create = () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const id = createAgent({ name: cleanName, role: role.trim() || 'Personal assistant', goal: goal.trim() || 'Help me move work forward.', color });
    router.replace(`/agent/${id}`);
  };
  return <Screen>
    <WorkspaceHeader back />
    <Heading subtitle="Give your agent a clear job and a useful first goal.">Create an agent</Heading>
    <Card><FieldLabel>Name</FieldLabel><TextInput value={name} onChangeText={setName} autoFocus placeholder="e.g. Studio partner" placeholderTextColor={palette.quiet} style={styles.input} /><FieldLabel>Role</FieldLabel><TextInput value={role} onChangeText={setRole} placeholder="Personal assistant" placeholderTextColor={palette.quiet} style={styles.input} /><FieldLabel>What should it help with?</FieldLabel><TextInput value={goal} onChangeText={setGoal} multiline textAlignVertical="top" placeholder="Describe the agent’s focus" placeholderTextColor={palette.quiet} style={[styles.input, styles.multiline]} /><FieldLabel>Accent color</FieldLabel><View style={styles.colors}>{colors.map((item) => <Text key={item} onPress={() => setColor(item)} style={[styles.swatch, { backgroundColor: item }, color === item && styles.selected]} />)}</View><ActionButton title="Create agent" icon="sparkles" onPress={create} disabled={!name.trim()} /></Card>
  </Screen>;
}

const styles = StyleSheet.create({ input: { minHeight: 45, borderRadius: 11, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background, color: palette.text, paddingHorizontal: 13, fontSize: 13 }, multiline: { minHeight: 110, paddingTop: 12 }, colors: { flexDirection: 'row', gap: 12 }, swatch: { width: 32, height: 32, borderRadius: 16, color: 'transparent', overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' }, selected: { borderColor: palette.text } });

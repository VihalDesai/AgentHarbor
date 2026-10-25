import { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, TextInput } from 'react-native';
import { ActionButton, Card, FieldLabel, Heading, Screen, WorkspaceHeader } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';

export default function CreateSkillScreen() {
  const { createSkill } = useWorkspace();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const save = () => {
    const cleanName = name.trim();
    const cleanInstructions = instructions.trim();
    if (!cleanName || !cleanInstructions) return;
    createSkill({ name: cleanName.slice(0, 100), description: description.trim().slice(0, 500), instructions: cleanInstructions.slice(0, 6000) });
    router.back();
  };
  return <Screen>
    <WorkspaceHeader back />
    <Heading subtitle="Give your team a repeatable playbook, voice, or process.">Create a skill</Heading>
    <Card style={styles.card}>
      <FieldLabel>Skill name</FieldLabel><TextInput value={name} onChangeText={setName} maxLength={100} autoFocus placeholder="e.g. Founder interview prep" placeholderTextColor={palette.quiet} style={styles.input} />
      <FieldLabel>Short description · optional</FieldLabel><TextInput value={description} onChangeText={setDescription} maxLength={500} multiline placeholder="When should this skill be used?" placeholderTextColor={palette.quiet} style={[styles.input, styles.description]} />
      <FieldLabel>Instructions</FieldLabel><Text style={styles.help}>Write the guidance an assigned agent should follow. These instructions are included with its next model request.</Text><TextInput value={instructions} onChangeText={setInstructions} maxLength={6000} multiline textAlignVertical="top" placeholder={'You are helping with…\n\n1. First, gather…\n2. Then, return…'} placeholderTextColor={palette.quiet} style={[styles.input, styles.instructions]} />
      <Text style={styles.counter}>{instructions.length.toLocaleString()} / 6,000 characters</Text>
      <ActionButton title="Save skill" icon="checkmark" onPress={save} disabled={!name.trim() || !instructions.trim()} />
    </Card>
  </Screen>;
}

const styles = StyleSheet.create({ card: { width: '100%', maxWidth: 680 }, input: { minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background, color: palette.text, paddingHorizontal: 12, paddingVertical: 11, fontSize: 13 }, description: { minHeight: 76, textAlignVertical: 'top' }, instructions: { minHeight: 190, textAlignVertical: 'top', lineHeight: 20 }, help: { color: palette.muted, fontSize: 11, lineHeight: 16, marginTop: -7 }, counter: { color: palette.quiet, textAlign: 'right', fontSize: 10 } });

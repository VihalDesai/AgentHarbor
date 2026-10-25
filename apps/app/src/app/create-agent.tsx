import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
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
  const { branchId: branchIdParam } = useLocalSearchParams<{ branchId?: string }>();
  const { createAgent, skills, branches, agents, model, ready } = useWorkspace();
  const [name, setName] = useState('');
  const [role, setRole] = useState('Personal assistant');
  const [goal, setGoal] = useState('Help me make steady progress on my priorities.');
  const [color, setColor] = useState(colors[0]);
  const [character, setCharacter] = useState<CharacterId>('sprout');
  const [phasesText, setPhasesText] = useState(defaultAgentPhases.join('\n'));
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [branchId, setBranchId] = useState(branches.some((branch) => branch.id === branchIdParam) ? branchIdParam ?? '' : branches[0]?.id ?? '');
  const [managerId, setManagerId] = useState('');
  const [keyReady, setKeyReady] = useState(false);
  const currentProvider = presetFor(model.provider);
  const branchAgents = agents.filter((agent) => agent.branchId === branchId);
  useEffect(() => {
    let active = true;
    if (ready) hasApiKey(model.provider).then((present) => { if (active) setKeyReady(present); }).catch(() => { if (active) setKeyReady(false); });
    return () => { active = false; };
  }, [model.provider, ready]);
  const create = () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const phases = phasesText.split(/\r?\n/).map((phase) => phase.trim()).filter(Boolean).slice(0, 6);
    const id = createAgent({ name: cleanName, role: role.trim() || 'Personal assistant', goal: goal.trim() || 'Help me move work forward.', color, character, phases, skillIds, branchId, managerId: managerId || undefined });
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
      <FieldLabel>Company branch</FieldLabel><View style={styles.choiceList}>{branches.map((branch) => <Pressable key={branch.id} accessibilityRole="radio" accessibilityState={{ checked: branchId === branch.id }} onPress={() => { setBranchId(branch.id); setManagerId(''); }} style={[styles.choice, branchId === branch.id && styles.choiceSelected]}><View style={[styles.branchDot, { backgroundColor: branch.color }]} /><View style={styles.choiceCopy}><Text style={styles.skillName}>{branch.name}</Text><Text style={styles.skillDescription}>{branch.description}</Text></View>{branchId === branch.id && <Ionicons name="checkmark-circle" size={17} color={palette.text} />}</Pressable>)}</View>
      <FieldLabel>Reports to</FieldLabel><View style={styles.choiceList}><Pressable accessibilityRole="radio" accessibilityState={{ checked: !managerId }} onPress={() => setManagerId('')} style={[styles.choice, !managerId && styles.choiceSelected]}><View style={styles.branchDot} /><View style={styles.choiceCopy}><Text style={styles.skillName}>Branch lead</Text><Text style={styles.skillDescription}>This agent is at the top of this branch.</Text></View>{!managerId && <Ionicons name="checkmark-circle" size={17} color={palette.text} />}</Pressable>{branchAgents.map((manager) => <Pressable key={manager.id} accessibilityRole="radio" accessibilityState={{ checked: managerId === manager.id }} onPress={() => setManagerId(manager.id)} style={[styles.choice, managerId === manager.id && styles.choiceSelected]}><AgentAvatar name={manager.name} character={manager.character} color={manager.color} size={31} /><View style={styles.choiceCopy}><Text style={styles.skillName}>{manager.name}</Text><Text style={styles.skillDescription}>{manager.role} · {manager.managerId ? `reports to ${agents.find((item) => item.id === manager.managerId)?.name ?? 'a manager'}` : 'branch lead'}</Text></View>{managerId === manager.id && <Ionicons name="checkmark-circle" size={17} color={palette.text} />}</Pressable>)}</View>
      <View style={styles.skillsHeading}><FieldLabel>Skills · optional</FieldLabel><Pressable accessibilityRole="button" onPress={() => router.push('/skills' as never)}><Text style={styles.changeProvider}>Manage skills</Text></Pressable></View>
      {skills.length ? <View style={styles.skillList}>{skills.map((skill) => {
        const selected = skillIds.includes(skill.id);
        return <Pressable key={skill.id} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => setSkillIds((ids) => ids.includes(skill.id) ? ids.filter((id) => id !== skill.id) : ids.length < 10 ? [...ids, skill.id] : ids)} style={[styles.skillOption, selected && styles.skillSelected]}><View style={[styles.skillCheck, selected && styles.skillChecked]}>{selected && <Ionicons name="checkmark" size={11} color={palette.background} />}</View><View style={styles.skillCopy}><Text style={styles.skillName}>{skill.name}</Text>{skill.description ? <Text numberOfLines={2} style={styles.skillDescription}>{skill.description}</Text> : null}</View></Pressable>;
      })}</View> : <Pressable accessibilityRole="button" onPress={() => router.push('/create-skill' as never)} style={styles.noSkills}><Text style={styles.providerHelp}>No skills yet. Create one to give this agent a reusable playbook.</Text><Text style={styles.changeProvider}>Create skill</Text></Pressable>}
      <View style={styles.providerCard}><View style={styles.providerIcon}><Ionicons name="hardware-chip-outline" size={16} color={palette.amber} /></View><View style={styles.providerCopy}><Text style={styles.providerName}>{currentProvider.name} · {model.model || currentProvider.model}</Text><Text style={styles.providerHelp}>{currentProvider.keyRequired ? keyReady ? `Your ${currentProvider.name} key is saved. Replies go directly to this provider.` : `No ${currentProvider.name} API key is saved yet. Add it in Settings before the first reply.` : 'This agent uses Ollama only because it is selected. It will not switch to another provider.'}</Text></View><Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/settings')}><Text style={styles.changeProvider}>Change</Text></Pressable></View>
      <ActionButton title="Create agent" icon="sparkles" onPress={create} disabled={!name.trim() || !ready} />
    </Card>
  </Screen>;
}

const styles = StyleSheet.create({ card: { width: '100%', maxWidth: 640 }, input: { minHeight: 45, borderRadius: 11, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background, color: palette.text, paddingHorizontal: 13, fontSize: 13 }, multiline: { minHeight: 92, paddingTop: 12 }, phaseInput: { minHeight: 84, paddingTop: 12, lineHeight: 21 }, colors: { flexDirection: 'row', gap: 12 }, swatch: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' }, selected: { borderColor: palette.text }, characters: { gap: 9, paddingVertical: 2 }, characterOption: { minWidth: 74, padding: 8, alignItems: 'center', gap: 6, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' }, characterSelected: { borderColor: palette.text, backgroundColor: palette.raised }, characterName: { color: palette.muted, fontSize: 10, fontWeight: '600' }, choiceList: { gap: 7 }, choice: { flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 9, borderWidth: 1, borderColor: palette.border, padding: 9, backgroundColor: palette.background }, choiceSelected: { borderColor: palette.text, backgroundColor: palette.raised }, choiceCopy: { flex: 1, gap: 3 }, branchDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: palette.quiet, marginHorizontal: 9 }, skillsHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, skillList: { gap: 7, maxHeight: 240 }, skillOption: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, borderRadius: 9, borderWidth: 1, borderColor: palette.border, padding: 9, backgroundColor: palette.background }, skillSelected: { borderColor: palette.text, backgroundColor: palette.raised }, skillCheck: { width: 17, height: 17, borderRadius: 5, borderWidth: 1, borderColor: palette.quiet, alignItems: 'center', justifyContent: 'center', marginTop: 1 }, skillChecked: { backgroundColor: palette.text, borderColor: palette.text }, skillCopy: { flex: 1, gap: 3 }, skillName: { color: palette.text, fontSize: 10, fontWeight: '700' }, skillDescription: { color: palette.muted, fontSize: 9, lineHeight: 14 }, noSkills: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, borderRadius: 9, borderWidth: 1, borderColor: palette.border, padding: 10, backgroundColor: palette.background }, providerCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background, padding: 11 }, providerIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: palette.raised }, providerCopy: { flex: 1, gap: 3 }, providerName: { color: palette.text, fontSize: 11, fontWeight: '700' }, providerHelp: { color: palette.muted, fontSize: 10, lineHeight: 15 }, changeProvider: { color: palette.text, fontSize: 10, fontWeight: '700', padding: 5 } });

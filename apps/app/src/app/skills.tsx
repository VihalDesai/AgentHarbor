import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, Card, Heading, Screen, WorkspaceHeader } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';

export default function SkillsScreen() {
  const { skills, agents, founders, deleteSkill } = useWorkspace();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const removeSkill = (id: string, name: string) => {
    const assignedAgents = agents.filter((agent) => agent.skillIds?.includes(id)).length;
    const assignedFounders = founders.filter((founder) => founder.skillIds.includes(id)).length;
    const message = `Delete “${name}”? It will also be removed from ${assignedAgents} agent${assignedAgents === 1 ? '' : 's'} and ${assignedFounders} founder profile${assignedFounders === 1 ? '' : 's'}.`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm(message)) deleteSkill(id);
      return;
    }
    Alert.alert('Delete skill?', message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteSkill(id) }]);
  };

  return <Screen>
    <WorkspaceHeader back />
    <View style={styles.headingRow}><Heading subtitle="Write reusable instructions, then add them to agents and founder profiles.">Skills</Heading><ActionButton title="Add skill" icon="add" onPress={() => router.push('/create-skill' as never)} /></View>
    {!skills.length ? <Card style={styles.empty}><View style={styles.emptyIcon}><Ionicons name="flash-outline" size={22} color={palette.text} /></View><Text style={styles.emptyTitle}>Build your first skill</Text><Text style={styles.muted}>Save a repeatable playbook, voice guide, or process. Skills stay on this device and can be attached to any agent or founder.</Text><ActionButton title="Create a skill" icon="add" onPress={() => router.push('/create-skill' as never)} /></Card> : <View style={styles.list}>{skills.map((skill) => {
      const assignedAgents = agents.filter((agent) => agent.skillIds?.includes(skill.id)).length;
      const assignedFounders = founders.filter((founder) => founder.skillIds.includes(skill.id)).length;
      const expanded = expandedId === skill.id;
      return <Card key={skill.id} style={styles.skillCard}>
        <View style={styles.cardTop}><View style={styles.skillIcon}><Ionicons name="flash-outline" size={17} color={palette.text} /></View><View style={styles.skillCopy}><Text style={styles.skillName}>{skill.name}</Text><Text style={styles.muted}>{assignedAgents} agents · {assignedFounders} founders</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`${expanded ? 'Hide' : 'Show'} ${skill.name} instructions`} onPress={() => setExpandedId(expanded ? null : skill.id)} style={styles.iconButton}><Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={17} color={palette.text} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Delete ${skill.name}`} onPress={() => removeSkill(skill.id, skill.name)} style={styles.iconButton}><Ionicons name="trash-outline" size={16} color={palette.muted} /></Pressable></View>
        {skill.description ? <Text style={styles.description}>{skill.description}</Text> : null}
        {expanded && <View style={styles.instructions}><Text style={styles.instructionsLabel}>Instructions for assigned agents</Text><Text selectable style={styles.instructionsText}>{skill.instructions}</Text></View>}
      </Card>;
    })}</View>}
    <Card style={styles.note}><Ionicons name="lock-closed-outline" size={15} color={palette.muted} /><Text style={styles.noteText}>Skills are stored in your local workspace. An agent sends its selected skill instructions to the model provider you configured when you chat.</Text></Card>
  </Screen>;
}

const styles = StyleSheet.create({ headingRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }, empty: { width: '100%', maxWidth: 660, alignItems: 'flex-start', padding: 24 }, emptyIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: palette.raised, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { color: palette.text, fontSize: 16, fontWeight: '700' }, muted: { color: palette.muted, fontSize: 12, lineHeight: 18 }, list: { width: '100%', maxWidth: 760, gap: 10 }, skillCard: { padding: 15, gap: 11 }, cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 }, skillIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: palette.raised, alignItems: 'center', justifyContent: 'center' }, skillCopy: { flex: 1, gap: 3 }, skillName: { color: palette.text, fontSize: 14, fontWeight: '700' }, iconButton: { width: 34, height: 34, borderRadius: 9, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background }, description: { color: '#D2D2D2', fontSize: 12, lineHeight: 18 }, instructions: { borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 11, gap: 6 }, instructionsLabel: { color: palette.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 }, instructionsText: { color: palette.text, fontSize: 12, lineHeight: 19 }, note: { width: '100%', maxWidth: 760, flexDirection: 'row', alignItems: 'flex-start', gap: 9 }, noteText: { flex: 1, color: palette.muted, fontSize: 10, lineHeight: 15 } });

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, AgentAvatar, Brand, Card, Heading, Screen, SectionTitle } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';

export default function AgentsScreen() {
  const { agents } = useWorkspace();
  return <Screen>
    <Brand />
    <Heading subtitle="Focused helpers for the work you do every day.">Your agents</Heading>
    <ActionButton title="Create an agent" icon="add" onPress={() => router.push('/create-agent')} />
    <SectionTitle title={`${agents.length} agents`} />
    {agents.map((agent) => <Pressable key={agent.id} onPress={() => router.push(`/agent/${agent.id}`)}>
      <Card><View style={styles.row}><AgentAvatar name={agent.name} color={agent.color} size={48} /><View style={styles.flex}><Text style={styles.name}>{agent.name}</Text><Text style={styles.role}>{agent.role}</Text></View><Text style={styles.arrow}>›</Text></View><Text style={styles.goal}>{agent.goal}</Text></Card>
    </Pressable>)}
  </Screen>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, flex: { flex: 1 }, name: { color: palette.text, fontSize: 16, fontWeight: '700' }, role: { color: palette.muted, fontSize: 12, marginTop: 4 }, goal: { color: palette.muted, fontSize: 13, lineHeight: 19 }, arrow: { color: palette.quiet, fontSize: 28 } });

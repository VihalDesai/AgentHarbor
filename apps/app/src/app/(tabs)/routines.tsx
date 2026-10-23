import { StyleSheet, Switch, Text, View } from 'react-native';
import { ActionButton, AgentAvatar, Card, Heading, Screen, SectionTitle, WorkspaceHeader } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';

export default function RoutinesScreen() {
  const { routines, agents, toggleRoutine, createRoutine } = useWorkspace();
  return <Screen>
    <WorkspaceHeader back />
    <Heading subtitle="Simple recurring prompts, stored on this device.">Routines</Heading>
    <ActionButton title="Add weekly check-in" icon="add" onPress={() => createRoutine({ name: 'Weekly check-in', description: 'Review priorities and suggest the next step.', schedule: 'Monday · 9:00 AM', agentId: agents[0]?.id ?? 'mara' })} />
    <SectionTitle title="Your schedule" />
    {routines.map((routine) => {
      const agent = agents.find((item) => item.id === routine.agentId);
      return <Card key={routine.id}><View style={styles.row}><AgentAvatar name={agent?.name ?? 'A'} color={agent?.color ?? palette.lime} /><View style={styles.flex}><Text style={styles.title}>{routine.name}</Text><Text style={styles.schedule}>{routine.schedule}</Text></View><Switch value={routine.enabled} onValueChange={() => toggleRoutine(routine.id)} trackColor={{ false: palette.border, true: palette.lime }} thumbColor={palette.text} /></View><Text style={styles.description}>{routine.description}</Text><Text style={styles.agent}>Handled by {agent?.name ?? 'your agent'}</Text></Card>;
    })}
    <Text style={styles.note}>Routines are saved locally. They are reminders and prompt templates; this starter version does not run background jobs.</Text>
  </Screen>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, flex: { flex: 1 }, title: { color: palette.text, fontSize: 14, fontWeight: '700' }, schedule: { color: palette.lime, fontSize: 11, marginTop: 5 }, description: { color: palette.muted, fontSize: 13, lineHeight: 19 }, agent: { color: palette.quiet, fontSize: 11 }, note: { color: palette.quiet, fontSize: 12, lineHeight: 18 } });

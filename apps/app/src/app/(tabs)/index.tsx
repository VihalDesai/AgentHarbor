import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, AgentAvatar, Brand, Card, Eyebrow, Hairline, Screen, SectionTitle, StatusPill } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';

export default function HomeScreen() {
  const { agents, routines, conversations } = useWorkspace();
  const goToAgent = (id: string) => router.push({ pathname: '/agent/[id]', params: { id } });
  const openCreate = () => router.push('/create-agent');

  return <Screen>
    <View style={styles.header}><Brand /><StatusPill label="LOCAL WORKSPACE" color={palette.lime} /></View>

    <View style={styles.intro}>
      <View style={styles.introCopy}><Eyebrow>YOUR WORKSPACE · READY WHEN YOU ARE</Eyebrow><Text style={styles.title}>Make room for the work that matters.</Text><Text style={styles.subtitle}>A steady crew of focused assistants, working from your computer or phone.</Text></View>
      <ActionButton title="Create an agent" icon="add" onPress={openCreate} style={styles.createButton} />
    </View>

    <View style={styles.metrics}>
      <Metric icon="people-outline" value={String(agents.length).padStart(2, '0')} label="AGENTS" color={palette.lavender} />
      <Metric icon="repeat-outline" value={String(routines.filter((routine) => routine.enabled).length).padStart(2, '0')} label="ROUTINES ON" color={palette.mint} />
      <Metric icon="chatbubble-ellipses-outline" value={String(Object.values(conversations).reduce((total, list) => total + list.length, 0)).padStart(2, '0')} label="SAVED NOTES" color={palette.amber} />
    </View>

    <Card style={styles.focusCard}>
      <View style={styles.focusTop}><View style={styles.focusIcon}><Ionicons name="sparkles-outline" size={17} color={palette.lime} /></View><Eyebrow style={styles.focusEyebrow}>A PLACE TO START</Eyebrow></View>
      <Text style={styles.focusTitle}>Give a task a good first home.</Text>
      <Text style={styles.focusBody}>Build a specialist for a recurring responsibility, or open a teammate and pick up where you left off.</Text>
      <View style={styles.focusActions}><ActionButton title="Make your first agent" icon="arrow-forward" onPress={openCreate} /><Text style={styles.localNote}>Your workspace stays on this device.</Text></View>
    </Card>

    <View style={styles.sectionBlock}>
      <SectionTitle title="Your crew" action="See all" onAction={() => router.push('/agents')} />
      <View style={styles.agentGrid}>{agents.slice(0, 4).map((agent) => <Pressable key={agent.id} onPress={() => goToAgent(agent.id)} style={({ pressed }) => [styles.agentCard, pressed && styles.pressed]}>
        <View style={styles.agentCardTop}><AgentAvatar name={agent.name} color={agent.color} /><Ionicons name="arrow-up-right-box" color={palette.quiet} size={16} /></View>
        <Text style={styles.agentName}>{agent.name}</Text><Text style={styles.agentRole}>{agent.role}</Text><Text numberOfLines={2} style={styles.agentGoal}>{agent.goal}</Text>
      </Pressable>)}</View>
    </View>

    <View style={styles.sectionBlock}>
      <SectionTitle title="In motion" action="Routines" onAction={() => router.push('/routines')} />
      <Card style={styles.activityCard}>
        {routines.filter((routine) => routine.enabled).slice(0, 2).map((routine, index) => {
          const agent = agents.find((item) => item.id === routine.agentId);
          return <View key={routine.id}>
            {index > 0 && <Hairline />}
            <View style={styles.activityRow}><View style={[styles.activityGlyph, { backgroundColor: `${agent?.color ?? palette.mint}20` }]}><Ionicons name="time-outline" size={17} color={agent?.color ?? palette.mint} /></View><View style={styles.activityCopy}><Text style={styles.activityTitle}>{routine.name}</Text><Text style={styles.activityMeta}>{routine.schedule} · {agent?.name ?? 'Agent'}</Text></View><View style={styles.liveDot} /></View>
          </View>;
        })}
        {routines.filter((routine) => routine.enabled).length === 0 && <Text style={styles.agentGoal}>No routines are running yet. Add one when you’re ready.</Text>}
      </Card>
    </View>
    <View style={styles.footer}><Text style={styles.footerText}>AGENTHARBOR</Text><Text style={styles.footerSub}>Open source · Local first</Text></View>
  </Screen>;
}

function Metric({ icon, value, label, color }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string; color: string }) {
  return <View style={styles.metric}><Ionicons name={icon} size={17} color={color} /><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  intro: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginTop: 18 },
  introCopy: { flex: 1, gap: 10 },
  title: { color: palette.text, fontSize: 34, fontWeight: '800', letterSpacing: -1.25, lineHeight: 41, maxWidth: 610 },
  subtitle: { color: palette.muted, fontSize: 14, lineHeight: 21, maxWidth: 520 },
  createButton: { minWidth: 158 },
  metrics: { flexDirection: 'row', gap: 11 },
  metric: { flex: 1, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, paddingVertical: 14, paddingHorizontal: 13, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 9 },
  metricValue: { color: palette.text, fontSize: 19, fontWeight: '800', marginLeft: 'auto' },
  metricLabel: { color: palette.quiet, fontSize: 9, fontWeight: '800', letterSpacing: 0.7, marginLeft: 1 },
  focusCard: { backgroundColor: '#1B1C1C', borderColor: '#393B35', padding: 21, overflow: 'hidden' },
  focusTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  focusIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: `${palette.lime}18` },
  focusEyebrow: { color: palette.muted },
  focusTitle: { color: palette.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.6 },
  focusBody: { color: palette.muted, fontSize: 13, lineHeight: 20, maxWidth: 610 },
  focusActions: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 2 },
  localNote: { color: palette.quiet, fontSize: 11 },
  sectionBlock: { gap: 12 },
  agentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  agentCard: { flexGrow: 1, flexBasis: 220, maxWidth: '100%', minHeight: 158, borderRadius: 17, backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, padding: 16, gap: 6 },
  pressed: { opacity: 0.8 },
  agentCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  agentName: { color: palette.text, fontSize: 16, fontWeight: '800' },
  agentRole: { color: palette.muted, fontSize: 12 },
  agentGoal: { color: palette.quiet, fontSize: 11, lineHeight: 17, marginTop: 2 },
  activityCard: { paddingHorizontal: 16, paddingVertical: 4 },
  activityRow: { minHeight: 63, flexDirection: 'row', alignItems: 'center', gap: 12 },
  activityGlyph: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activityCopy: { flex: 1, gap: 4 },
  activityTitle: { color: palette.text, fontSize: 13, fontWeight: '700' },
  activityMeta: { color: palette.quiet, fontSize: 10 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.mint },
  footer: { borderTopWidth: 1, borderTopColor: palette.border, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 15, marginTop: 2 },
  footerText: { color: palette.quiet, fontSize: 9, letterSpacing: 1.2, fontWeight: '800' },
  footerSub: { color: palette.quiet, fontSize: 10 },
});

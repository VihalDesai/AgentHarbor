import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AgentAvatar, Card, Screen, WorkspaceHeader } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';
import { presetFor } from '@/services/providers';
import { agentTemplates, uniqueTemplateName } from '@/data/templates';

const featuredTemplates = agentTemplates.filter((template) => template.source === 'From Skydive');

export default function HomeScreen() {
  const { agents, conversations, model, createAgent } = useWorkspace();
  const goToAgent = (id: string) => router.push({ pathname: '/agent/[id]', params: { id } });
  const activity = agents.flatMap((agent) => (conversations[agent.id] ?? []).slice(-1).map((last) => ({ agent, last }))).slice(0, 6);
  const provider = presetFor(model.provider);

  const addTemplate = (template: typeof agentTemplates[number]) => {
    const id = createAgent({ name: uniqueTemplateName(template.name, agents), role: template.role, goal: template.goal, color: template.color, character: template.character, phases: template.phases });
    router.push(`/agent/${id}`);
  };

  return <Screen wide style={styles.page}>
    <WorkspaceHeader />
    <View style={homeLayoutStyles.shortcuts}>
      <Shortcut icon="add" title="New agent" onPress={() => router.push('/create-agent')} />
      <Shortcut icon="albums-outline" title="Templates" onPress={() => router.push('/(tabs)/templates')} />
      {agents[0] && <Shortcut icon="person-circle-outline" title={agents[0].name} onPress={() => goToAgent(agents[0].id)} />}
      <Shortcut icon="people-outline" title="All agents" onPress={() => router.push('/(tabs)/agents')} />
    </View>

    <View style={styles.homeGrid}>
      <View style={styles.feed}>
        <View style={homeLayoutStyles.welcomeRow}>
          <Text style={styles.welcome}>Welcome back</Text>
          <View style={homeLayoutStyles.feedTools}>
            <Pressable accessibilityRole="button" accessibilityLabel="Search agents" onPress={() => router.push('/(tabs)/agents')} style={homeLayoutStyles.search}><Ionicons name="search-outline" size={17} color={palette.muted} /></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Show all agents" onPress={() => router.push('/(tabs)/agents')} style={styles.filter}><Text style={styles.filterText}>All agents</Text><Ionicons name="chevron-down" size={13} color={palette.muted} /></Pressable>
          </View>
        </View>
        {activity.map(({ agent, last }) => <Card key={agent.id} style={styles.activity}>
          <View style={styles.activityHeader}><AgentAvatar name={agent.name} character={agent.character} color={agent.color || palette.muted} size={38} /><View style={styles.activityIdentity}><Text style={styles.agentName}>{agent.name}</Text><Text style={styles.when}>Active in your workspace</Text></View><Pressable onPress={() => goToAgent(agent.id)} style={styles.more}><Ionicons name="ellipsis-horizontal" size={17} color={palette.muted} /></Pressable></View>
          <Pressable onPress={() => goToAgent(agent.id)}><Text style={styles.activityText} numberOfLines={3}>{last.content}</Text></Pressable>
          <View style={styles.activityFooter}><Text style={styles.channel}>Skydive</Text><Pressable onPress={() => goToAgent(agent.id)} style={styles.open}><Text style={styles.openText}>Open conversation</Text><Ionicons name="arrow-forward" size={13} color={palette.muted} /></Pressable></View>
        </Card>)}
        {activity.length === 0 && <Card style={styles.welcomeCard}>
          <Text style={styles.welcomeCardTitle}>Welcome to your workspace</Text>
          <Text style={styles.welcomeCardBody}>Create an agent or bring one in from a template to start a conversation.</Text>
          <View style={styles.welcomeActions}><Pressable onPress={() => router.push('/create-agent')} style={styles.primaryAction}><Ionicons name="add" size={15} color={palette.background} /><Text style={styles.primaryActionText}>New agent</Text></Pressable><Pressable onPress={() => router.push('/(tabs)/templates')} style={styles.secondaryAction}><Text style={styles.secondaryActionText}>Browse templates</Text></Pressable></View>
        </Card>}
        <Pressable onPress={() => router.push('/(tabs)/agents')} style={styles.recommend}><Ionicons name="people-outline" size={18} color={palette.muted} /><View style={styles.recommendCopy}><Text style={styles.recommendTitle}>Your agents</Text><Text style={styles.recommendText}>{agents.length ? `${agents.length} agents in your local workspace` : 'Add an agent to your team'}</Text></View><Ionicons name="arrow-forward" size={15} color={palette.quiet} /></Pressable>
      </View>

      <View style={styles.sidebar}>
        <Card style={styles.statusCard}>
          <Text style={styles.sideTitle}>Default model</Text>
          <Text style={styles.modelName}>{model.model || provider.model}</Text>
          <Text style={styles.sideCopy}>{provider.name} · {provider.keyRequired ? 'Bring your own API key' : 'Runs on your device'}</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/settings')} style={styles.settingsLink}><Text style={styles.settingsLinkText}>Provider settings</Text><Ionicons name="arrow-forward" size={13} color={palette.text} /></Pressable>
        </Card>
        <Card style={styles.statusCard}>
          <Text style={styles.sideTitle}>Workspace</Text>
          <Text style={styles.sideCopy}>Your agents and conversations stay on this device.</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/agents')} style={styles.settingsLink}><Text style={styles.settingsLinkText}>Manage agents</Text><Ionicons name="arrow-forward" size={13} color={palette.text} /></Pressable>
        </Card>
      </View>
    </View>

    <View style={styles.featured}>
      <View style={styles.featuredHeading}><Text style={styles.featuredTitle}>Add an expert to your team</Text><Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/templates')}><Text style={styles.seeAll}>See all</Text></Pressable></View>
      <View style={styles.featuredGrid}>{featuredTemplates.map((template) => <Card key={template.id} style={styles.featuredCard}>
        <Pressable accessibilityRole="button" onPress={() => router.push(`/template/${template.id}` as never)} style={styles.featuredHead}><AgentAvatar name={template.name} character={template.character} color={template.color} size={45} /><View style={styles.featuredCopy}><Text numberOfLines={1} style={styles.featuredName}>{template.role}</Text><Text style={styles.featuredByline}>{template.name} · Skydive</Text></View></Pressable>
        <Pressable onPress={() => router.push(`/template/${template.id}` as never)}><Text numberOfLines={2} style={styles.featuredDescription}>{template.tagline}</Text></Pressable>
        <Pressable onPress={() => addTemplate(template)} style={styles.addButton}><Ionicons name="add" size={14} color={palette.background} /><Text style={styles.addButtonText}>Add to your team</Text></Pressable>
      </Card>)}</View>
    </View>
    <Pressable onPress={() => router.push('/(tabs)/agents')} style={styles.float}><Ionicons name="chatbubbles-outline" size={16} color={palette.text} /><Text style={styles.floatText}>Message your agents</Text></Pressable>
  </Screen>;
}

function Shortcut({ icon, title, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.shortcutItem, pressed && styles.pressed]}><View style={styles.shortcutIcon}><Ionicons name={icon} size={20} color={palette.text} /></View><Text numberOfLines={1} style={styles.shortcutLabel}>{title}</Text></Pressable>;
}

const styles = StyleSheet.create({
  page: { minHeight: '100%', alignItems: 'stretch', width: '100%', maxWidth: '100%', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48, gap: 23 },
  homeGrid: { width: '100%', maxWidth: 1030, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center', gap: 18 },
  feed: { width: '100%', maxWidth: 610, flexGrow: 2, flexBasis: 560, gap: 14 },
  welcome: { color: palette.text, fontSize: 20, fontWeight: '600', marginBottom: 2 },
  feedTools: { flexDirection: 'row', gap: 8, marginBottom: 5 },
  searchText: { color: palette.quiet, fontSize: 11, flex: 1 },
  filter: { minHeight: 34, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, borderRadius: 18, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 7 },
  filterText: { color: palette.muted, fontSize: 10 },
  activity: { borderRadius: 12, padding: 15, gap: 12 },
  activityHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  activityIdentity: { flex: 1, gap: 3 },
  agentName: { color: palette.text, fontSize: 12, fontWeight: '700' },
  when: { color: palette.quiet, fontSize: 10 },
  more: { padding: 6 },
  activityText: { color: '#D5D5D5', fontSize: 12, lineHeight: 19 },
  activityFooter: { borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  channel: { color: palette.quiet, fontSize: 10 },
  open: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  openText: { color: palette.muted, fontSize: 10 },
  welcomeCard: { alignItems: 'flex-start', padding: 23, gap: 10 },
  welcomeCardTitle: { color: palette.text, fontSize: 16, fontWeight: '700' },
  welcomeCardBody: { color: palette.muted, fontSize: 12, lineHeight: 18, maxWidth: 400 },
  welcomeActions: { flexDirection: 'row', gap: 8, marginTop: 3 },
  primaryAction: { minHeight: 35, borderRadius: 8, backgroundColor: palette.text, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5, paddingHorizontal: 12 },
  primaryActionText: { color: palette.background, fontSize: 10, fontWeight: '700' },
  secondaryAction: { minHeight: 35, borderRadius: 8, backgroundColor: palette.raised, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  secondaryActionText: { color: palette.text, fontSize: 10, fontWeight: '600' },
  recommend: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, padding: 13 },
  recommendCopy: { flex: 1, gap: 3 },
  recommendTitle: { color: palette.text, fontSize: 11, fontWeight: '700' },
  recommendText: { color: palette.quiet, fontSize: 10 },
  sidebar: { width: '100%', maxWidth: 285, flexGrow: 1, flexBasis: 245, gap: 11 },
  statusCard: { padding: 15, gap: 9 },
  sideTitle: { color: palette.text, fontSize: 13, fontWeight: '600' },
  modelName: { color: palette.text, fontSize: 17, fontWeight: '600' },
  sideCopy: { color: palette.muted, fontSize: 11, lineHeight: 17 },
  settingsLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderColor: palette.border, paddingTop: 11, marginTop: 2 },
  settingsLinkText: { color: palette.text, fontSize: 10, fontWeight: '600' },
  featured: { width: '100%', maxWidth: 1030, alignSelf: 'center', gap: 13, marginTop: 1 },
  featuredHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featuredTitle: { color: palette.text, fontSize: 18, fontWeight: '600' },
  seeAll: { color: palette.muted, fontSize: 11, fontWeight: '600' },
  featuredGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  featuredCard: { flexGrow: 1, flexBasis: 225, maxWidth: '100%', minHeight: 178, justifyContent: 'space-between', padding: 13, gap: 11 },
  featuredHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  featuredCopy: { flex: 1, gap: 3 },
  featuredName: { color: palette.text, fontSize: 11, fontWeight: '700' },
  featuredByline: { color: palette.quiet, fontSize: 9 },
  featuredDescription: { color: palette.muted, fontSize: 10, lineHeight: 15, minHeight: 30 },
  addButton: { minHeight: 32, borderRadius: 7, backgroundColor: palette.text, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },
  addButtonText: { color: palette.background, fontSize: 10, fontWeight: '700' },
  shortcutItem: { alignItems: 'center', gap: 8, width: 80 },
  shortcutIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  shortcutLabel: { color: palette.muted, fontSize: 11, fontWeight: '600', maxWidth: 86 },
  float: { position: 'fixed' as never, left: 24, bottom: 20, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 10 },
  floatText: { color: palette.text, fontSize: 10, fontWeight: '600' },
  pressed: { opacity: 0.74 },
});

const homeLayoutStyles = StyleSheet.create({
  shortcuts: { flexDirection: 'row', justifyContent: 'center', gap: 21, flexWrap: 'wrap', paddingVertical: 2, marginTop: 0, marginBottom: 2 },
  welcomeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feedTools: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  search: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});

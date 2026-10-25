import { useLocalSearchParams, router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, AgentAvatar, Card, Screen, WorkspaceHeader } from '@/components/HarborUI';
import { agentTemplates, uniqueTemplateName } from '@/data/templates';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const template = useMemo(() => agentTemplates.find((entry) => entry.id === id), [id]);
  const { agents, createAgent } = useWorkspace();

  if (!template) {
    return <Screen style={styles.page}>
      <WorkspaceHeader back />
      <Card style={styles.notFound}>
        <Text style={styles.title}>Template not found</Text>
        <Text style={styles.muted}>This starting point may have been removed.</Text>
        <ActionButton title="Back to templates" icon="arrow-back" tone="secondary" onPress={() => router.replace('/(tabs)/templates')} />
      </Card>
    </Screen>;
  }

  const addTemplate = () => {
    const agentId = createAgent({ name: uniqueTemplateName(template.name, agents), role: template.role, goal: template.goal, color: template.color });
    router.replace(`/agent/${agentId}`);
  };

  const outcomes = [
    { icon: 'flag-outline' as const, title: 'A clear goal', description: template.goal },
    { icon: 'chatbubble-ellipses-outline' as const, title: 'A focused conversation', description: 'Keep this agent’s requests and replies together on this device.' },
    { icon: 'options-outline' as const, title: 'Your provider choice', description: 'Connect a model provider in settings when you are ready. API keys stay out of the workspace records.' },
  ];

  return <Screen style={styles.page}>
    <WorkspaceHeader back />
    <View style={styles.content}>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)/templates')} style={styles.backLink}>
        <Ionicons name="arrow-back" size={14} color={palette.muted} /><Text style={styles.backText}>Templates</Text>
      </Pressable>
      <Card style={styles.hero}>
        <View style={[styles.art, { backgroundColor: `${template.color}18`, borderColor: `${template.color}45` }]}>
          <View style={[styles.glow, { backgroundColor: template.color }]} />
          <AgentAvatar name={template.name} color={template.color} size={82} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.title}>{template.role}</Text>
          <Text style={styles.byline}>{template.name} · AgentHarbor · {template.category}</Text>
          <Text style={styles.description}>{template.description}</Text>
          <ActionButton title="Add to your workspace" icon="add" onPress={addTemplate} style={styles.addButton} />
        </View>
      </Card>

      <View style={styles.columns}>
        <View style={styles.mainColumn}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Meet {template.name}</Text>
            <Text style={styles.body}>{template.description} {template.name} starts with a clear role and goal, then you can shape its instructions to fit your own workflow.</Text>
          </Card>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>What you get</Text>
            {outcomes.map((item) => <View key={item.title} style={styles.outcome}>
              <View style={[styles.outcomeIcon, { backgroundColor: `${template.color}18` }]}><Ionicons name={item.icon} size={16} color={template.color} /></View>
              <View style={styles.outcomeCopy}><Text style={styles.outcomeTitle}>{item.title}</Text><Text style={styles.muted}>{item.description}</Text></View>
            </View>)}
          </Card>
        </View>
        <View style={styles.sideColumn}>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Focus areas</Text>
            <Text style={styles.muted}>Suggested topics for the agent’s instructions. These are not connected services.</Text>
            <View style={styles.tags}>{template.tools.map((item) => <View key={item} style={styles.tag}><Text style={styles.tagText}>{item}</Text></View>)}</View>
          </Card>
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Make it yours</Text>
            <Text style={styles.muted}>You can change this agent’s name, role, and goal after it is added.</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/settings')} style={styles.settingsLink}>
              <Text style={styles.settingsLinkText}>Provider settings</Text><Ionicons name="arrow-forward" size={13} color={palette.text} />
            </Pressable>
          </Card>
        </View>
      </View>
      <View style={styles.bottomAction}>
        <ActionButton title={`Add ${template.name} to your workspace`} icon="add" onPress={addTemplate} />
      </View>
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 940, paddingTop: 16, gap: 18 },
  content: { gap: 14 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, alignSelf: 'flex-start' },
  backText: { color: palette.muted, fontSize: 11 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 20, borderRadius: 12, padding: 18 },
  art: { width: 144, height: 144, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  glow: { position: 'absolute', width: 105, height: 105, borderRadius: 60, opacity: 0.12 },
  heroCopy: { flex: 1, gap: 8 },
  title: { color: palette.text, fontSize: 24, fontWeight: '700', letterSpacing: -0.45 },
  byline: { color: palette.quiet, fontSize: 10 },
  description: { color: palette.muted, fontSize: 12, lineHeight: 18 },
  addButton: { alignSelf: 'flex-start', marginTop: 4 },
  columns: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 12 },
  mainColumn: { flexGrow: 2, flexBasis: 390, gap: 12 },
  sideColumn: { flexGrow: 1, flexBasis: 230, gap: 12 },
  section: { borderRadius: 11, padding: 15, gap: 11 },
  sectionTitle: { color: palette.text, fontSize: 13, fontWeight: '600' },
  body: { color: palette.muted, fontSize: 11, lineHeight: 18 },
  outcome: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  outcomeIcon: { width: 29, height: 29, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  outcomeCopy: { flex: 1, gap: 3 },
  outcomeTitle: { color: palette.text, fontSize: 10, fontWeight: '600' },
  muted: { color: palette.muted, fontSize: 10, lineHeight: 15 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: palette.raised, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 },
  tagText: { color: palette.muted, fontSize: 9 },
  settingsLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderColor: palette.border, paddingTop: 10 },
  settingsLinkText: { color: palette.text, fontSize: 10, fontWeight: '600' },
  bottomAction: { paddingVertical: 2 },
  notFound: { padding: 20, gap: 12 },
});

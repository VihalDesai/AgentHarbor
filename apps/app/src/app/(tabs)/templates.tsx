import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AgentAvatar, Brand, Card, Eyebrow, Screen } from '@/components/HarborUI';
import { agentTemplates, uniqueTemplateName } from '@/data/templates';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';

const filters = ['All', ...Array.from(new Set(agentTemplates.map((item) => item.category)))];

export default function TemplatesScreen() {
  const [filter, setFilter] = useState('All');
  const { agents, createAgent } = useWorkspace();
  const entries = useMemo(() => filter === 'All' ? agentTemplates : agentTemplates.filter((item) => item.category === filter), [filter]);
  const add = (template: typeof agentTemplates[number]) => {
    const id = createAgent({ name: uniqueTemplateName(template.name, agents), role: template.role, goal: template.goal, color: template.color });
    router.replace(`/agent/${id}`);
  };
  return <Screen>
    <View style={styles.header}><Brand compact /><Pressable onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={20} color={palette.text} /></Pressable></View>
    <Eyebrow>START WITH A GOOD FIRST DRAFT</Eyebrow>
    <Text style={styles.title}>Agent templates</Text>
    <Text style={styles.subtitle}>Choose a starting point, then make it yours.</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterOn]}><Text style={[styles.filterText, filter === item && styles.filterTextOn]}>{item}</Text></Pressable>)}</ScrollView>
    <View style={styles.grid}>{entries.map((template) => <Card key={template.id} style={styles.templateCard}>
      <View style={styles.cardHead}><AgentAvatar name={template.name} color={template.color} size={47} /><View style={styles.cardHeadCopy}><Text style={styles.name}>{template.role}</Text><Text style={styles.byline}>{template.name} · {template.category}</Text></View><Ionicons name={template.icon as keyof typeof Ionicons.glyphMap} size={20} color={template.color} /></View>
      <Text style={styles.description}>{template.description}</Text>
      <View style={styles.toolRow}>{template.tools.map((tool) => <View key={tool} style={styles.tool}><Text style={styles.toolText}>{tool}</Text></View>)}</View>
      <Pressable onPress={() => add(template)} style={({ pressed }) => [styles.useButton, pressed && styles.pressed]}><Ionicons name="add" size={16} color={palette.background} /><Text style={styles.useText}>Add to your workspace</Text></Pressable>
    </Card>)}</View>
    <Text style={styles.footer}>Templates are local starting points. No account or external integration required.</Text>
  </Screen>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, close: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: palette.raised }, title: { color: palette.text, fontSize: 32, fontWeight: '800', letterSpacing: -1 }, subtitle: { color: palette.muted, fontSize: 13 }, filters: { gap: 8 }, filter: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 99, backgroundColor: palette.raised, borderWidth: 1, borderColor: palette.border }, filterOn: { backgroundColor: '#30271F', borderColor: palette.amber }, filterText: { color: palette.muted, fontSize: 11, fontWeight: '600' }, filterTextOn: { color: palette.amber }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, templateCard: { flexGrow: 1, flexBasis: 300, maxWidth: '100%', minHeight: 226, justifyContent: 'space-between' }, cardHead: { flexDirection: 'row', alignItems: 'center', gap: 11 }, cardHeadCopy: { flex: 1, gap: 3 }, name: { color: palette.text, fontSize: 14, fontWeight: '700' }, byline: { color: palette.quiet, fontSize: 10 }, description: { color: palette.muted, fontSize: 12, lineHeight: 18, minHeight: 36 }, toolRow: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' }, tool: { backgroundColor: palette.raised, borderRadius: 99, paddingVertical: 5, paddingHorizontal: 9 }, toolText: { color: palette.muted, fontSize: 10 }, useButton: { minHeight: 40, borderRadius: 12, backgroundColor: palette.lime, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 5 }, useText: { color: palette.background, fontSize: 11, fontWeight: '800' }, pressed: { opacity: 0.75 }, footer: { color: palette.quiet, fontSize: 10, textAlign: 'center', marginTop: 8 } });

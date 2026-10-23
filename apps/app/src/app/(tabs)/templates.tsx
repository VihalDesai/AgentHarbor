import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AgentAvatar, Brand, Card, Screen } from '@/components/HarborUI';
import { agentTemplates, uniqueTemplateName } from '@/data/templates';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';

const filters = ['All', ...Array.from(new Set(agentTemplates.map((item) => item.category)))];

export default function TemplatesScreen() {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const { agents, createAgent } = useWorkspace();
  const entries = useMemo(() => agentTemplates.filter((item) => (filter === 'All' || item.category === filter) && `${item.name} ${item.role} ${item.description} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase())), [filter, query]);
  const add = (template: typeof agentTemplates[number]) => {
    const id = createAgent({ name: uniqueTemplateName(template.name, agents), role: template.role, goal: template.goal, color: template.color });
    router.replace(`/agent/${id}`);
  };
  return <Screen>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={17} color={palette.muted} /><Text style={styles.backText}>Back</Text></Pressable><Brand compact /></View>
    <View style={styles.titleRow}><View><Text style={styles.title}>Templates</Text><Text style={styles.subtitle}>Choose a starting point, then make it yours.</Text></View><Text style={styles.resultCount}>{entries.length} templates</Text></View>
    <View style={styles.search}><Ionicons name="search-outline" size={16} color={palette.quiet} /><TextInput value={query} onChangeText={setQuery} placeholder="Search templates" placeholderTextColor={palette.quiet} style={styles.searchInput} /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterOn]}><Text style={[styles.filterText, filter === item && styles.filterTextOn]}>{item}</Text></Pressable>)}</ScrollView>
    <Text style={styles.sectionTitle}>From AgentHarbor</Text>
    <View style={styles.grid}>{entries.map((template) => <Card key={template.id} style={styles.templateCard}>
      <View style={styles.cardHead}><AgentAvatar name={template.name} color={template.color} size={47} /><View style={styles.cardHeadCopy}><Text style={styles.name}>{template.role}</Text><Text style={styles.byline}>{template.name} · {template.category}</Text></View><Ionicons name={template.icon as keyof typeof Ionicons.glyphMap} size={20} color={template.color} /></View>
      <Text style={styles.description}>{template.description}</Text>
      <View style={styles.toolRow}>{template.tools.map((tool) => <View key={tool} style={styles.tool}><Text style={styles.toolText}>{tool}</Text></View>)}</View>
      <Pressable onPress={() => add(template)} style={({ pressed }) => [styles.useButton, pressed && styles.pressed]}><Ionicons name="add" size={16} color={palette.background} /><Text style={styles.useText}>Add to your workspace</Text></Pressable>
    </Card>)}</View>
    <Text style={styles.footer}>Templates are local starting points. No account or external integration required.</Text>
  </Screen>;
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8 }, backText: { color: palette.muted, fontSize: 11 }, titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 }, title: { color: palette.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.5 }, subtitle: { color: palette.muted, fontSize: 12, marginTop: 6 }, resultCount: { color: palette.quiet, fontSize: 10, paddingBottom: 3 }, search: { minHeight: 39, borderRadius: 8, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 8 }, searchInput: { flex: 1, color: palette.text, fontSize: 12, paddingVertical: 7, outlineStyle: 'none' as never }, sectionTitle: { color: palette.text, fontSize: 14, fontWeight: '600', marginBottom: -6 }, filters: { gap: 7 }, filter: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 7, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }, filterOn: { backgroundColor: palette.raised, borderColor: '#555555' }, filterText: { color: palette.muted, fontSize: 10, fontWeight: '600' }, filterTextOn: { color: palette.text }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, templateCard: { flexGrow: 1, flexBasis: 290, maxWidth: '100%', minHeight: 206, justifyContent: 'space-between', borderRadius: 11, padding: 14 }, cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 }, cardHeadCopy: { flex: 1, gap: 3 }, name: { color: palette.text, fontSize: 13, fontWeight: '600' }, byline: { color: palette.quiet, fontSize: 10 }, description: { color: palette.muted, fontSize: 11, lineHeight: 17, minHeight: 34 }, toolRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' }, tool: { backgroundColor: palette.raised, borderRadius: 6, paddingVertical: 5, paddingHorizontal: 8 }, toolText: { color: palette.muted, fontSize: 9 }, useButton: { minHeight: 35, borderRadius: 7, backgroundColor: palette.text, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }, useText: { color: palette.background, fontSize: 10, fontWeight: '700' }, pressed: { opacity: 0.75 }, footer: { color: palette.quiet, fontSize: 10, textAlign: 'center', marginTop: 8 } });

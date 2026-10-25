import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AgentAvatar, Screen, WorkspaceHeader } from '@/components/HarborUI';
import { IntegrationLogo } from '@/components/IntegrationLogo';
import { agentTemplates, uniqueTemplateName } from '@/data/templates';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';

const categories = ['Customer Success', 'Design', 'Engineering', 'Marketing', 'Operations', 'People', 'Productivity', 'Research', 'Sales', 'Venture Capital'];
const filters = ['All', 'Created by me', 'From my workspace', ...categories];

export default function TemplatesScreen() {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [sourceView, setSourceView] = useState<'From Skydive' | 'Marketplace' | null>(null);
  const { agents, createAgent } = useWorkspace();
  const entries = useMemo(() => agentTemplates.filter((item) => {
    const inSource = !sourceView || item.source === sourceView;
    const isScopeFilter = filter === 'Created by me' || filter === 'From my workspace';
    const inScope = !isScopeFilter || item.source === filter;
    const inCategory = !categories.includes(filter) || item.category === filter;
    const haystack = `${item.name} ${item.role} ${item.author} ${item.description} ${item.category} ${item.tools.join(' ')} ${item.skills.map((skill) => skill.slug).join(' ')}`;
    return inSource && inScope && inCategory && haystack.toLowerCase().includes(query.trim().toLowerCase());
  }), [filter, query, sourceView]);
  const fromSkydive = entries.filter((item) => item.source === 'From Skydive');
  const marketplace = entries.filter((item) => item.source === 'Marketplace');
  const isCatalogView = sourceView !== null;
  const isWorkspaceFilter = filter === 'Created by me' || filter === 'From my workspace';
  const add = (template: typeof agentTemplates[number]) => {
    const id = createAgent({ name: uniqueTemplateName(template.name, agents), role: template.role, goal: template.goal, color: template.color, character: template.character, phases: template.phases });
    router.replace(`/agent/${id}`);
  };

  const templateCard = (template: typeof agentTemplates[number]) => <View key={template.id} style={styles.templateCard}>
    <Pressable accessibilityRole="button" accessibilityLabel={`View ${template.role} template`} onPress={() => router.push(`/template/${template.id}` as never)} style={styles.cardHead}>
      <AgentAvatar name={template.name} character={template.character} color={template.color} size={48} />
      <View style={styles.cardHeadCopy}>
        <View style={styles.nameRow}><Text numberOfLines={1} style={styles.templateName}>{template.role}</Text>{template.isNew && <View style={styles.newBadge}><Text style={styles.newText}>New</Text></View>}</View>
        <Text numberOfLines={1} style={styles.byline}>{template.name} · By {template.author}</Text>
      </View>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel={`Read about ${template.role}`} onPress={() => router.push(`/template/${template.id}` as never)}>
      <Text numberOfLines={3} style={styles.description}>{template.tagline}</Text>
    </Pressable>
    <View style={styles.cardMeta}>
      <View style={styles.toolRow}>{template.tools.slice(0, 3).map((tool) => <View key={tool} style={styles.tool}><IntegrationLogo name={tool} size={14} /><Text numberOfLines={1} style={styles.toolText}>{tool}</Text></View>)}{template.tools.length > 3 && <Text style={styles.moreTools}>+{template.tools.length - 3}</Text>}</View>
      {!!template.skills.length && <View style={styles.skillCountRow}><Ionicons name="sparkles-outline" size={13} color={palette.muted} /><Text style={styles.skillCount}>{template.skills.length} {template.skills.length === 1 ? 'skill' : 'skills'}</Text></View>}
    </View>
    <Pressable accessibilityRole="button" onPress={() => add(template)} style={({ pressed }) => [styles.useButton, pressed && styles.pressed]}>
      <Text style={styles.useText}>Add to team</Text>
    </Pressable>
  </View>;

  return <Screen style={styles.page}>
    <WorkspaceHeader />
    <Pressable accessibilityRole="button" onPress={() => isCatalogView ? setSourceView(null) : router.back()} style={styles.backLink}><Ionicons name="arrow-back" size={14} color={palette.muted} /><Text style={styles.backText}>{isCatalogView ? 'Back to all templates' : 'Back'}</Text></Pressable>
    <Text style={styles.title}>{sourceView === 'From Skydive' ? 'Templates from Skydive' : sourceView === 'Marketplace' ? 'Marketplace' : 'Templates'}</Text>
    <View style={styles.search}><Ionicons name="search-outline" size={16} color={palette.quiet} /><TextInput value={query} onChangeText={setQuery} placeholder="Search templates…" placeholderTextColor={palette.quiet} style={styles.searchInput} /></View>
    <View style={styles.filters}>{filters.map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: filter === item }} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterOn]}><Text style={[styles.filterText, filter === item && styles.filterTextOn]}>{item}</Text></Pressable>)}</View>
    {!entries.length && (isWorkspaceFilter
      ? <Text style={styles.emptyText}>No templates here yet.</Text>
      : <View style={styles.empty}><Text style={styles.emptyTitle}>No templates found</Text><Text style={styles.emptyHint}>Try another category or search.</Text></View>)}
    {isCatalogView && <View style={styles.grid}>{entries.map(templateCard)}</View>}
    {!isCatalogView && !!fromSkydive.length && <View style={styles.section}><View style={styles.sectionHeading}><Text style={styles.sectionTitle}>From Skydive</Text><Pressable onPress={() => { setFilter('All'); setQuery(''); setSourceView('From Skydive'); }}><Text style={styles.seeAll}>See all</Text></Pressable></View><View style={styles.grid}>{fromSkydive.slice(0, 4).map(templateCard)}</View></View>}
    {!isCatalogView && !!marketplace.length && <View style={styles.section}><View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Marketplace</Text><Pressable onPress={() => { setFilter('All'); setQuery(''); setSourceView('Marketplace'); }}><Text style={styles.seeAll}>See all</Text></Pressable></View><View style={styles.grid}>{marketplace.slice(0, 4).map(templateCard)}</View></View>}
  </Screen>;
}

const styles = StyleSheet.create({
  page: { maxWidth: 880, paddingTop: 28, paddingBottom: 28, gap: 15 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3, alignSelf: 'flex-start' },
  backText: { color: palette.muted, fontSize: 12, fontFamily: 'Inter_400Regular' },
  title: { color: palette.text, fontSize: 32, lineHeight: 48, fontWeight: '500', letterSpacing: -0.2, marginTop: 1, fontFamily: 'Inter_500Medium' },
  search: { minHeight: 43, borderRadius: 9, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1, color: palette.text, fontSize: 12, paddingVertical: 8, outlineStyle: 'none' as never, fontFamily: 'Inter_400Regular' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  filter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border },
  filterOn: { backgroundColor: '#F4F4F4', borderColor: '#F4F4F4' },
  filterText: { color: palette.muted, fontSize: 12, fontWeight: '500', fontFamily: 'Inter_500Medium' },
  filterTextOn: { color: '#111111' },
  section: { gap: 26, marginTop: 3 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: palette.text, fontSize: 16, fontWeight: '600', letterSpacing: -0.2, fontFamily: 'Inter_600SemiBold' },
  seeAll: { color: palette.muted, fontSize: 12, fontFamily: 'Inter_400Regular' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  templateCard: { flexGrow: 1, flexBasis: 320, maxWidth: '100%', minHeight: 248, borderRadius: 14, borderWidth: 1, borderColor: '#282828', backgroundColor: '#1D1D1D', padding: 20, justifyContent: 'space-between', gap: 12 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardHeadCopy: { flex: 1, gap: 4, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  templateName: { color: palette.text, fontSize: 16, fontWeight: '600', flexShrink: 1, fontFamily: 'Inter_600SemiBold' },
  newBadge: { borderRadius: 9, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: '#18212B' },
  newText: { color: '#A8CCF2', fontSize: 10, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  byline: { color: '#A1A1A1', fontSize: 13, fontFamily: 'Inter_400Regular' },
  description: { color: '#C0C0C0', fontSize: 14, lineHeight: 20, minHeight: 39, fontFamily: 'Inter_400Regular' },
  cardMeta: { gap: 8 },
  toolRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  tool: { maxWidth: 145, backgroundColor: '#2A2A2A', borderRadius: 18, paddingHorizontal: 9, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 },
  toolText: { color: '#E3E3E3', fontSize: 9, flexShrink: 1, fontFamily: 'Inter_400Regular' },
  moreTools: { color: palette.muted, fontSize: 10, fontFamily: 'Inter_400Regular' },
  skillCountRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  skillCount: { color: '#B7B7B7', fontSize: 12, fontFamily: 'Inter_400Regular' },
  useButton: { minHeight: 34, borderRadius: 8, backgroundColor: '#303030', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  useText: { color: palette.text, fontSize: 13, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  pressed: { opacity: 0.75 },
  empty: { minHeight: 120, borderRadius: 12, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 24 },
  emptyTitle: { color: palette.text, fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptyHint: { color: palette.muted, fontSize: 13, fontFamily: 'Inter_400Regular' },
  emptyText: { alignSelf: 'flex-start', color: palette.text, fontSize: 15, lineHeight: 22.5, fontFamily: 'Inter_400Regular' },
});

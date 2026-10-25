import { useLocalSearchParams, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, AgentAvatar, Screen, WorkspaceHeader } from '@/components/HarborUI';
import { IntegrationLogo } from '@/components/IntegrationLogo';
import { agentTemplates, uniqueTemplateName } from '@/data/templates';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const template = useMemo(() => agentTemplates.find((entry) => entry.id === id), [id]);
  const { agents, createAgent } = useWorkspace();
  const [shareNotice, setShareNotice] = useState('');

  if (!template) {
    return <Screen style={styles.page}>
      <WorkspaceHeader />
      <View style={styles.notFound}>
        <Text style={styles.title}>Template not found</Text>
        <Text style={styles.body}>This starting point may have been removed.</Text>
        <ActionButton title="Back to templates" icon="arrow-back" tone="secondary" onPress={() => router.replace('/(tabs)/templates')} />
      </View>
    </Screen>;
  }

  const addTemplate = () => {
    const agentId = createAgent({ name: uniqueTemplateName(template.name, agents), role: template.role, goal: template.goal, color: template.color, character: template.character, phases: template.phases });
    router.replace(`/agent/${agentId}`);
  };

  const copyLink = async () => {
    const url = Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.href
      : `agentharbor://template/${template.id}`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareNotice('Link copied');
        return;
      }
      await Share.share({ message: url });
      setShareNotice('Share link ready');
    } catch {
      setShareNotice('Could not share this template');
    }
  };

  const openSkills = async () => {
    const url = template.skills.find((skill) => skill.url)?.url;
    if (url) await Linking.openURL(url);
  };

  return <Screen style={styles.page}>
    <WorkspaceHeader />
    <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)/templates')} style={styles.backLink}>
      <Ionicons name="arrow-back" size={14} color={palette.muted} /><Text style={styles.backText}>Back</Text>
    </Pressable>

    <View style={styles.hero}>
      <AgentAvatar name={template.name} character={template.character} color={template.color} size={64} />
      <View style={styles.heroCopy}>
        <View style={styles.nameRow}><Text style={styles.title}>{template.role}</Text>{template.isNew && <View style={styles.newBadge}><Text style={styles.newText}>New</Text></View>}</View>
        <Text style={styles.byline}>{template.name} · By {template.author}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={() => void copyLink()} style={styles.copyButton}><Text style={styles.copyText}>{shareNotice || 'Copy link'}</Text></Pressable>
        <ActionButton title="Add to your team" onPress={addTemplate} style={styles.addButton} />
      </View>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Meet {template.name}</Text>
      <Text style={styles.body}>{template.description}</Text>
    </View>

    {!!template.tools.length && <View style={styles.section}>
      <Text style={styles.sectionTitle}>Works with</Text>
      <View style={styles.pills}>{template.tools.map((tool) => <View key={tool} style={styles.integration}><IntegrationLogo name={tool} size={16} /><Text style={styles.integrationText}>{tool}</Text></View>)}</View>
    </View>}

    {!!template.skills.length && <View style={styles.section}>
      <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Skills</Text>{template.skills.some((skill) => skill.url) && <Pressable accessibilityRole="button" onPress={() => void openSkills()}><Text style={styles.inlineAction}>Download skills</Text></Pressable>}</View>
      <View style={styles.pills}>{template.skills.map((skill) => <View key={skill.slug} style={styles.skill}><Ionicons name="sparkles-outline" size={12} color={palette.muted} /><Text style={styles.skillText}>{skill.slug}</Text></View>)}</View>
    </View>}

    {!!template.benefits.length && <View style={[styles.section, styles.benefitsSection]}>
      <Text style={styles.sectionTitle}>What you get</Text>
      <View style={styles.benefits}>{template.benefits.map((benefit) => <View key={benefit.title} style={styles.benefit}>
        <View style={styles.benefitIcon}><Ionicons name="checkmark-circle-outline" size={17} color={palette.muted} /></View>
        <View style={styles.benefitCopy}><Text style={styles.benefitTitle}>{benefit.title}</Text><Text style={styles.bodySmall}>{benefit.description}</Text></View>
      </View>)}</View>
    </View>}

    <View style={styles.footerCta}>
      <View style={styles.footerCopy}><Text style={styles.footerTitle}>Put {template.name} to work</Text><Text style={styles.bodySmall}>{template.tagline}</Text></View>
      <ActionButton title="Add to your team" onPress={addTemplate} />
    </View>
  </Screen>;
}

const styles = StyleSheet.create({
  page: { maxWidth: 1080, paddingTop: 29, paddingBottom: 38, gap: 38 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  backText: { color: palette.muted, fontSize: 12, fontFamily: 'Inter_400Regular' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 15, flexWrap: 'wrap' },
  heroCopy: { flex: 1, minWidth: 190, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  title: { color: palette.text, fontSize: 32, lineHeight: 40, fontWeight: '500', letterSpacing: -0.2, fontFamily: 'Inter_500Medium' },
  newBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#18212B' },
  newText: { color: '#A8CCF2', fontSize: 10, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  byline: { color: palette.muted, fontSize: 13, fontFamily: 'Inter_400Regular' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 9, flexWrap: 'wrap' },
  copyButton: { minHeight: 39, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 9, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface },
  copyText: { color: palette.text, fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  addButton: { minHeight: 39, paddingHorizontal: 15 },
  section: { gap: 22, paddingBottom: 8 },
  benefitsSection: { marginTop: -8 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: palette.text, fontSize: 20, fontWeight: '600', letterSpacing: -0.25, fontFamily: 'Inter_600SemiBold' },
  body: { color: '#D1D1D1', fontSize: 16, lineHeight: 24, fontFamily: 'Inter_400Regular' },
  bodySmall: { color: palette.muted, fontSize: 15, lineHeight: 22, fontFamily: 'Inter_400Regular' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  integration: { minHeight: 33, borderRadius: 18, paddingHorizontal: 11, paddingVertical: 5, backgroundColor: '#262626', flexDirection: 'row', alignItems: 'center', gap: 7 },
  integrationText: { color: '#F0F0F0', fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  skill: { minHeight: 30, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#262626', flexDirection: 'row', alignItems: 'center', gap: 6 },
  skillText: { color: '#E5E5E5', fontSize: 11, fontFamily: 'Inter_400Regular' },
  inlineAction: { color: palette.text, fontSize: 12, textDecorationLine: 'underline', fontFamily: 'Inter_400Regular' },
  benefits: { gap: 0, maxWidth: 640 },
  benefit: { flexDirection: 'row', alignItems: 'flex-start', gap: 13, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#282828' },
  benefitIcon: { width: 20, paddingTop: 1 },
  benefitCopy: { flex: 1, gap: 5 },
  benefitTitle: { color: palette.text, fontSize: 16, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  footerCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', borderTopWidth: 1, borderColor: palette.border, paddingTop: 20 },
  footerCopy: { flex: 1, minWidth: 210, gap: 4 },
  footerTitle: { color: palette.text, fontSize: 20, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  notFound: { padding: 20, gap: 13, borderRadius: 12, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border },
});

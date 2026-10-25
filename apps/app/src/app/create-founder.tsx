import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, Card, FieldLabel, Heading, Screen, WorkspaceHeader } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';

export default function CreateFounderScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { ready, skills, founders } = useWorkspace();
  const existing = founders.find((founder) => founder.id === edit);
  if (!ready) return <Screen><WorkspaceHeader back /><Heading>Founder profile</Heading></Screen>;
  return <FounderProfileForm key={existing?.id ?? 'new-founder'} existing={existing} skills={skills} />;
}

function FounderProfileForm({ existing, skills }: { existing?: ReturnType<typeof useWorkspace>['founders'][number]; skills: ReturnType<typeof useWorkspace>['skills'] }) {
  const { createFounder, updateFounder } = useWorkspace();
  const [name, setName] = useState(existing?.name ?? '');
  const [title, setTitle] = useState(existing?.title ?? 'Founder');
  const [company, setCompany] = useState(existing?.company ?? '');
  const [about, setAbout] = useState(existing?.about ?? '');
  const [skillIds, setSkillIds] = useState<string[]>(existing?.skillIds ?? []);
  const toggleSkill = (id: string) => setSkillIds((selected) => selected.includes(id) ? selected.filter((item) => item !== id) : selected.length < 20 ? [...selected, id] : selected);
  const save = () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const input = { name: cleanName.slice(0, 100), title: title.trim().slice(0, 120) || 'Founder', company: company.trim().slice(0, 120), about: about.trim().slice(0, 1500), skillIds };
    if (existing) updateFounder(existing.id, input); else createFounder(input);
    router.replace('/founders' as never);
  };
  return <Screen>
    <WorkspaceHeader back />
    <Heading subtitle="Add a founder and select the skills that describe their work.">{existing ? 'Edit founder profile' : 'Founder profile'}</Heading>
    <Card style={styles.card}>
      <FieldLabel>Name</FieldLabel><TextInput value={name} onChangeText={setName} maxLength={100} autoFocus placeholder="e.g. Alex Morgan" placeholderTextColor={palette.quiet} style={styles.input} />
      <FieldLabel>Role or title</FieldLabel><TextInput value={title} onChangeText={setTitle} maxLength={120} placeholder="Founder & CEO" placeholderTextColor={palette.quiet} style={styles.input} />
      <FieldLabel>Company · optional</FieldLabel><TextInput value={company} onChangeText={setCompany} maxLength={120} placeholder="Company name" placeholderTextColor={palette.quiet} style={styles.input} />
      <FieldLabel>About · optional</FieldLabel><TextInput value={about} onChangeText={setAbout} maxLength={1500} multiline textAlignVertical="top" placeholder="Focus, background, or current priorities" placeholderTextColor={palette.quiet} style={[styles.input, styles.about]} />
      <View style={styles.skillsHeading}><FieldLabel>Founder skills</FieldLabel><Pressable accessibilityRole="button" onPress={() => router.push('/create-skill' as never)}><Text style={styles.addSkill}>+ Create skill</Text></Pressable></View>
      {!skills.length ? <View style={styles.noSkills}><Ionicons name="flash-outline" size={15} color={palette.muted} /><Text style={styles.noSkillsText}>Your skill library is empty. You can add skills now or save this profile first.</Text></View> : <View style={styles.skillsList}>{skills.map((skill) => {
        const selected = skillIds.includes(skill.id);
        return <Pressable key={skill.id} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => toggleSkill(skill.id)} style={[styles.skillOption, selected && styles.skillSelected]}><View style={[styles.check, selected && styles.checked]}>{selected && <Ionicons name="checkmark" size={12} color={palette.background} />}</View><View style={styles.skillCopy}><Text style={styles.skillName}>{skill.name}</Text>{skill.description ? <Text numberOfLines={2} style={styles.skillDescription}>{skill.description}</Text> : null}</View></Pressable>;
      })}</View>}
      <ActionButton title={existing ? 'Save changes' : 'Save founder profile'} icon="checkmark" onPress={save} disabled={!name.trim()} />
    </Card>
  </Screen>;
}

const styles = StyleSheet.create({ card: { width: '100%', maxWidth: 680 }, input: { minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background, color: palette.text, paddingHorizontal: 12, paddingVertical: 11, fontSize: 13 }, about: { minHeight: 86, textAlignVertical: 'top', lineHeight: 19 }, skillsHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, addSkill: { color: palette.text, fontSize: 11, fontWeight: '700' }, noSkills: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 9, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background, padding: 11 }, noSkillsText: { flex: 1, color: palette.muted, fontSize: 11, lineHeight: 16 }, skillsList: { gap: 7, maxHeight: 300 }, skillOption: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 9, borderWidth: 1, borderColor: palette.border, padding: 10, backgroundColor: palette.background }, skillSelected: { borderColor: palette.text, backgroundColor: palette.raised }, check: { width: 18, height: 18, borderRadius: 5, borderWidth: 1, borderColor: palette.quiet, alignItems: 'center', justifyContent: 'center', marginTop: 1 }, checked: { backgroundColor: palette.text, borderColor: palette.text }, skillCopy: { flex: 1, gap: 3 }, skillName: { color: palette.text, fontSize: 11, fontWeight: '700' }, skillDescription: { color: palette.muted, fontSize: 10, lineHeight: 14 } });

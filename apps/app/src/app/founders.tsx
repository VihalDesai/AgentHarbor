import { router } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, Card, Heading, Screen, WorkspaceHeader } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';

export default function FoundersScreen() {
  const { founders, skills, deleteFounder } = useWorkspace();
  const removeFounder = (id: string, name: string) => {
    const message = `Delete ${name}’s founder profile?`;
    if (Platform.OS === 'web') {
      if (globalThis.confirm(message)) deleteFounder(id);
      return;
    }
    Alert.alert('Delete founder profile?', message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteFounder(id) }]);
  };
  return <Screen>
    <WorkspaceHeader back />
    <View style={styles.headingRow}><Heading subtitle="Keep founder profiles and their selected skills together in this workspace.">Founders</Heading><ActionButton title="Add founder" icon="add" onPress={() => router.push('/create-founder' as never)} /></View>
    {!founders.length ? <Card style={styles.empty}><View style={styles.emptyIcon}><Ionicons name="people-outline" size={22} color={palette.text} /></View><Text style={styles.emptyTitle}>Add a founder profile</Text><Text style={styles.muted}>Create profiles for the people behind your company, then attach relevant skills from your library.</Text><ActionButton title="Create founder profile" icon="add" onPress={() => router.push('/create-founder' as never)} />{!skills.length && <Pressable accessibilityRole="button" onPress={() => router.push('/create-skill' as never)}><Text style={styles.link}>Create skills first</Text></Pressable>}</Card> : <View style={styles.list}>{founders.map((founder) => {
      const attachedSkills = skills.filter((skill) => founder.skillIds.includes(skill.id));
      return <Card key={founder.id} style={styles.founderCard}>
        <View style={styles.cardTop}><View style={styles.avatar}><Text style={styles.avatarText}>{founder.name.trim().charAt(0).toUpperCase()}</Text></View><View style={styles.founderCopy}><Text style={styles.founderName}>{founder.name}</Text><Text style={styles.muted}>{[founder.title, founder.company].filter(Boolean).join(' · ')}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Delete ${founder.name} profile`} onPress={() => removeFounder(founder.id, founder.name)} style={styles.delete}><Ionicons name="trash-outline" size={16} color={palette.muted} /></Pressable></View>
        {founder.about ? <Text style={styles.about}>{founder.about}</Text> : null}
        <View style={styles.skillsHeader}><Text style={styles.skillLabel}>FOUNDER SKILLS</Text><Pressable accessibilityRole="button" onPress={() => router.push('/skills' as never)}><Text style={styles.manage}>Manage library</Text></Pressable></View>
        {attachedSkills.length ? <View style={styles.chips}>{attachedSkills.map((skill) => <View key={skill.id} style={styles.chip}><Ionicons name="flash-outline" size={12} color={palette.muted} /><Text style={styles.chipText}>{skill.name}</Text></View>)}</View> : <Text style={styles.muted}>No skills selected</Text>}
        <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/create-founder', params: { edit: founder.id } } as never)} style={styles.editSkills}><Ionicons name="create-outline" size={14} color={palette.text} /><Text style={styles.editSkillsText}>Edit founder profile and skills</Text></Pressable>
      </Card>;
    })}</View>}
  </Screen>;
}

const styles = StyleSheet.create({ headingRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }, empty: { width: '100%', maxWidth: 660, alignItems: 'flex-start', padding: 24 }, emptyIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: palette.raised, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { color: palette.text, fontSize: 16, fontWeight: '700' }, muted: { color: palette.muted, fontSize: 12, lineHeight: 18 }, link: { color: palette.text, fontSize: 12, fontWeight: '700', paddingVertical: 5 }, list: { width: '100%', maxWidth: 760, gap: 11 }, founderCard: { gap: 12, padding: 16 }, cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 }, avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6672C7', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' }, founderCopy: { flex: 1, gap: 3 }, founderName: { color: palette.text, fontSize: 14, fontWeight: '700' }, delete: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background }, about: { color: '#D2D2D2', fontSize: 12, lineHeight: 18 }, skillsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 11 }, skillLabel: { color: palette.muted, fontSize: 9, fontWeight: '700', letterSpacing: 0.9 }, manage: { color: palette.text, fontSize: 10, fontWeight: '600' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.raised, paddingVertical: 6, paddingHorizontal: 9 }, chipText: { color: palette.text, fontSize: 10 }, editSkills: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 6 }, editSkillsText: { color: palette.text, fontSize: 10, fontWeight: '600' } });

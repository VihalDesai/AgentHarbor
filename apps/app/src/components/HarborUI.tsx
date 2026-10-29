import { Ionicons } from '@expo/vector-icons';
import { PropsWithChildren, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { palette } from '@/constants/palette';
import { CharacterPortrait } from '@/components/CharacterPortrait';
import { CompanyLogo } from '@/components/CompanyLogo';
import { characterForName } from '@/services/characters';
import type { CharacterId } from '@/model/types';
import { useWorkspace } from '@/state/WorkspaceStore';

export function Screen({ children, scroll = true, style, wide = false }: PropsWithChildren<{ scroll?: boolean; style?: ViewStyle; wide?: boolean }>) {
  const content = <View style={[styles.content, wide && styles.wideContent, style]}>{children}</View>;
  if (!scroll) return <View style={styles.screen}>{content}</View>;
  return <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">{content}</ScrollView>;
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return <CompanyLogo size={compact ? 'small' : 'large'} />;
}

export function WorkspaceHeader({ back = false, menuOnly = false }: { back?: boolean; menuOnly?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { companyName, storageProblem } = useWorkspace();
  const items = [
    { label: 'Home', icon: 'home-outline' as const, path: '/(tabs)' },
    { label: 'Agents', icon: 'people-outline' as const, path: '/(tabs)/agents' },
    { label: 'Routines', icon: 'repeat-outline' as const, path: '/(tabs)/routines' },
    { label: 'Providers & API', icon: 'hardware-chip-outline' as const, path: '/(tabs)/settings' },
    { label: 'Templates', icon: 'albums-outline' as const, path: '/(tabs)/templates' },
    { label: 'Skills', icon: 'flash-outline' as const, path: '/skills' },
    { label: 'Founders', icon: 'business-outline' as const, path: '/founders' },
    { label: 'Company', icon: 'git-branch-outline' as const, path: '/company' },
    { label: 'Chats', icon: 'chatbubbles-outline' as const, path: '/company-chat' },
  ];
  return <View style={[styles.headerSlot, menuOnly && styles.menuOnlySlot]}>
    {storageProblem && <View accessibilityRole="alert" style={styles.storageWarning}><Ionicons name="warning-outline" size={15} color={palette.amber} /><Text style={styles.storageWarningText}>{storageProblem}</Text></View>}
    <View style={[styles.workspaceHeader, menuOnly && styles.menuOnlyHeader, !menuOnly && !back && styles.referenceHeader]}>
    {menuOnly ? <View /> : back ? <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.headerBack}><Ionicons name="arrow-back" size={16} color={palette.muted} /><Text style={styles.headerBackText}>Back</Text></Pressable> : <Brand compact />}
    <Pressable accessibilityRole="button" accessibilityLabel="Open workspace menu" accessibilityState={{ expanded: menuOpen }} onPress={() => setMenuOpen(true)} style={styles.profileButton}><Text style={styles.profileInitials}>V</Text></Pressable>
    <Modal transparent visible={menuOpen} animationType="fade" onRequestClose={() => setMenuOpen(false)}>
      <View style={styles.menuRoot}>
        <Pressable accessibilityLabel="Close workspace menu" onPress={() => setMenuOpen(false)} style={styles.menuScrim} />
        <View style={styles.menuPanel}>
          <View style={styles.menuAccount}><View style={styles.menuAvatar}><Text style={styles.menuAvatarText}>V</Text></View><View><Text style={styles.menuAccountTitle}>{companyName}</Text><Text style={styles.menuAccountDetail}>Local company</Text></View></View>
          <View style={styles.menuDivider} />
          {items.map((item) => <Pressable key={item.label} accessibilityRole="button" onPress={() => { setMenuOpen(false); router.push(item.path as never); }} style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}><Ionicons name={item.icon} size={16} color={palette.muted} /><Text style={styles.menuLabel}>{item.label}</Text></Pressable>)}
          <View style={styles.menuDivider} />
          <Text style={styles.menuNote}>Open source · No pricing</Text>
        </View>
      </View>
    </Modal>
    </View>
  </View>;
}

export function Eyebrow({ children, style }: PropsWithChildren<{ style?: TextStyle }>) {
  return <Text style={[styles.eyebrow, style]}>{children}</Text>;
}

export function Heading({ children, subtitle, size = 'large' }: PropsWithChildren<{ subtitle?: string; size?: 'large' | 'medium' }>) {
  return <View style={styles.headingWrap}><Text style={size === 'large' ? styles.headingLarge : styles.headingMedium}>{children}</Text>{subtitle && <Text style={styles.headingSubtitle}>{subtitle}</Text>}</View>;
}

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ActionButton({ title, onPress, icon, tone = 'primary', style, disabled }: { title: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap; tone?: 'primary' | 'secondary' | 'quiet'; style?: ViewStyle; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.button, tone === 'primary' ? styles.buttonPrimary : tone === 'secondary' ? styles.buttonSecondary : styles.buttonQuiet, pressed && styles.pressed, disabled && styles.disabled, style]}>{icon && <Ionicons name={icon} size={17} color={tone === 'primary' ? palette.background : palette.text} />}<Text style={tone === 'primary' ? styles.buttonTextPrimary : styles.buttonText}>{title}</Text></Pressable>;
}

export function IconButton({ icon, onPress, label, tone = 'secondary' }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; label: string; tone?: 'secondary' | 'quiet' }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, tone === 'quiet' && styles.iconButtonQuiet, pressed && styles.pressed]}><Ionicons name={icon} size={19} color={palette.text} /></Pressable>;
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return <View style={styles.sectionTitle}><Text style={styles.sectionTitleText}>{title}</Text>{action && onAction && <Pressable onPress={onAction}><Text style={styles.sectionAction}>{action}</Text></Pressable>}</View>;
}

export function AgentAvatar({ name, color, size = 42, character }: { name: string; color: string; size?: number; character?: CharacterId }) {
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}><CharacterPortrait name={name} id={character ?? characterForName(name)} size={size} /></View>;
}

export function FieldLabel({ children }: PropsWithChildren) { return <Text style={styles.fieldLabel}>{children}</Text>; }
export function Hairline() { return <View style={styles.hairline} />; }
export function StatusPill({ label, color = palette.mint }: { label: string; color?: string }) { return <View style={[styles.statusPill, { borderColor: `${color}55`, backgroundColor: `${color}12` }]}><View style={[styles.statusDot, { backgroundColor: color }]} /><Text style={[styles.statusText, { color }]}>{label}</Text></View>; }

const styles = StyleSheet.create({
  headerSlot: { width: '100%', minHeight: 38, zIndex: 10, gap: 8 },
  menuOnlySlot: { height: 0 },
  storageWarning: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#65502C', backgroundColor: '#2D2518' },
  storageWarningText: { flex: 1, color: '#E8CB91', fontSize: 10, lineHeight: 15 },
  workspaceHeader: { width: '100%', minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 },
  referenceHeader: Platform.OS === 'web' ? { position: 'fixed' as never, top: 16, left: 24, right: 24, width: 'auto' as never, zIndex: 60 } : {},
  menuOnlyHeader: { position: 'fixed' as never, width: 38, right: 24, top: 12, zIndex: 60 },
  headerBack: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 2 },
  headerBackText: { color: palette.muted, fontSize: 12 },
  profileButton: { width: 38, height: 38, borderRadius: 20, backgroundColor: '#6672C7', alignItems: 'center', justifyContent: 'center' },
  profileInitials: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  menuRoot: { flex: 1, alignItems: 'flex-end' },
  menuScrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.34)' },
  menuPanel: { width: 238, marginTop: Platform.OS === 'web' ? 58 : 54, marginRight: 22, borderRadius: 12, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, padding: 8, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 14 },
  menuAccount: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  menuAvatar: { width: 34, height: 34, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6672C7' },
  menuAvatarText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  menuAccountTitle: { color: palette.text, fontSize: 12, fontWeight: '700' },
  menuAccountDetail: { color: palette.quiet, fontSize: 10, marginTop: 3 },
  menuDivider: { height: 1, backgroundColor: palette.border, marginVertical: 5 },
  menuItem: { minHeight: 40, borderRadius: 7, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuPressed: { backgroundColor: palette.raised },
  menuLabel: { color: palette.text, fontSize: 12 },
  menuNote: { color: palette.quiet, fontSize: 10, paddingHorizontal: 10, paddingVertical: 8 },
  screen: { flex: 1, backgroundColor: palette.background },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingBottom: 38 },
  content: { width: '100%', maxWidth: Platform.OS === 'web' ? 1180 : 680, paddingHorizontal: Platform.OS === 'web' ? 28 : 18, paddingTop: Platform.OS === 'web' ? 22 : 16, gap: 18 },
  wideContent: { maxWidth: '100%', paddingHorizontal: Platform.OS === 'web' ? 24 : 18 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  brandMark: { width: 30, height: 30, backgroundColor: '#F1F1F1', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: palette.background, fontSize: 12, fontWeight: '900', letterSpacing: -0.6 },
  brandName: { color: palette.text, fontSize: 20, fontWeight: '600', letterSpacing: -0.5 },
  brandCaption: { color: palette.quiet, fontSize: 11, marginTop: 2 },
  eyebrow: { color: palette.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' },
  headingWrap: { gap: 7 },
  headingLarge: { color: palette.text, fontSize: Platform.OS === 'web' ? 34 : 29, fontWeight: '800', letterSpacing: -1.1, lineHeight: Platform.OS === 'web' ? 41 : 36 },
  headingMedium: { color: palette.text, fontSize: 22, fontWeight: '700', letterSpacing: -0.6 },
  headingSubtitle: { color: palette.muted, fontSize: 14, lineHeight: 21 },
  card: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 12, padding: 15, gap: 12 },
  button: { minHeight: 38, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14 },
  buttonPrimary: { backgroundColor: palette.lime },
  buttonSecondary: { backgroundColor: palette.raised, borderWidth: 1, borderColor: palette.border },
  buttonQuiet: { backgroundColor: 'transparent' },
  buttonTextPrimary: { color: palette.background, fontSize: 13, fontWeight: '800' },
  buttonText: { color: palette.text, fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
  iconButton: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.raised, borderWidth: 1, borderColor: palette.border },
  iconButtonQuiet: { backgroundColor: 'transparent', borderColor: 'transparent' },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleText: { color: palette.text, fontSize: 15, fontWeight: '700' },
  sectionAction: { color: palette.lime, fontSize: 12, fontWeight: '700' },
  avatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarText: { fontWeight: '800' },
  fieldLabel: { color: palette.muted, fontSize: 12, fontWeight: '700' },
  hairline: { height: 1, backgroundColor: palette.border, width: '100%' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 100, paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
});

import { Ionicons } from '@expo/vector-icons';
import { PropsWithChildren } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { palette } from '@/constants/palette';

export function Screen({ children, scroll = true, style }: PropsWithChildren<{ scroll?: boolean; style?: ViewStyle }>) {
  const content = <View style={[styles.content, style]}>{children}</View>;
  if (!scroll) return <View style={styles.screen}>{content}</View>;
  return <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">{content}</ScrollView>;
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return <View style={styles.brandRow}><View style={styles.brandMark}><Text style={styles.brandMarkText}>AH</Text></View><View><Text style={styles.brandName}>AgentHarbor</Text>{!compact && <Text style={styles.brandCaption}>Your local agent workspace</Text>}</View></View>;
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

export function AgentAvatar({ name, color, size = 42 }: { name: string; color: string; size?: number }) {
  return <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}25`, borderColor: `${color}65` }]}><Text style={[styles.avatarText, { color, fontSize: size * 0.34 }]}>{name.slice(0, 1).toUpperCase()}</Text></View>;
}

export function FieldLabel({ children }: PropsWithChildren) { return <Text style={styles.fieldLabel}>{children}</Text>; }
export function Hairline() { return <View style={styles.hairline} />; }
export function StatusPill({ label, color = palette.mint }: { label: string; color?: string }) { return <View style={[styles.statusPill, { borderColor: `${color}55`, backgroundColor: `${color}12` }]}><View style={[styles.statusDot, { backgroundColor: color }]} /><Text style={[styles.statusText, { color }]}>{label}</Text></View>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingBottom: 38 },
  content: { width: '100%', maxWidth: Platform.OS === 'web' ? 1320 : 680, paddingHorizontal: Platform.OS === 'web' ? 30 : 20, paddingTop: Platform.OS === 'web' ? 28 : 18, gap: 21 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  brandMark: { width: 36, height: 36, backgroundColor: palette.lime, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: palette.background, fontSize: 12, fontWeight: '900', letterSpacing: -0.6 },
  brandName: { color: palette.text, fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  brandCaption: { color: palette.quiet, fontSize: 11, marginTop: 2 },
  eyebrow: { color: palette.lime, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  headingWrap: { gap: 7 },
  headingLarge: { color: palette.text, fontSize: Platform.OS === 'web' ? 34 : 29, fontWeight: '800', letterSpacing: -1.1, lineHeight: Platform.OS === 'web' ? 41 : 36 },
  headingMedium: { color: palette.text, fontSize: 22, fontWeight: '700', letterSpacing: -0.6 },
  headingSubtitle: { color: palette.muted, fontSize: 14, lineHeight: 21 },
  card: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 19, padding: 18, gap: 14 },
  button: { minHeight: 44, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  buttonPrimary: { backgroundColor: palette.lime },
  buttonSecondary: { backgroundColor: palette.raised, borderWidth: 1, borderColor: palette.border },
  buttonQuiet: { backgroundColor: 'transparent' },
  buttonTextPrimary: { color: palette.background, fontSize: 13, fontWeight: '800' },
  buttonText: { color: palette.text, fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
  iconButton: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.raised, borderWidth: 1, borderColor: palette.border },
  iconButtonQuiet: { backgroundColor: 'transparent', borderColor: 'transparent' },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleText: { color: palette.text, fontSize: 15, fontWeight: '700' },
  sectionAction: { color: palette.lime, fontSize: 12, fontWeight: '700' },
  avatar: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800' },
  fieldLabel: { color: palette.muted, fontSize: 12, fontWeight: '700' },
  hairline: { height: 1, backgroundColor: palette.border, width: '100%' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 100, paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
});

import { Image, StyleSheet, Text, View } from 'react-native';
import { palette } from '@/constants/palette';

export function CompanyLogo({ size = 'small' }: { size?: 'small' | 'large' }) {
  const large = size === 'large';
  return <View style={[styles.row, large && styles.largeRow]}>
    <Image source={require('../../assets/images/app-mark.png')} resizeMode="contain" style={[styles.mark, large && styles.largeMark]} accessibilityLabel="AI Automation and Agents logo mark" />
    <View style={styles.type}>
      <Text style={[styles.title, large && styles.largeTitle]}>AI Automation</Text>
      <Text style={[styles.subtitle, large && styles.largeSubtitle]}>A N D&nbsp; A G E N T S</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 6 }, largeRow: { gap: 11 }, mark: { width: 29, height: 29, borderRadius: 5 }, largeMark: { width: 58, height: 58, borderRadius: 9 }, type: { gap: 1, justifyContent: 'center' }, title: { color: palette.text, fontSize: 15, fontWeight: '800', letterSpacing: -0.5 }, largeTitle: { fontSize: 27, letterSpacing: -0.9 }, subtitle: { color: palette.muted, fontSize: 6.5, fontWeight: '600', letterSpacing: 1.1 }, largeSubtitle: { fontSize: 10, letterSpacing: 2.4 } });

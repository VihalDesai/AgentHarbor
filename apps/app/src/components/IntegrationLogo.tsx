import { FontAwesome5 } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

const brands: Record<string, { icon: string; color: string; brand?: boolean; solid?: boolean }> = {
  gmail: { icon: 'envelope', color: '#EA4335', solid: true },
  'google calendar': { icon: 'calendar-alt', color: '#4285F4', solid: true },
  'google drive': { icon: 'google-drive', color: '#34A853', brand: true },
  'google search console': { icon: 'google', color: '#4285F4', brand: true },
  'google sheets': { icon: 'table', color: '#0F9D58', solid: true },
  slack: { icon: 'slack', color: '#E01E5A', brand: true },
  github: { icon: 'github', color: '#F0F0F0', brand: true },
  gitlab: { icon: 'gitlab', color: '#FC6D26', brand: true },
  linear: { icon: 'circle', color: '#5E6AD2', solid: true },
  canva: { icon: 'image', color: '#7D2AE8', solid: true },
  dropbox: { icon: 'dropbox', color: '#0061FF', brand: true },
  instagram: { icon: 'instagram', color: '#E4405F', brand: true },
  notion: { icon: 'book-open', color: '#F5F5F5', solid: true },
  paper: { icon: 'sticky-note', color: '#B6A6FA', solid: true },
  'google docs': { icon: 'file-alt', color: '#4285F4', solid: true },
  twitter: { icon: 'twitter', color: '#1DA1F2', brand: true },
  linkedin: { icon: 'linkedin', color: '#0A66C2', brand: true },
  granola: { icon: 'coffee', color: '#D39A64', solid: true },
  readwise: { icon: 'book-open', color: '#F5C542', solid: true },
};

export function IntegrationLogo({ name, size = 14 }: { name: string; size?: number }) {
  const mark = brands[name.toLowerCase()] ?? { icon: 'puzzle-piece', color: '#B7B7B7', solid: true };
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.mark, { width: size, height: size }]}>
    <FontAwesome5 name={mark.icon as never} size={size} color={mark.color} brand={mark.brand} solid={mark.solid} />
  </View>;
}

const styles = StyleSheet.create({ mark: { alignItems: 'center', justifyContent: 'center' } });

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { palette } from '@/constants/palette';

export default function WorkspaceTabs() {
  const desktop = Platform.OS === 'web';
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: palette.text, tabBarInactiveTintColor: palette.quiet, tabBarStyle: desktop ? { display: 'none' } : { backgroundColor: palette.surface, borderTopColor: palette.border, height: 62, paddingTop: 6, paddingBottom: 8 }, tabBarLabelStyle: { fontSize: 10, fontWeight: '600' } }}>
    <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={desktop ? 17 : size} color={color} /> }} />
    <Tabs.Screen name="agents" options={{ title: 'Agents', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={desktop ? 17 : size} color={color} /> }} />
    <Tabs.Screen name="routines" options={{ title: 'Routines', tabBarIcon: ({ color, size }) => <Ionicons name="repeat-outline" size={desktop ? 17 : size} color={color} /> }} />
    <Tabs.Screen name="settings" options={{ title: 'Providers', tabBarIcon: ({ color, size }) => <Ionicons name="hardware-chip-outline" size={desktop ? 17 : size} color={color} /> }} />
    <Tabs.Screen name="templates" options={{ href: null }} />
  </Tabs>;
}

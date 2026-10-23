import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WorkspaceProvider } from '@/state/WorkspaceStore';
import { palette } from '@/constants/palette';

export default function RootLayout() {
  return (
    <ThemeProvider value={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: palette.background, card: palette.surface, text: palette.text, border: palette.border, primary: palette.lime } }}>
      <WorkspaceProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="create-agent" options={{ presentation: 'modal' }} />
          <Stack.Screen name="agent/[id]" />
        </Stack>
      </WorkspaceProvider>
    </ThemeProvider>
  );
}

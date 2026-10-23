import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AgentAvatar, Brand, Card, Screen, StatusPill } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { askLocalModel } from '@/services/model';
import { useWorkspace } from '@/state/WorkspaceStore';
import type { AgentMessage } from '@/model/types';

export default function AgentChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { agents, conversations, model, addMessage } = useWorkspace();
  const agent = agents.find((item) => item.id === id);
  const messages = conversations[id] ?? [];
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  if (!agent) return <Screen><Brand /><Card><Text style={styles.body}>This agent is no longer in your workspace.</Text><Pressable onPress={() => router.replace('/(tabs)/agents')}><Text style={styles.link}>Back to agents</Text></Pressable></Card></Screen>;

  const send = async () => {
    const content = draft.trim();
    if (!content || sending) return;
    setDraft('');
    setSending(true);
    const userMessage: AgentMessage = { id: `msg-${Date.now()}`, role: 'user', content, createdAt: 'Just now' };
    addMessage(agent.id, userMessage);
    const reply = await askLocalModel(model, `You are ${agent.name}, an agent whose role is ${agent.role}. Your goal is: ${agent.goal}. Be practical, clear, and honest about limitations.`, content);
    addMessage(agent.id, { id: `msg-${Date.now()}-reply`, role: 'assistant', content: reply.text, createdAt: 'Just now', mode: reply.source });
    setSending(false);
  };

  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView style={styles.screen} contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={palette.text} /></Pressable><Brand compact /><View style={styles.spacer} /><StatusPill label="On this device" /></View>
      <View style={styles.profile}><AgentAvatar name={agent.name} color={agent.color} size={54} /><View style={styles.profileText}><Text style={styles.name}>{agent.name}</Text><Text style={styles.role}>{agent.role}</Text></View></View>
      <Text style={styles.goal}>{agent.goal}</Text>
      {messages.map((message) => <View key={message.id} style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.agentBubble]}>{message.role === 'assistant' && <Text style={styles.speaker}>{agent.name}{message.mode === 'provider' ? ' · API response' : message.mode === 'preview' ? ' · connection needed' : ''}</Text>}<Text style={styles.message}>{message.content}</Text></View>)}
      {sending && <View style={[styles.bubble, styles.agentBubble]}><ActivityIndicator color={palette.lime} /></View>}
    </ScrollView>
    <View style={styles.composer}><TextInput value={draft} onChangeText={setDraft} onSubmitEditing={send} returnKeyType="send" placeholder={`Message ${agent.name}…`} placeholderTextColor={palette.quiet} style={styles.input} multiline /><Pressable onPress={send} disabled={!draft.trim() || sending} style={[styles.send, (!draft.trim() || sending) && styles.sendDisabled]}><Ionicons name="arrow-up" size={19} color={palette.background} /></Pressable></View>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ flex: { flex: 1, backgroundColor: palette.background }, screen: { flex: 1 }, wrap: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 22, gap: 14, paddingBottom: 32 }, header: { flexDirection: 'row', alignItems: 'center', gap: 10 }, back: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.raised }, spacer: { flex: 1 }, profile: { flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 20 }, profileText: { gap: 3 }, name: { color: palette.text, fontSize: 22, fontWeight: '800' }, role: { color: palette.muted, fontSize: 12 }, goal: { color: palette.muted, fontSize: 13, lineHeight: 19, marginBottom: 8 }, bubble: { maxWidth: '89%', padding: 14, borderRadius: 17, gap: 7 }, userBubble: { alignSelf: 'flex-end', backgroundColor: '#343445', borderBottomRightRadius: 5 }, agentBubble: { alignSelf: 'flex-start', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderBottomLeftRadius: 5 }, speaker: { color: palette.lime, fontSize: 10, fontWeight: '700' }, message: { color: palette.text, fontSize: 14, lineHeight: 21 }, body: { color: palette.muted, lineHeight: 20 }, link: { color: palette.lime, fontWeight: '700' }, composer: { width: '100%', maxWidth: 760, alignSelf: 'center', flexDirection: 'row', gap: 9, padding: 12, borderTopWidth: 1, borderColor: palette.border }, input: { flex: 1, minHeight: 46, maxHeight: 130, borderRadius: 14, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, color: palette.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 }, send: { width: 44, height: 44, borderRadius: 14, backgroundColor: palette.lime, alignItems: 'center', justifyContent: 'center' }, sendDisabled: { opacity: 0.45 } });

import { useState } from 'react';
import { router } from 'expo-router';
import { Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActionButton, AgentAvatar, Card, Heading, Screen, WorkspaceHeader } from '@/components/HarborUI';
import { palette } from '@/constants/palette';
import { useWorkspace } from '@/state/WorkspaceStore';
import type { Agent } from '@/model/types';

const branchColors = ['#A993FF', '#73D6BC', '#F2B86B', '#EF8BA7', '#8CB8F5', '#E89465'];

export default function CompanyScreen() {
  const { companyName, updateCompanyName, branches, agents, companyTasks, createBranch } = useWorkspace();
  const [dialog, setDialog] = useState<'company' | 'branch' | null>(null);
  const [companyDraft, setCompanyDraft] = useState(companyName);
  const [branchName, setBranchName] = useState('');
  const [branchDescription, setBranchDescription] = useState('');
  const [branchColor, setBranchColor] = useState(branchColors[0]);
  const managerNames = agents.filter((agent) => agent.managerId).length;

  const saveCompany = () => {
    updateCompanyName(companyDraft);
    setDialog(null);
  };
  const saveBranch = () => {
    const name = branchName.trim();
    if (!name) return;
    createBranch({ name: name.slice(0, 100), description: branchDescription.trim().slice(0, 500), color: branchColor });
    setBranchName(''); setBranchDescription(''); setDialog(null);
  };

  return <Screen wide style={styles.page}>
    <WorkspaceHeader back />
    <View style={styles.heading}><View><Text style={styles.eyebrow}>YOUR ORGANIZATION</Text><Heading subtitle="See each branch, its agents, and who reports to whom.">Company</Heading></View><View style={styles.headerActions}><ActionButton title="Company chat" icon="chatbubbles-outline" tone="secondary" onPress={() => router.push('/company-chat' as never)} /><ActionButton title="Add branch" icon="add" onPress={() => setDialog('branch')} /></View></View>

    <Card style={styles.companyCard}>
      <View style={styles.companyIdentity}><View style={styles.companyLogoCrop}><Image source={require('../../assets/images/company-wordmark.png')} resizeMode="cover" style={styles.wordmark} accessibilityLabel="AI Automation and Agents company logo" /></View><View style={styles.companyTitleWrap}><Text style={styles.companyName}>{companyName}</Text><Text style={styles.companyCaption}>Private workspace · Saved on this device</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Rename company" onPress={() => { setCompanyDraft(companyName); setDialog('company'); }} style={styles.iconButton}><Ionicons name="create-outline" size={17} color={palette.text} /></Pressable></View>
      <View style={styles.stats}><Stat label="Branches" value={branches.length} /><View style={styles.statDivider} /><Stat label="Agents" value={agents.length} /><View style={styles.statDivider} /><Stat label="Reporting lines" value={managerNames} /><View style={styles.statDivider} /><Stat label="Work requests" value={companyTasks.length} /></View>
    </Card>

    <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Branches & reporting lines</Text><Text style={styles.sectionHint}>New agents can be placed in a branch and assigned to a manager.</Text></View><Pressable accessibilityRole="button" onPress={() => router.push('/create-agent' as never)} style={styles.textAction}><Ionicons name="person-add-outline" size={14} color={palette.text} /><Text style={styles.textActionLabel}>New agent</Text></Pressable></View>
    {branches.length ? <View style={styles.branchGrid}>{branches.map((branch) => {
      const branchAgents = agents.filter((agent) => agent.branchId === branch.id);
      const leads = branchAgents.filter((agent) => !agent.managerId);
      return <Card key={branch.id} style={styles.branchCard}>
        <View style={styles.branchHeader}><View style={[styles.branchMark, { backgroundColor: `${branch.color}1D`, borderColor: `${branch.color}65` }]}><View style={[styles.branchDot, { backgroundColor: branch.color }]} /></View><View style={styles.branchCopy}><Text style={styles.branchName}>{branch.name}</Text><Text style={styles.branchCount}>{branchAgents.length} {branchAgents.length === 1 ? 'agent' : 'agents'}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Add agent to ${branch.name}`} onPress={() => router.push({ pathname: '/create-agent', params: { branchId: branch.id } } as never)} style={styles.addSmall}><Ionicons name="add" size={17} color={palette.text} /></Pressable></View>
        {branch.description ? <Text style={styles.branchDescription}>{branch.description}</Text> : null}
        <View style={[styles.treeBody, { borderTopColor: `${branch.color}45` }]}>
          {leads.length ? leads.map((agent) => <AgentTreeNode key={agent.id} agent={agent} agents={branchAgents} />) : <View style={styles.emptyBranch}><Ionicons name="people-outline" size={16} color={palette.quiet} /><Text style={styles.emptyBranchText}>No agents in this branch yet</Text><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/create-agent', params: { branchId: branch.id } } as never)}><Text style={styles.emptyAction}>Add its first agent</Text></Pressable></View>}
        </View>
      </Card>;
    })}</View> : <Card style={styles.emptyBranch}><Text style={styles.emptyBranchText}>Create a branch to organize your agents.</Text><ActionButton title="Add branch" icon="add" onPress={() => setDialog('branch')} /></Card>}
    <Card style={styles.routingNote}><View style={styles.noteIcon}><Ionicons name="git-network-outline" size={17} color={palette.text} /></View><View style={styles.noteCopy}><Text style={styles.noteTitle}>One place to delegate</Text><Text style={styles.noteBody}>Send a work request in Company chat. The selected model routes it to up to three agents using their roles, branch, goals, and skills, then saves each response here.</Text></View><Pressable accessibilityRole="button" onPress={() => router.push('/company-chat' as never)}><Ionicons name="arrow-forward" size={16} color={palette.muted} /></Pressable></Card>

    <Modal transparent visible={dialog !== null} animationType="fade" onRequestClose={() => setDialog(null)}>
      <View style={styles.modalRoot}><Pressable accessibilityLabel="Close dialog" onPress={() => setDialog(null)} style={styles.scrim} /><Card style={styles.modalCard}>
        <View style={styles.modalHeading}><View><Text style={styles.modalTitle}>{dialog === 'company' ? 'Company name' : 'Add a branch'}</Text><Text style={styles.modalSubtitle}>{dialog === 'company' ? 'This name appears above your org chart.' : 'Branches group agents by the work they own.'}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setDialog(null)} style={styles.iconButton}><Ionicons name="close" size={17} color={palette.text} /></Pressable></View>
        {dialog === 'company' ? <><TextInput value={companyDraft} onChangeText={setCompanyDraft} maxLength={100} placeholder="Company name" placeholderTextColor={palette.quiet} style={styles.input} /><ActionButton title="Save company name" icon="checkmark" onPress={saveCompany} disabled={!companyDraft.trim()} /></> : <><TextInput value={branchName} onChangeText={setBranchName} maxLength={100} placeholder="e.g. Customer Success" placeholderTextColor={palette.quiet} style={styles.input} /><TextInput value={branchDescription} onChangeText={setBranchDescription} maxLength={500} multiline placeholder="What this branch handles" placeholderTextColor={palette.quiet} style={[styles.input, styles.branchInput]} /><Text style={styles.colorLabel}>Branch color</Text><View style={styles.colorRow}>{branchColors.map((color) => <Pressable key={color} accessibilityRole="radio" accessibilityLabel={`Choose ${color} branch color`} accessibilityState={{ checked: color === branchColor }} onPress={() => setBranchColor(color)} style={[styles.colorChip, { backgroundColor: color }, color === branchColor && styles.colorChipSelected]} />)}</View><ActionButton title="Create branch" icon="add" onPress={saveBranch} disabled={!branchName.trim()} /></>}
      </Card></View>
    </Modal>
  </Screen>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function AgentTreeNode({ agent, agents }: { agent: Agent; agents: Agent[] }) {
  const reports = agents.filter((item) => item.managerId === agent.id);
  return <View style={styles.nodeWrap}>
    <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/agent/[id]', params: { id: agent.id } } as never)} style={({ pressed }) => [styles.agentNode, pressed && styles.nodePressed]}>
      <AgentAvatar name={agent.name} character={agent.character} color={agent.color} size={34} /><View style={styles.agentNodeCopy}><Text style={styles.agentNodeName}>{agent.name}</Text><Text numberOfLines={1} style={styles.agentNodeRole}>{agent.role}</Text></View><View style={styles.reportBadge}><Ionicons name="people-outline" size={11} color={palette.muted} /><Text style={styles.reportCount}>{reports.length}</Text></View>
    </Pressable>
    {reports.length > 0 && <View style={styles.reports}>{reports.map((report) => <AgentTreeNode key={report.id} agent={report} agents={agents} />)}</View>}
  </View>;
}

const styles = StyleSheet.create({ page: { minHeight: '100%', alignItems: 'stretch', paddingTop: 17, paddingBottom: 50, gap: 18 }, heading: { width: '100%', maxWidth: 1100, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, paddingHorizontal: 5 }, eyebrow: { color: palette.quiet, fontSize: 9, fontWeight: '700', letterSpacing: 1.3, marginBottom: 6 }, headerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 2 }, companyCard: { width: '100%', maxWidth: 1100, alignSelf: 'center', gap: 17, padding: 18 }, companyIdentity: { flexDirection: 'row', alignItems: 'center', gap: 14 }, companyLogoCrop: { width: 150, height: 54, overflow: 'hidden', borderRadius: 7, backgroundColor: '#080808' }, wordmark: { width: 150, height: 75 }, companyTitleWrap: { flex: 1, gap: 4 }, companyName: { color: palette.text, fontSize: 20, fontWeight: '700' }, companyCaption: { color: palette.muted, fontSize: 10 }, iconButton: { width: 35, height: 35, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background }, stats: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 20, borderTopWidth: 1, borderTopColor: palette.border, paddingTop: 15 }, stat: { gap: 2 }, statValue: { color: palette.text, fontSize: 18, fontWeight: '700' }, statLabel: { color: palette.quiet, fontSize: 9 }, statDivider: { height: 28, width: 1, backgroundColor: palette.border }, sectionHeading: { width: '100%', maxWidth: 1100, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, paddingHorizontal: 5, marginTop: 3 }, sectionTitle: { color: palette.text, fontSize: 16, fontWeight: '700' }, sectionHint: { color: palette.muted, fontSize: 10, marginTop: 5 }, textAction: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, borderRadius: 8 }, textActionLabel: { color: palette.text, fontSize: 10, fontWeight: '600' }, branchGrid: { width: '100%', maxWidth: 1100, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 12 }, branchCard: { flexGrow: 1, flexBasis: 330, maxWidth: '100%', minHeight: 190, padding: 13, gap: 9 }, branchHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 }, branchMark: { width: 31, height: 31, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 }, branchDot: { width: 9, height: 9, borderRadius: 5 }, branchCopy: { flex: 1, gap: 2 }, branchName: { color: palette.text, fontSize: 13, fontWeight: '700' }, branchCount: { color: palette.quiet, fontSize: 9 }, addSmall: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' }, branchDescription: { color: palette.muted, fontSize: 10, lineHeight: 15, minHeight: 15 }, treeBody: { borderTopWidth: 1, paddingTop: 9, gap: 7 }, nodeWrap: { gap: 5 }, agentNode: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: palette.border, borderRadius: 9, backgroundColor: palette.background, padding: 7 }, nodePressed: { backgroundColor: palette.raised }, agentNodeCopy: { flex: 1, gap: 2 }, agentNodeName: { color: palette.text, fontSize: 10, fontWeight: '700' }, agentNodeRole: { color: palette.muted, fontSize: 9 }, reportBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6 }, reportCount: { color: palette.quiet, fontSize: 9 }, reports: { marginLeft: 15, borderLeftWidth: 1, borderLeftColor: palette.border, paddingLeft: 9, gap: 5 }, emptyBranch: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, padding: 11 }, emptyBranchText: { color: palette.muted, fontSize: 10 }, emptyAction: { color: palette.text, fontSize: 10, fontWeight: '700', paddingHorizontal: 3 }, routingNote: { width: '100%', maxWidth: 1100, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13 }, noteIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: palette.raised, alignItems: 'center', justifyContent: 'center' }, noteCopy: { flex: 1, gap: 3 }, noteTitle: { color: palette.text, fontSize: 11, fontWeight: '700' }, noteBody: { color: palette.muted, fontSize: 10, lineHeight: 15 }, modalRoot: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18 }, scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.72)' }, modalCard: { width: '100%', maxWidth: 430, padding: 17, gap: 12, zIndex: 1 }, modalHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 }, modalTitle: { color: palette.text, fontSize: 15, fontWeight: '700' }, modalSubtitle: { color: palette.muted, fontSize: 10, marginTop: 3, lineHeight: 15 }, input: { minHeight: 42, borderRadius: 9, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.background, color: palette.text, paddingHorizontal: 11, paddingVertical: 10, fontSize: 12 }, branchInput: { minHeight: 72, textAlignVertical: 'top' }, colorLabel: { color: palette.muted, fontSize: 10, fontWeight: '700' }, colorRow: { flexDirection: 'row', gap: 11, paddingVertical: 3 }, colorChip: { width: 25, height: 25, borderRadius: 13, borderWidth: 2, borderColor: 'transparent' }, colorChipSelected: { borderColor: palette.text, transform: [{ scale: 1.12 }] } });

import type { Agent, Routine, WorkspaceData } from '@/model/types';

export const starterAgents: Agent[] = [
  { id: 'mara', name: 'Mara', role: 'Operations partner', goal: 'Keep the week organized and surface what needs a decision.', color: '#A993FF', character: 'sprout', phases: ['Review priorities', 'Plan the week', 'Track decisions'], createdAt: 'Today' },
  { id: 'patch', name: 'Patch', role: 'Engineering guide', goal: 'Turn clear bug reports into small, reviewable fixes.', color: '#73D6BC', character: 'comet', phases: ['Reproduce the issue', 'Plan a focused fix', 'Review the change'], createdAt: 'Yesterday' },
  { id: 'finch', name: 'Finch', role: 'Research analyst', goal: 'Find reliable answers and return a concise brief with sources.', color: '#F2B86B', character: 'cloud', phases: ['Frame the question', 'Compare evidence', 'Summarize with sources'], createdAt: 'Monday' },
  { id: 'sol', name: 'Sol', role: 'Writing partner', goal: 'Help shape drafts in a clear, consistent voice.', color: '#EF8BA7', character: 'ember', phases: ['Clarify the audience', 'Shape the draft', 'Polish the voice'], createdAt: 'Monday' },
];

export const starterRoutines: Routine[] = [
  { id: 'routine-1', name: 'Morning focus brief', description: 'Summarize the calendar and open commitments.', schedule: 'Weekdays · 8:30 AM', agentId: 'mara', enabled: true },
  { id: 'routine-2', name: 'Friday week close', description: 'Collect shipped work and list loose ends.', schedule: 'Friday · 3:00 PM', agentId: 'patch', enabled: true },
  { id: 'routine-3', name: 'Monthly reading list', description: 'Find a few useful updates in selected topics.', schedule: 'First Monday · 9:00 AM', agentId: 'finch', enabled: false },
];

export const initialWorkspace: WorkspaceData = {
  agents: starterAgents,
  routines: starterRoutines,
  conversations: {
    mara: [{ id: 'welcome-mara', role: 'assistant', content: 'I’m Mara. Tell me what you want to move forward, and I’ll keep the next steps clear.', createdAt: 'Today' }],
    patch: [{ id: 'welcome-patch', role: 'assistant', content: 'I’m Patch. Share a bug, code task, or review you want to untangle.', createdAt: 'Yesterday' }],
    finch: [{ id: 'welcome-finch', role: 'assistant', content: 'I’m Finch. Give me a question and I’ll bring back a concise, source-aware brief.', createdAt: 'Monday' }],
    sol: [{ id: 'welcome-sol', role: 'assistant', content: 'I’m Sol. Send me a rough draft or an idea and we’ll shape it together.', createdAt: 'Monday' }],
  },
  model: { provider: 'openai', endpoint: 'https://api.openai.com/v1', model: 'gpt-4.1-mini' },
};

import type { Agent } from '@/model/types';

export type AgentTemplate = Pick<Agent, 'name' | 'role' | 'goal' | 'color'> & { id: string; category: string; description: string; icon: string; tools: string[] };

export const agentTemplates: AgentTemplate[] = [
  { id: 'chief-of-staff', name: 'Mara', role: 'Chief of staff', goal: 'Keep the week organized and surface what needs a decision.', category: 'Operations', description: 'A calm partner for planning, priorities, and weekly follow-through.', icon: 'compass-outline', color: '#E8AD63', tools: ['Calendar', 'Notes'] },
  { id: 'engineer', name: 'Patch', role: 'Engineering partner', goal: 'Turn clear bug reports into small, reviewable fixes.', category: 'Engineering', description: 'Work through bugs, review code, and keep changes understandable.', icon: 'code-slash-outline', color: '#83B9FF', tools: ['Git', 'Issues'] },
  { id: 'researcher', name: 'Finch', role: 'Research analyst', goal: 'Find reliable answers and return a concise brief with sources.', category: 'Research', description: 'Explore a question and bring back a concise, source-aware brief.', icon: 'search-outline', color: '#7DD9BA', tools: ['Web', 'Documents'] },
  { id: 'writer', name: 'Sol', role: 'Writing partner', goal: 'Help shape drafts in a clear, consistent voice.', category: 'Writing', description: 'Turn a rough idea into useful, polished writing.', icon: 'create-outline', color: '#EF8BA7', tools: ['Drafts', 'Notes'] },
  { id: 'designer', name: 'Sora', role: 'Design partner', goal: 'Shape product ideas into clear interfaces and practical design notes.', category: 'Design', description: 'Explore layouts, flows, and visual systems with a practical eye.', icon: 'color-palette-outline', color: '#AA99FF', tools: ['Design notes', 'Research'] },
  { id: 'project-guide', name: 'North', role: 'Project guide', goal: 'Keep a project moving by tracking decisions, owners, and next steps.', category: 'Productivity', description: 'Bring scattered work into a small, clear list of next steps.', icon: 'map-outline', color: '#F0B66D', tools: ['Tasks', 'Notes'] },
];

export function uniqueTemplateName(name: string, agents: Agent[]) {
  const names = new Set(agents.map((agent) => agent.name.toLocaleLowerCase()));
  if (!names.has(name.toLocaleLowerCase())) return name;
  let suffix = 2;
  while (names.has(`${name} ${suffix}`.toLocaleLowerCase())) suffix += 1;
  return `${name} ${suffix}`;
}

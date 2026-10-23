export type Agent = {
  id: string;
  name: string;
  role: string;
  goal: string;
  color: string;
  createdAt: string;
};

export type AgentMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  mode?: 'local' | 'preview';
};

export type Routine = {
  id: string;
  name: string;
  description: string;
  schedule: string;
  agentId: string;
  enabled: boolean;
};

export type ModelSettings = {
  endpoint: string;
  model: string;
};

export type WorkspaceData = {
  agents: Agent[];
  routines: Routine[];
  conversations: Record<string, AgentMessage[]>;
  model: ModelSettings;
};

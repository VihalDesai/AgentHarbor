export type CharacterId = 'sprout' | 'comet' | 'pebble' | 'ripple' | 'ember' | 'moss' | 'cloud' | 'orbit';

export const defaultAgentPhases = ['Understand the goal', 'Plan the next steps', 'Deliver a clear result'];

export type Agent = {
  id: string;
  name: string;
  role: string;
  goal: string;
  color: string;
  character?: CharacterId;
  phases?: string[];
  createdAt: string;
};

export type AgentMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  mode?: 'local' | 'provider' | 'preview';
};

export type ModelTurn = Pick<AgentMessage, 'role' | 'content'>;

export type Routine = {
  id: string;
  name: string;
  description: string;
  schedule: string;
  agentId: string;
  enabled: boolean;
};

export type ModelSettings = {
  provider: ProviderId;
  endpoint: string;
  model: string;
};

export type ProviderId = 'openai' | 'anthropic' | 'gemini' | 'openrouter' | 'groq' | 'deepseek' | 'ollama' | 'custom';

export type WorkspaceData = {
  agents: Agent[];
  routines: Routine[];
  conversations: Record<string, AgentMessage[]>;
  model: ModelSettings;
};

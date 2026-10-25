export type CharacterId =
  | 'sprout' | 'comet' | 'pebble' | 'ripple' | 'ember' | 'moss' | 'cloud' | 'orbit'
  | 'chief-of-staff' | 'engineer' | 'motion-designer' | 'pull-request-reviewer'
  | 'blog-refresh-search-impact' | 'canva-design-assistant' | 'design-maven' | 'meta-ads-operator'
  | 'product-sourcer' | 'pr-reviewer' | 'pr-walkthrough-qa' | 'recruiter' | 'research-pitch'
  | 'saul' | 'social-media-image-creator' | 'social-media-post-planner'
  | 'aeo-geo-manager' | 'crm-assistant' | 'customer-outreach' | 'customer-support-manager'
  | 'deal-flow' | 'designer' | 'diligence-analyst' | 'dub-co-affiliate-agent';

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

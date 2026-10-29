export type CharacterId =
  | 'sprout' | 'comet' | 'pebble' | 'ripple' | 'ember' | 'moss' | 'cloud' | 'orbit'
  | 'chief-of-staff' | 'engineer' | 'motion-designer' | 'pull-request-reviewer'
  | 'blog-refresh-search-impact' | 'canva-design-assistant' | 'design-maven' | 'meta-ads-operator'
  | 'product-sourcer' | 'pr-reviewer' | 'pr-walkthrough-qa' | 'recruiter' | 'research-pitch'
  | 'saul' | 'social-media-image-creator' | 'social-media-post-planner'
  | 'aeo-geo-manager' | 'crm-assistant' | 'customer-outreach' | 'customer-support-manager'
  | 'deal-flow' | 'designer' | 'diligence-analyst' | 'dub-co-affiliate-agent'
  | 'mobile-submission-specialist' | 'asset-expert' | 'frontend-engineer' | 'bug-investigator'
  | 'head-of-content' | 'loops-email-assistant' | 'project-manager' | 'stripe-disputes-agent'
  | 'personal-assistant-for-outreach' | 'sourcing-scout' | 'sdr-investor-relations'
  | 'expense-reconciler' | 'fundraise-sheet-watcher'
  | 'youtube-creator-scout' | 'x-influencer-lead' | 'security-researcher'
  | 'portfolio-fundraise-desk' | 'portfolio-analyst' | 'pipeline-audit'
  | 'pass-emails' | 'partner-writing' | 'network-memory' | 'morning-prep-brief'
  | 'lp-relations' | 'intro-accountability-tracker' | 'copywriter';

export const defaultAgentPhases = ['Understand the goal', 'Plan the next steps', 'Deliver a clear result'];

export type Agent = {
  id: string;
  name: string;
  role: string;
  goal: string;
  color: string;
  character?: CharacterId;
  phases?: string[];
  skillIds?: string[];
  branchId?: string;
  managerId?: string;
  createdAt: string;
};

export type CompanyBranch = {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
};

export type AgentWorkRun = {
  agentId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: string;
};

export type CompanyTask = {
  id: string;
  request: string;
  createdAt: string;
  status: 'routing' | 'working' | 'completed' | 'failed';
  agentRuns: AgentWorkRun[];
  error?: string;
};

export type Skill = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  createdAt: string;
};

export type FounderProfile = {
  id: string;
  name: string;
  title: string;
  company: string;
  about: string;
  skillIds: string[];
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
  companyName: string;
  branches: CompanyBranch[];
  companyTasks: CompanyTask[];
  agents: Agent[];
  skills: Skill[];
  founders: FounderProfile[];
  routines: Routine[];
  conversations: Record<string, AgentMessage[]>;
  model: ModelSettings;
};

import type { Agent, CharacterId } from '@/model/types';
import catalog from './template-catalog.json';

export type TemplateBenefit = { title: string; description: string; icon: string | null };
export type TemplateSkill = { slug: string; url: string | null };
export type AgentTemplate = Pick<Agent, 'name' | 'role' | 'goal' | 'color'> & {
  id: string;
  category: string;
  description: string;
  tagline: string;
  author: string;
  source: 'From Skydive' | 'Marketplace' | 'Created by me';
  icon: string;
  tools: string[];
  character: CharacterId;
  phases: string[];
  benefits: TemplateBenefit[];
  skills: TemplateSkill[];
  isNew: boolean;
};

export const agentTemplates = catalog as unknown as AgentTemplate[];

export function uniqueTemplateName(name: string, agents: Agent[]) {
  const names = new Set(agents.map((agent) => agent.name.toLocaleLowerCase()));
  if (!names.has(name.toLocaleLowerCase())) return name;
  let suffix = 2;
  while (names.has(`${name} ${suffix}`.toLocaleLowerCase())) suffix += 1;
  return `${name} ${suffix}`;
}

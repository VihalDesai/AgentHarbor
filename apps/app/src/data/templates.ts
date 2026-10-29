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
  source: 'From Skydive' | 'Marketplace' | 'Created by me' | 'From my workspace';
  icon: string;
  tools: string[];
  character: CharacterId;
  phases: string[];
  benefits: TemplateBenefit[];
  skills: TemplateSkill[];
  isNew: boolean;
};

const normalizedCatalog = (catalog as unknown as AgentTemplate[]).map((template) => ({
  ...template,
  phases: Array.isArray(template.phases) ? template.phases.filter((phase): phase is string => typeof phase === 'string' && Boolean(phase.trim())) : [],
  tools: Array.isArray(template.tools) ? template.tools.filter((tool): tool is string => typeof tool === 'string' && Boolean(tool.trim())) : [],
  skills: Array.isArray(template.skills) ? template.skills.filter((skill) => Boolean(skill?.slug)) : [],
  benefits: Array.isArray(template.benefits) ? template.benefits.filter((benefit) => Boolean(benefit?.title && benefit?.description)) : [],
}));

export const agentTemplates = normalizedCatalog;

export function uniqueTemplateName(name: string, agents: Agent[]) {
  const names = new Set(agents.map((agent) => agent.name.toLocaleLowerCase()));
  if (!names.has(name.toLocaleLowerCase())) return name;
  let suffix = 2;
  while (names.has(`${name} ${suffix}`.toLocaleLowerCase())) suffix += 1;
  return `${name} ${suffix}`;
}

import type { CharacterId } from '@/model/types';

export const characters: { id: CharacterId; name: string; color: string; accent: string }[] = [
  { id: 'chief-of-staff', name: 'Sugarplum', color: '#F0FFEC', accent: '#C6F0D7' },
  { id: 'engineer', name: 'Eggplant', color: '#FFE7EC', accent: '#D8E9FF' },
  { id: 'motion-designer', name: 'Sunray', color: '#FFF5DB', accent: '#FFE1A6' },
  { id: 'pull-request-reviewer', name: 'Nimble', color: '#FFF5DB', accent: '#E8D7FF' },
  { id: 'blog-refresh-search-impact', name: 'Uma', color: '#EEE7FF', accent: '#D8E9FF' },
  { id: 'canva-design-assistant', name: 'Candy', color: '#FFE7EC', accent: '#FFD0E0' },
  { id: 'design-maven', name: 'Echo', color: '#EEE7FF', accent: '#D8E9FF' },
  { id: 'meta-ads-operator', name: 'Basil', color: '#EEE7FF', accent: '#E8D7FF' },
  { id: 'product-sourcer', name: 'Finder', color: '#FFE7EC', accent: '#F4C4C6' },
  { id: 'pr-reviewer', name: 'Vanguard', color: '#FFF5DB', accent: '#FFE1A6' },
  { id: 'pr-walkthrough-qa', name: 'Pixel', color: '#FFEDDA', accent: '#FFE1A6' },
  { id: 'recruiter', name: 'Recruiter', color: '#EEE7FF', accent: '#E8D7FF' },
  { id: 'research-pitch', name: 'Beca', color: '#FFEDDA', accent: '#FFE1A6' },
  { id: 'saul', name: 'Saul', color: '#FFE7EC', accent: '#FFD0E0' },
  { id: 'social-media-image-creator', name: 'Studio', color: '#EEE7FF', accent: '#E8D7FF' },
  { id: 'social-media-post-planner', name: 'Posey', color: '#EEE7FF', accent: '#D8E9FF' },
  { id: 'aeo-geo-manager', name: 'Roux', color: '#FFF5DB', accent: '#FFE1A6' },
  { id: 'crm-assistant', name: 'Rodeo', color: '#F0FFEC', accent: '#C6F0D7' },
  { id: 'customer-outreach', name: 'Zippy', color: '#FAFFE0', accent: '#E2ECB3' },
  { id: 'customer-support-manager', name: 'Slippers', color: '#FAFFE0', accent: '#E2ECB3' },
  { id: 'deal-flow', name: 'Ice', color: '#EEE7FF', accent: '#D8E9FF' },
  { id: 'designer', name: 'Ren', color: '#FAFFE0', accent: '#E2ECB3' },
  { id: 'diligence-analyst', name: 'Mittens', color: '#FAFFE0', accent: '#E2ECB3' },
  { id: 'dub-co-affiliate-agent', name: 'Tuesday', color: '#FFEDDA', accent: '#FFE1A6' },
];

const legacyCharacterIds: CharacterId[] = ['sprout', 'comet', 'pebble', 'ripple', 'ember', 'moss', 'cloud', 'orbit'];

export function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === 'string' && (characters.some((character) => character.id === value) || legacyCharacterIds.includes(value as CharacterId));
}

export function characterForName(name: string): CharacterId {
  let hash = 0;
  for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return characters[hash % characters.length].id;
}

export function characterFor(id: CharacterId | undefined, name: string) {
  return characters.find((character) => character.id === id) ?? characters.find((character) => character.id === characterForName(name)) ?? characters[0];
}

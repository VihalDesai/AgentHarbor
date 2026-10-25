import type { CharacterId } from '@/model/types';

export const characters: { id: CharacterId; name: string; color: string; accent: string }[] = [
  { id: 'sprout', name: 'Sprout', color: '#70C6A1', accent: '#C6F0D7' },
  { id: 'comet', name: 'Comet', color: '#79A9E8', accent: '#D8E9FF' },
  { id: 'pebble', name: 'Pebble', color: '#C59C83', accent: '#F0D5C3' },
  { id: 'ripple', name: 'Ripple', color: '#58B8C6', accent: '#C5F4F1' },
  { id: 'ember', name: 'Ember', color: '#E88B65', accent: '#FFD0A9' },
  { id: 'moss', name: 'Moss', color: '#9FAE60', accent: '#DDE7A5' },
  { id: 'cloud', name: 'Cloud', color: '#A6B8D9', accent: '#E9F0FF' },
  { id: 'orbit', name: 'Orbit', color: '#AE8DD8', accent: '#E8D7FF' },
];

export function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === 'string' && characters.some((character) => character.id === value);
}

export function characterForName(name: string): CharacterId {
  let hash = 0;
  for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return characters[hash % characters.length].id;
}

export function characterFor(id: CharacterId | undefined, name: string) {
  return characters.find((character) => character.id === id) ?? characters.find((character) => character.id === characterForName(name)) ?? characters[0];
}

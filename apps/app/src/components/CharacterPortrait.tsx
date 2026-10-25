import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { characterFor } from '@/services/characters';
import type { CharacterId } from '@/model/types';

export function CharacterPortrait({ id, name, size = 56 }: { id?: CharacterId; name: string; size?: number }) {
  const character = characterFor(id, name);
  const dark = '#243036';
  return <Svg width={size} height={size} viewBox="0 0 64 64" aria-hidden={true}>
    {character.id === 'comet' && <Path d="M7 43c8-3 12-8 16-16-1 12 4 18 15 20-12 4-17 2-23-6-2 5-5 8-8 9 2-3 2-5 0-7Z" fill={character.accent} />}
    {character.id === 'orbit' && <Ellipse cx="32" cy="34" rx="29" ry="13" fill="none" stroke={character.accent} strokeWidth="3" transform="rotate(-25 32 34)" />}
    {character.id === 'pebble' && <Path d="m17 22 3-12 10 9M47 22l-3-12-10 9" fill={character.color} stroke={dark} strokeWidth="1.5" strokeLinejoin="round" />}
    {character.id === 'ripple' && <Path d="M13 28c-8-8-7-14 1-17 8 4 10 10 8 17m21 0c-2-7 0-13 8-17 8 3 9 9 1 17" fill={character.accent} stroke={character.color} strokeWidth="2" />}
    {character.id === 'ember' && <Path d="M21 23c-7-10 3-15 6-22 8 9 11 14 5 22 7-5 12-2 12 5H20c-1-2-1-4 1-5Z" fill={character.accent} stroke={character.color} strokeWidth="1.5" />}
    {character.id === 'moss' && <><Path d="M24 20C12 7 17 3 29 9c3 2 4 5 3 11m8 0c-1-9 5-13 14-9 3 9-3 14-12 15" fill={character.accent} stroke={character.color} strokeWidth="1.5" strokeLinejoin="round" /></>}
    {character.id === 'cloud' && <Path d="M18 25c-7-8-3-15 6-15 4 0 7 3 8 8 2-8 10-11 16-6 4 3 4 8 1 13" fill={character.accent} stroke={character.color} strokeWidth="1.5" />}
    {character.id === 'sprout' && <><Ellipse cx="24" cy="13" rx="6" ry="12" fill={character.accent} transform="rotate(-35 24 13)" /><Ellipse cx="40" cy="13" rx="6" ry="12" fill={character.accent} transform="rotate(35 40 13)" /></>}
    <Circle cx="32" cy="36" r="21" fill={character.color} />
    <Ellipse cx="24.5" cy="34" rx="2.3" ry="3" fill={dark} />
    <Ellipse cx="39.5" cy="34" rx="2.3" ry="3" fill={dark} />
    <Path d="M27 43c3 3 7 3 10 0" fill="none" stroke={dark} strokeWidth="2" strokeLinecap="round" />
    {character.id === 'orbit' && <Circle cx="52" cy="14" r="4" fill={character.accent} />}
    {character.id === 'comet' && <Path d="m47 13 2 4 4 1-4 2-2 4-2-4-4-2 4-1 2-4Z" fill={character.accent} />}
    {character.id === 'ripple' && <Path d="M27 49c3 2 7 2 10 0" fill="none" stroke={character.accent} strokeWidth="2" strokeLinecap="round" />}
  </Svg>;
}

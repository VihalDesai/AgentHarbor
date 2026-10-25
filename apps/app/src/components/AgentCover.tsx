import { Image } from 'expo-image';
import type { CharacterId } from '@/model/types';

export function AgentCover({ character, name = 'Agent' }: { character?: CharacterId; name?: string }) {
  return <Image source={require('../../assets/images/profile-cover.webp')} contentFit="cover" accessibilityLabel={`${name} profile cover`} style={{ width: '100%', height: '100%' }} />;
}

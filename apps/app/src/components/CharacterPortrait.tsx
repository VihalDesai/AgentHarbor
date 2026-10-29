import { Image } from 'expo-image';
import { characterFor, characters } from '@/services/characters';
import type { CharacterId } from '@/model/types';

const portraits: Partial<Record<CharacterId, number>> = {
  'chief-of-staff': require('../../assets/characters/chief-of-staff.png'),
  engineer: require('../../assets/characters/engineer.png'),
  'motion-designer': require('../../assets/characters/motion-designer.png'),
  'pull-request-reviewer': require('../../assets/characters/pull-request-reviewer.png'),
  'blog-refresh-search-impact': require('../../assets/characters/blog-refresh-search-impact.png'),
  'canva-design-assistant': require('../../assets/characters/canva-design-assistant.png'),
  'design-maven': require('../../assets/characters/design-maven.png'),
  'meta-ads-operator': require('../../assets/characters/meta-ads-operator.png'),
  'product-sourcer': require('../../assets/characters/product-sourcer.png'),
  'pr-reviewer': require('../../assets/characters/pr-reviewer.png'),
  'pr-walkthrough-qa': require('../../assets/characters/pr-walkthrough-qa.png'),
  recruiter: require('../../assets/characters/recruiter.png'),
  'research-pitch': require('../../assets/characters/research-pitch.png'),
  saul: require('../../assets/characters/saul.png'),
  'social-media-image-creator': require('../../assets/characters/social-media-image-creator.png'),
  'social-media-post-planner': require('../../assets/characters/social-media-post-planner.png'),
  'aeo-geo-manager': require('../../assets/characters/aeo-geo-manager.png'),
  'crm-assistant': require('../../assets/characters/crm-assistant.png'),
  'customer-outreach': require('../../assets/characters/customer-outreach.png'),
  'customer-support-manager': require('../../assets/characters/customer-support-manager.png'),
  'deal-flow': require('../../assets/characters/deal-flow.png'),
  designer: require('../../assets/characters/designer.png'),
  'diligence-analyst': require('../../assets/characters/diligence-analyst.png'),
  'dub-co-affiliate-agent': require('../../assets/characters/dub-co-affiliate-agent.png'),
  'youtube-creator-scout': require('../../assets/characters/youtube-creator-scout.png'),
  'x-influencer-lead': require('../../assets/characters/x-influencer-lead.png'),
  'security-researcher': require('../../assets/characters/security-researcher.png'),
  'portfolio-fundraise-desk': require('../../assets/characters/portfolio-fundraise-desk.png'),
  'portfolio-analyst': require('../../assets/characters/portfolio-analyst.png'),
  'pipeline-audit': require('../../assets/characters/pipeline-audit.png'),
  'pass-emails': require('../../assets/characters/pass-emails.png'),
  'partner-writing': require('../../assets/characters/partner-writing.png'),
  'network-memory': require('../../assets/characters/network-memory.png'),
  'morning-prep-brief': require('../../assets/characters/morning-prep-brief.png'),
  'lp-relations': require('../../assets/characters/lp-relations.png'),
  'intro-accountability-tracker': require('../../assets/characters/intro-accountability-tracker.png'),
  copywriter: require('../../assets/characters/copywriter.png'),
  sprout: require('../../assets/characters/chief-of-staff.png'),
  comet: require('../../assets/characters/engineer.png'),
  pebble: require('../../assets/characters/product-sourcer.png'),
  ripple: require('../../assets/characters/canva-design-assistant.png'),
  ember: require('../../assets/characters/social-media-post-planner.png'),
  moss: require('../../assets/characters/blog-refresh-search-impact.png'),
  cloud: require('../../assets/characters/design-maven.png'),
  orbit: require('../../assets/characters/motion-designer.png'),
};

export function CharacterPortrait({ id, name, size = 56 }: { id?: CharacterId; name: string; size?: number }) {
  const character = characterFor(id, name);
  const avatarUrl = characters.find((entry) => entry.id === character.id)?.avatarUrl;
  const source = avatarUrl ? { uri: avatarUrl } : portraits[character.id];
  return <Image source={source ?? portraits['chief-of-staff']!} cachePolicy="disk" contentFit="cover" accessibilityLabel={`${character.name} character portrait`} style={{ width: size, height: size, borderRadius: size / 2 }} />;
}

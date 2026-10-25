import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { characterFor } from '@/services/characters';
import type { CharacterId } from '@/model/types';

const themes: Record<CharacterId, { sky: string; horizon: string; ridge: string; foreground: string }> = {
  sprout: { sky: '#A9D3B6', horizon: '#D2D8A7', ridge: '#768A70', foreground: '#394D48' },
  comet: { sky: '#90B5E0', horizon: '#C9D4E5', ridge: '#72849A', foreground: '#394B60' },
  pebble: { sky: '#D0AA91', horizon: '#E6C5A5', ridge: '#967A73', foreground: '#554C50' },
  ripple: { sky: '#78BCC1', horizon: '#B1D7CD', ridge: '#668B8E', foreground: '#344D55' },
  ember: { sky: '#E59A6E', horizon: '#D79B92', ridge: '#896B7A', foreground: '#4F465C' },
  moss: { sky: '#B2B97B', horizon: '#DBD3A0', ridge: '#7F8863', foreground: '#494E42' },
  cloud: { sky: '#A8C2DE', horizon: '#D6D9E6', ridge: '#82869C', foreground: '#4D5066' },
  orbit: { sky: '#B9A5DB', horizon: '#D8B7CB', ridge: '#82758F', foreground: '#49465B' },
};

export function AgentCover({ character, name = 'Agent' }: { character?: CharacterId; name?: string }) {
  const theme = themes[characterFor(character, name).id];
  return <Svg width="100%" height="100%" viewBox="0 0 1520 240" preserveAspectRatio="xMidYMid slice" aria-hidden={true}>
    <Defs>
      <LinearGradient id="sunset-sky" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={theme.sky} />
        <Stop offset="0.5" stopColor={theme.horizon} />
        <Stop offset="1" stopColor={theme.ridge} />
      </LinearGradient>
      <LinearGradient id="sunset-ridge" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={theme.ridge} />
        <Stop offset="1" stopColor={theme.foreground} />
      </LinearGradient>
    </Defs>
    <Rect width="1520" height="240" fill="url(#sunset-sky)" />
    <Circle cx="1180" cy="38" r="13" fill="#FFE1B3" opacity="0.92" />
    <Path d="M0 97 C170 80 278 101 424 84 C568 66 677 99 822 83 C972 65 1082 92 1218 74 C1332 58 1430 68 1520 57 L1520 153 L0 153 Z" fill={theme.horizon} opacity="0.42" />
    <Path d="M0 126 C130 102 235 108 356 119 C496 132 594 95 730 101 C872 107 973 131 1108 113 C1248 94 1362 112 1520 91 L1520 205 L0 205 Z" fill="url(#sunset-ridge)" />
    <Path d="M0 157 C154 135 263 149 390 141 C522 132 636 159 779 146 C923 133 1021 160 1152 142 C1295 122 1392 145 1520 126 L1520 240 L0 240 Z" fill={theme.ridge} />
    <Path d="M0 183 C143 164 250 170 380 181 C515 193 635 166 764 176 C897 187 1015 161 1147 170 C1290 179 1396 151 1520 159 L1520 240 L0 240 Z" fill={theme.foreground} opacity="0.82" />
    <Path d="M0 205 C164 190 278 203 431 195 C589 186 682 208 827 197 C984 185 1080 204 1206 191 C1326 180 1426 194 1520 184 L1520 240 L0 240 Z" fill="#252833" opacity="0.72" />
  </Svg>;
}

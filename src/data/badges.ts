import { Badge } from '../types';

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_word',
    name: 'První zápal',
    description: 'Uhodni své první denní slovo na 100 °C.',
    icon: '🔥',
    rarity: 'common'
  },
  {
    id: 'hot_streak_3',
    name: 'Třídenní série',
    description: 'Vyřeš denní výzvu 3 dny v řadě bez přerušení.',
    icon: '⚡',
    rarity: 'common'
  },
  {
    id: 'hot_streak_7',
    name: 'Týdenní mistr',
    description: 'Udržuj aktivní sérii 7 po sobě jdoucích dní.',
    icon: '👑',
    rarity: 'rare'
  },
  {
    id: 'millionaire_boss',
    name: 'Milionář v praxi',
    description: 'Odpověz správně na 5 bonusových otázek z reálného provozu.',
    icon: '💰',
    rarity: 'rare'
  },
  {
    id: 'sharp_shooter',
    name: 'Ostrý střelec',
    description: 'Uhodni tajné slovo na méně než 5 pokusů.',
    icon: '🎯',
    rarity: 'epic'
  },
  {
    id: 'hangman_survivor',
    name: 'Záchrana na šibenici',
    description: 'Úspěšně vylušti definici v Oběšenci a následně vyhraj.',
    icon: '🪢',
    rarity: 'common'
  },
  {
    id: 'polyglot_team',
    name: 'Korporátní guru',
    description: 'Vyřeš v jeden den všechna 3 slova ve všech kategoriích.',
    icon: '🏆',
    rarity: 'legendary'
  },
  {
    id: 'steam_engine',
    name: 'Horká pára (90°C+)',
    description: 'Dosáhni teploty nad 90 °C těsně před finálním vítězstvím.',
    icon: '🌋',
    rarity: 'common'
  }
];

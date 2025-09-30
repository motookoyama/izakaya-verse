export type ThemeId =
  | 'onyx-neon'
  | 'hanami-sakura'
  | 'steampunk'
  | 'pacific'
  | 'rose-aurora';

export interface ThemePalette {
  id: ThemeId;
  name: string;
  description: string;
  vars: Record<string, string>;
}

const baseShadow = '0 14px 40px rgba(0,0,0,.35)';

export const themes: ThemePalette[] = [
  {
    id: 'onyx-neon',
    name: 'Onyx Neon',
    description: '濃い赤とネオンサイアンで構成した夜更けのチャット空間。',
    vars: {
      '--bg': '#190c18',
      '--panel': '#d93851',
      '--surface': '#db435b',
      '--line': '#e16377',
      '--fg': '#f5f7fb',
      '--muted': '#aeb6c9',
      '--brand': '#e87b25',
      '--brand-2': '#58cff5',
      '--accent': '#190c18',
      '--radius': '16px',
      '--space': '14px',
      '--shadow': baseShadow,
    },
  },
  {
    id: 'hanami-sakura',
    name: 'Hanami Sakura',
    description: '花見の薄曇りをイメージした桜色の柔らかなライトテーマ。',
    vars: {
      '--bg': '#f6f1f5',
      '--panel': '#fff7fa',
      '--surface': '#fdeff4',
      '--line': '#f3cddd',
      '--fg': '#312026',
      '--muted': '#7d5b65',
      '--brand': '#ea669a',
      '--brand-2': '#6fb48c',
      '--accent': '#f4c95d',
      '--radius': '16px',
      '--space': '14px',
      '--shadow': '0 12px 32px rgba(234, 102, 154, 0.18)',
    },
  },
  {
    id: 'rose-aurora',
    name: 'Rose Aurora',
    description: '快晴の朝焼けを思わせるローズとパステルのコントラストテーマ。',
    vars: {
      '--bg': '#e9f8ff',
      '--panel': '#fff0f7',
      '--surface': '#ffe5ef',
      '--line': '#d3b7ff',
      '--fg': '#1f2435',
      '--muted': '#697596',
      '--brand': '#ff7a59',
      '--brand-2': '#4ba3ff',
      '--accent': '#ffd166',
      '--radius': '16px',
      '--space': '14px',
      '--shadow': '0 12px 32px rgba(75, 163, 255, 0.18)',
    },
  },
  {
    id: 'steampunk',
    name: 'Steampunk Brass',
    description: '金属感のあるブラスカラーで MetaCapture 編集向け。',
    vars: {
      '--bg': '#19160f',
      '--panel': '#2b2216',
      '--surface': '#342919',
      '--line': '#5a462a',
      '--fg': '#f3e8d1',
      '--muted': '#d6c6a8',
      '--brand': '#c79a3b',
      '--brand-2': '#e87a3a',
      '--accent': '#b3262d',
      '--radius': '16px',
      '--space': '14px',
      '--shadow': baseShadow,
    },
  },
  {
    id: 'pacific',
    name: 'Pacific Cyan',
    description: 'ディープブルーとミントのツートンによるクールなスキン。',
    vars: {
      '--bg': '#081018',
      '--panel': '#0f172a',
      '--surface': '#0c1220',
      '--line': '#1e2741',
      '--fg': '#e6e7ea',
      '--muted': '#9aa3af',
      '--brand': '#7c87ff',
      '--brand-2': '#30e1b9',
      '--accent': '#ff6b9e',
      '--radius': '16px',
      '--space': '14px',
      '--shadow': baseShadow,
    },
  },
];

export type ThemeVarKey = keyof ThemePalette['vars'];

export const themeVarKeys: ThemeVarKey[] = Array.from(
  new Set(themes.flatMap((theme) => Object.keys(theme.vars)))
) as ThemeVarKey[];

const FALLBACK_THEME: ThemePalette = themes[0] ?? { id: 'onyx-neon', name: 'Onyx Neon', description: '', vars: {} } as ThemePalette;

export function findTheme(id: ThemeId): ThemePalette {
  const theme = themes.find((item) => item.id === id);
  return theme ?? FALLBACK_THEME;
}

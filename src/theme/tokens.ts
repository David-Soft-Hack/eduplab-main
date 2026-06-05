export const md3LightTokens = {
  primary: '#006b5b',
  onPrimary: '#ffffff',
  primaryContainer: '#6cf7da',
  onPrimaryContainer: '#00201a',

  secondary: '#4a635c',
  onSecondary: '#ffffff',
  secondaryContainer: '#cce8de',
  onSecondaryContainer: '#06201b',

  tertiary: '#8b6a00',
  onTertiary: '#ffffff',
  tertiaryContainer: '#ffdfa0',
  onTertiaryContainer: '#2a1e00',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#410002',

  surface: '#faf9fc',
  surfaceDim: '#d8d7db',
  surfaceBright: '#faf9fc',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f2f6',
  surfaceContainer: '#edecf0',
  surfaceContainerHigh: '#e7e6ea',
  surfaceContainerHighest: '#e1e1e5',
  onSurface: '#1a1c1e',
  onSurfaceVariant: '#44474f',

  inverseSurface: '#2f3033',
  inverseOnSurface: '#f1f0f4',
  inversePrimary: '#6cf7da',

  outline: '#74777f',
  outlineVariant: '#c4c6cf',

  shadow: '#000000',
  scrim: '#000000',

  surfaceTint: '#006b5b',

  stateHover: 'rgba(26, 28, 30, 0.08)',
  stateFocus: 'rgba(26, 28, 30, 0.12)',
  statePressed: 'rgba(26, 28, 30, 0.12)',
  stateDragged: 'rgba(26, 28, 30, 0.16)',
} as const;

export const md3DarkTokens = {
  primary: '#6cf7da',
  onPrimary: '#00382f',
  primaryContainer: '#005045',
  onPrimaryContainer: '#9efff0',

  secondary: '#b0ccc3',
  onSecondary: '#1b352f',
  secondaryContainer: '#324c44',
  onSecondaryContainer: '#cce8de',

  tertiary: '#eac25b',
  onTertiary: '#463300',
  tertiaryContainer: '#684e00',
  onTertiaryContainer: '#ffdfa0',

  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',

  surface: '#111318',
  surfaceDim: '#111318',
  surfaceBright: '#37393e',
  surfaceContainerLowest: '#0c0e12',
  surfaceContainerLow: '#191b1f',
  surfaceContainer: '#1d1f23',
  surfaceContainerHigh: '#282a2e',
  surfaceContainerHighest: '#333439',
  onSurface: '#e1e1e5',
  onSurfaceVariant: '#c4c6cf',

  inverseSurface: '#e1e1e5',
  inverseOnSurface: '#2f3033',
  inversePrimary: '#006b5b',

  outline: '#8e9099',
  outlineVariant: '#44474f',

  shadow: '#000000',
  scrim: '#000000',

  surfaceTint: '#6cf7da',

  stateHover: 'rgba(225, 225, 229, 0.08)',
  stateFocus: 'rgba(225, 225, 229, 0.12)',
  statePressed: 'rgba(225, 225, 229, 0.12)',
  stateDragged: 'rgba(225, 225, 229, 0.16)',
} as const;

export type Md3TokenKey = keyof typeof md3LightTokens;

export const allTokenKeys = Object.keys(md3LightTokens) as Md3TokenKey[];

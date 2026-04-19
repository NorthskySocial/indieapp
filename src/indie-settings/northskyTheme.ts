// NorthSky brand palette
// Gradient: #2AFFBA (mint) → #BB0FFB (magenta)
// Stops: #2AFFBA, #40DAC4, #59B2CF, #7780DC, #9A45EC, #1F0B35

// Purple primary ramp (light → dark). Used directly in light mode,
// inverted for dark/dim so bg-tints render as dark purple.
const purpleRamp = [
  '#FAF3FF', // 25
  '#F4E7FE', // 50
  '#E8CFFD', // 100
  '#D2A6FB', // 200
  '#BC7DF8', // 300
  '#A85BF1', // 400
  '#9A45EC', // 500 — brand
  '#7E2FD0', // 600
  '#6322A8', // 700
  '#491880', // 800
  '#310F58', // 900
  '#200A3D', // 950
  '#150626', // 975
] as const

// Mint primary ramp (light → dark). Used in light mode.
const mintRamp = [
  '#F0FFFA', // 25
  '#DDFEF1', // 50
  '#BBFDE3', // 100
  '#88FCD0', // 200
  '#54FBC2', // 300
  '#3FFBB8', // 400
  '#2AFBBA', // 500 — brand
  '#15D89B', // 600
  '#0FA678', // 700
  '#0A7A58', // 800
  '#074E38', // 900
  '#053825', // 950
  '#032818', // 975
] as const

// Purple-tinted neutral ramp (light → dark).
const neutralRamp = [
  '#FFFFFF', // 0
  '#FAF7FD', // 25
  '#F2EDF8', // 50
  '#E5DCEF', // 100
  '#CDBEDF', // 200
  '#B19CCB', // 300
  '#9479B5', // 400
  '#785A9B', // 500
  '#604980', // 600
  '#4C3A66', // 700
  '#3A2C4F', // 800
  '#2A1F3B', // 900
  '#22182F', // 950
  '#1A1226', // 975
  '#000000', // 1000
] as const

const primaryKeys = [
  'primary_25',
  'primary_50',
  'primary_100',
  'primary_200',
  'primary_300',
  'primary_400',
  'primary_500',
  'primary_600',
  'primary_700',
  'primary_800',
  'primary_900',
  'primary_950',
  'primary_975',
] as const

const contrastKeys = [
  'contrast_0',
  'contrast_25',
  'contrast_50',
  'contrast_100',
  'contrast_200',
  'contrast_300',
  'contrast_400',
  'contrast_500',
  'contrast_600',
  'contrast_700',
  'contrast_800',
  'contrast_900',
  'contrast_950',
  'contrast_975',
  'contrast_1000',
] as const

function buildScale<K extends readonly string[]>(
  keys: K,
  values: readonly string[],
  invert: boolean,
): Record<K[number], string> {
  const ordered = invert ? [...values].reverse() : values
  return Object.fromEntries(keys.map((key, i) => [key, ordered[i]])) as Record<
    K[number],
    string
  >
}

const darkPalette = {
  ...buildScale(primaryKeys, purpleRamp, true),
  ...buildScale(contrastKeys, neutralRamp, true),
}

const lightPalette = {
  ...buildScale(primaryKeys, mintRamp, false),
  ...buildScale(contrastKeys, neutralRamp, false),
}

export const northskyDarkTheme = {
  palette: darkPalette,
  atoms: {
    bg: {
      backgroundColor: '#1F0B35',
    },
  },
}

export const northskyLightTheme = {
  palette: lightPalette,
  atoms: {
    bg: {
      backgroundColor: '#DFE1E3',
    },
  },
}

export const themes = {
  dark: northskyDarkTheme,
  dim: northskyDarkTheme,
  light: northskyLightTheme,
}

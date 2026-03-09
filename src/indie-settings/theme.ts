import {type Theme} from '@bsky.app/alf'

import {themes as baseThemes} from '#/alf/themes'
import {themes as overrides} from './northskyTheme'

type ThemeOverride = {
  palette?: Partial<Theme['palette']>
  atoms?: Partial<Theme['atoms']>
}

function mergeTheme(base: Theme, override?: ThemeOverride): Theme {
  if (!override) return base
  return {
    ...base,
    palette: {...base.palette, ...override.palette},
    atoms: {...base.atoms, ...override.atoms},
  } as Theme
}

const mergedLight = mergeTheme(baseThemes.light, overrides?.light)
const mergedDark = mergeTheme(baseThemes.dark, overrides?.dark)
const mergedDim = mergeTheme(baseThemes.dim, overrides?.dim)

export const indieThemes: typeof baseThemes = {
  ...baseThemes,
  light: mergedLight,
  dark: mergedDark,
  dim: mergedDim,
  lightPalette: mergedLight.palette,
  darkPalette: mergedDark.palette,
  dimPalette: mergedDim.palette,
}

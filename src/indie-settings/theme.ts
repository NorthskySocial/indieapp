import {createTheme, type Theme} from '@bsky.app/alf'

import {themes as baseThemes} from '#/alf/themes'
import {themes as overrides} from './northskyTheme'

type ThemeOverride = {
  palette?: Partial<Theme['palette']>
  atoms?: Partial<Theme['atoms']>
}

function mergeTheme(base: Theme, override?: ThemeOverride): Theme {
  if (!override) return base
  const mergedPalette = {
    ...base.palette,
    ...override.palette,
  } as Theme['palette']
  const rebuilt = createTheme({
    scheme: base.scheme,
    name: base.name,
    palette: mergedPalette,
    options: {shadowOpacity: base.scheme === 'dark' ? 0.4 : 0.1},
  })
  return {
    ...rebuilt,
    atoms: {...rebuilt.atoms, ...override.atoms},
  }
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

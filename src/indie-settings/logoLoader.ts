import {AppSettings} from '#/indie-settings/settings'

// Pre-require all possible logos so Metro bundles them
const logoModules: Record<string, any> = {
  'indie-settings/assets/bluesky/SvgLogo': require('./assets/bluesky/SvgLogo'),
  // Add more logos here as needed:
  'indie-settings/assets/northsky/SvgLogo': require('./assets/northsky/SvgLogo'),
}

export function loadSvgLogo() {
  const path = AppSettings.LOGO_SVG_PATH
  try {
    if (!path || !logoModules[path]) {
      throw new Error(`Logo not found for path: ${path}`)
    }
    const module = logoModules[path]
    return module.SvgLogo
  } catch (err) {
    console.error(`Failed to load logo from ${path}:`, err)
    return null
  }
}

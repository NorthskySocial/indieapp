import {NorthSkyAppSettings} from './northsky.settings.example'

export interface IndieAppSettings {
  // Feature flags
  ANALYTICS_ENABLED: boolean
  AGE_ASSURANCE_ENABLED: boolean
  // App identity
  APP_NAME: string
  BASE_URL: string
  BSKY_DOWNLOAD_URL: string
  BSKY_SERVICE: string
  BSKY_SERVICE_DID: string
  DEFAULT_POST: string
  DEFAULT_SERVICE: string
  DEFAULT_URI: string
  DISCOVER_FEED_URI: string
  EMBED_SCRIPT: string
  EMBED_SERVICE: string
  FAVICON_PATH: string
  SPLASH_IMAGE_PATH: string
  SPLASH_IMAGE_DARK_PATH: string
  SPLASH_ANDROID_IMAGE_PATH: string
  HELP_DESK_LANG: string
  HELP_DESK_URL: string
  LOGO_SVG_PATH: string
  PUBLIC_BSKY_SERVICE: string
  PUBLIC_BSKY_SERVICE_DID: string
  STAGING_SERVICE: string
  STAGING_DEFAULT_FEED_URI: string
  STAGING_VIDEO_FEED_URI: string
  VIDEO_FEED_URI: string
}

const HELP_DESK_LANG = 'en-us'

// Bluesky Settings
export const BlueSkyAppSettings: IndieAppSettings = {
  ANALYTICS_ENABLED: false,
  AGE_ASSURANCE_ENABLED: true,
  APP_NAME: 'Bluesky',
  BASE_URL: 'https://bsky.app',
  BSKY_DOWNLOAD_URL: 'https://bsky.app/download',
  BSKY_SERVICE: 'https://bsky.social',
  BSKY_SERVICE_DID: 'did:web:bsky.social',
  DEFAULT_POST:
    'https://bsky.app/profile/did:plc:vjug55kidv6sye7ykr5faxxn/post/3jzn6g7ixgq2y',
  DEFAULT_SERVICE: 'https://bsky.social',
  DEFAULT_URI:
    'at://did:plc:vjug55kidv6sye7ykr5faxxn/app.bsky.feed.post/3jzn6g7ixgq2y',
  DISCOVER_FEED_URI:
    'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot',
  EMBED_SCRIPT: 'https://embed.bsky.app/static/embed.js',
  EMBED_SERVICE: 'https://embed.bsky.app',
  FAVICON_PATH: './assets/favicon.png',
  SPLASH_IMAGE_PATH: './assets/splash/splash.png',
  SPLASH_IMAGE_DARK_PATH: './assets/splash/splash-dark.png',
  SPLASH_ANDROID_IMAGE_PATH: './assets/splash/android-splash-logo-white.png',
  HELP_DESK_LANG,
  HELP_DESK_URL: `https://blueskyweb.zendesk.com/hc/${HELP_DESK_LANG}`,
  LOGO_SVG_PATH: 'indie-settings/assets/bluesky/SvgLogo',
  PUBLIC_BSKY_SERVICE: 'https://api.bsky.app',
  PUBLIC_BSKY_SERVICE_DID: 'did:web:api.bsky.app',
  STAGING_SERVICE: 'https://staging.bsky.dev',
  STAGING_DEFAULT_FEED_URI:
    'at://did:plc:yofh3kx63drvfljkibw5zuxo/app.bsky.feed.generator/whats-hot',
  STAGING_VIDEO_FEED_URI:
    'at://did:plc:yofh3kx63drvfljkibw5zuxo/app.bsky.feed.generator/thevids',
  VIDEO_FEED_URI:
    'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/thevids',
}

// Replace the example NorthSkyAppSettings with your own indie settings
export const AppSettings: IndieAppSettings = {
  ...BlueSkyAppSettings,
  ...NorthSkyAppSettings,
}

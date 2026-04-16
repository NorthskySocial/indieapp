/* eslint-disable  @typescript-eslint/no-duplicate-enum-values */

import {NorthSkyAppSettings} from './northsky.settings.example'

// Bluesky Settings
export enum BlueSkyAppSettings {
  ANALYTICS_ENABLED = 'false',
  AGE_ASSURANCE_ENABLED = 'true',
  APP_NAME = 'Bluesky',
  BASE_URL = 'https://bsky.app',
  BSKY_DOWNLOAD_URL = 'https://bsky.app/download',
  BSKY_SERVICE = 'https://bsky.social',
  BSKY_SERVICE_DID = 'did:web:bsky.social',
  DEFAULT_POST = 'https://bsky.app/profile/did:plc:vjug55kidv6sye7ykr5faxxn/post/3jzn6g7ixgq2y',
  DEFAULT_SERVICE = 'https://bsky.social',
  DEFAULT_URI = 'at://did:plc:vjug55kidv6sye7ykr5faxxn/app.bsky.feed.post/3jzn6g7ixgq2y',
  DISCOVER_FEED_URI = 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot',
  EMBED_SCRIPT = 'https://embed.bsky.app/static/embed.js',
  EMBED_SERVICE = 'https://embed.bsky.app',
  FAVICON_PATH = './assets/favicon.png',
  HELP_DESK_LANG = 'en-us',
  HELP_DESK_URL = `https://blueskyweb.zendesk.com/hc/${HELP_DESK_LANG}`,
  LOGO_SVG_PATH = 'indie-settings/assets/bluesky/SvgLogo',
  PUBLIC_BSKY_SERVICE = 'https://api.bsky.app',
  PUBLIC_BSKY_SERVICE_DID = 'did:web:api.bsky.app',
  STAGING_SERVICE = 'https://staging.bsky.dev',
  STAGING_DEFAULT_FEED_URI = 'at://did:plc:yofh3kx63drvfljkibw5zuxo/app.bsky.feed.generator/whats-hot',
  STAGING_VIDEO_FEED_URI = 'at://did:plc:yofh3kx63drvfljkibw5zuxo/app.bsky.feed.generator/thevids',
  VIDEO_FEED_URI = 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/thevids',
}

// Replace the example NorthSkyAppSettings with your own indie settings
export const AppSettings = {...BlueSkyAppSettings, ...NorthSkyAppSettings}

/**
 * Coerce a string enum member to a boolean flag. Only the literal `'true'`
 * resolves to `true`; anything else (including `'false'`, empty string, or
 * missing) resolves to `false`.
 */
const asBool = (value: string): boolean => value === 'true'

/**
 * Derived boolean views of `AppSettings` toggles. See the enum member
 * corresponding to each for semantics.
 */
export const ANALYTICS_ENABLED: boolean = asBool(AppSettings.ANALYTICS_ENABLED)
export const AGE_ASSURANCE_ENABLED: boolean = asBool(
  AppSettings.AGE_ASSURANCE_ENABLED,
)

import {NorthSkyAppSettings} from './northsky.settings.example'

/** Resolved appview (service URL + DID) for an account or route. */
export interface Appview {
  BSKY_SERVICE: string
  BSKY_SERVICE_DID: string
}

/**
 * Maps a set of PDS hostnames to the appview that should serve accounts
 * signed in through them.
 *
 * Matching is done on the hostname of the service URL the user selected as
 * their hosting provider in the login form (e.g. `bsky.social`), i.e.
 * `agent.serviceUrl`. For most deployments this is the same host that runs
 * the PDS for those accounts.
 */
export interface AppviewRoute extends Appview {
  /**
   * Lowercase PDS hostnames this route applies to (e.g. `bsky.social`).
   * Match is exact, no wildcards.
   */
  pdsHosts: string[]
}

export interface IndieAppSettings {
  // Feature flags
  ANALYTICS_ENABLED: boolean
  AGE_ASSURANCE_ENABLED: boolean
  // App identity
  APP_NAME: string
  APPVIEW_ROUTES: AppviewRoute[]
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
  HELP_DESK_LANG: string
  HELP_DESK_URL: string
  LOGO_SVG_PATH: string
  DEFAULT_BSKY_SERVICE: string
  DEFAULT_BSKY_SERVICE_DID: string
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
  APPVIEW_ROUTES: [],
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
  HELP_DESK_LANG,
  HELP_DESK_URL: `https://blueskyweb.zendesk.com/hc/${HELP_DESK_LANG}`,
  LOGO_SVG_PATH: 'indie-settings/assets/bluesky/SvgLogo',
  DEFAULT_BSKY_SERVICE: 'https://api.bsky.app',
  DEFAULT_BSKY_SERVICE_DID: 'did:web:api.bsky.app',
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

/**
 * Resolve the appview (service URL + DID) to use for an account whose
 * hosting provider is at `pdsHost`. The first matching entry in
 * {@link IndieAppSettings.APPVIEW_ROUTES} wins; otherwise falls back to the
 * configured default appview.
 *
 * @param pdsHost - Hostname of the hosting provider selected at login, i.e.
 *   `new URL(agent.serviceUrl).hostname` (e.g. `northsky.social`). Undefined
 *   for guest/public agents.
 */
export function resolveAppviewForPdsHost(pdsHost: string | undefined): Appview {
  if (pdsHost) {
    const normalized = pdsHost.toLowerCase()
    for (const route of AppSettings.APPVIEW_ROUTES) {
      if (route.pdsHosts.some(h => h.toLowerCase() === normalized)) {
        return {
          BSKY_SERVICE: route.BSKY_SERVICE,
          BSKY_SERVICE_DID: route.BSKY_SERVICE_DID,
        }
      }
    }
  }
  return {
    BSKY_SERVICE: AppSettings.DEFAULT_BSKY_SERVICE,
    BSKY_SERVICE_DID: AppSettings.DEFAULT_BSKY_SERVICE_DID,
  }
}

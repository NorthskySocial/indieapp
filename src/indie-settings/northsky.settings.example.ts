import {type IndieAppSettings} from './settings'

const EMBED_SERVICE = 'https://embed.northsky.app'
const HELP_DESK_LANG = 'en-us'

// Northsky Settings
export const NorthSkyAppSettings: Partial<IndieAppSettings> = {
  ANALYTICS_ENABLED: false,
  AGE_ASSURANCE_ENABLED: false,
  APP_NAME: 'Northsky',
  APPVIEW_ROUTES: [
    {
      pdsHosts: ['blacksky.community', 'northsky.social'],
      BSKY_SERVICE: 'https://api.blacksky.community',
      BSKY_SERVICE_DID: 'did:web:api.blacksky.community',
    },
  ],
  BASE_URL: 'https://northsky.app',
  BSKY_DOWNLOAD_URL: 'https://northsky.app/download',
  BSKY_SERVICE: 'https://northsky.social',
  BSKY_SERVICE_DID: 'did:web:bsky.social',
  DEFAULT_POST:
    'https://bsky.app/profile/did:plc:vjug55kidv6sye7ykr5faxxn/post/3jzn6g7ixgq2y',
  DEFAULT_SERVICE: 'https://northsky.social',
  DEFAULT_URI:
    'at://did:plc:vjug55kidv6sye7ykr5faxxn/app.bsky.feed.post/3jzn6g7ixgq2y',
  DISCOVER_FEED_URI:
    'at://did:plc:23cnpffmuf4vkpsnwhgyvljw/app.bsky.feed.generator/NorthskySocial',
  EMBED_SERVICE,
  EMBED_SCRIPT: `${EMBED_SERVICE}/static/embed.js`,
  FAVICON_PATH: 'src/indie-settings/assets/northsky/Northsky-Icon-Color.png',
  HELP_DESK_LANG,
  HELP_DESK_URL: `https://blueskyweb.zendesk.com/hc/${HELP_DESK_LANG}`,
  LOGO_SVG_PATH: 'indie-settings/assets/northsky/SvgLogo',
  // Fallback appview for accounts whose PDS host isn't listed in
  // APPVIEW_ROUTES above (e.g. bsky.social accounts on *.host.bsky.network).
  DEFAULT_BSKY_SERVICE: 'https://api.bsky.app',
  DEFAULT_BSKY_SERVICE_DID: 'did:web:api.bsky.app',
  STAGING_SERVICE: 'https://staging.bsky.dev',
  STAGING_DEFAULT_FEED_URI:
    'at://did:plc:23cnpffmuf4vkpsnwhgyvljw/app.bsky.feed.generator/NorthskySocial',
  STAGING_VIDEO_FEED_URI:
    'at://did:plc:yofh3kx63drvfljkibw5zuxo/app.bsky.feed.generator/thevids',
  VIDEO_FEED_URI:
    'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/thevids',
}

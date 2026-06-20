import {type IndieAppSettings as IndieAppSettingsType} from './settings'

/*
 * Indieapp Settings
 *
 * Deployment-specific values for indieapp.ripperoni.com.
 * Override only the values that differ from the default Bluesky settings.
 */
export const indieAppSettings: Partial<IndieAppSettingsType> = {
  // Deployment identity
  BASE_URL: 'https://indieapp.ripperoni.com',
  BSKY_DOWNLOAD_URL: 'https://indieapp.ripperoni.com/download',

  // AT Protocol service — connect via bsky.social
  BSKY_SERVICE: 'https://bsky.social',
  BSKY_SERVICE_DID: 'did:web:bsky.social',
  DEFAULT_SERVICE: 'https://bsky.social',

  // Public API endpoints
  PUBLIC_BSKY_SERVICE: 'https://api.bsky.app',
  PUBLIC_BSKY_SERVICE_DID: 'did:web:api.bsky.app',
  DISCOVER_FEED_URI:
    'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot',
  VIDEO_FEED_URI:
    'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/thevids',

  // Embed service — re-use official Bluesky embed
  EMBED_SERVICE: 'https://embed.bsky.app',
  EMBED_SCRIPT: 'https://embed.bsky.app/static/embed.js',

  // Stratos service — our deployment on this server
  STRATOS_SERVICE_DID: 'did:web:stratos.ripperoni.com',

  // Help desk (same as default)
  HELP_DESK_URL: 'https://blueskyweb.zendesk.com/hc/en-us',

  // Analytics disabled
  ANALYTICS_ENABLED: false,
  AGE_ASSURANCE_ENABLED: false,
}

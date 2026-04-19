import {Platform} from 'react-native'

import {BSKY_APP_HOSTNAME} from '#/lib/strings/url-helpers'
import {NotImplementedError} from '../NotImplemented'
import {type GooglePlayReferrerInfo, type ReferrerInfo} from './types'

export function getGooglePlayReferrerInfoAsync(): Promise<GooglePlayReferrerInfo> {
  throw new NotImplementedError()
}

export function getReferrerInfo(): ReferrerInfo | null {
  if (
    Platform.OS === 'web' &&
    // for ssr
    typeof document !== 'undefined' &&
    document != null &&
    document.referrer
  ) {
    try {
      const url = new URL(document.referrer)
      if (url.hostname !== BSKY_APP_HOSTNAME) {
        return {
          referrer: url.href,
          hostname: url.hostname,
        }
      }
    } catch {
      // If something happens to the URL parsing, we don't want to actually cause any problems for the user. Just
      // log the error so we might catch it
      console.error('Failed to parse referrer URL')
    }
  }
  return null
}

import {describe, expect, it} from '@jest/globals'

import {
  AppSettings,
  type AppviewRoute,
  resolveAppviewForPdsHost,
} from '#/indie-settings/settings'

function withRoutes<T>(routes: AppviewRoute[], fn: () => T): T {
  const original = AppSettings.APPVIEW_ROUTES
  AppSettings.APPVIEW_ROUTES = routes
  try {
    return fn()
  } finally {
    AppSettings.APPVIEW_ROUTES = original
  }
}

describe('resolveAppviewForPdsHost', () => {
  it('falls back to DEFAULT_BSKY_SERVICE when no routes are configured', () => {
    const result = withRoutes([], () =>
      resolveAppviewForPdsHost('pds-one.test'),
    )
    expect(result).toEqual({
      BSKY_SERVICE: AppSettings.DEFAULT_BSKY_SERVICE,
      BSKY_SERVICE_DID: AppSettings.DEFAULT_BSKY_SERVICE_DID,
    })
  })

  it('falls back when pdsHost is undefined', () => {
    const result = resolveAppviewForPdsHost(undefined)
    expect(result).toEqual({
      BSKY_SERVICE: AppSettings.DEFAULT_BSKY_SERVICE,
      BSKY_SERVICE_DID: AppSettings.DEFAULT_BSKY_SERVICE_DID,
    })
  })

  describe('with configured routes', () => {
    const routes: AppviewRoute[] = [
      {
        pdsHosts: ['pds-one.test', 'pds-two.test'],
        BSKY_SERVICE: 'https://appview-a.test',
        BSKY_SERVICE_DID: 'did:web:appview-a.test',
      },
      {
        pdsHosts: ['pds-three.test'],
        BSKY_SERVICE: 'https://appview-b.test',
        BSKY_SERVICE_DID: 'did:web:appview-b.test',
      },
    ]

    it('matches the first PDS host in a route', () => {
      const result = withRoutes(routes, () =>
        resolveAppviewForPdsHost('pds-one.test'),
      )
      expect(result).toEqual({
        BSKY_SERVICE: 'https://appview-a.test',
        BSKY_SERVICE_DID: 'did:web:appview-a.test',
      })
    })

    it('matches additional PDS hosts in the same route', () => {
      const result = withRoutes(routes, () =>
        resolveAppviewForPdsHost('pds-two.test'),
      )
      expect(result).toEqual({
        BSKY_SERVICE: 'https://appview-a.test',
        BSKY_SERVICE_DID: 'did:web:appview-a.test',
      })
    })

    it('matches case-insensitively', () => {
      const result = withRoutes(routes, () =>
        resolveAppviewForPdsHost('PDS-One.Test'),
      )
      expect(result).toEqual({
        BSKY_SERVICE: 'https://appview-a.test',
        BSKY_SERVICE_DID: 'did:web:appview-a.test',
      })
    })

    it('returns the matching route for other hosts', () => {
      const result = withRoutes(routes, () =>
        resolveAppviewForPdsHost('pds-three.test'),
      )
      expect(result).toEqual({
        BSKY_SERVICE: 'https://appview-b.test',
        BSKY_SERVICE_DID: 'did:web:appview-b.test',
      })
    })

    it('falls back when no route matches', () => {
      const result = withRoutes(routes, () =>
        resolveAppviewForPdsHost('unknown.test'),
      )
      expect(result).toEqual({
        BSKY_SERVICE: AppSettings.DEFAULT_BSKY_SERVICE,
        BSKY_SERVICE_DID: AppSettings.DEFAULT_BSKY_SERVICE_DID,
      })
    })
  })
})

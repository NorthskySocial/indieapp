import {describe, expect, it, jest} from '@jest/globals'

jest.mock('jwt-decode', () => ({jwtDecode: () => ({})}))
jest.mock('../../birthdate')
jest.mock('../../../ageAssurance/data')
jest.mock('#/lib/notifications/notifications', () => ({
  unregisterPushToken: () => Promise.resolve(),
}))

import {AppSettings, type AppviewRoute} from '#/indie-settings/settings'
import {configureAppviewProxy, getAppviewForAgent} from '../agent'

type StubAgent = {
  serviceUrl: string | URL | undefined
  appview?: {BSKY_SERVICE: string; BSKY_SERVICE_DID: string}
  configureProxy: jest.Mock
}

function makeAgent(serviceUrl: string | undefined): StubAgent {
  return {
    serviceUrl,
    configureProxy: jest.fn(),
  }
}

function withRoutes<T>(routes: AppviewRoute[], fn: () => T): T {
  const original = AppSettings.APPVIEW_ROUTES
  AppSettings.APPVIEW_ROUTES = routes
  try {
    return fn()
  } finally {
    AppSettings.APPVIEW_ROUTES = original
  }
}

const routes: AppviewRoute[] = [
  {
    pdsHosts: ['host-one.test', 'host-two.test'],
    BSKY_SERVICE: 'https://appview-a.test',
    BSKY_SERVICE_DID: 'did:web:appview-a.test',
  },
]

describe('configureAppviewProxy', () => {
  it('resolves appview from the service URL hostname (not pdsUrl)', () => {
    const agent = makeAgent('https://host-one.test')
    withRoutes(routes, () => configureAppviewProxy(agent as any))
    expect(agent.appview).toEqual({
      BSKY_SERVICE: 'https://appview-a.test',
      BSKY_SERVICE_DID: 'did:web:appview-a.test',
    })
    expect(agent.configureProxy).toHaveBeenCalledWith(
      'did:web:appview-a.test#bsky_appview',
    )
  })

  it('falls back to DEFAULT_BSKY_SERVICE when the service URL host does not match', () => {
    const agent = makeAgent('https://unknown.test')
    withRoutes(routes, () => configureAppviewProxy(agent as any))
    expect(agent.appview).toEqual({
      BSKY_SERVICE: AppSettings.DEFAULT_BSKY_SERVICE,
      BSKY_SERVICE_DID: AppSettings.DEFAULT_BSKY_SERVICE_DID,
    })
    expect(agent.configureProxy).toHaveBeenCalledWith(
      `${AppSettings.DEFAULT_BSKY_SERVICE_DID}#bsky_appview`,
    )
  })

  it('matches additional hosts in the same route', () => {
    const agent = makeAgent('https://host-two.test')
    withRoutes(routes, () => configureAppviewProxy(agent as any))
    expect(agent.appview?.BSKY_SERVICE).toBe('https://appview-a.test')
  })
})

describe('getAppviewForAgent', () => {
  it('returns the appview stored on the agent', () => {
    const agent = {
      appview: {
        BSKY_SERVICE: 'https://appview-a.test',
        BSKY_SERVICE_DID: 'did:web:appview-a.test',
      },
    }

    expect(getAppviewForAgent(agent as any)).toEqual(agent.appview)
  })

  it('falls back to DEFAULT_BSKY_SERVICE when the agent has no appview', () => {
    expect(getAppviewForAgent({} as any)).toEqual({
      BSKY_SERVICE: AppSettings.DEFAULT_BSKY_SERVICE,
      BSKY_SERVICE_DID: AppSettings.DEFAULT_BSKY_SERVICE_DID,
    })
  })
})

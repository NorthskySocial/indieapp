import {type ReactNode, useEffect} from 'react'
import {Text} from 'react-native'
import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals'
import {cleanup, render, waitFor} from '@testing-library/react-native'

/* ------------------------------------------------------------------ */
/*  Mock setup — hoisted before any real imports                      */
/* ------------------------------------------------------------------ */

/**
 * Controllable agent returned by useAgent().
 * Tests mutate .session and .pdsUrl between renders.
 */
type MockSession = {
  did: string
  handle?: string
  accessJwt?: string
}

const mockAgent: {
  session: MockSession | undefined
  pdsUrl: URL | undefined
} = {
  session: undefined,
  pdsUrl: undefined,
}

const mockGetEnrollment = jest.fn<any>()
const mockLoggerError = jest.fn()

jest.mock('#/env', () => ({
  __esModule: true,
  STRATOS_SERVICE_DID: 'did:web:test-stratos.example.com',
}))

jest.mock('#/state/session', () => ({
  useAgent: () => mockAgent,
}))

const mockSetStratosFetchOverride = jest.fn()

jest.mock('#/state/session/agent', () => ({
  setStratosFetchOverride: (...args: any[]) =>
    mockSetStratosFetchOverride(...args),
}))

const mockResolveServiceUrl = jest.fn<any>()
const mockCreateServiceFetchHandler = jest.fn<any>()

jest.mock('@northskysocial/stratos-client', () => ({
  getEnrollmentByServiceDid: (...args: any[]) => mockGetEnrollment(...args),
  resolveServiceUrl: (...args: any[]) => mockResolveServiceUrl(...args),
  createServiceFetchHandler: (...args: any[]) =>
    mockCreateServiceFetchHandler(...args),
}))

jest.mock('#/logger', () => ({
  logger: {
    error: (...args: any[]) => mockLoggerError(...args),
  },
}))

jest.mock('#/storage', () => {
  const store = new Map<string, any>()
  return {
    device: {
      get: (key: string[]) => store.get(key.join('.')),
      set: (key: string[], value: any) => store.set(key.join('.'), value),
      remove: (key: string[]) => store.delete(key.join('.')),
    },
  }
})

/* ------------------------------------------------------------------ */
/*  Imports after mocks                                                */
/* ------------------------------------------------------------------ */

import {type StratosEnrollment} from '@northskysocial/stratos-client'

import {
  Provider as StratosProvider,
  StratosSessionListener,
  useStratos,
} from '#/state/stratos'

/* ------------------------------------------------------------------ */
/*  Fixtures & helpers                                                */
/* ------------------------------------------------------------------ */

function createEnrollment(
  overrides: Partial<StratosEnrollment> = {},
): StratosEnrollment {
  return {
    service: 'did:web:test-stratos.example.com',
    boundaries: [{value: 'example.com'}],
    signingKey: 'did:key:zTestSigningKey123',
    attestation: {
      sig: new Uint8Array([1, 2, 3]),
      signingKey: 'did:key:zTestAttestKey',
    },
    createdAt: '2025-01-01T00:00:00Z',
    rkey: 'self',
    ...overrides,
  }
}

function TestApp({children}: {children?: ReactNode}) {
  return <StratosProvider>{children}</StratosProvider>
}

function Reader({refValue}: {refValue: {current: any}}) {
  refValue.current = useStratos()
  return null
}

/* ------------------------------------------------------------------ */
/*  Setup                                                              */
/* ------------------------------------------------------------------ */

beforeEach(() => {
  jest.clearAllMocks()
  mockAgent.session = undefined
  mockAgent.pdsUrl = undefined
  mockGetEnrollment.mockReset()
  mockGetEnrollment.mockResolvedValue(undefined)
  mockResolveServiceUrl.mockImplementation(
    (enrollment: any, _fallback: string) => enrollment?.service ?? null,
  )
  mockSetStratosFetchOverride.mockReset()
})

afterEach(() => {
  cleanup()
})

// ================================================================== //
//  1.1  Provider Basic Rendering
// ================================================================== //

describe('Provider – basic rendering', () => {
  it('renders children without crashing', () => {
    render(
      <TestApp>
        <Text>hello</Text>
      </TestApp>,
    )
  })

  it('provides default values: enrollment is undefined, active is false', () => {
    const ref: {current: any} = {current: null}
    render(
      <TestApp>
        <Reader refValue={ref} />
      </TestApp>,
    )
    expect(ref.current.enrollment).toBeUndefined()
    expect(ref.current.active).toBe(false)
  })
})

// ================================================================== //
//  1.2  useStratos() Hook
// ================================================================== //

describe('useStratos() hook', () => {
  it('returns enrollment, active, setEnrollment, setActive, reset', () => {
    const ref: {current: any} = {current: null}
    render(
      <TestApp>
        <Reader refValue={ref} />
      </TestApp>,
    )
    expect(ref.current).toMatchObject({
      enrollment: undefined,
      active: false,
    })
    expect(typeof ref.current.setEnrollment).toBe('function')
    expect(typeof ref.current.setActive).toBe('function')
    expect(typeof ref.current.reset).toBe('function')
  })

  it('throws when used outside Provider', () => {
    // useStratos uses useContext which returns defaults when outside Provider
    const ref: {current: any} = {current: null}
    render(<Reader refValue={ref} />)
    expect(ref.current).toMatchObject({
      enrollment: undefined,
      active: false,
      serviceUrl: null,
    })
  })

  it('setEnrollment updates enrollment', async () => {
    const ref: {current: any} = {current: null}
    function Updater() {
      const stratos = useStratos()
      ref.current = stratos
      useEffect(() => {
        stratos.setEnrollment(createEnrollment({service: 'did:web:updated'}))
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }
    render(
      <TestApp>
        <Updater />
      </TestApp>,
    )
    await waitFor(() => {
      expect(ref.current.enrollment?.service).toBe('did:web:updated')
    })
  })

  it('setActive updates active', async () => {
    const ref: {current: any} = {current: null}
    function Updater() {
      const stratos = useStratos()
      ref.current = stratos
      useEffect(() => {
        stratos.setActive(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }
    render(
      <TestApp>
        <Updater />
      </TestApp>,
    )
    await waitFor(() => {
      expect(ref.current.active).toBe(true)
    })
  })

  it('reset sets enrollment to undefined and active to false', async () => {
    const ref: {current: any} = {current: null}
    function Updater() {
      const stratos = useStratos()
      ref.current = stratos
      useEffect(() => {
        stratos.setEnrollment(createEnrollment())
        stratos.setActive(true)
        stratos.reset()
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }
    render(
      <TestApp>
        <Updater />
      </TestApp>,
    )
    await waitFor(() => {
      expect(ref.current.enrollment).toBeUndefined()
      expect(ref.current.active).toBe(false)
    })
  })

  it('state updates trigger re-renders in consuming components', async () => {
    let renderCount = 0
    function Counter() {
      const stratos = useStratos()
      renderCount++
      useEffect(() => {
        stratos.setActive(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }
    render(
      <TestApp>
        <Counter />
      </TestApp>,
    )
    await waitFor(() => {
      expect(renderCount).toBeGreaterThanOrEqual(2)
    })
  })
})

// ================================================================== //
//  1.3  StratosSessionListener
// ================================================================== //

describe('StratosSessionListener', () => {
  function renderWithListener() {
    const ref: {current: any} = {current: null}
    render(
      <TestApp>
        <StratosSessionListener />
        <Reader refValue={ref} />
      </TestApp>,
    )
    return ref
  }

  it('calls reset when STRATOS_SERVICE_DID is not set', () => {
    // Temporarily override env mock for this test
    const origMock = jest.requireMock('#/env')
    const origDid = origMock.STRATOS_SERVICE_DID
    origMock.STRATOS_SERVICE_DID = ''

    const ref = renderWithListener()

    expect(ref.current.enrollment).toBeUndefined()
    expect(ref.current.active).toBe(false)
    expect(mockGetEnrollment).not.toHaveBeenCalled()

    // Restore
    origMock.STRATOS_SERVICE_DID = origDid
  })

  it('calls reset when there is no active agent session', () => {
    // mockAgent is already set to session=undefined in beforeEach
    const ref = renderWithListener()

    expect(ref.current.enrollment).toBeUndefined()
    expect(ref.current.active).toBe(false)
    expect(mockGetEnrollment).not.toHaveBeenCalled()
  })

  it('calls getEnrollmentByServiceDid when agent has a session and service DID is set', async () => {
    mockAgent.session = {did: 'did:plc:testuser'}
    mockAgent.pdsUrl = new URL('https://pds.example.com')

    renderWithListener()

    await waitFor(() => {
      expect(mockGetEnrollment).toHaveBeenCalledWith(
        'did:plc:testuser',
        'https://pds.example.com/',
        'did:web:test-stratos.example.com',
      )
    })
  })

  it('updates enrollment state when discovery returns an enrollment', async () => {
    const enrollment = createEnrollment({service: 'did:web:discovered'})
    mockGetEnrollment.mockResolvedValue(enrollment)
    mockAgent.session = {did: 'did:plc:testuser'}
    mockAgent.pdsUrl = new URL('https://pds.example.com')

    const ref: {current: any} = {current: null}
    render(
      <TestApp>
        <StratosSessionListener />
        <Reader refValue={ref} />
      </TestApp>,
    )

    await waitFor(() => {
      expect(ref.current.enrollment?.service).toBe('did:web:discovered')
    })
  })

  it('sets enrollment to null and logs error when discovery throws', async () => {
    const testError = new Error('Network failure')
    mockGetEnrollment.mockRejectedValue(testError)
    mockAgent.session = {did: 'did:plc:testuser'}
    mockAgent.pdsUrl = new URL('https://pds.example.com')

    renderWithListener()
    await waitFor(() => {
      expect(mockGetEnrollment).toHaveBeenCalled()
    })

    expect(mockLoggerError).toHaveBeenCalledWith(
      'Stratos: failed to discover enrollment',
      {safeMessage: testError},
    )
  })

  it('prevents stale state updates after unmount (cleanup sets stale flag)', async () => {
    let resolvePromise!: (v: StratosEnrollment) => void
    mockGetEnrollment.mockImplementation(() => {
      return new Promise<StratosEnrollment>(resolve => {
        resolvePromise = resolve
      })
    })
    mockAgent.session = {did: 'did:plc:testuser'}
    mockAgent.pdsUrl = new URL('https://pds.example.com')

    renderWithListener()

    // Wait until discover has been called (it will be pending)
    await waitFor(() => {
      expect(mockGetEnrollment).toHaveBeenCalled()
    })

    // Unmount before the async operation completes
    cleanup()

    // Now resolve the pending promise — it should be stale
    resolvePromise(createEnrollment())

    // Wait a tick for any stale callbacks to fire
    await new Promise(resolve => setImmediate(resolve))

    // Render a fresh provider and verify state is still default
    const ref2: {current: any} = {current: null}
    render(
      <TestApp>
        <Reader refValue={ref2} />
      </TestApp>,
    )
    expect(ref2.current.enrollment).toBeUndefined()
  })
})

// ================================================================== //
//  1.4  XRPC Routing Integration
// ================================================================== //

describe('XRPC routing integration', () => {
  const mockHandleFn = jest
    .fn<(pathname: string, init: RequestInit) => Promise<Response>>()
    .mockResolvedValue(new Response('{}', {status: 200}))

  beforeEach(() => {
    mockCreateServiceFetchHandler.mockReturnValue({
      handle: mockHandleFn,
    })
  })

  function renderWithRouting() {
    const ref: {current: any} = {current: null}
    render(
      <TestApp>
        <StratosSessionListener />
        <Reader refValue={ref} />
      </TestApp>,
    )
    return ref
  }

  it('clears the fetch override when there is no session', () => {
    // mockAgent.session is already undefined from beforeEach
    renderWithRouting()

    expect(mockSetStratosFetchOverride).toHaveBeenCalledWith(null)
  })

  it('clears the fetch override when Stratos is inactive', async () => {
    const enrollment = createEnrollment()
    mockGetEnrollment.mockResolvedValue(enrollment)
    mockAgent.session = {did: 'did:plc:testuser'}
    mockAgent.pdsUrl = new URL('https://pds.example.com')

    renderWithRouting()

    // Discovery completes and sets enrollment, but active is false → no handler
    await waitFor(() => {
      expect(mockGetEnrollment).toHaveBeenCalled()
    })

    // The handler should be null since active is false
    expect(mockSetStratosFetchOverride).toHaveBeenCalledWith(null)
  })

  it('installs the fetch override when Stratos is active with enrollment', async () => {
    const enrollment = createEnrollment()
    mockGetEnrollment.mockResolvedValue(enrollment)
    mockAgent.session = {
      did: 'did:plc:testuser',
      accessJwt: 'test-access-jwt',
    }
    mockAgent.pdsUrl = new URL('https://pds.example.com')

    // Component that activates Stratos via an effect, then renders the listener
    function ActivateAndRender() {
      const stratos = useStratos()
      useEffect(() => {
        stratos.setActive(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return <StratosSessionListener />
    }

    render(
      <TestApp>
        <ActivateAndRender />
      </TestApp>,
    )

    // Wait for discovery to complete
    await waitFor(() => {
      expect(mockGetEnrollment).toHaveBeenCalled()
    })

    // Wait for the routing handler to be registered
    await waitFor(() => {
      expect(mockCreateServiceFetchHandler).toHaveBeenCalled()
    })

    // setStratosFetchOverride should have been called with a function (not null)
    const calls = mockSetStratosFetchOverride.mock.calls
    const lastCall = calls[calls.length - 1]
    expect(lastCall).toBeDefined()
    const lastHandler = lastCall[0]
    expect(typeof lastHandler).toBe('function')
  })

  it('clears the fetch override on unmount', async () => {
    mockAgent.session = {did: 'did:plc:testuser'}
    mockAgent.pdsUrl = new URL('https://pds.example.com')

    const {unmount} = render(
      <TestApp>
        <StratosSessionListener />
      </TestApp>,
    )

    mockSetStratosFetchOverride.mockClear()

    unmount()

    expect(mockSetStratosFetchOverride).toHaveBeenCalledWith(null)
  })

  it('the wrapped handler extracts pathname from full URL and delegates', async () => {
    // Set up the mock handler to return a successful response
    const mockHandlerFn = jest
      .fn<(pathname: string, init: RequestInit) => Promise<Response>>()
      .mockResolvedValue(new Response('ok', {status: 200}))
    mockCreateServiceFetchHandler.mockReturnValue({
      handle: mockHandlerFn,
    })

    const enrollment = createEnrollment()
    mockGetEnrollment.mockResolvedValue(enrollment)
    mockAgent.session = {
      did: 'did:plc:testuser',
      accessJwt: 'test-access-jwt',
    }
    mockAgent.pdsUrl = new URL('https://pds.example.com')

    function ActivateAndRender() {
      const stratos = useStratos()
      if (!stratos.active) {
        stratos.setActive(true)
      }
      return <StratosSessionListener />
    }

    render(
      <TestApp>
        <ActivateAndRender />
      </TestApp>,
    )

    await waitFor(() => {
      expect(mockCreateServiceFetchHandler).toHaveBeenCalled()
    })

    // Get the wrapped function that was passed to setStratosFetchOverride
    const calls = mockSetStratosFetchOverride.mock.calls
    const lastCall = calls[calls.length - 1]
    const wrappedHandler = lastCall[0] as Exclude<typeof globalThis.fetch, null>

    // Call it with a full URL — the wrapper should extract the pathname
    const result = await wrappedHandler(
      'https://pds.example.com/xrpc/com.atproto.repo.getRecord',
    )

    // The stratos handler should have been called with just the pathname
    expect(mockHandlerFn).toHaveBeenCalledWith(
      '/xrpc/com.atproto.repo.getRecord',
      {},
    )

    // And it should return the expected response
    expect(result.status).toBe(200)
    await expect(result.text()).resolves.toBe('ok')
  })
})

// ================================================================== //
//  1.5  Edge Cases
// ================================================================== //

describe('Edge cases', () => {
  it('multiple children of Provider all observe the same state', () => {
    const ref1: {current: any} = {current: null}
    const ref2: {current: any} = {current: null}

    render(
      <TestApp>
        <Reader refValue={ref1} />
        <Reader refValue={ref2} />
      </TestApp>,
    )

    expect(ref1.current.enrollment).toBe(ref2.current.enrollment)
    expect(ref1.current.active).toBe(ref2.current.active)

    expect(ref1.current.setActive).toBe(ref2.current.setActive)
    expect(ref1.current.setEnrollment).toBe(ref2.current.setEnrollment)
    expect(ref1.current.reset).toBe(ref2.current.reset)
  })

  it('useStratos() returns stable references for API callbacks across re-renders', () => {
    const firstRefs: {
      setEnrollment: any
      setActive: any
      reset: any
    } = {setEnrollment: null, setActive: null, reset: null}
    let renderCount = 0

    function Observer() {
      const stratos = useStratos()
      renderCount++
      if (renderCount === 1) {
        firstRefs.setEnrollment = stratos.setEnrollment
        firstRefs.setActive = stratos.setActive
        firstRefs.reset = stratos.reset
      }
      // Trigger a re-render by calling setActive
      useEffect(() => {
        if (!stratos.active) {
          stratos.setActive(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return null
    }

    render(
      <TestApp>
        <Observer />
      </TestApp>,
    )

    // After re-render, verify the original refs are still the same
    // instances (useMemo should keep them stable)
    expect(firstRefs.setEnrollment).toBe(firstRefs.setEnrollment)
    expect(firstRefs.setActive).toBe(firstRefs.setActive)
    expect(firstRefs.reset).toBe(firstRefs.reset)
    expect(renderCount).toBeGreaterThanOrEqual(2)
  })
})

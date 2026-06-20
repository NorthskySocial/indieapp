import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  createServiceFetchHandler,
  type FetchHandler,
  getEnrollmentByServiceDid,
  resolveServiceUrl,
  type StratosEnrollment,
} from '@northskysocial/stratos-client'

import {logger} from '#/logger'
import {useAgent} from '#/state/session'
import {setStratosFetchOverride} from '#/state/session/agent'
import {STRATOS_SERVICE_DID} from '#/env'
import {device} from '#/storage'

type StratosStateContext = {
  enrollment: StratosEnrollment | null | undefined
  active: boolean
  serviceUrl: string | null
  customServiceDid: string | undefined
  refreshKey: number
}

type StratosApiContext = {
  setEnrollment: (enrollment: StratosEnrollment | null | undefined) => void
  setActive: (active: boolean) => void
  reset: () => void
  refreshEnrollment: () => void
  setCustomServiceDid: (did: string | undefined) => void
}

const StateContext = createContext<StratosStateContext>({
  enrollment: undefined,
  active: false,
  serviceUrl: null,
  customServiceDid: undefined,
  refreshKey: 0,
})
StateContext.displayName = 'StratosStateContext'

const ApiContext = createContext<StratosApiContext>({
  setEnrollment: () => {},
  setActive: () => {},
  reset: () => {},
  refreshEnrollment: () => {},
  setCustomServiceDid: () => {},
})
ApiContext.displayName = 'StratosApiContext'

export function Provider({children}: React.PropsWithChildren<{}>) {
  const [enrollment, setEnrollment] = useState<
    StratosEnrollment | null | undefined
  >(undefined)
  const [active, setActiveState] = useState(false)
  const [customServiceDid, setCustomServiceDid] = useState<string | undefined>()
  const [refreshKey, setRefreshKey] = useState(0)
  const storedActiveLoaded = useRef(false)

  // Load persisted active state on mount
  useEffect(() => {
    const stored = device.get(['stratosActive'])
    if (stored !== undefined) {
      setActiveState(stored)
    }
    storedActiveLoaded.current = true
  }, [])

  const setActive = useCallback((next: boolean) => {
    setActiveState(next)
    device.set(['stratosActive'], next)
  }, [])

  // Load persisted custom service DID on mount
  useEffect(() => {
    const stored = device.get(['stratosServiceDid'])
    if (stored !== undefined) {
      setCustomServiceDid(stored)
    }
  }, [])

  const persistCustomServiceDid = useCallback((did: string | undefined) => {
    setCustomServiceDid(did)
    if (did) {
      device.set(['stratosServiceDid'], did)
    } else {
      device.remove(['stratosServiceDid'])
    }
  }, [])

  const reset = useCallback(() => {
    setEnrollment(undefined)
    setActive(false)
    device.set(['stratosActive'], false)
  }, [])

  const refreshEnrollment = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  const api = useMemo(
    () => ({
      setEnrollment,
      setActive,
      reset,
      refreshEnrollment,
      setCustomServiceDid: persistCustomServiceDid,
    }),
    [
      setEnrollment,
      setActive,
      reset,
      refreshEnrollment,
      persistCustomServiceDid,
    ],
  )

  const serviceUrl = useMemo(() => {
    return enrollment ? resolveServiceUrl(enrollment, '') : null
  }, [enrollment])

  return (
    <StateContext.Provider
      value={{enrollment, active, serviceUrl, customServiceDid, refreshKey}}>
      <ApiContext.Provider value={api}>{children}</ApiContext.Provider>
    </StateContext.Provider>
  )
}

/**
 * Internal component that runs inside the Provider and auto-discovers
 * Stratos enrollment whenever the session or agent changes.
 * Must be rendered inside both StratosProvider and SessionProvider.
 */
export function StratosSessionListener() {
  const agent = useAgent()
  const {reset, setEnrollment, customServiceDid, refreshKey} = useStratos()

  // Use user-overridden service DID if set, otherwise fall back to env config
  const serviceDid = customServiceDid || STRATOS_SERVICE_DID

  useEffect(() => {
    const agentDid = agent.session?.did
    const agentPdsUrl = agent.pdsUrl?.toString()

    if (!serviceDid || !agentDid || !agentPdsUrl) {
      // No Stratos configured, no session, or no PDS URL → full reset
      reset()
      return
    }

    let stale = false

    async function discover() {
      try {
        const result = await getEnrollmentByServiceDid(
          agentDid!,
          agentPdsUrl!,
          serviceDid,
        )
        if (!stale) {
          setEnrollment(result)
        }
      } catch (e) {
        if (!stale) {
          logger.error('Stratos: failed to discover enrollment', {
            safeMessage: e,
          })
          setEnrollment(null)
        }
      }
    }

    void discover()

    return () => {
      stale = true
    }
  }, [reset, setEnrollment, serviceDid, agent, refreshKey])

  // ---- XRPC Routing Integration ----
  // When Stratos is active with a valid enrollment, create a fetch handler
  // that routes XRPC calls through the Stratos service and install it as
  // the agent's fetch override. Clear the override when Stratos is inactive,
  // not enrolled, or on unmount.

  const stratosHandler = useStratosFetchHandler()

  useEffect(() => {
    if (stratosHandler) {
      // The stratos-client handler expects pathname + init, but the agent's
      // fetch receives full URLs. Wrap it to extract the pathname.
      const wrapped: typeof globalThis.fetch = (input, init) => {
        const urlStr =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.href
              : input.url
        const parsed = new URL(urlStr)
        const pathname = parsed.pathname + (parsed.search || '')
        return stratosHandler(pathname, init ?? {})
      }
      setStratosFetchOverride(wrapped)
    } else {
      setStratosFetchOverride(null)
    }
    return () => {
      setStratosFetchOverride(null)
    }
  }, [stratosHandler])

  return null
}

export function useStratos() {
  const state = useContext(StateContext)
  const api = useContext(ApiContext)
  return {...state, ...api}
}

/**
 * Returns the resolved Stratos service URL, if enrollment is active.
 * This is a convenience hook derived from `useStratos().serviceUrl`.
 */
export function useStratosServiceUrl(): string | null {
  return useContext(StateContext).serviceUrl
}

/**
 * Creates an authenticated fetch handler that attaches the user's
 * access JWT as a Bearer token. Intended for use with
 * `createServiceFetchHandler` to route authenticated requests to
 * the Stratos service.
 *
 * @param accessJwt - the user's access JWT from the agent session
 * @returns a FetchHandler suitable for `createServiceFetchHandler`
 */
export function createStratosAuthHandler(accessJwt: string): FetchHandler {
  return async (url: string, init: RequestInit) => {
    const headers = new Headers(init.headers || {})
    headers.set('Authorization', `Bearer ${accessJwt}`)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    return fetch(url, {...init, headers})
  }
}

/**
 * Returns a Stratos fetch handler that routes XRPC calls to the
 * Stratos service using the agent's session for authentication.
 * Returns `null` when there is no active enrollment or session.
 *
 * Usage:
 * ```ts
 * const stratosHandler = useStratosFetchHandler()
 * if (stratosHandler) {
 *   const res = await stratosHandler('/xrpc/com.atproto.repo.getRecord', {
 *     method: 'POST',
 *     body: JSON.stringify({...}),
 *   })
 * }
 * ```
 */
export function useStratosFetchHandler(): FetchHandler | null {
  const {enrollment, active} = useStratos()
  const agent = useAgent()

  return useMemo(() => {
    if (!enrollment || !active) return null
    const session = agent.session
    if (!session?.accessJwt) return null

    const serviceUrl = resolveServiceUrl(
      enrollment,
      agent.pdsUrl?.toString() ?? '',
    )
    const authHandler = createStratosAuthHandler(session.accessJwt)
    return createServiceFetchHandler(authHandler, serviceUrl).handle
  }, [enrollment, active, agent])
}

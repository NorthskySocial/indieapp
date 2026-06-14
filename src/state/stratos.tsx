import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {type StratosEnrollment} from '@northskysocial/stratos-client'
import {getEnrollmentByServiceDid} from '@northskysocial/stratos-client'

import {logger} from '#/logger'
import {useAgent} from '#/state/session'
import {STRATOS_SERVICE_DID} from '#/env'

type StratosStateContext = {
  enrollment: StratosEnrollment | null | undefined
  active: boolean
}

type StratosApiContext = {
  setEnrollment: (enrollment: StratosEnrollment | null | undefined) => void
  setActive: (active: boolean) => void
  reset: () => void
}

const StateContext = createContext<StratosStateContext>({
  enrollment: undefined,
  active: false,
})
StateContext.displayName = 'StratosStateContext'

const ApiContext = createContext<StratosApiContext>({
  setEnrollment: () => {},
  setActive: () => {},
  reset: () => {},
})
ApiContext.displayName = 'StratosApiContext'

export function Provider({children}: React.PropsWithChildren<{}>) {
  const [enrollment, setEnrollment] = useState<
    StratosEnrollment | null | undefined
  >(undefined)
  const [active, setActive] = useState(false)

  const reset = useCallback(() => {
    setEnrollment(undefined)
    setActive(false)
  }, [])

  const api = useMemo(
    () => ({setEnrollment, setActive, reset}),
    [setEnrollment, setActive, reset],
  )

  return (
    <StateContext.Provider value={{enrollment, active}}>
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
  const {reset, setEnrollment} = useStratosApi()

  const serviceDid = STRATOS_SERVICE_DID

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
  }, [reset, setEnrollment, serviceDid, agent])

  return null
}

export function useStratos() {
  return useContext(StateContext)
}

export function useStratosApi() {
  return useContext(ApiContext)
}

export function useStratosEnrollment() {
  return useContext(StateContext).enrollment
}

export function useStratosActive() {
  return useContext(StateContext).active
}

export function useSetStratosActive() {
  return useContext(ApiContext).setActive
}

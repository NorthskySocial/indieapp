import {device, useStorage} from '#/storage'

/**
 * Persisted Stratos active state for this device. Defaults to false.
 */
export function useStratosActive() {
  const [active = false, setActive] = useStorage(device, ['stratosActive'])
  return [active, setActive] as const
}

/**
 * Persisted custom Stratos service DID override for this device.
 */
export function useStratosServiceDid() {
  const [serviceDid, setServiceDid] = useStorage(device, ['stratosServiceDid'])
  return [serviceDid, setServiceDid] as const
}

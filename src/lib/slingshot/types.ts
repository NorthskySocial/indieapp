/**
 * Response from blue.microcosm.repo.getRecordByUri
 */
export type SlingshotRecord = {
  uri: string
  cid?: string
  value: Record<string, unknown>
}

/**
 * Response from blue.microcosm.identity.resolveMiniDoc
 */
export type SlingshotMiniDoc = {
  did: string
  handle: string
  pds: string
  signing_key: string
}

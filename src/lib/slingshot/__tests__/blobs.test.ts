import {buildPdsBlobUrl} from '../blobs'

describe('buildPdsBlobUrl', () => {
  it('constructs correct getBlob URL', () => {
    const url = buildPdsBlobUrl(
      'https://pds.example.com',
      'did:plc:abc123',
      'bafyreiabc123',
    )
    expect(url).toBe(
      'https://pds.example.com/xrpc/com.atproto.sync.getBlob?did=did%3Aplc%3Aabc123&cid=bafyreiabc123',
    )
  })

  it('encodes special characters in DID', () => {
    const url = buildPdsBlobUrl(
      'https://pds.example.com',
      'did:web:example.com:path',
      'bafyreiabc',
    )
    expect(url).toContain('did=did%3Aweb%3Aexample.com%3Apath')
  })

  it('preserves PDS URL as-is', () => {
    const url = buildPdsBlobUrl(
      'https://my-pds.example.com:8080',
      'did:plc:x',
      'bafyrei123',
    )
    expect(url).toMatch(
      /^https:\/\/my-pds\.example\.com:8080\/xrpc\/com\.atproto\.sync\.getBlob/,
    )
  })
})

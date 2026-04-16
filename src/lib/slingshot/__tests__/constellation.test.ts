import {CONSTELLATION_SERVICE, getPostInteractionCounts} from '../constellation'

beforeEach(() => {
  jest.restoreAllMocks()
})

describe('CONSTELLATION_SERVICE', () => {
  it('points to Microcosm Constellation', () => {
    expect(CONSTELLATION_SERVICE).toBe('https://constellation.microcosm.blue')
  })
})

describe('getPostInteractionCounts', () => {
  const postUri = 'at://did:plc:abc/app.bsky.feed.post/3xyz'

  it('fetches all four counts in parallel', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch')
    fetchSpy.mockImplementation(async (url: RequestInfo | URL) => {
      const urlStr = url.toString()
      if (urlStr.includes('app.bsky.feed.like')) {
        return {ok: true, json: async () => ({count: 42})} as Response
      }
      if (urlStr.includes('app.bsky.feed.repost')) {
        return {ok: true, json: async () => ({count: 7})} as Response
      }
      if (urlStr.includes('reply.parent.uri')) {
        return {ok: true, json: async () => ({count: 3})} as Response
      }
      if (urlStr.includes('embed.record.uri')) {
        return {ok: true, json: async () => ({count: 1})} as Response
      }
      return {ok: false} as Response
    })

    const counts = await getPostInteractionCounts(postUri)
    expect(counts).toEqual({
      likeCount: 42,
      repostCount: 7,
      replyCount: 3,
      quoteCount: 1,
    })
    expect(fetchSpy).toHaveBeenCalledTimes(4)
  })

  it('calls correct Constellation endpoints', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch')
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({count: 0}),
    } as Response)

    await getPostInteractionCounts(postUri)

    const calls = fetchSpy.mock.calls.map(c => c[0]?.toString())
    expect(calls).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'blue.microcosm.links.getBacklinksCount?subject=',
        ),
      ]),
    )
    // Verify each source type
    expect(
      calls.some(c => c?.includes('app.bsky.feed.like%3Asubject.uri')),
    ).toBe(true)
    expect(
      calls.some(c => c?.includes('app.bsky.feed.repost%3Asubject.uri')),
    ).toBe(true)
    expect(
      calls.some(c => c?.includes('app.bsky.feed.post%3Areply.parent.uri')),
    ).toBe(true)
    expect(
      calls.some(c => c?.includes('app.bsky.feed.post%3Aembed.record.uri')),
    ).toBe(true)
  })

  it('sends Accept: application/json header', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({count: 0}),
    } as Response)

    await getPostInteractionCounts(postUri)

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {Accept: 'application/json'},
      }),
    )
  })

  it('returns 0 for failed requests', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    const counts = await getPostInteractionCounts(postUri)
    expect(counts).toEqual({
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      quoteCount: 0,
    })
  })

  it('returns 0 for network errors', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))

    const counts = await getPostInteractionCounts(postUri)
    expect(counts).toEqual({
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      quoteCount: 0,
    })
  })

  it('returns 0 when count field is missing from response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    const counts = await getPostInteractionCounts(postUri)
    expect(counts).toEqual({
      likeCount: 0,
      repostCount: 0,
      replyCount: 0,
      quoteCount: 0,
    })
  })

  it('handles partial failures gracefully', async () => {
    let callCount = 0
    jest.spyOn(global, 'fetch').mockImplementation(async () => {
      callCount++
      if (callCount === 1) {
        return {ok: true, json: async () => ({count: 10})} as Response
      }
      if (callCount === 3) {
        throw new Error('timeout')
      }
      return {ok: false, status: 500} as Response
    })

    const counts = await getPostInteractionCounts(postUri)
    // First call succeeds (like=10), rest fail (=0)
    expect(counts.likeCount).toBe(10)
    expect(counts.repostCount).toBe(0)
    expect(counts.replyCount).toBe(0)
    expect(counts.quoteCount).toBe(0)
  })
})

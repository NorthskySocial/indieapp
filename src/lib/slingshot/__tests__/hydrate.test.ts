import {
  hydrateAvatarUrl,
  hydratePostView,
  hydratePostViewRecord,
} from '../hydrate'
import {type PostInteractionCounts, type SlingshotMiniDoc} from '../types'

const MOCK_MINIDOC: SlingshotMiniDoc = {
  did: 'did:plc:testuser123',
  handle: 'alice.test',
  pds: 'https://pds.example.com',
  signing_key: 'did:key:z123',
}

function makeBlobRef(cid: string, mimeType = 'image/jpeg', size = 1000) {
  return {
    $type: 'blob',
    ref: {$link: cid},
    mimeType,
    size,
  }
}

describe('hydratePostView', () => {
  const BASE_URI = 'at://did:plc:testuser123/app.bsky.feed.post/3abc'
  const BASE_CID = 'bafyreipost123'

  it('hydrates a basic post without embeds', () => {
    const record = {
      $type: 'app.bsky.feed.post',
      text: 'Hello world',
      createdAt: '2026-04-10T12:00:00.000Z',
    }
    const view = hydratePostView(record, BASE_URI, BASE_CID, MOCK_MINIDOC)

    expect(view.uri).toBe(BASE_URI)
    expect(view.cid).toBe(BASE_CID)
    expect(view.author.did).toBe('did:plc:testuser123')
    expect(view.author.handle).toBe('alice.test')
    expect(view.record).toBe(record)
    expect(view.embed).toBeUndefined()
    expect(view.replyCount).toBe(0)
    expect(view.repostCount).toBe(0)
    expect(view.likeCount).toBe(0)
    expect(view.quoteCount).toBe(0)
    expect(view.indexedAt).toBe('2026-04-10T12:00:00.000Z')
  })

  it('uses provided interaction counts', () => {
    const record = {
      $type: 'app.bsky.feed.post',
      text: 'Hello world',
      createdAt: '2026-04-10T12:00:00.000Z',
    }
    const counts: PostInteractionCounts = {
      likeCount: 42,
      repostCount: 7,
      replyCount: 13,
      quoteCount: 3,
    }
    const view = hydratePostView(
      record,
      BASE_URI,
      BASE_CID,
      MOCK_MINIDOC,
      counts,
    )

    expect(view.likeCount).toBe(42)
    expect(view.repostCount).toBe(7)
    expect(view.replyCount).toBe(13)
    expect(view.quoteCount).toBe(3)
  })

  it('uses current time as indexedAt when createdAt missing', () => {
    const before = new Date().toISOString()
    const record = {$type: 'app.bsky.feed.post', text: 'test'}
    const view = hydratePostView(record, BASE_URI, BASE_CID, MOCK_MINIDOC)
    const after = new Date().toISOString()

    expect(view.indexedAt >= before).toBe(true)
    expect(view.indexedAt <= after).toBe(true)
  })

  it('hydrates image embeds with PDS blob URLs', () => {
    const record = {
      $type: 'app.bsky.feed.post',
      text: 'pics',
      createdAt: '2026-04-10T12:00:00.000Z',
      embed: {
        $type: 'app.bsky.embed.images',
        images: [
          {
            image: makeBlobRef('bafyimg1'),
            alt: 'first image',
            aspectRatio: {width: 800, height: 600},
          },
          {
            image: makeBlobRef('bafyimg2'),
            alt: '',
          },
        ],
      },
    }
    const view = hydratePostView(record, BASE_URI, BASE_CID, MOCK_MINIDOC)

    expect(view.embed?.$type).toBe('app.bsky.embed.images#view')
    const images = (view.embed as any).images
    expect(images).toHaveLength(2)
    expect(images[0].thumb).toContain('bafyimg1')
    expect(images[0].fullsize).toContain('bafyimg1')
    expect(images[0].alt).toBe('first image')
    expect(images[0].aspectRatio).toEqual({width: 800, height: 600})
    expect(images[1].thumb).toContain('bafyimg2')
    expect(images[1].alt).toBe('')
  })

  it('hydrates external embeds with thumb blob URL', () => {
    const record = {
      $type: 'app.bsky.feed.post',
      text: 'link',
      createdAt: '2026-04-10T12:00:00.000Z',
      embed: {
        $type: 'app.bsky.embed.external',
        external: {
          uri: 'https://example.com/article',
          title: 'Article Title',
          description: 'A description',
          thumb: makeBlobRef('bafythumb1'),
        },
      },
    }
    const view = hydratePostView(record, BASE_URI, BASE_CID, MOCK_MINIDOC)

    expect(view.embed?.$type).toBe('app.bsky.embed.external#view')
    const ext = (view.embed as any).external
    expect(ext.uri).toBe('https://example.com/article')
    expect(ext.title).toBe('Article Title')
    expect(ext.description).toBe('A description')
    expect(ext.thumb).toContain('bafythumb1')
  })

  it('hydrates external embed without thumb', () => {
    const record = {
      $type: 'app.bsky.feed.post',
      text: 'link',
      createdAt: '2026-04-10T12:00:00.000Z',
      embed: {
        $type: 'app.bsky.embed.external',
        external: {
          uri: 'https://example.com',
          title: 'No Thumb',
          description: '',
        },
      },
    }
    const view = hydratePostView(record, BASE_URI, BASE_CID, MOCK_MINIDOC)
    const ext = (view.embed as any).external
    expect(ext.thumb).toBeUndefined()
  })

  it('hydrates record embed as viewNotFound', () => {
    const record = {
      $type: 'app.bsky.feed.post',
      text: 'quote',
      createdAt: '2026-04-10T12:00:00.000Z',
      embed: {
        $type: 'app.bsky.embed.record',
        record: {
          uri: 'at://did:plc:other/app.bsky.feed.post/3xyz',
          cid: 'bafyquoted',
        },
      },
    }
    const view = hydratePostView(record, BASE_URI, BASE_CID, MOCK_MINIDOC)

    expect(view.embed?.$type).toBe('app.bsky.embed.record#view')
    const inner = (view.embed as any).record
    expect(inner.$type).toBe('app.bsky.embed.record#viewNotFound')
    expect(inner.uri).toBe('at://did:plc:other/app.bsky.feed.post/3xyz')
    expect(inner.notFound).toBe(true)
  })

  it('hydrates recordWithMedia embed', () => {
    const record = {
      $type: 'app.bsky.feed.post',
      text: 'quote with media',
      createdAt: '2026-04-10T12:00:00.000Z',
      embed: {
        $type: 'app.bsky.embed.recordWithMedia',
        record: {
          $type: 'app.bsky.embed.record',
          record: {
            uri: 'at://did:plc:other/app.bsky.feed.post/3xyz',
            cid: 'bafyquoted',
          },
        },
        media: {
          $type: 'app.bsky.embed.images',
          images: [
            {
              image: makeBlobRef('bafymedia1'),
              alt: 'media',
            },
          ],
        },
      },
    }
    const view = hydratePostView(record, BASE_URI, BASE_CID, MOCK_MINIDOC)

    expect(view.embed?.$type).toBe('app.bsky.embed.recordWithMedia#view')
    const rwm = view.embed as any
    expect(rwm.record.$type).toBe('app.bsky.embed.record#view')
    expect(rwm.media.$type).toBe('app.bsky.embed.images#view')
    expect(rwm.media.images[0].thumb).toContain('bafymedia1')
  })

  it('returns undefined embed for video (cannot hydrate)', () => {
    const record = {
      $type: 'app.bsky.feed.post',
      text: 'video post',
      createdAt: '2026-04-10T12:00:00.000Z',
      embed: {
        $type: 'app.bsky.embed.video',
        video: makeBlobRef('bafyvideo', 'video/mp4', 50000),
      },
    }
    const view = hydratePostView(record, BASE_URI, BASE_CID, MOCK_MINIDOC)
    expect(view.embed).toBeUndefined()
  })
})

describe('hydratePostViewRecord', () => {
  it('returns ViewRecord with embeds array', () => {
    const record = {
      $type: 'app.bsky.feed.post',
      text: 'test',
      createdAt: '2026-04-10T12:00:00.000Z',
      embed: {
        $type: 'app.bsky.embed.images',
        images: [{image: makeBlobRef('bafyimg'), alt: 'alt'}],
      },
    }
    const vr = hydratePostViewRecord(
      record,
      'at://did:plc:testuser123/app.bsky.feed.post/3abc',
      'bafyrei123',
      MOCK_MINIDOC,
    )

    expect(vr.$type).toBe('app.bsky.embed.record#viewRecord')
    expect(vr.value).toBe(record)
    expect(vr.embeds).toHaveLength(1)
    expect(vr.embeds![0].$type).toBe('app.bsky.embed.images#view')
    expect(vr.replyCount).toBe(0)
    expect(vr.likeCount).toBe(0)
  })

  it('uses provided interaction counts', () => {
    const record = {
      $type: 'app.bsky.feed.post',
      text: 'test',
      createdAt: '2026-04-10T12:00:00.000Z',
    }
    const counts: PostInteractionCounts = {
      likeCount: 99,
      repostCount: 15,
      replyCount: 8,
      quoteCount: 2,
    }
    const vr = hydratePostViewRecord(
      record,
      'at://did:plc:testuser123/app.bsky.feed.post/3abc',
      'bafyrei123',
      MOCK_MINIDOC,
      counts,
    )

    expect(vr.likeCount).toBe(99)
    expect(vr.repostCount).toBe(15)
    expect(vr.replyCount).toBe(8)
    expect(vr.quoteCount).toBe(2)
  })

  it('returns undefined embeds when no embed in record', () => {
    const record = {
      $type: 'app.bsky.feed.post',
      text: 'no embed',
      createdAt: '2026-04-10T12:00:00.000Z',
    }
    const vr = hydratePostViewRecord(
      record,
      'at://did:plc:testuser123/app.bsky.feed.post/3abc',
      'bafyrei123',
      MOCK_MINIDOC,
    )
    expect(vr.embeds).toBeUndefined()
  })
})

describe('hydrateAvatarUrl', () => {
  it('returns PDS blob URL for profile avatar', () => {
    const record = {
      $type: 'app.bsky.actor.profile',
      displayName: 'Alice',
      avatar: makeBlobRef('bafyavatar'),
    }
    const url = hydrateAvatarUrl(record, MOCK_MINIDOC)
    expect(url).toContain('bafyavatar')
    expect(url).toContain('pds.example.com')
    expect(url).toContain('com.atproto.sync.getBlob')
  })

  it('returns undefined for profile without avatar', () => {
    const record = {
      $type: 'app.bsky.actor.profile',
      displayName: 'No Avatar',
    }
    const url = hydrateAvatarUrl(record, MOCK_MINIDOC)
    expect(url).toBeUndefined()
  })

  it('returns undefined for post records', () => {
    const record = {
      $type: 'app.bsky.feed.post',
      text: 'not a profile',
      createdAt: '2026-04-10T12:00:00.000Z',
    }
    const url = hydrateAvatarUrl(record, MOCK_MINIDOC)
    expect(url).toBeUndefined()
  })
})

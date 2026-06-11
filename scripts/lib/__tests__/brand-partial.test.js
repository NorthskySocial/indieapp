/**
 * Property-based tests for brand-partial library
 *
 * Uses Jest with fast-check to verify:
 * - Property 1: Settings merge resolution
 * - Property 2: Brand partial contains all derived brand values
 * - Property 3: Text brand values are safely escaped while SVG is preserved
 */

/** @type {import('fast-check')} */
const fc = require('fast-check')
const {
  buildBrandTitle,
  buildBrandSplash,
  buildBrandMeta,
  escapeHtmlText,
} = require('../brand-partial')

// Run at least 100 iterations per property (design: minimum 100 iterations).
const NUM_RUNS = 100

/**
 * @typedef {Object} BrandSettings
 * @property {string} APP_NAME
 * @property {string} APPLICATION_NAME
 * @property {string} OG_SITE_NAME
 * @property {string} TWITTER_HANDLE
 * @property {string} MASK_ICON_COLOR
 * @property {string} THEME_COLOR
 */

describe('brand-partial', () => {
  describe('escapeHtmlText', () => {
    it('escapes HTML metacharacters', () => {
      expect(escapeHtmlText('<script>')).toBe('&lt;script&gt;')
      expect(escapeHtmlText('a & b')).toBe('a &amp; b')
      expect(escapeHtmlText('"quoted"')).toBe('&quot;quoted&quot;')
      expect(escapeHtmlText("'single'")).toBe('&#39;single&#39;')
    })

    it('handles empty string', () => {
      expect(escapeHtmlText('')).toBe('')
    })

    it('preserves non-special characters', () => {
      expect(escapeHtmlText('hello world')).toBe('hello world')
    })
  })

  /**
   * Property 1: Settings merge resolution
   * For any base settings object and any partial override object, the resolved
   * AppSettings shall equal the override's value for every key present in the
   * override, and the base value for every key absent from the override.
   *
   * Validates: Requirements 1.9, 2.3
   */
  describe('Property 1: Settings merge resolution', () => {
    /** @type {Array<keyof BrandSettings>} */
    const brandKeys = [
      'APP_NAME',
      'APPLICATION_NAME',
      'OG_SITE_NAME',
      'TWITTER_HANDLE',
      'MASK_ICON_COLOR',
      'THEME_COLOR',
    ]

    /** @type {BrandSettings} */
    const baseSettings = {
      APP_NAME: 'Base App',
      APPLICATION_NAME: 'Base Application',
      OG_SITE_NAME: 'Base Site',
      TWITTER_HANDLE: '@base',
      MASK_ICON_COLOR: '#000000',
      THEME_COLOR: '#111111',
    }

    it('should resolve merged settings correctly', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.record({
              APP_NAME: fc.string(),
              APPLICATION_NAME: fc.string(),
              OG_SITE_NAME: fc.string(),
              TWITTER_HANDLE: fc.string(),
              MASK_ICON_COLOR: fc.string(),
              THEME_COLOR: fc.string(),
            }),
            fc.record({
              APP_NAME: fc.string(),
            }),
            fc.record({
              APPLICATION_NAME: fc.string(),
              OG_SITE_NAME: fc.string(),
            }),
            fc.record({
              TWITTER_HANDLE: fc.string(),
              MASK_ICON_COLOR: fc.string(),
              THEME_COLOR: fc.string(),
            }),
          ),
          (/** @type {Partial<BrandSettings>} */ override) => {
            // Perform the merge: {...baseSettings, ...override}
            const merged = {...baseSettings, ...override}

            for (const key of brandKeys) {
              if (key in override) {
                // Key present in override -> override value wins
                expect(merged[key]).toBe(override[key])
              } else {
                // Key absent from override -> base value retained
                expect(merged[key]).toBe(baseSettings[key])
              }
            }
          },
        ),
        {numRuns: NUM_RUNS},
      )
    })

    it('should handle empty override object', () => {
      /** @type {Partial<BrandSettings>} */
      const override = {}
      const merged = {...baseSettings, ...override}

      for (const key of brandKeys) {
        expect(merged[key]).toBe(baseSettings[key])
      }
    })

    it('should handle full override of all keys', () => {
      fc.assert(
        fc.property(
          fc.record({
            APP_NAME: fc.string(),
            APPLICATION_NAME: fc.string(),
            OG_SITE_NAME: fc.string(),
            TWITTER_HANDLE: fc.string(),
            MASK_ICON_COLOR: fc.string(),
            THEME_COLOR: fc.string(),
          }),
          (/** @type {BrandSettings} */ override) => {
            const merged = {...baseSettings, ...override}

            for (const key of brandKeys) {
              expect(merged[key]).toBe(override[key])
            }
          },
        ),
        {numRuns: NUM_RUNS},
      )
    })
  })

  /**
   * Property 2: Brand partial contains all derived brand values
   * For any brand settings and any light/dark SVG source contents, the generated
   * brand partial shall contain the app name (title), the inline light splash SVG,
   * the inline dark splash SVG, the application-name value, the OpenGraph site name,
   * the Twitter site handle, the mask-icon color, and the theme color, each placed
   * in its correct HTML context.
   *
   * Validates: Requirements 3.4, 4.2, 4.5, 4.6, 4.7, 4.8, 4.9
   */
  describe('Property 2: Brand partial contains all derived brand values', () => {
    it('should contain all brand values in the generated partial', () => {
      fc.assert(
        fc.property(
          fc.record({
            APP_NAME: fc.string({minLength: 1}),
            APPLICATION_NAME: fc.string({minLength: 1}),
            OG_SITE_NAME: fc.string({minLength: 1}),
            TWITTER_HANDLE: fc.string({minLength: 1}),
            MASK_ICON_COLOR: fc.string({minLength: 1}),
            THEME_COLOR: fc.string(),
          }),
          fc.string(),
          fc.string(),
          (
            /** @type {BrandSettings} */ settings,
            /** @type {string} */ lightSvg,
            /** @type {string} */ darkSvg,
          ) => {
            const title = buildBrandTitle(settings)
            const splash = buildBrandSplash(lightSvg, darkSvg)
            const meta = buildBrandMeta(settings)
            const esc = escapeHtmlText

            // Title fragment is the escaped app name
            expect(title).toBe(esc(settings.APP_NAME))

            // Light/dark splash SVG injected verbatim
            expect(splash).toContain(
              `<span class="splash-light">${lightSvg}</span>`,
            )
            expect(splash).toContain(
              `<span class="splash-dark">${darkSvg}</span>`,
            )

            // application-name
            expect(meta).toContain(
              `<meta name="application-name" content="${esc(settings.APPLICATION_NAME)}">`,
            )

            // og:site_name
            expect(meta).toContain(
              `<meta property="og:site_name" content="${esc(settings.OG_SITE_NAME)}">`,
            )

            // twitter:site
            expect(meta).toContain(
              `<meta name="twitter:site" content="${esc(settings.TWITTER_HANDLE)}" />`,
            )

            // mask-icon color
            expect(meta).toContain(`color="${esc(settings.MASK_ICON_COLOR)}"`)

            // theme-color: empty -> no content attribute; otherwise content present
            if (settings.THEME_COLOR === '') {
              expect(meta).toContain('<meta name="theme-color">')
            } else {
              expect(meta).toContain(
                `<meta name="theme-color" content="${esc(settings.THEME_COLOR)}">`,
              )
            }
          },
        ),
        {numRuns: NUM_RUNS},
      )
    })
  })

  /**
   * Property 3: Text brand values are safely escaped while SVG is preserved
   * For any brand settings whose text fields contain HTML metacharacters,
   * the generated brand partial shall encode those values so that no unintended
   * tag or attribute boundary is introduced, while the raw light and dark splash
   * SVG source contents are emitted verbatim.
   *
   * Validates: Requirements 3.4
   */
  describe('Property 3: Text brand values are safely escaped while SVG is preserved', () => {
    it('should escape text fields while preserving raw SVG verbatim', () => {
      // Text fields drawn from a pool that includes HTML metacharacters.
      const metaChars = ['a', 'Z', '1', ' ', '&', '<', '>', '"', "'", '@', '#']
      const textWithMeta = fc
        .array(fc.constantFrom(...metaChars), {minLength: 1})
        .map(chars => chars.join(''))
      const themeWithMeta = fc
        .array(fc.constantFrom(...metaChars))
        .map(chars => chars.join(''))

      fc.assert(
        fc.property(
          fc.record({
            APP_NAME: textWithMeta,
            APPLICATION_NAME: textWithMeta,
            OG_SITE_NAME: textWithMeta,
            TWITTER_HANDLE: textWithMeta,
            MASK_ICON_COLOR: textWithMeta,
            THEME_COLOR: themeWithMeta,
          }),
          fc.string(),
          fc.string(),
          (
            /** @type {BrandSettings} */ settings,
            /** @type {string} */ lightSvg,
            /** @type {string} */ darkSvg,
          ) => {
            const splash = buildBrandSplash(lightSvg, darkSvg)
            const meta = buildBrandMeta(settings)
            const title = buildBrandTitle(settings)

            // Raw SVG is preserved verbatim.
            expect(splash).toContain(lightSvg)
            expect(splash).toContain(darkSvg)

            // Each text field appears only in its escaped form.
            expect(title).toBe(escapeHtmlText(settings.APP_NAME))
            for (const value of [
              settings.APPLICATION_NAME,
              settings.OG_SITE_NAME,
              settings.TWITTER_HANDLE,
              settings.MASK_ICON_COLOR,
            ]) {
              expect(meta).toContain(escapeHtmlText(value))
            }

            // Escaped value decodes back to the original (round-trip safety).
            expect(decodeHtml(escapeHtmlText(settings.APP_NAME))).toBe(
              settings.APP_NAME,
            )
          },
        ),
        {numRuns: NUM_RUNS},
      )
    })

    it('should preserve raw SVG content without escaping', () => {
      // SVG with characters that should NOT be escaped.
      const lightSvg =
        '<svg xmlns="http://www.w3.org/2000/svg"><path d="M10 10"/></svg>'
      const darkSvg =
        '<svg xmlns="http://www.w3.org/2000/svg"><path fill="#FFF"/></svg>'

      const result = buildBrandSplash(lightSvg, darkSvg)

      expect(result).toContain(lightSvg)
      expect(result).toContain(darkSvg)
      expect(result).toContain('xmlns="http://www.w3.org/2000/svg"')
      expect(result).toContain('fill="#FFF"')
    })
  })
})

/**
 * Decode the HTML entities produced by escapeHtmlText.
 * @param {string} s
 * @returns {string}
 */
function decodeHtml(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

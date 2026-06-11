/*
 * This is a Node build script (run after `expo export`), so it legitimately
 * depends on Node.js builtins.
 */
/* eslint-disable import-x/no-nodejs-modules */
const path = require('node:path')
const fs = require('node:fs')

// Register tsx to load TypeScript settings
require('tsx/cjs')
const {AppSettings} = require('../src/indie-settings/settings')
const {
  buildBrandTitle,
  buildBrandSplash,
  buildBrandMeta,
  BRAND_STATIC_FILES,
} = require('./lib/brand-partial')

const projectRoot = path.join(__dirname, '..')
const templateFile = path.join(
  projectRoot,
  'bskyweb',
  'templates',
  'scripts.html',
)
const templatesDir = path.join(projectRoot, 'bskyweb', 'templates')
const brandTitleFile = path.join(templatesDir, 'brand_title.html')
const brandSplashFile = path.join(templatesDir, 'brand_splash.html')
const brandMetaFile = path.join(templatesDir, 'brand_meta.html')

/** @type {{entrypoints: string[]}} */
const {entrypoints} = require(
  path.join(projectRoot, 'web-build/asset-manifest.json'),
)

console.log(`Found ${entrypoints.length} entrypoints`)
console.log(`Writing ${templateFile}`)

const outputFile = entrypoints
  .map(
    /** @param {string} name */ name => {
      const file = path.basename(name)
      const ext = path.extname(file)

      if (ext === '.js') {
        return `<script defer="defer" src="{{ staticCDNHost }}/static/js/${file}"></script>`
      }
      if (ext === '.css') {
        return `<link rel="stylesheet" href="{{ staticCDNHost }}/static/css/${file}">`
      }

      return ''
    },
  )
  .join('\n')
fs.writeFileSync(templateFile, outputFile)

/**
 * Read a file and exit with code 1 if missing.
 * @param {string} filePath - Path to the file to read
 * @returns {string} File contents
 */
function readFileOrFail(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (err) {
    console.error(`error: brand splash SVG not found: ${filePath}`)
    process.exit(1)
  }
}

// Read raw splash SVG files from settings paths
const lightSvgPath = path.join(projectRoot, AppSettings.SPLASH_SVG_LIGHT_PATH)
const darkSvgPath = path.join(projectRoot, AppSettings.SPLASH_SVG_DARK_PATH)

console.log(`Reading light splash SVG: ${lightSvgPath}`)
const lightSvg = readFileOrFail(lightSvgPath)
console.log(`Reading dark splash SVG: ${darkSvgPath}`)
const darkSvg = readFileOrFail(darkSvgPath)

// Build and write brand fragments (plain content, included by base.html)
console.log(`Writing ${brandTitleFile}`)
fs.writeFileSync(brandTitleFile, buildBrandTitle(AppSettings))
console.log(`Writing ${brandSplashFile}`)
fs.writeFileSync(brandSplashFile, buildBrandSplash(lightSvg, darkSvg))
console.log(`Writing ${brandMetaFile}`)
fs.writeFileSync(brandMetaFile, buildBrandMeta(AppSettings))

/**
 * Copy a single file, exiting with code 1 if missing.
 * Skips the copy when the source and target resolve to the same path (e.g. the
 * Bluesky default, whose brand assets already live in bskyweb/static).
 * @param {string} sourcePath - Source file path
 * @param {string} targetPath - Target file path
 */
function copyFileOrFail(sourcePath, targetPath) {
  if (path.resolve(sourcePath) === path.resolve(targetPath)) {
    console.log(`Skipping ${sourcePath} (already in place)`)
    return
  }
  try {
    fs.copyFileSync(sourcePath, targetPath)
    console.log(`Copied ${sourcePath} to ${targetPath}`)
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`error: static brand asset not found: ${sourcePath}`)
      process.exit(1)
    }
    throw err
  }
}

// Copy static brand assets from WEB_STATIC_BRAND_DIR to bskyweb/static/
const brandStaticDir = path.join(projectRoot, AppSettings.WEB_STATIC_BRAND_DIR)
const targetStaticDir = path.join(projectRoot, 'bskyweb', 'static')

for (const fileName of BRAND_STATIC_FILES) {
  const sourcePath = path.join(brandStaticDir, fileName)
  const targetPath = path.join(targetStaticDir, fileName)
  copyFileOrFail(sourcePath, targetPath)
}

// Copy js/css/media build outputs (existing behavior - Requirement 7.3)
function copyFiles(sourceDir, targetDir) {
  const files = fs.readdirSync(path.join(projectRoot, sourceDir))
  files.forEach(file => {
    const sourcePath = path.join(projectRoot, sourceDir, file)
    const targetPath = path.join(projectRoot, targetDir, file)
    fs.copyFileSync(sourcePath, targetPath)
    console.log(`Copied ${sourcePath} to ${targetPath}`)
  })
}

copyFiles('web-build/static/js', 'bskyweb/static/js')
copyFiles('web-build/static/css', 'bskyweb/static/css')
copyFiles('web-build/static/media', 'bskyweb/static/media')

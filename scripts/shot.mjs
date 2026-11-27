#!/usr/bin/env node
/**
 * Screenshot tool for the FamilyMenu AI mockup.
 *
 * Starts its own Vite dev server (programmatically, on --port with a private cache dir), opens each
 * URL in headless Microsoft Edge (puppeteer-core), waits for fonts/images/network idle, runs optional
 * actions and saves PNGs. Page console errors are printed.
 *
 *   node scripts/shot.mjs --port 5180 --url "/?tab=week" --out shots/foundation/week.png
 *   node scripts/shot.mjs --port 5180 --desktop --url "/?tab=today" --out shots/foundation/desktop.png
 *   node scripts/shot.mjs --port 5180 --shots shots/foundation/shots.json
 *
 * Flags
 *   --port <n>            dev-server port (each agent uses its own; default 5180)
 *   --cache <dir>         Vite cache dir (default node_modules/.vite-<port>)
 *   --url <path>          path + query, e.g. "/?tab=week&theme=dark"
 *   --base <path>         serve the app under a base path, e.g. /familymenu-ai/ (as on GitHub Pages)
 *   --out <file.png>      output path (folders are created)
 *   --desktop             1440×900 @1x (framed iPhone + presenter panel); default is 393×852 @2x
 *   --wait <ms>           extra wait after load (default 0; a 700 ms settle is always applied)
 *   --click <selector>    click a CSS selector before the shot (repeatable)
 *   --click-text <text>   click the first visible element whose text contains <text> (repeatable)
 *   --no-defaults         don't add frame=0 / reset=1 to the URL
 *   --dark-os             emulate prefers-color-scheme: dark
 *   --reduced-motion      emulate prefers-reduced-motion: reduce
 *   --shots <file.json>   batch: [{ "url", "out", "desktop"?, "wait"?, "actions"?: [...] }]
 *
 * Actions (JSON): { "click": "css" } · { "clickText": "Αλλαγή" } · { "wait": 400 } ·
 *   { "press": "Escape" } · { "longpress": "css", "ms": 700 } · { "scroll": { "selector": ".ios-scroll", "y": 400 } } ·
 *   { "drag": { "from": [x, y], "to": [x, y], "steps": 16 } } · { "eval": "js expression" }
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

function parseArgs(argv) {
  const a = { clicks: [], port: 5180 }
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i]
    const next = () => argv[++i]
    switch (k) {
      case '--port': a.port = Number(next()); break
      case '--cache': a.cache = next(); break
      case '--url': a.url = next(); break
      case '--base': a.base = next(); break
      case '--out': a.out = next(); break
      case '--desktop': a.desktop = true; break
      case '--wait': a.wait = Number(next()); break
      case '--click': a.clicks.push({ click: next() }); break
      case '--click-text': a.clicks.push({ clickText: next() }); break
      case '--no-defaults': a.noDefaults = true; break
      case '--dark-os': a.darkOs = true; break
      case '--reduced-motion': a.reducedMotion = true; break
      case '--shots': a.shots = next(); break
      default:
        console.error(`Unknown flag ${k}`)
        process.exit(2)
    }
  }
  return a
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function withDefaults(url, desktop, noDefaults) {
  const u = new URL(url, 'http://x')
  if (!noDefaults) {
    if (!desktop && !u.searchParams.has('frame')) u.searchParams.set('frame', '0')
    if (!u.searchParams.has('reset')) u.searchParams.set('reset', '1')
  }
  return u.pathname + (u.search || '')
}

async function clickText(page, text) {
  const box = await page.evaluate((needle) => {
    const els = [...document.querySelectorAll('button,[role="button"],[role="tab"],[role="menuitem"],[role="radio"],a,[role="listitem"],[role="alert"],label,span,div,h1,h2,h3,p')]
    const visible = (el) => {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.bottom > 0 && r.top < innerHeight
    }
    // Prefer the smallest interactive element containing the text.
    const matches = els.filter((el) => visible(el) && (el.innerText || '').trim().includes(needle))
    if (!matches.length) return null
    matches.sort((a, b) => {
      const ia = a.matches('button,[role="button"],[role="tab"],[role="menuitem"],[role="radio"],a') ? 0 : 1
      const ib = b.matches('button,[role="button"],[role="tab"],[role="menuitem"],[role="radio"],a') ? 0 : 1
      if (ia !== ib) return ia - ib
      return a.getBoundingClientRect().width * a.getBoundingClientRect().height - b.getBoundingClientRect().width * b.getBoundingClientRect().height
    })
    const r = matches[0].getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }, text)
  if (!box) throw new Error(`clickText: no visible element contains "${text}"`)
  await page.mouse.click(box.x, box.y)
}

async function runAction(page, act) {
  if (act.click) {
    await page.waitForSelector(act.click, { visible: true, timeout: 5000 })
    await page.click(act.click)
  } else if (act.clickText) {
    await clickText(page, act.clickText)
  } else if (act.wait) {
    await sleep(act.wait)
  } else if (act.press) {
    await page.keyboard.press(act.press)
  } else if (act.longpress) {
    const el = await page.waitForSelector(act.longpress, { visible: true, timeout: 5000 })
    const b = await el.boundingBox()
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
    await page.mouse.down()
    await sleep(act.ms ?? 700)
    await page.mouse.up()
  } else if (act.scroll) {
    await page.evaluate(({ selector, y, index }) => {
      const list = [...document.querySelectorAll(selector)].filter((el) => getComputedStyle(el).visibility !== 'hidden')
      const el = list[index ?? list.length - 1]
      if (el) el.scrollTo({ top: y, behavior: 'instant' })
    }, act.scroll)
  } else if (act.drag) {
    const { from, to, steps = 16 } = act.drag
    await page.mouse.move(from[0], from[1])
    await page.mouse.down()
    for (let i = 1; i <= steps; i++) {
      await page.mouse.move(from[0] + ((to[0] - from[0]) * i) / steps, from[1] + ((to[1] - from[1]) * i) / steps)
      await sleep(12)
    }
    await page.mouse.up()
  } else if (act.eval) {
    await page.evaluate(act.eval)
  } else if (act.dragEl) {
    // drag relative to an element: { "dragEl": { "selector": "...", "index": 0, "dx": -300, "dy": 0, "fromX": 0.8 } }
    const { selector, index = 0, dx = 0, dy = 0, fromX = 0.5, fromY = 0.5, steps = 16 } = act.dragEl
    const b = await page.evaluate(({ selector, index }) => {
      const els = [...document.querySelectorAll(selector)].filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' && r.top >= 0 && r.bottom <= innerHeight
      })
      const r = els[index]?.getBoundingClientRect()
      return r ? { x: r.left, y: r.top, w: r.width, h: r.height } : null
    }, { selector, index })
    if (!b) throw new Error(`dragEl: no visible element for ${selector}`)
    const x0 = b.x + b.w * fromX
    const y0 = b.y + b.h * fromY
    await page.mouse.move(x0, y0)
    await page.mouse.down()
    for (let i = 1; i <= steps; i++) {
      await page.mouse.move(x0 + (dx * i) / steps, y0 + (dy * i) / steps)
      await sleep(12)
    }
    await page.mouse.up()
  } else if (act.shot) {
    // intermediate screenshot inside one page session (journeys): { "shot": "shots/x/step-1.png" }
    const out = path.resolve(ROOT, act.shot)
    mkdirSync(path.dirname(out), { recursive: true })
    await page.screenshot({ path: out })
    console.log(`  · ${path.relative(ROOT, out)}`)
  }
  await sleep(act.after ?? 120)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  let shots
  if (args.shots) {
    shots = JSON.parse(readFileSync(path.resolve(ROOT, args.shots), 'utf8'))
  } else if (args.url && args.out) {
    shots = [{ url: args.url, out: args.out, desktop: args.desktop, wait: args.wait, actions: args.clicks }]
  } else {
    console.error('Usage: node scripts/shot.mjs --port 5180 --url "/?tab=week" --out shots/week.png  (or --shots file.json)')
    process.exit(2)
  }
  if (!existsSync(EDGE)) throw new Error(`Microsoft Edge not found at ${EDGE}`)

  const cacheDir = path.resolve(ROOT, args.cache ?? `node_modules/.vite-${args.port}`)
  process.env.VITE_CACHE_DIR = cacheDir
  const { createServer } = await import('vite')
  const server = await createServer({
    root: ROOT,
    configFile: path.join(ROOT, 'vite.config.ts'),
    cacheDir,
    base: args.base ?? '/',
    logLevel: 'error',
    clearScreen: false,
    server: { port: args.port, strictPort: true, host: '127.0.0.1' },
  })
  await server.listen()
  const base = `http://127.0.0.1:${args.port}${(args.base ?? '/').replace(/\/$/, '')}`

  const puppeteer = (await import('puppeteer-core')).default
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: true,
    args: ['--hide-scrollbars', '--force-color-profile=srgb', '--disable-features=Translate', '--no-first-run', '--lang=el-GR'],
  })

  let failures = 0
  try {
    for (const shot of shots) {
      const desktop = shot.desktop ?? args.desktop
      const page = await browser.newPage()
      const errors = []
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text())
      })
      page.on('pageerror', (e) => errors.push(String(e?.message ?? e)))
      await page.setViewport(desktop ? { width: 1440, height: 900, deviceScaleFactor: 1 } : { width: 393, height: 852, deviceScaleFactor: 2 })
      const media = []
      if (shot.darkOs ?? args.darkOs) media.push({ name: 'prefers-color-scheme', value: 'dark' })
      if (shot.reducedMotion ?? args.reducedMotion) media.push({ name: 'prefers-reduced-motion', value: 'reduce' })
      if (media.length) await page.emulateMediaFeatures(media)
      const url = base + withDefaults(shot.url ?? '/', desktop, shot.noDefaults ?? args.noDefaults)
      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 })
        await page.evaluate(() => document.fonts.ready)
        await page.evaluate(
          () =>
            Promise.race([
              // lazy images far off-screen never load: wait only for eager ones, and never longer than 5 s
              Promise.all(
                [...document.images]
                  .filter((i) => !i.complete && i.loading !== 'lazy')
                  .map((i) => new Promise((r) => { i.addEventListener('load', r); i.addEventListener('error', r) })),
              ),
              new Promise((r) => setTimeout(r, 5000)),
            ]),
        )
        await sleep(700)
        for (const act of shot.actions ?? []) await runAction(page, act)
        if (shot.wait) await sleep(shot.wait)
        await page.evaluate(() => document.fonts.ready)
        const out = path.resolve(ROOT, shot.out)
        mkdirSync(path.dirname(out), { recursive: true })
        await page.screenshot({ path: out })
        console.log(`✓ ${path.relative(ROOT, out)}  ←  ${url.replace(base, '')}`)
      } catch (e) {
        failures++
        console.error(`✗ ${shot.out}: ${e.message}`)
      }
      for (const err of errors) console.error(`  console.error: ${err}`)
      await page.close()
    }
  } finally {
    await browser.close()
    await server.close()
  }
  process.exit(failures ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

/**
 * Checks that scroll reveals replay when sections come back into view. Needs the dev server
 * on 127.0.0.1:5173. Scrolls to the bottom, then back up to a section, and samples the
 * reveal state right after re-entry (should be mid-animation) and a moment later (done).
 */
import { mkdir } from "node:fs/promises"
import { chromium } from "@playwright/test"

const OUT = "test-results/replay"
await mkdir(OUT, { recursive: true })
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const logs = []
page.on("console", (m) => {
  if (["error", "warning"].includes(m.type()) && !m.text().includes("GL Driver"))
    logs.push(m.text().slice(0, 200))
})
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`))

await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" })
await page.waitForTimeout(2500)

/** Real wheel scrolling (Lenis owns the scroll position and reverts window.scrollTo). */
async function scrollTo(target) {
  for (let i = 0; i < 400; i += 1) {
    const y = await page.evaluate(() => window.scrollY)
    const max = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight
    )
    const goal = Math.min(Math.max(target, 0), max)
    const delta = goal - y
    if (Math.abs(delta) < 40) break
    await page.mouse.wheel(0, Math.sign(delta) * Math.min(Math.abs(delta), 450))
    await page.waitForTimeout(70)
  }
  await page.waitForTimeout(250)
}

const state = (selector) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const cs = getComputedStyle(el)
    return { clip: cs.clipPath, opacity: cs.opacity, transform: cs.transform }
  }, selector)

const top = (selector) =>
  page.evaluate(
    (sel) => document.querySelector(sel).getBoundingClientRect().top + window.scrollY,
    selector
  )

/** rAF sampler: records every distinct clip-path / transform the element shows. */
const watch = (selector) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel)
    window.__seen = window.__seen || {}
    const seen = (window.__seen[sel] = new Set())
    const loop = () => {
      const cs = getComputedStyle(el)
      seen.add(`${cs.clipPath}|${cs.transform}`)
      window.__raf = requestAnimationFrame(loop)
    }
    cancelAnimationFrame(window.__raf)
    loop()
  }, selector)
const seen = (selector) => page.evaluate((sel) => [...window.__seen[sel]].length, selector)

const result = {}
const card = "#experience article[data-reveal]"
const heading = "#work h2 .mask-line > span"
const hero = "[data-hero-name] .mask-line > span"
const end = () => page.evaluate(() => document.documentElement.scrollHeight)

// Down to the bottom (everything plays once), then back up section by section.
await scrollTo(await end())
await page.waitForTimeout(1200)
result.cardWhileAway = (await state(card)).clip

await watch(card)
await scrollTo((await top(card)) - 300)
await page.waitForTimeout(1600)
result.cardStatesDuringReturn = await seen(card)
result.cardFinal = (await state(card)).clip

await scrollTo(await end())
await page.waitForTimeout(1000)
await watch(heading)
await scrollTo((await top("#work")) - 100)
await page.waitForTimeout(1600)
result.headingStatesDuringReturn = await seen(heading)
result.headingFinal = (await state(heading)).transform

await watch(hero)
await scrollTo(0)
await page.waitForTimeout(2500)
result.heroStatesDuringReturn = await seen(hero)
result.heroFinal = (await state(hero)).transform
await page.screenshot({ path: `${OUT}/hero-after-return.png` })

console.log(JSON.stringify({ result, logs }, null, 2))
await browser.close()

/**
 * Production-build check against `vite preview` on 127.0.0.1:4173: asset load order, LCP,
 * hero canvas/plan per tier, section-figure handoff, console errors. Writes nothing.
 */
import { chromium } from "@playwright/test"

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173"
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
})
const result = {}
const runs = [
  ["desktop", { viewport: { width: 1440, height: 900 } }],
  ["mobile", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
  ["reduced", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }],
]
for (const [name, opts] of runs) {
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  const errors = []
  const assets = []
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type()) && !m.text().includes("GL Driver"))
      errors.push(m.text().slice(0, 200))
  })
  page.on("pageerror", (e) => errors.push(e.message))
  const t0 = Date.now()
  page.on("requestfinished", async (r) => {
    if (!r.url().includes("/assets/")) return
    const sizes = await r.sizes().catch(() => null)
    assets.push(
      `${r.url().split("/").pop()} ${sizes ? Math.round(sizes.responseBodySize / 1024) : "?"}kB +${Date.now() - t0}ms`
    )
  })
  await page.goto(BASE, { waitUntil: "load" })
  const lcp = await page.evaluate(
    () =>
      new Promise((res) => {
        new PerformanceObserver((l) => {
          const e = l.getEntries().at(-1)
          res({ ms: Math.round(e.startTime), el: e.element?.tagName })
        }).observe({ type: "largest-contentful-paint", buffered: true })
        setTimeout(() => res(null), 3000)
      })
  )
  await page.waitForTimeout(4000)
  const hero = {
    canvas: await page.locator("#hero canvas").count(),
    plan: await page.locator("#hero svg[data-plan]").count(),
  }
  // Section-figure handoff: fallback fades out once the canvas has drawn.
  const host = page.locator("#experience [data-section-scene]").first()
  await host.evaluate((el) => el.scrollIntoView({ block: "center" }))
  await page.waitForTimeout(5000)
  const handoff = await host.evaluate((el) => {
    const [fallback, canvasWrap] = el.children
    return {
      fallbackOpacity: fallback ? getComputedStyle(fallback).opacity : null,
      canvasOpacity: canvasWrap ? getComputedStyle(canvasWrap).opacity : null,
      canvas: el.querySelectorAll("canvas").length,
    }
  })
  result[name] = { lcp, hero, handoff, assets, errors }
  await ctx.close()
}
await browser.close()
console.log(JSON.stringify(result, null, 2))

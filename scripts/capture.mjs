/**
 * Visual QA capture. Requires the dev server on http://127.0.0.1:5173.
 *
 *   node scripts/capture.mjs            → test-results/screens/<viewport>-<section>.png
 *   node scripts/capture.mjs --reduced  → same, with prefers-reduced-motion: reduce
 *
 * Also writes test-results/screens/report.json with console errors, page errors,
 * document overflow and a list of captured files.
 */
import { mkdir, writeFile } from "node:fs/promises"
import { chromium } from "@playwright/test"

const BASE = process.env.BASE_URL || "http://127.0.0.1:5173"
const OUT = "test-results/screens"
const reduced = process.argv.includes("--reduced")
const SECTIONS = ["hero", "about", "experience", "work", "skills", "credentials", "contact"]
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
})
const report = { reduced, viewports: [], errors: [] }

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: reduced ? "reduce" : "no-preference",
  })
  const page = await context.newPage()
  const errors = []
  page.on("console", (msg) => {
    // Headless screenshots trigger GL ReadPixels driver warnings; they are not app issues.
    if (msg.text().includes("GL Driver Message")) return
    if (msg.type() === "error" || msg.type() === "warning")
      errors.push(`${msg.type()}: ${msg.text()}`)
  })
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`))

  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(2500)

  const prefix = `${vp.name}${reduced ? "-reduced" : ""}`
  const files = []
  await page.screenshot({ path: `${OUT}/${prefix}-00-top.png` })
  files.push(`${prefix}-00-top.png`)

  // Scroll slowly to the end first so every scroll-triggered reveal has fired.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.5
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 150))
    }
  })
  await page.waitForTimeout(1200)

  // One image per whole section (element screenshot), plus the footer.
  for (const [i, id] of [...SECTIONS, "footer"].entries()) {
    const el = id === "footer" ? page.locator("footer").first() : page.locator(`#${id}`)
    if ((await el.count()) === 0) {
      errors.push(`missing section #${id}`)
      continue
    }
    await el.first().scrollIntoViewIfNeeded()
    await page.waitForTimeout(700)
    const file = `${prefix}-${String(i + 1).padStart(2, "0")}-${id}.png`
    try {
      await el.first().screenshot({ path: `${OUT}/${file}` })
    } catch {
      await page.screenshot({ path: `${OUT}/${file}` })
    }
    files.push(file)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(600)

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.trim()),
    canvases: document.querySelectorAll("canvas").length,
    heroCanvas: document.querySelectorAll("#hero canvas").length,
    title: document.title,
  }))

  report.viewports.push({ ...vp, files, metrics, errors })
  if (metrics.scrollWidth > metrics.clientWidth + 1) {
    report.errors.push(
      `${vp.name}: horizontal overflow ${metrics.scrollWidth} > ${metrics.clientWidth}`
    )
  }
  report.errors.push(...errors.map((e) => `${vp.name}: ${e}`))
  await context.close()
}

await browser.close()
await writeFile(`${OUT}/report.json`, JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))

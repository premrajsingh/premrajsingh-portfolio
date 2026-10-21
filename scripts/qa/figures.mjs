/**
 * Scrolls each section figure into view (hover on), screenshots it, and reports canvases and
 * console errors. Needs the dev server on 127.0.0.1:5173. Output: test-results/figures/.
 */
import { mkdir } from "node:fs/promises"
import { chromium } from "@playwright/test"

const OUT = "test-results/figures"
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
await page.waitForTimeout(2000)

const hosts = page.locator("[data-section-scene]")
const info = []
for (let i = 0; i < (await hosts.count()); i += 1) {
  const host = hosts.nth(i)
  await host.evaluate((el) => el.scrollIntoView({ block: "center" }))
  await page.waitForTimeout(2600)
  const box = await host.boundingBox()
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.45)
  await page.waitForTimeout(900)
  const kind = await host.getAttribute("data-section-scene")
  await page.screenshot({
    path: `${OUT}/${String(i).padStart(2, "0")}-${kind}.png`,
    clip: {
      x: Math.max(0, box.x - 24),
      y: Math.max(0, box.y - 24),
      width: Math.min(1440, box.width + 48),
      height: Math.min(900, box.height + 48),
    },
  })
  info.push({ i, kind, canvas: await host.locator("canvas").count() })
}
console.log(JSON.stringify({ info, logs }, null, 2))
await browser.close()

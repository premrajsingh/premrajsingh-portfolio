import { test, expect } from "@playwright/test"

/**
 * Smoke suite for the Fig. 0 portfolio (docs/design-spec.md §10.2).
 * Headless Chromium may or may not have WebGL, so hero-figure checks accept either the
 * live canvas or the SVG plan.
 */

const SECTION_IDS = ["hero", "about", "experience", "work", "skills", "credentials", "contact"]
const NAV_LABELS = ["About", "Experience", "Work", "Skills", "Credentials", "Contact"]
const RESUME_PROJECTS = [
  "AI Project Estimator",
  "Dasgupta Maiti Portal",
  "Yashoda Bhawan System",
  "Automated Bank Statement Processing",
  "Studify Hub",
]
const LIVE_LINKS = [
  "https://software-cost-esstimator-frontend.vercel.app/",
  "https://dasguptamaitiassociates.com/",
  "https://yashodabhawan.in/",
  "https://premrajsingh.github.io/StudifyHub/",
]

test.describe("structure", () => {
  test("landmarks, single h1 and role text", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("banner")).toBeVisible()
    await expect(page.locator("#main")).toBeVisible()
    await expect(page.getByRole("contentinfo")).toBeAttached()
    await expect(page.locator("h1")).toHaveCount(1)

    const h1 = page.locator("h1")
    await expect(h1).toContainText("Prem Raj")
    await expect(h1).toContainText("AI Software Developer")
    await expect(
      page
        .getByRole("banner")
        .getByText(/AI Software Developer/)
        .first()
    ).toBeVisible()
    await expect(page.locator('a[href="#main"]')).toBeAttached()
  })

  test("sections are in order and Travel is gone", async ({ page }) => {
    await page.goto("/")
    for (const id of SECTION_IDS) await expect(page.locator(`#${id}`)).toBeAttached()

    const inOrder = await page.evaluate((ids) => {
      const els = ids.map((id) => document.getElementById(id))
      return els.every(
        (el, i) =>
          i === 0 ||
          Boolean(els[i - 1].compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)
      )
    }, SECTION_IDS)
    expect(inOrder).toBe(true)

    const primary = page.getByRole("navigation", { name: "Primary" }).getByRole("link")
    await expect(primary).toHaveText(NAV_LABELS)
    await expect(page.locator("#travel")).toHaveCount(0)
    await expect(page.getByText("Travel", { exact: true })).toHaveCount(0)
    await expect(page.getByText(/AI Full Stack/)).toHaveCount(0)
  })
})

test.describe("content", () => {
  test("Plancover is current and header-only; Droot dates are corrected", async ({ page }) => {
    await page.goto("/")
    const heading = page.getByRole("heading", { name: "AI Engineer Intern" })
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toBeVisible()

    const plancover = page.locator("article", { has: heading })
    for (const text of ["Plancover", "Gurgaon", "Oct 2026 – Present", "Internship"]) {
      await expect(plancover).toContainText(text)
    }
    await expect(plancover.locator("ul, ol")).toHaveCount(0)

    const droot = page.locator("article", { hasText: "Droot Private Limited" })
    await expect(droot).toContainText("Jul 2026 – Sep 2026")
    await expect(page.getByText("July 2026 – Present")).toHaveCount(0)
  })

  test("work lists every resume project with live links", async ({ page }) => {
    await page.goto("/")
    const work = page.locator("#work")
    for (const title of RESUME_PROJECTS) {
      await expect(work.getByRole("heading", { level: 3, name: title, exact: true })).toBeAttached()
    }
    for (const href of LIVE_LINKS)
      await expect(page.locator(`a[href="${href}"]`).first()).toBeAttached()
    await expect(page.locator('svg[data-figure="bank-pipeline"]')).toBeAttached()
    await expect(work).toContainText("Spotify Web Clone")
    await expect(work).toContainText("CRUD Application")
    await expect(page.getByRole("button", { name: /Open file/i })).toHaveCount(0)
  })

  test("hero spec plate names the four capabilities", async ({ page }) => {
    await page.goto("/")
    const hero = page.locator("#hero")
    for (const text of [
      "Knowledge-graph RAG",
      "Multi-agent systems",
      "Event-driven integrations",
      "Production",
    ]) {
      await expect(hero).toContainText(text)
    }
  })

  test("contact links and copy buttons", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator('a[href="mailto:singhpremraj264@gmail.com"]').first()).toBeAttached()
    await expect(page.locator('a[href="tel:+917726960080"]').first()).toBeAttached()
    await expect(page.getByRole("button", { name: "Copy email" })).toBeAttached()
    await expect(page.getByRole("button", { name: "Copy phone number" })).toBeAttached()
    const resume = await page.request.head("/Prem_Raj_Resume.pdf")
    expect(resume.status()).toBe(200)
  })
})

test.describe("interaction", () => {
  test("hero figure, legend and readout", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(2500)
    const figure = page.locator("#hero canvas, #hero svg[data-plan]")
    expect(await figure.count()).toBeGreaterThan(0)
    await expect(page.locator("#hero-caption")).toContainText("13 components · 17 connectors")

    const readout = page.locator("#hero-active")
    await expect(readout).toHaveText("—")

    await page.locator("#hero-caption summary").click()
    const chips = page.locator("#hero-caption button[data-node-id]")
    await expect(chips).toHaveCount(13)

    await chips.first().focus()
    await expect(readout).not.toHaveText("—")
    const first = await readout.textContent()
    await page.keyboard.press("ArrowRight")
    await expect(chips.nth(1)).toBeFocused()
    await expect(readout).not.toHaveText(first ?? "")

    await page.keyboard.press("Enter")
    await expect(chips.nth(1)).toHaveAttribute("aria-pressed", "true")
    await page.keyboard.press("Escape")
    await expect(readout).toHaveText("—")
  })

  test("run a request: trace plays, waterfall completes, scenarios cycle", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(1500)
    const button = page.getByRole("button", { name: /Run a request/ })
    await button.click()

    const panel = page.locator("#hero-trace")
    await expect(panel).toBeAttached()
    await expect(panel).toContainText("Trace · Estimate request")
    await expect(panel.locator(".trace-row")).toHaveCount(8)
    await expect(panel).toHaveAttribute("data-status", "done", { timeout: 15000 })
    await expect(panel.locator('.trace-row[data-state="done"]')).toHaveCount(8)
    await expect(panel).toContainText("200 OK")
    await expect(page.locator("#hero-active")).toHaveText("—")

    const again = page.getByRole("button", { name: /Run another request/ })
    await again.click()
    await expect(panel).toContainText("Trace · Inbound WhatsApp message")
  })

  test("section figures: fallback content present; canvases mount when WebGL exists", async ({
    page,
  }) => {
    await page.goto("/")
    const hosts = page.locator("[data-section-scene]")
    await expect(hosts).toHaveCount(8)
    // Experience stacks keep their accessible component list under the figure.
    await expect(page.locator("#experience [data-section-scene]").first()).toContainText(/Stack:/)
    const webgl = await page.evaluate(() => {
      const c = document.createElement("canvas")
      return Boolean(c.getContext("webgl2") || c.getContext("webgl"))
    })
    await page.locator("#work").scrollIntoViewIfNeeded()
    await page.waitForTimeout(2500)
    const canvases = await page.locator("#work canvas").count()
    if (webgl) expect(canvases).toBeGreaterThan(0)
    else expect(canvases).toBe(0)
  })

  test("certificate dialog traps focus and closes on Escape", async ({ page }) => {
    await page.goto("/")
    const trigger = page.getByRole("button", { name: /View certificate: HackHazards 2025/ })
    await trigger.scrollIntoViewIfNeeded()
    await trigger.click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute("aria-modal", "true")
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true)

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test("keyboard: skip link first, visible focus ring", async ({ page }) => {
    await page.goto("/")
    await page.keyboard.press("Tab")
    await expect(page.locator('a[href="#main"]')).toBeFocused()
    await page.keyboard.press("Tab")
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)
    expect(outline).not.toBe("none")
  })
})

test.describe("quality", () => {
  test("no console or page errors", async ({ page }) => {
    const errors = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    page.on("pageerror", (err) => errors.push(err.message))
    await page.goto("/", { waitUntil: "networkidle" })
    await page.waitForTimeout(1500)
    expect(errors).toEqual([])
  })

  for (const size of [
    { width: 390, height: 844 },
    { width: 320, height: 700 },
  ]) {
    test(`no horizontal overflow at ${size.width}px`, async ({ page }) => {
      await page.setViewportSize(size)
      await page.goto("/", { waitUntil: "networkidle" })
      await page.waitForTimeout(1200)
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
    })
  }

  test("reduced motion: no canvas, SVG plan, everything visible, no Lenis", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/", { waitUntil: "networkidle" })
    await page.waitForTimeout(1500)

    await expect(page.locator("#hero canvas")).toHaveCount(0)
    await expect(page.locator("#hero svg[data-plan]")).toBeAttached()

    const hidden = await page.evaluate(
      () =>
        [
          ...document.querySelectorAll(
            "[data-reveal], [data-mask], [data-clip], [data-stagger] > *"
          ),
        ].filter((el) => {
          const style = getComputedStyle(el)
          const clip = style.clipPath
          return (
            style.visibility === "hidden" ||
            parseFloat(style.opacity) < 0.9 ||
            (clip && clip !== "none" && clip !== "inset(0%)" && !/inset\(0(px|%)?\)/.test(clip))
          )
        }).length
    )
    expect(hidden).toBe(0)
    expect(await page.evaluate(() => document.documentElement.classList.contains("lenis"))).toBe(
      false
    )
  })
})

import { beforeEach, describe, expect, it, vi } from "vitest"
import { activeNodeStore } from "./activeNodeStore.js"

describe("activeNodeStore", () => {
  beforeEach(() => {
    activeNodeStore.clear({ force: true })
  })

  it("starts empty", () => {
    expect(activeNodeStore.getSnapshot()).toEqual({ id: null, pinned: false, source: null })
  })

  it("notifies subscribers when the active id changes", () => {
    const listener = vi.fn()
    const unsubscribe = activeNodeStore.subscribe(listener)

    activeNodeStore.setActive("neo4j", { source: "legend" })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(activeNodeStore.getSnapshot()).toEqual({
      id: "neo4j",
      pinned: false,
      source: "legend",
    })
    unsubscribe()
  })

  it("does not notify when id and pinned are unchanged", () => {
    const listener = vi.fn()
    activeNodeStore.setActive("llm")
    const unsubscribe = activeNodeStore.subscribe(listener)

    activeNodeStore.setActive("llm")
    activeNodeStore.setActive("llm", { source: "scene" })

    expect(listener).not.toHaveBeenCalled()
    expect(activeNodeStore.getSnapshot().source).toBe("scene")
    unsubscribe()
  })

  it("notifies when only the pinned flag changes", () => {
    const listener = vi.fn()
    activeNodeStore.setActive("bus")
    const unsubscribe = activeNodeStore.subscribe(listener)

    activeNodeStore.setActive("bus", { pin: true })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(activeNodeStore.getSnapshot().pinned).toBe(true)
    unsubscribe()
  })

  it("clear() is a no-op while pinned", () => {
    const listener = vi.fn()
    activeNodeStore.setActive("mongo", { pin: true })
    const unsubscribe = activeNodeStore.subscribe(listener)

    activeNodeStore.clear()

    expect(listener).not.toHaveBeenCalled()
    expect(activeNodeStore.getSnapshot().id).toBe("mongo")
    unsubscribe()
  })

  it("clear() clears an unpinned node and notifies once", () => {
    const listener = vi.fn()
    activeNodeStore.setActive("client")
    const unsubscribe = activeNodeStore.subscribe(listener)

    activeNodeStore.clear()
    activeNodeStore.clear()

    expect(listener).toHaveBeenCalledTimes(1)
    expect(activeNodeStore.getSnapshot()).toEqual({ id: null, pinned: false, source: null })
    unsubscribe()
  })

  it("clear({ force: true }) always clears, even when pinned", () => {
    const listener = vi.fn()
    activeNodeStore.setActive("agents", { pin: true, source: "legend" })
    const unsubscribe = activeNodeStore.subscribe(listener)

    activeNodeStore.clear({ force: true })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(activeNodeStore.getSnapshot()).toEqual({ id: null, pinned: false, source: null })
    unsubscribe()
  })

  it("unsubscribe stops notifications", () => {
    const listener = vi.fn()
    const unsubscribe = activeNodeStore.subscribe(listener)
    unsubscribe()

    activeNodeStore.setActive("pinecone")

    expect(listener).not.toHaveBeenCalled()
  })
})

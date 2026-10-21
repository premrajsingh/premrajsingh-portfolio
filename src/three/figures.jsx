import { Suspense, useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { ContactShadows, Edges, Grid, PerspectiveCamera, useTexture } from "@react-three/drei"
import * as THREE from "three"
import { ACCENT, INK, NODE_BY_ID } from "./architecture.js"
import { HIT_SIZE, noRaycast, useToonGradient, useToonMaterial } from "./nodeMaterials.js"
import { NodeShape } from "./nodeShapes.jsx"
import { activeNodeStore } from "../lib/activeNodeStore.js"
import { skillHover } from "../lib/hoverStore.js"

/**
 * Small R3F figures used outside the hero (one lazily loaded chunk):
 *
 *  - StackFigure — a role's actual components (EXPERIENCE[].stack) standing on a strip of
 *    engineering grid, drawn with the hero's shapes. Hovering an object lights it and the
 *    matching hero node; the canvas renders only while it is on screen.
 *  - ShelfFigure — the twelve Skills groups as objects on a shelf; the hovered table row
 *    lifts its object.
 *
 * Both are white toon solids with ink edges, dpr 1, no post-processing, no shadow maps.
 */

const damp = THREE.MathUtils.damp
const EDGE_IDLE = new THREE.Color(INK)
const EDGE_DIM = new THREE.Color("#D3D6D1")
const C_ACCENT = new THREE.Color(ACCENT)

/** Approximate footprint widths per kind so objects sit evenly on a row. */
const WIDTH = {
  card: 1.3,
  ring: 1.0,
  capsule: 1.0,
  box: 1.15,
  "box-sm": 0.95,
  queue: 2.5,
  cluster: 1.05,
  glass: 1.1,
  db: 1.0,
  graph: 1.15,
  lattice: 0.95,
  square: 0.9,
}

function layoutRow(items, gap = 0.55) {
  const widths = items.map((item) => WIDTH[item.kind] ?? 1)
  const total = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1)
  let x = -total / 2
  return items.map((item, i) => {
    const cx = x + widths[i] / 2
    x += widths[i] + gap
    return { ...item, x: cx }
  })
}

function restY(kind) {
  // Matches the node heights used in architecture.js so bases touch the grid.
  switch (kind) {
    case "card":
      return 0.42
    case "ring":
      return 0.08
    case "capsule":
      return 0.13
    case "box":
      return 0.25
    case "box-sm":
      return 0.2
    case "queue":
      return 0.3
    case "cluster":
      return 0.25
    case "glass":
      return 0.95
    case "db":
      return 0.35
    case "graph":
      return 0.55
    case "lattice":
      return 0.4
    case "square":
      return 0.03
    default:
      return 0.3
  }
}

/* ------------------------------------------------------------------------------------------ */
/* One object: shape + edges + hover proxy                                                     */
/* ------------------------------------------------------------------------------------------ */

function Figure({ item, gradient, isActive, onEnter, onLeave, index }) {
  const group = useRef()
  const edges = useRef([])
  const wireRef = useRef()
  const material = useToonMaterial(gradient)
  const addEdge = (line) => {
    if (line && !edges.current.includes(line)) edges.current.push(line)
  }
  const hit = HIT_SIZE[item.kind] ?? [1, 1, 1]
  const base = restY(item.kind)

  useFrame((state, dt) => {
    const delta = Math.min(dt, 0.05)
    const active = isActive()
    const anyActive = isActive.any()
    const k = 1 - Math.exp(-10 * delta)
    const target = active ? C_ACCENT : anyActive ? EDGE_DIM : EDGE_IDLE
    for (const line of edges.current) line.material?.color.lerp(target, k)
    if (wireRef.current) wireRef.current.color.lerp(target, k)
    material.emissiveIntensity = damp(material.emissiveIntensity, active ? 0.08 : 0, 8, delta)
    if (group.current) {
      const t = state.clock.elapsedTime
      const bob = Math.sin(t * 0.9 + index * 1.3) * 0.015
      group.current.position.y = damp(
        group.current.position.y,
        base + (active ? 0.22 : 0) + bob,
        7,
        delta
      )
      group.current.rotation.y = damp(group.current.rotation.y, active ? 0.35 : 0, 6, delta)
    }
  })

  return (
    <group ref={group} position={[item.x, base, 0]}>
      <NodeShape
        node={item}
        material={material}
        addEdge={addEdge}
        glass={false}
        wireRef={wireRef}
      />
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = "pointer"
          onEnter(item)
        }}
        onPointerOut={() => {
          document.body.style.cursor = ""
          onLeave(item)
        }}
      >
        <boxGeometry args={hit} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Stage({ items, span, isActive, onEnter, onLeave, pointerRef }) {
  const gradient = useToonGradient()
  const rig = useRef()
  useFrame((_, dt) => {
    if (!rig.current) return
    const delta = Math.min(dt, 0.05)
    const p = pointerRef.current
    rig.current.rotation.y = damp(rig.current.rotation.y, p.x * 0.12, 4, delta)
    rig.current.rotation.x = damp(rig.current.rotation.x, -p.y * 0.05, 4, delta)
  })
  return (
    <group ref={rig}>
      <Grid
        args={[span + 3, 5]}
        position={[0, -0.001, 0]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#E3E5E1"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#CDD0CB"
        fadeDistance={40}
        fadeStrength={1}
        raycast={noRaycast}
      />
      <ContactShadows
        frames={1}
        resolution={256}
        scale={span + 4}
        blur={2.4}
        far={2.5}
        opacity={0.16}
      />
      {items.map((item, i) => (
        <Figure
          key={item.key}
          item={item}
          index={i}
          gradient={gradient}
          isActive={Object.assign(() => isActive(item), { any: () => isActive.any() })}
          onEnter={onEnter}
          onLeave={onLeave}
        />
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Canvas shell shared by both figures                                                         */
/* ------------------------------------------------------------------------------------------ */

function usePointerRef(ref) {
  const pointerRef = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const onMove = (event) => {
      const rect = el.getBoundingClientRect()
      pointerRef.current = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
      }
    }
    const onLeave = () => {
      pointerRef.current = { x: 0, y: 0 }
    }
    el.addEventListener("pointermove", onMove, { passive: true })
    el.addEventListener("pointerleave", onLeave)
    return () => {
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerleave", onLeave)
    }
  }, [ref])
  return pointerRef
}

/** Fits a row of `span` world units into the host box from the front-right, whatever its aspect. */
function RowCamera({ span }) {
  const { size, camera } = useThree()
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height)
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2)
    const dW = span / (2 * Math.tan(halfFov) * aspect)
    const dH = 2.4 / (2 * Math.tan(halfFov))
    const d = Math.max(dW, dH) * 1.08
    // Nearly frontal for long rows so the far end does not run out of the box.
    const side = aspect > 4 ? 0.1 : 0.28
    camera.position.set(side * d, 0.42 * d, 0.88 * d)
    camera.lookAt(0, 0.3, 0)
    camera.updateProjectionMatrix()
  }, [size, camera, span])
  return null
}

function FigureCanvas({ hostRef, visible, items, isActive, onEnter, onLeave, onReady }) {
  const pointerRef = usePointerRef(hostRef)
  const span = useMemo(() => {
    const xs = items.map((i) => i.x)
    const widths = items.map((i) => WIDTH[i.kind] ?? 1)
    return Math.max(...xs) - Math.min(...xs) + Math.max(...widths) + 1.2
  }, [items])

  return (
    <Canvas
      dpr={1}
      flat
      frameloop={visible ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      eventSource={hostRef}
      onCreated={(state) => {
        state.gl.setClearAlpha(0)
        window.requestAnimationFrame(() => onReady?.())
        state.setEvents({
          compute: (event, s) => {
            const rect = s.gl.domElement.getBoundingClientRect()
            s.pointer.set(
              ((event.clientX - rect.left) / rect.width) * 2 - 1,
              -((event.clientY - rect.top) / rect.height) * 2 + 1
            )
            s.raycaster.setFromCamera(s.pointer, s.camera)
          },
        })
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <PerspectiveCamera makeDefault fov={22} near={0.5} far={80} position={[3, 4, 8]} />
      <RowCamera span={span} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 8, 3]} intensity={1.35} />
      <Stage
        items={items}
        span={span}
        isActive={isActive}
        onEnter={onEnter}
        onLeave={onLeave}
        pointerRef={pointerRef}
      />
    </Canvas>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Public figures                                                                              */
/* ------------------------------------------------------------------------------------------ */

/** A role's stack. `ids` are node ids from architecture.js. Mirrors the hero's active node. */
export function StackFigure({ hostRef, visible, ids, onReady }) {
  const items = useMemo(
    () =>
      layoutRow(
        ids
          .map((id) => NODE_BY_ID[id])
          .filter(Boolean)
          .map((node) => ({ key: node.id, id: node.id, kind: node.kind, pos: node.pos }))
      ),
    [ids]
  )
  const isActive = useMemo(() => {
    const fn = (item) => activeNodeStore.getSnapshot().id === item.id
    fn.any = () => {
      const id = activeNodeStore.getSnapshot().id
      return Boolean(id) && ids.includes(id)
    }
    return fn
  }, [ids])
  return (
    <FigureCanvas
      hostRef={hostRef}
      visible={visible}
      onReady={onReady}
      items={items}
      isActive={isActive}
      onEnter={(item) => {
        if (!activeNodeStore.getSnapshot().pinned) {
          activeNodeStore.setActive(item.id, { source: "stack" })
        }
      }}
      onLeave={(item) => {
        const snap = activeNodeStore.getSnapshot()
        if (!snap.pinned && snap.id === item.id && snap.source === "stack") activeNodeStore.clear()
      }}
    />
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Work: screenshots as standing 3D screens (the diagram's "card" shape, textured)           */
/* ------------------------------------------------------------------------------------------ */

const SCREEN_W = 2.4
const SCREEN_H = SCREEN_W * (9 / 16)
const DETAIL_SCALE = 0.5

function useSrgbTextures(urls) {
  const textures = useTexture(urls)
  useEffect(() => {
    const list = Array.isArray(textures) ? textures : [textures]
    for (const tex of list) {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 4
      tex.needsUpdate = true
    }
  }, [textures])
  return Array.isArray(textures) ? textures : [textures]
}

function Screen({ texture, width, height, position, rotation = [0, 0, 0], index, pointerRef }) {
  const group = useRef()
  const base = useMemo(() => position, [position])
  useFrame((state, dt) => {
    if (!group.current) return
    const delta = Math.min(dt, 0.05)
    const t = state.clock.elapsedTime
    const bob = Math.sin(t * 0.8 + index * 1.7) * 0.012
    // Deeper screens drift less: a cheap parallax that reads as true depth under the tilt.
    const depth = 1 - index * 0.35
    const p = pointerRef.current
    group.current.position.x = damp(
      group.current.position.x,
      base[0] + p.x * 0.08 * depth,
      5,
      delta
    )
    group.current.position.y = damp(
      group.current.position.y,
      base[1] + bob - p.y * 0.05 * depth,
      5,
      delta
    )
  })
  return (
    <group ref={group} position={position} rotation={rotation}>
      <mesh raycast={noRaycast}>
        <boxGeometry args={[width, height, 0.05]} />
        <meshBasicMaterial attach="material-0" color="#ECEEEA" />
        <meshBasicMaterial attach="material-1" color="#ECEEEA" />
        <meshBasicMaterial attach="material-2" color="#F3F4F1" />
        <meshBasicMaterial attach="material-3" color="#E3E5E0" />
        <meshBasicMaterial attach="material-4" map={texture} toneMapped={false} />
        <meshBasicMaterial attach="material-5" color="#E3E5E0" />
        <Edges color={INK} lineWidth={1} threshold={25} />
      </mesh>
    </group>
  )
}

function ScreenStage({ images, pointerRef }) {
  const textures = useSrgbTextures(images.map((img) => img.src))
  const rig = useRef()
  useFrame((_, dt) => {
    if (!rig.current) return
    const delta = Math.min(dt, 0.05)
    const p = pointerRef.current
    rig.current.rotation.y = damp(rig.current.rotation.y, p.x * 0.16, 4, delta)
    rig.current.rotation.x = damp(rig.current.rotation.x, -p.y * 0.07, 4, delta)
  })
  const dw = SCREEN_W * DETAIL_SCALE
  const dh = SCREEN_H * DETAIL_SCALE
  return (
    <group ref={rig}>
      <Grid
        args={[8, 6]}
        position={[0, -0.001, 0]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#E3E5E1"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#CDD0CB"
        fadeDistance={30}
        fadeStrength={1}
        raycast={noRaycast}
      />
      <ContactShadows frames={1} resolution={256} scale={8} blur={2.2} far={2} opacity={0.18} />
      <Screen
        texture={textures[0]}
        width={SCREEN_W}
        height={SCREEN_H}
        position={[0, SCREEN_H / 2 + 0.08, 0.2]}
        index={0}
        pointerRef={pointerRef}
      />
      {textures[1] ? (
        <Screen
          texture={textures[1]}
          width={dw}
          height={dh}
          position={[-SCREEN_W * 0.55, dh / 2 + 0.04, -0.75]}
          rotation={[0, 0.35, 0]}
          index={1}
          pointerRef={pointerRef}
        />
      ) : null}
      {textures[2] ? (
        <Screen
          texture={textures[2]}
          width={dw}
          height={dh}
          position={[SCREEN_W * 0.58, dh / 2 + 0.04, -0.95]}
          rotation={[0, -0.35, 0]}
          index={2}
          pointerRef={pointerRef}
        />
      ) : null}
    </group>
  )
}

/** Fits the screen stack into the host box, whatever its aspect. */
function ScreenCamera() {
  const { size, camera } = useThree()
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height)
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2)
    const needW = SCREEN_W * 1.75
    const needH = SCREEN_H + 1.1
    const dW = needW / (2 * Math.tan(halfFov) * aspect)
    const dH = needH / (2 * Math.tan(halfFov))
    const d = Math.max(dW, dH)
    camera.position.set(d * 0.12, d * 0.3 + 0.4, d)
    camera.lookAt(0, SCREEN_H / 2, 0)
    camera.updateProjectionMatrix()
  }, [size, camera])
  return null
}

/** A project's screenshots as standing screens. `images` = [{ src, alt }] (1–3). */
export function ScreenFigure({ hostRef, visible, images, onReady }) {
  const pointerRef = usePointerRef(hostRef)
  return (
    <Canvas
      dpr={1}
      flat
      frameloop={visible ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={(state) => {
        state.gl.setClearAlpha(0)
        window.requestAnimationFrame(() => onReady?.())
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <PerspectiveCamera makeDefault fov={22} near={0.5} far={60} position={[0, 2, 9]} />
      <ScreenCamera />
      <ambientLight intensity={1} />
      <Suspense fallback={null}>
        <ScreenStage images={images} pointerRef={pointerRef} />
      </Suspense>
    </Canvas>
  )
}

/** The Skills groups as objects on a shelf; `groups` = [{ title, kind }]. */
export function ShelfFigure({ hostRef, visible, groups, onReady }) {
  const items = useMemo(
    () =>
      layoutRow(
        groups.map((g) => ({ key: g.title, title: g.title, kind: g.kind })),
        0.5
      ),
    [groups]
  )
  const isActive = useMemo(() => {
    const fn = (item) => skillHover.getSnapshot() === item.title
    fn.any = () => skillHover.getSnapshot() !== null
    return fn
  }, [])
  return (
    <FigureCanvas
      hostRef={hostRef}
      visible={visible}
      onReady={onReady}
      items={items}
      isActive={isActive}
      onEnter={(item) => skillHover.set(item.title)}
      onLeave={(item) => skillHover.clear(item.title)}
    />
  )
}

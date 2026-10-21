import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  ContactShadows,
  Environment,
  Grid,
  Lightformer,
  Line,
  PerformanceMonitor,
  PerspectiveCamera,
} from "@react-three/drei"
import * as THREE from "three"
import { ACCENT, EDGES, INK, NODES, PACKETS_STATIC, edgeSamples } from "./architecture.js"
import { createPackets, createPacketsFrom, stepPackets } from "./packets.js"
import { HIT_SIZE, noRaycast, useToonGradient, useToonMaterial } from "./nodeMaterials.js"
import { NodeShape } from "./nodeShapes.jsx"
import { activeNodeStore } from "../lib/activeNodeStore.js"
import { traceStore } from "../lib/traceStore.js"

/**
 * Fig. 0 — the hero's reference-architecture scene (design-spec §6.3, amended by §0.1).
 *
 * Thirteen nodes from src/three/architecture.js, seventeen orthogonally routed connectors,
 * instanced packets, toon-shaded white solids with ink edges, one glass LLM. Everything inside
 * the canvas reads refs or store snapshots in useFrame — no React state changes per frame.
 *
 * Deviations from the spec, all deliberate:
 * - Solids are plain box/cylinder geometry instead of drei RoundedBox: Edges on a rounded box
 *   finds no creases above the threshold, so the drawn outline disappears.
 * - Pointer coordinates are computed against the canvas rect (custom `compute`), because
 *   R3F's `eventPrefix="client"` assumes a full-viewport canvas.
 */

/** Time-boxed glass decision (spec §6.3.1). false ships the flat toon icosahedron. */
const LLM_GLASS = true

const CONNECTOR_IDLE = new THREE.Color("#9A9F98")
const CONNECTOR_DIM = new THREE.Color("#E1E3DF")
const EDGE_IDLE = new THREE.Color(INK)
const EDGE_DIM = new THREE.Color("#D3D6D1")
const C_ACCENT = new THREE.Color(ACCENT)

const NEIGHBOURS = NODES.reduce((map, node) => {
  map[node.id] = new Set()
  return map
}, {})
for (const edge of EDGES) {
  NEIGHBOURS[edge.from].add(edge.to)
  NEIGHBOURS[edge.to].add(edge.from)
}

const FOOTPRINT_SCALE = { queue: 1.35, card: 0.75, cluster: 0.85 }
const damp = THREE.MathUtils.damp
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const cubicOut = (t) => 1 - (1 - t) ** 3

/* ------------------------------------------------------------------------------------------ */
/* Hover / pin wiring shared by every node                                                     */
/* ------------------------------------------------------------------------------------------ */

let leaveTimer = 0

function hoverHandlers(id) {
  return {
    onPointerOver: (event) => {
      event.stopPropagation()
      window.clearTimeout(leaveTimer)
      document.body.style.cursor = "pointer"
      if (!activeNodeStore.getSnapshot().pinned) activeNodeStore.setActive(id, { source: "scene" })
    },
    onPointerOut: () => {
      document.body.style.cursor = ""
      window.clearTimeout(leaveTimer)
      leaveTimer = window.setTimeout(() => {
        const snap = activeNodeStore.getSnapshot()
        if (!snap.pinned && snap.source === "scene") activeNodeStore.clear()
      }, 80)
    },
    onClick: (event) => {
      event.stopPropagation()
      const snap = activeNodeStore.getSnapshot()
      if (snap.id === id && snap.pinned) activeNodeStore.clear({ force: true })
      else activeNodeStore.setActive(id, { pin: true, source: "scene" })
    },
  }
}

/* ------------------------------------------------------------------------------------------ */
/* Nodes                                                                                       */
/* ------------------------------------------------------------------------------------------ */

function Node({ node, index, tier, gradient, pulses, born, glass, glassQuality }) {
  const group = useRef()
  const edges = useRef([])
  const wireRef = useRef()
  const material = useToonMaterial(gradient)

  const addEdge = (line) => {
    if (line && !edges.current.includes(line)) edges.current.push(line)
  }

  const [x, y, z] = node.pos
  const hit = HIT_SIZE[node.kind] ?? [1, 1, 1]

  useFrame((state, dt) => {
    const delta = Math.min(dt, 0.05)
    const { id: activeId } = activeNodeStore.getSnapshot()

    // Entrance: rise from the grid with a 40 ms stagger (full tier only).
    if (group.current) {
      let rise = 1
      if (tier === "full") {
        const t = (state.clock.elapsedTime - born.current - index * 0.04) / 0.9
        rise = cubicOut(THREE.MathUtils.clamp(t, 0, 1))
      }
      group.current.position.y = y - 0.6 * (1 - rise)
    }

    // Highlight: ink edges → accent (active), stay ink (neighbour), fade (others).
    const target =
      activeId === null
        ? EDGE_IDLE
        : activeId === node.id
          ? C_ACCENT
          : NEIGHBOURS[activeId]?.has(node.id)
            ? EDGE_IDLE
            : EDGE_DIM
    const k = 1 - Math.exp(-10 * delta)
    for (const line of edges.current) line.material?.color.lerp(target, k)
    if (wireRef.current) wireRef.current.color.lerp(target, k)

    // Store discs pulse when a packet arrives.
    const p = pulses.current[node.id] ?? 0
    material.emissiveIntensity = 0.22 * p + (activeId === node.id ? 0.06 : 0)
    if (p > 0.001) pulses.current[node.id] = p * Math.pow(0.9, delta * 60)
  })

  return (
    <group ref={group} position={[x, y, z]}>
      <NodeShape
        node={node}
        material={material}
        addEdge={addEdge}
        glass={glass}
        glassQuality={glassQuality}
        wireRef={wireRef}
      />
      <mesh {...hoverHandlers(node.id)}>
        <boxGeometry args={hit} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Connectors                                                                                  */
/* ------------------------------------------------------------------------------------------ */

const CONNECTOR_POINTS = EDGES.map((edge) => {
  const s = edgeSamples(edge, 48)
  const pts = []
  for (let i = 0; i < s.length; i += 3) pts.push([s[i], s[i + 1], s[i + 2]])
  return pts
})

function Connector({ edge, index, tier, born }) {
  const line = useRef()
  useFrame((state, dt) => {
    const mat = line.current?.material
    if (!mat) return
    const delta = Math.min(dt, 0.05)
    const { id: activeId } = activeNodeStore.getSnapshot()
    const connected = activeId !== null && (edge.from === activeId || edge.to === activeId)
    const target = activeId === null ? CONNECTOR_IDLE : connected ? C_ACCENT : CONNECTOR_DIM
    mat.color.lerp(target, 1 - Math.exp(-10 * delta))
    if (tier === "full") {
      const t = (state.clock.elapsedTime - born.current - 0.6) / 0.8
      mat.opacity = THREE.MathUtils.clamp(t, 0, 1)
    }
  })
  return (
    <Line
      ref={line}
      points={CONNECTOR_POINTS[index]}
      color={CONNECTOR_IDLE}
      lineWidth={edge.async ? 1.1 : 1.3}
      dashed={edge.async}
      dashSize={0.18}
      gapSize={0.1}
      transparent
      opacity={tier === "full" ? 0 : 1}
      raycast={noRaycast}
    />
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Packets                                                                                     */
/* ------------------------------------------------------------------------------------------ */

function Packets({ tier, progressRef, pulses, born }) {
  const mesh = useRef()
  const count = tier === "full" ? 20 : PACKETS_STATIC.length
  const state = useMemo(
    () =>
      tier === "full" ? createPackets(EDGES, count) : createPacketsFrom(EDGES, PACKETS_STATIC),
    [tier, count]
  )
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3() }), [])
  const hooks = useMemo(
    () => ({
      onArrive: (nodeId) => {
        pulses.current[nodeId] = 1
      },
    }),
    [pulses]
  )

  useFrame((frame, dt) => {
    if (!mesh.current) return
    const delta = Math.min(dt, 0.05)
    const started = tier !== "full" || frame.clock.elapsedTime - born.current > 1.4
    if (started) stepPackets(state, delta, hooks)

    const { id: activeId } = activeNodeStore.getSnapshot()
    for (let i = 0; i < state.length; i += 1) {
      const packet = state[i]
      const edge = EDGES[packet.edge]
      const samples = edgeSamples(edge, 64)
      const n = samples.length / 3 - 1
      const f = THREE.MathUtils.clamp(packet.t, 0, 1) * n
      const i0 = Math.min(n - 1, Math.floor(f))
      const u = f - i0
      const a = i0 * 3
      const b = a + 3
      tmp.p.set(
        samples[a] + (samples[b] - samples[a]) * u,
        samples[a + 1] + (samples[b + 1] - samples[a + 1]) * u,
        samples[a + 2] + (samples[b + 2] - samples[a + 2]) * u
      )
      const onActive = activeId !== null && (edge.from === activeId || edge.to === activeId)
      const s = started ? (onActive ? 1.4 : 1) : 0
      tmp.m.makeScale(s, s, s).setPosition(tmp.p)
      mesh.current.setMatrixAt(i, tmp.m)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.material.opacity = 1 - THREE.MathUtils.clamp(progressRef.current ?? 0, 0, 1)
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
      raycast={noRaycast}
    >
      <sphereGeometry args={[0.055, 10, 8]} />
      <meshBasicMaterial color={ACCENT} transparent toneMapped={false} />
    </instancedMesh>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Active footprint                                                                            */
/* ------------------------------------------------------------------------------------------ */

const NODE_INDEX = Object.fromEntries(NODES.map((n) => [n.id, n]))

/* ------------------------------------------------------------------------------------------ */
/* "Run a request" — the scripted trace packet with a comet trail                             */
/* ------------------------------------------------------------------------------------------ */

const TRACE_HEADS = 2 // scenarios fan out to at most two concurrent spans
const TRAIL = 7
const TRAIL_STEP = 0.028 // parametric distance between trail beads
const TRACE_INSTANCES = TRACE_HEADS * (1 + TRAIL)

function samplePoint(samples, t, out) {
  const n = samples.length / 3 - 1
  const f = THREE.MathUtils.clamp(t, 0, 1) * n
  const i0 = Math.min(n - 1, Math.floor(f))
  const u = f - i0
  const a = i0 * 3
  const b = a + 3
  return out.set(
    samples[a] + (samples[b] - samples[a]) * u,
    samples[a + 1] + (samples[b + 1] - samples[a + 1]) * u,
    samples[a + 2] + (samples[b + 2] - samples[a + 2]) * u
  )
}

function TracePacket({ pulses, progressRef }) {
  const mesh = useRef()
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3() }), [])
  const lastActive = useRef(null)

  useFrame(() => {
    const inst = mesh.current
    if (!inst) return
    const snap = traceStore.getSnapshot()
    let packets = []
    if (snap.status === "running") {
      const result = traceStore.tick(performance.now())
      if (result) {
        packets = result.packets
        if (result.arrivals) {
          for (const span of snap.run.spans) if (span.arrived) pulses.current[span.to] = 1
        }
        // Light the hop's destination so the diagram and readout follow the request.
        const lead = packets[0]?.span ?? null
        const target = lead ? lead.to : null
        if (target !== lastActive.current) {
          lastActive.current = target
          if (target) activeNodeStore.setActive(target, { source: "trace" })
          else if (activeNodeStore.getSnapshot().source === "trace") {
            activeNodeStore.clear({ force: true })
          }
        }
      }
    } else if (lastActive.current) {
      lastActive.current = null
      if (activeNodeStore.getSnapshot().source === "trace") activeNodeStore.clear({ force: true })
    }

    let i = 0
    for (let h = 0; h < TRACE_HEADS; h += 1) {
      const packet = packets[h]
      for (let k = 0; k <= TRAIL; k += 1, i += 1) {
        if (!packet) {
          tmp.m.makeScale(0, 0, 0)
          inst.setMatrixAt(i, tmp.m)
          continue
        }
        const samples = edgeSamples(EDGES[packet.edge], 64)
        const back = packet.reverse ? -k * TRAIL_STEP : k * TRAIL_STEP
        samplePoint(samples, packet.t - back, tmp.p)
        const s = k === 0 ? 1.9 : 1.4 * (1 - k / (TRAIL + 1))
        tmp.m.makeScale(s, s, s).setPosition(tmp.p)
        inst.setMatrixAt(i, tmp.m)
      }
    }
    inst.instanceMatrix.needsUpdate = true
    inst.material.opacity = 1 - THREE.MathUtils.clamp(progressRef.current ?? 0, 0, 1)
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, TRACE_INSTANCES]}
      frustumCulled={false}
      raycast={noRaycast}
    >
      <sphereGeometry args={[0.055, 12, 10]} />
      <meshBasicMaterial color={ACCENT} transparent toneMapped={false} />
    </instancedMesh>
  )
}

function Footprint() {
  const mesh = useRef()
  useFrame((_, dt) => {
    if (!mesh.current) return
    const delta = Math.min(dt, 0.05)
    const { id } = activeNodeStore.getSnapshot()
    const node = id ? NODE_INDEX[id] : null
    if (node) {
      const s = FOOTPRINT_SCALE[node.kind] ?? 1
      mesh.current.position.set(node.pos[0], 0.004, node.pos[2])
      mesh.current.scale.setScalar(s * 1.15)
    }
    const mat = mesh.current.material
    mat.opacity = damp(mat.opacity, node ? 0.9 : 0, 8, delta)
  })
  return (
    <mesh ref={mesh} rotation-x={-Math.PI / 2} raycast={noRaycast}>
      <ringGeometry args={[0.55, 0.62, 48]} />
      <meshBasicMaterial color={ACCENT} transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Camera + rig                                                                                */
/* ------------------------------------------------------------------------------------------ */

const LOOK = new THREE.Vector3(0.4, 0.3, 0)

function CameraRig({ tier, progressRef, pointerRef, rig }) {
  const base = useMemo(
    () => (tier === "full" ? new THREE.Vector3(13, 10.5, 13) : new THREE.Vector3(9, 14, 9)),
    [tier]
  )
  const plan = useMemo(() => new THREE.Vector3(6, 21, 6), [])
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3() }), [])
  const look = useRef({ yaw: 0, pitch: 0 })

  useFrame((state, dt) => {
    // Read the camera from frame state: drei's makeDefault camera replaces the initial one
    // after first render, so a camera captured at render time would be the wrong object.
    const { camera, size } = state
    const delta = Math.min(dt, 0.05)
    const aspect = size.width / Math.max(1, size.height)
    const fit = Math.max(1, 1.3 / aspect)
    const p = easeInOut(THREE.MathUtils.clamp(progressRef.current ?? 0, 0, 1))

    tmp.a.copy(base).multiplyScalar(fit)
    tmp.b.copy(plan).multiplyScalar(fit)
    camera.position.lerpVectors(tmp.a, tmp.b, p)
    camera.lookAt(LOOK)

    if (rig.current) {
      const pointer = pointerRef.current ?? { x: 0, y: 0 }
      const t = state.clock.elapsedTime
      look.current.yaw = damp(look.current.yaw, pointer.x * 0.1, 4, delta)
      look.current.pitch = damp(look.current.pitch, -pointer.y * 0.045, 4, delta)
      const sway = Math.sin((t * Math.PI * 2) / 14) * 0.05
      rig.current.rotation.y = sway + look.current.yaw
      rig.current.rotation.x = look.current.pitch
    }
  })
  return null
}

/* ------------------------------------------------------------------------------------------ */
/* Scene root                                                                                  */
/* ------------------------------------------------------------------------------------------ */

function Diagram({ tier, progressRef, pointerRef, perfLevel, visible }) {
  const rig = useRef()
  const gradient = useToonGradient()
  const pulses = useRef({})
  const born = useRef(0)
  const [entranceDone, setEntranceDone] = useState(tier !== "full")

  // (Re)start the entrance each time the hero becomes visible: on mount, and again when the
  // visitor scrolls back to the top, so the diagram re-assembles like on a fresh load.
  // The clock is paused while off-screen (frameloop "never"), so the real start time is
  // stamped on the first frame after resuming; until then `Infinity` keeps everything at its
  // pre-entrance state instead of flashing the finished diagram for a frame.
  useLayoutEffect(() => {
    if (!visible) return
    born.current = Infinity
    if (tier === "full") setEntranceDone(false)
  }, [visible, tier])

  useFrame((state) => {
    if (born.current === Infinity) born.current = state.clock.elapsedTime
  })

  useEffect(() => {
    if (tier !== "full" || !visible) return undefined
    const id = window.setTimeout(() => setEntranceDone(true), 1500)
    return () => window.clearTimeout(id)
  }, [tier, visible])

  const glass = LLM_GLASS && tier === "full" && perfLevel < 2
  const glassQuality =
    perfLevel >= 1 ? { resolution: 384, samples: 4 } : { resolution: 512, samples: 6 }

  return (
    <>
      <PerspectiveCamera makeDefault fov={24} near={1} far={80} position={[13, 10.5, 13]} />
      <CameraRig tier={tier} progressRef={progressRef} pointerRef={pointerRef} rig={rig} />

      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 8, 3]} intensity={1.35} />
      {glass ? (
        <Environment resolution={64} frames={1}>
          <Lightformer
            form="rect"
            intensity={1.2}
            scale={[4, 4, 1]}
            position={[0, 5, 0]}
            rotation-x={-Math.PI / 2}
          />
          <Lightformer
            form="rect"
            intensity={0.6}
            scale={[2, 6, 1]}
            position={[-5, 2, 0]}
            rotation-y={Math.PI / 2}
          />
          <Lightformer
            form="rect"
            intensity={1}
            color="#0B0D10"
            scale={[6, 2, 1]}
            position={[0, 1, -6]}
          />
        </Environment>
      ) : null}

      <group ref={rig}>
        <Grid
          args={[14, 10]}
          position={[0.4, -0.001, 0]}
          cellSize={0.5}
          cellThickness={0.6}
          cellColor="#E3E5E1"
          sectionSize={2.5}
          sectionThickness={1}
          sectionColor="#CDD0CB"
          fadeDistance={60}
          fadeStrength={1}
          raycast={noRaycast}
        />
        {entranceDone ? (
          <ContactShadows
            frames={1}
            resolution={tier === "full" ? 512 : 256}
            scale={16}
            blur={2.6}
            far={3}
            opacity={0.18}
            position={[0.4, 0, 0]}
          />
        ) : null}

        {EDGES.map((edge, i) => (
          <Connector
            key={`${edge.from}-${edge.to}-${i}`}
            edge={edge}
            index={i}
            tier={tier}
            born={born}
          />
        ))}
        {NODES.map((node, i) => (
          <Node
            key={node.id}
            node={node}
            index={i}
            tier={tier}
            gradient={gradient}
            pulses={pulses}
            born={born}
            glass={glass}
            glassQuality={glassQuality}
          />
        ))}
        <Packets tier={tier} progressRef={progressRef} pulses={pulses} born={born} />
        <TracePacket pulses={pulses} progressRef={progressRef} />
        <Footprint />
      </group>
    </>
  )
}

/**
 * True while ≥ 5 % of the hero is in the viewport. Hidden tabs need no extra gate: browsers
 * stop requestAnimationFrame there, which halts R3F's loop on its own.
 */
function useHeroVisible(eventSource) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = eventSource?.current
    if (!el || typeof IntersectionObserver === "undefined") return undefined
    const io = new IntersectionObserver(([entry]) => setVisible(entry.intersectionRatio >= 0.05), {
      threshold: [0, 0.05],
    })
    io.observe(el)
    return () => io.disconnect()
  }, [eventSource])
  return visible
}

export default function ArchitectureScene({ tier, eventSource, progressRef, pointerRef, onReady }) {
  const visible = useHeroVisible(eventSource)
  const [perfLevel, setPerfLevel] = useState(0)
  const full = tier === "full"
  const dpr = full && perfLevel === 0 ? [1, 1.5] : 1

  return (
    <Canvas
      dpr={dpr}
      flat
      frameloop={visible ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      eventSource={eventSource}
      onCreated={(state) => {
        state.gl.setClearAlpha(0)
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
        window.requestAnimationFrame(() => onReady?.())
      }}
      onPointerMissed={(event) => {
        if (event.target instanceof Element && event.target.closest("[data-hero-stage]")) {
          activeNodeStore.clear({ force: true })
        }
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      {full ? (
        <PerformanceMonitor
          flipflops={2}
          onDecline={() => setPerfLevel((l) => Math.min(2, l + 1))}
          onFallback={() => setPerfLevel(2)}
        />
      ) : null}
      <Diagram
        tier={tier}
        progressRef={progressRef}
        pointerRef={pointerRef}
        perfLevel={perfLevel}
        visible={visible}
      />
    </Canvas>
  )
}

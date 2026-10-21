import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { Edges, MeshTransmissionMaterial } from "@react-three/drei"
import * as THREE from "three"
import { GRAPH_INNER, INK, PAGE_BG } from "./architecture.js"
import { noRaycast } from "./nodeMaterials.js"

/**
 * The thirteen component shapes of Fig. 0 as reusable R3F pieces (design-spec §6.3 item 8).
 * Shared by the hero scene and the smaller section figures (src/three/figures.jsx) so every
 * 3D object on the site speaks the same drawn vocabulary: white toon solids, ink edges.
 */

export function NodeShape({ node, material, addEdge, glass, glassQuality, wireRef }) {
  const edgeProps = { color: INK, lineWidth: 1, threshold: 25 }
  switch (node.kind) {
    case "card":
      return (
        <mesh material={material} raycast={noRaycast}>
          <boxGeometry args={[1.2, 0.75, 0.06]} />
          <Edges ref={addEdge} {...edgeProps} />
        </mesh>
      )
    case "ring":
      return (
        <mesh material={material} rotation-x={Math.PI / 2} raycast={noRaycast}>
          <torusGeometry args={[0.42, 0.05, 12, 48]} />
        </mesh>
      )
    case "capsule":
      return (
        <mesh material={material} rotation-z={Math.PI / 2} raycast={noRaycast}>
          <capsuleGeometry args={[0.12, 0.6, 4, 12]} />
        </mesh>
      )
    case "box":
    case "box-sm": {
      const s = node.kind === "box" ? [1.0, 0.5, 1.0] : [0.8, 0.4, 0.8]
      return (
        <mesh material={material} raycast={noRaycast}>
          <boxGeometry args={s} />
          <Edges ref={addEdge} {...edgeProps} />
        </mesh>
      )
    }
    case "queue":
      return (
        <mesh material={material} rotation-z={Math.PI / 2} raycast={noRaycast}>
          <cylinderGeometry args={[0.28, 0.28, 2.4, 32]} />
          <Edges ref={addEdge} {...edgeProps} />
        </mesh>
      )
    case "cluster":
      return (
        <group position-y={-0.25}>
          <mesh material={material} position-y={0.04} raycast={noRaycast}>
            <boxGeometry args={[0.9, 0.08, 0.9]} />
            <Edges ref={addEdge} {...edgeProps} />
          </mesh>
          {[
            [-0.25, 0.23, 0.2],
            [0.25, 0.23, 0.2],
            [0, 0.23, -0.22],
          ].map((p) => (
            <mesh key={p.join()} material={material} position={p} raycast={noRaycast}>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <Edges ref={addEdge} {...edgeProps} />
            </mesh>
          ))}
        </group>
      )
    case "glass":
      return (
        <mesh material={glass ? undefined : material} raycast={noRaycast}>
          <icosahedronGeometry args={[0.5, 0]} />
          {glass ? (
            <MeshTransmissionMaterial
              transmission={1}
              thickness={0.5}
              roughness={0.12}
              ior={1.45}
              chromaticAberration={0.012}
              anisotropicBlur={0.1}
              distortion={0}
              samples={glassQuality.samples}
              resolution={glassQuality.resolution}
              background={new THREE.Color(PAGE_BG)}
            />
          ) : null}
          <Edges ref={addEdge} color={INK} lineWidth={1} threshold={1} />
        </mesh>
      )
    case "db":
      return (
        <mesh material={material} raycast={noRaycast}>
          <cylinderGeometry args={[0.42, 0.42, 0.7, 32]} />
          <Edges ref={addEdge} {...edgeProps} />
        </mesh>
      )
    case "square":
      return (
        <mesh material={material} raycast={noRaycast}>
          <boxGeometry args={[0.8, 0.06, 0.8]} />
          <Edges ref={addEdge} {...edgeProps} />
        </mesh>
      )
    case "graph":
      return <GraphShape material={material} wireRef={wireRef} />
    case "lattice":
      return <LatticeShape addEdge={addEdge} />
    default:
      return null
  }
}

function GraphShape({ material, wireRef }) {
  const inner = useRef()
  const links = useMemo(() => {
    const positions = []
    for (const [a, b] of GRAPH_INNER.links) {
      positions.push(...GRAPH_INNER.points[a], ...GRAPH_INNER.points[b])
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [])
  useEffect(() => () => links.dispose(), [links])

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    GRAPH_INNER.points.forEach((p, i) => {
      m.makeTranslation(p[0], p[1], p[2])
      inner.current.setMatrixAt(i, m)
    })
    inner.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group>
      <mesh raycast={noRaycast}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial ref={wireRef} wireframe color={INK} transparent opacity={0.9} />
      </mesh>
      <instancedMesh
        ref={inner}
        args={[undefined, undefined, GRAPH_INNER.points.length]}
        material={material}
        raycast={noRaycast}
      >
        <sphereGeometry args={[0.05, 10, 8]} />
      </instancedMesh>
      <lineSegments geometry={links} raycast={noRaycast}>
        <lineBasicMaterial color={INK} />
      </lineSegments>
    </group>
  )
}

function LatticeShape({ addEdge }) {
  const geometry = useMemo(() => {
    const positions = []
    const steps = 5
    for (let x = 0; x < steps; x += 1)
      for (let y = 0; y < steps; y += 1)
        for (let z = 0; z < steps; z += 1) {
          const f = (v) => -0.32 + (v * 0.64) / (steps - 1)
          positions.push(f(x), f(y), f(z))
        }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group>
      <points geometry={geometry} raycast={noRaycast}>
        <pointsMaterial size={0.035} color="#646A72" sizeAttenuation />
      </points>
      <mesh raycast={noRaycast}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        <Edges ref={addEdge} color={INK} lineWidth={1} threshold={25} />
      </mesh>
    </group>
  )
}

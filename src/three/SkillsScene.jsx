// SkillsScene.jsx — 3D floating skill orbs background
import { useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Text, Float, MeshDistortMaterial, Sparkles } from "@react-three/drei"
import * as THREE from "three"

const ITEMS = [
  { label:"React",      color:"#61DAFB", pos:[-3.6, 1.3, 0],   s:0.54 },
  { label:"Node.js",    color:"#68A063", pos:[-1.2, 2.1, -1],  s:0.47 },
  { label:"Python",     color:"#3776AB", pos:[ 1.5, 2.0,  0],  s:0.5  },
  { label:"MongoDB",    color:"#47A248", pos:[ 3.5, 1.1, -0.5],s:0.51 },
  { label:"FastAPI",    color:"#009688", pos:[-3.3,-1.0, -0.5],s:0.44 },
  { label:"Gemini AI",  color:"#4285F4", pos:[-0.8,-1.9,  0],  s:0.57 },
  { label:"TypeScript", color:"#3178C6", pos:[ 2.2,-1.5, -0.8],s:0.45 },
  { label:"Tailwind",   color:"#06B6D4", pos:[ 0.2, 0.5,  1.2],s:0.49 },
  { label:"JWT",        color:"#d63aff", pos:[-1.8, 0.4, -1.5],s:0.41 },
]

function SkillOrb({ label, color, pos, s, index }) {
  const ref = useRef()
  useFrame(st => {
    if (!ref.current) return
    const t = st.clock.elapsedTime + index * 1.1
    ref.current.position.y = pos[1] + Math.sin(t * 0.65) * 0.2
    ref.current.rotation.y = t * 0.32
  })
  return (
    <group ref={ref} position={pos}>
      <Float floatIntensity={0.28} speed={1.4 + index * 0.18}>
        <mesh>
          <sphereGeometry args={[s, 28, 28]} />
          <MeshDistortMaterial color={color} emissive={color} emissiveIntensity={0.32}
            distort={0.22} speed={2} roughness={0.22} metalness={0.4}
            transparent opacity={0.75} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[s + 0.17, 0.013, 8, 60]} />
          <meshBasicMaterial color={color} transparent opacity={0.48} />
        </mesh>
        <Text position={[0, -(s + 0.27), 0]} fontSize={0.2} color="#ffffff"
          anchorX="center" anchorY="middle"
          outlineWidth={0.007} outlineColor="#000000">
          {label}
        </Text>
      </Float>
    </group>
  )
}

function BigRing() {
  const ref = useRef()
  useFrame(s => {
    if (!ref.current) return
    ref.current.rotation.x = s.clock.elapsedTime * 0.12
    ref.current.rotation.y = s.clock.elapsedTime * 0.08
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[5.2, 0.016, 8, 160]} />
      <meshBasicMaterial color="#00FF94" transparent opacity={0.12} />
    </mesh>
  )
}

export default function SkillsScene() {
  return (
    <Canvas camera={{ position: [0, 0, 9.5], fov: 58 }}
      dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", width: "100%", height: "100%" }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 6]}  intensity={1.5} color="#00FF94" />
      <pointLight position={[5, 3, 3]}  intensity={1.2} color="#00D4FF" />
      <BigRing />
      <Suspense fallback={null}>
        {ITEMS.map((it, i) => <SkillOrb key={it.label} {...it} index={i} />)}
      </Suspense>
      <Sparkles count={55} scale={12} size={2} speed={0.28} color="#00FF94" opacity={0.3} />
    </Canvas>
  )
}

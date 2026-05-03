// ProfileScene.jsx — Dramatic 3D photo card with holographic rings
import { useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useTexture, Sparkles, MeshDistortMaterial } from "@react-three/drei"
import * as THREE from "three"

function HoloCard() {
  const groupRef  = useRef()
  const ring1     = useRef()
  const ring2     = useRef()
  const ring3     = useRef()
  const scanRef   = useRef()
  const glowRef   = useRef()

  const tex = useTexture("/photos/hero.jpg")
  const W = 2.8, H = 3.6

  useFrame(s => {
    const t = s.clock.elapsedTime

    // Gentle float + subtle sway
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.12
      groupRef.current.rotation.y = Math.sin(t * 0.35) * 0.08
      groupRef.current.rotation.z = Math.sin(t * 0.28) * 0.03
    }

    // Ring rotations — each axis different
    if (ring1.current) { ring1.current.rotation.x = t * 0.5;  ring1.current.rotation.z = t * 0.18 }
    if (ring2.current) { ring2.current.rotation.y = -t * 0.38; ring2.current.rotation.x = t * 0.22 }
    if (ring3.current) { ring3.current.rotation.z = t * 0.28; ring3.current.rotation.y = t * 0.14 }

    // Scan sweep
    if (scanRef.current) {
      const sy = ((t * 0.55) % 1) * H - H / 2
      scanRef.current.position.y = sy
      scanRef.current.material.opacity = 0.07 + Math.sin(t * 3) * 0.025
    }

    // Breathing glow
    if (glowRef.current) {
      const p = (Math.sin(t * 1.4) + 1) * 0.5
      glowRef.current.material.emissiveIntensity = 0.3 + p * 0.5
    }
  })

  return (
    <group ref={groupRef}>
      {/* Background glow halo */}
      <mesh position={[0, 0, -0.8]}>
        <planeGeometry args={[W+3.5, H+3.5]}/>
        <meshBasicMaterial color="#00FF94" transparent opacity={0.04}
          blending={THREE.AdditiveBlending} depthWrite={false}/>
      </mesh>

      {/* Frame body */}
      <mesh>
        <boxGeometry args={[W+0.18, H+0.18, 0.05]}/>
        <meshStandardMaterial color="#080808" roughness={0.1} metalness={0.9}
          emissive="#00FF94" emissiveIntensity={0.06}/>
      </mesh>

      {/* Glowing border */}
      <mesh ref={glowRef}>
        <boxGeometry args={[W+0.24, H+0.24, 0.025]}/>
        <meshStandardMaterial color="#00FF94" emissive="#00FF94"
          emissiveIntensity={0.3} transparent opacity={0.25}/>
      </mesh>

      {/* Photo */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[W, H]}/>
        <meshBasicMaterial map={tex} toneMapped={false}/>
      </mesh>

      {/* Scan sweep */}
      <mesh ref={scanRef} position={[0, 0, 0.06]}>
        <planeGeometry args={[W, 0.22]}/>
        <meshBasicMaterial color="#00FF94" transparent opacity={0.07}
          blending={THREE.AdditiveBlending} depthWrite={false}/>
      </mesh>

      {/* Corner HUD brackets */}
      {[[-W/2,-H/2,-1,-1], [W/2,-H/2,1,-1], [W/2,H/2,1,1], [-W/2,H/2,-1,1]].map(([cx,cy,sx,sy],k)=>(
        <group key={k} position={[cx, cy, 0.07]}>
          <mesh position={[sx*0.22, 0, 0]}><boxGeometry args={[0.44,0.022,0.022]}/><meshBasicMaterial color="#00FF94" opacity={0.95} transparent/></mesh>
          <mesh position={[0, sy*0.22, 0]}><boxGeometry args={[0.022,0.44,0.022]}/><meshBasicMaterial color="#00FF94" opacity={0.95} transparent/></mesh>
        </group>
      ))}

      {/* Bottom status bar */}
      <mesh position={[0, -H/2 - 0.07, 0.04]}>
        <planeGeometry args={[W, 0.08]}/>
        <meshBasicMaterial color="#00FF94" transparent opacity={0.22}/>
      </mesh>

      {/* ── HOLOGRAPHIC ORBIT RINGS ── */}
      {/* Ring 1 — large tilt */}
      <mesh ref={ring1} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[2.55, 0.02, 8, 128]}/>
        <meshBasicMaterial color="#00FF94" transparent opacity={0.55}/>
      </mesh>

      {/* Ring 2 — angled */}
      <mesh ref={ring2} rotation={[Math.PI/3, 0, 0]}>
        <torusGeometry args={[2.85, 0.014, 8, 128]}/>
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.38}/>
      </mesh>

      {/* Ring 3 — counter */}
      <mesh ref={ring3} rotation={[Math.PI/6, Math.PI/4, 0]}>
        <torusGeometry args={[3.15, 0.01, 8, 128]}/>
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.25}/>
      </mesh>

      {/* Dashed outer ring */}
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[3.6, 0.008, 4, 64]}/>
        <meshBasicMaterial color="#00FF94" transparent opacity={0.12}/>
      </mesh>

      {/* Central face distort orb (very small, behind card) */}
      <mesh position={[0, 0, -1.2]}>
        <sphereGeometry args={[0.55, 24, 24]}/>
        <MeshDistortMaterial color="#00FF94" emissive="#00FF94" emissiveIntensity={0.7}
          distort={0.55} speed={3} transparent opacity={0.3}/>
      </mesh>
    </group>
  )
}

export default function ProfileScene() {
  return (
    <Canvas camera={{ position:[0, 0, 7], fov:48 }}
      dpr={[1,2]} gl={{ antialias:true, alpha:true }}
      style={{ background:"transparent", width:"100%", height:"100%" }}>
      <ambientLight intensity={0.25}/>
      <pointLight position={[5,  5, 5]}  intensity={3.0} color="#00FF94"/>
      <pointLight position={[-5,-4, 4]}  intensity={2.5} color="#00D4FF"/>
      <directionalLight position={[0, 6, 6]} intensity={1.2}/>
      <Suspense fallback={null}>
        <HoloCard/>
      </Suspense>
      <Sparkles count={45} scale={8} size={2.2} speed={0.28} color="#00FF94" opacity={0.45}/>
    </Canvas>
  )
}

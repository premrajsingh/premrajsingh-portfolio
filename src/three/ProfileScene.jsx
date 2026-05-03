// ProfileScene.jsx — Elegant floating 3D photo card
import { useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sparkles, Float, RoundedBox, Image } from "@react-three/drei"
import * as THREE from "three"

function ElegantAvatar() {
  const groupRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.12
      groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.06
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={2.5} rotationIntensity={0.15} floatIntensity={0.6}>
        {/* The Photo itself using Drei's Image which handles UVs and rounding perfectly */}
        <Image url="/photos/hero.jpg" transparent radius={0.3} position={[0, 0, 0.05]} scale={[3.0, 3.8]} />
        
        {/* Physical backplate / frame for the photo */}
        <RoundedBox args={[3.0, 3.8, 0.04]} radius={0.3} smoothness={8} position={[0, 0, 0]}>
          <meshStandardMaterial color="#080808" roughness={0.4} metalness={0.8} />
        </RoundedBox>
        
        {/* Elegant glowing accent rim */}
        <RoundedBox args={[3.15, 3.95, 0.02]} radius={0.35} smoothness={8} position={[0, 0, -0.05]}>
          <meshBasicMaterial color="#00FF94" transparent opacity={0.3} blending={THREE.AdditiveBlending}/>
        </RoundedBox>
        
        {/* Secondary soft aura (Cyan) */}
        <RoundedBox args={[3.3, 4.1, 0.01]} radius={0.4} smoothness={8} position={[0, 0, -0.1]}>
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.1} blending={THREE.AdditiveBlending}/>
        </RoundedBox>

        {/* Outer ambient glow */}
        <mesh position={[0, 0, -0.4]}>
          <planeGeometry args={[6, 7]} />
          <meshBasicMaterial color="#00FF94" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </Float>
    </group>
  )
}

export default function ProfileScene() {
  return (
    <Canvas camera={{ position:[0, 0, 7.5], fov:45 }}
      dpr={[1,2]} gl={{ antialias:true, alpha:true }}
      style={{ background:"transparent", width:"100%", height:"100%" }}>
      <ambientLight intensity={0.7}/>
      <spotLight position={[5, 8, 5]} intensity={2.0} angle={0.5} penumbra={1} color="#ffffff"/>
      <pointLight position={[-4, -4, 4]} intensity={2.0} color="#00FF94"/>
      <pointLight position={[4, -4, -4]} intensity={1.5} color="#00D4FF"/>
      <Suspense fallback={null}>
        <ElegantAvatar/>
      </Suspense>
      <Sparkles count={55} scale={8} size={2.5} speed={0.4} color="#00FF94" opacity={0.4}/>
    </Canvas>
  )
}

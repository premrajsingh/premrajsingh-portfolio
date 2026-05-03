// HeroScene.jsx — RESTORED LAYOUT WITH SCROLLING
import { useRef, useMemo, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useTexture, Sparkles, MeshDistortMaterial } from "@react-three/drei"
import * as THREE from "three"

/* ─── PARTICLES ─── */
function Particles({ count = 500 }) {
  const ref = useRef()
  const pos = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      a[i*3]   = (Math.random()-0.5) * 32
      a[i*3+1] = (Math.random()-0.5) * 18
      a[i*3+2] = (Math.random()-0.5) * 12
    }
    return a
  }, [count])
  useFrame(s => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.008 })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={pos} count={count} itemSize={3}/>
      </bufferGeometry>
      <pointsMaterial size={0.03} sizeAttenuation transparent opacity={0.38}
        color="#00FF94" blending={THREE.AdditiveBlending} depthWrite={false}/>
    </points>
  )
}

/* ─── HUD CORNER BRACKETS ─── */
function Brackets({ W, H, color }) {
  const L = 0.42, T = 0.022
  return (
    <>
      {[[-W/2,-H/2,-1,-1],[W/2,-H/2,1,-1],[W/2,H/2,1,1],[-W/2,H/2,-1,1]].map(([cx,cy,sx,sy],k)=>(
        <group key={k} position={[cx, cy, 0.08]}>
          <mesh position={[sx*L/2, 0, 0]}>
            <boxGeometry args={[L, T, T]}/>
            <meshBasicMaterial color={color} transparent opacity={0.95}/>
          </mesh>
          <mesh position={[0, sy*L/2, 0]}>
            <boxGeometry args={[T, L, T]}/>
            <meshBasicMaterial color={color} transparent opacity={0.95}/>
          </mesh>
        </group>
      ))}
    </>
  )
}

/* ─── ORIGINAL SLOTS ─── */
const SLOTS = [
  { d:-2, x:-4.6, y: 0.5, z:-3.4, ry: 0.60, rx: 0.04, s:0.62 }, // Far Left
  { d:-1, x:-1.8, y: 0.3, z:-1.6, ry: 0.38, rx: 0.00, s:0.80 }, // Left
  { d: 0, x: 1.8, y: 0.1, z: 0.0, ry:-0.06, rx:-0.03, s:1.00 }, // Center
  { d: 1, x: 5.4, y: 0.0, z:-1.6, ry:-0.38, rx: 0.00, s:0.80 }, // Right
  { d: 2, x: 8.4, y:-0.2, z:-3.4, ry:-0.60, rx:-0.04, s:0.62 }  // Far Right
];

function getTransform(d) {
  if (d <= -2) {
    const over = -2 - d;
    return {
      pos: [-4.6 - over*4, 0.5, -3.4 - over*15],
      rotY: 0.60, rotX: 0.04,
      scale: Math.max(0, 0.62 - over*1.5)
    };
  }
  if (d >= 2) {
    const over = d - 2;
    return {
      pos: [8.4 + over*4, -0.2, -3.4 - over*15],
      rotY: -0.60, rotX: -0.04,
      scale: Math.max(0, 0.62 - over*1.5)
    };
  }
  
  const leftIdx = Math.floor(d) + 2; 
  const rightIdx = leftIdx + 1;
  const t = d - Math.floor(d);
  
  const L = SLOTS[leftIdx];
  const R = SLOTS[rightIdx];
  
  return {
    pos: [
      THREE.MathUtils.lerp(L.x, R.x, t),
      THREE.MathUtils.lerp(L.y, R.y, t),
      THREE.MathUtils.lerp(L.z, R.z, t)
    ],
    rotY: THREE.MathUtils.lerp(L.ry, R.ry, t),
    rotX: THREE.MathUtils.lerp(L.rx, R.rx, t),
    scale: THREE.MathUtils.lerp(L.s, R.s, t)
  };
}

/* ─── SINGLE PHOTO CARD ─── */
function DepthCard({ url, physicalIndex, floatDelay=0, scrollIndexRef, targetIndexRef, glowColor="#00FF94" }) {
  const groupRef = useRef()
  const glowRef  = useRef()
  const scanRef  = useRef()
  const tex = useTexture(url)

  const aspect = tex.image ? tex.image.width / tex.image.height : 0.72
  const H = 3.2 
  const W = H * aspect

  useFrame(s => {
    if (!groupRef.current) return
    const t = s.clock.elapsedTime
    
    // Calculate circular distance from active center
    const scrollPos = scrollIndexRef.current
    let distance = (physicalIndex - scrollPos) % 5;
    if (distance > 2.5) distance -= 5;
    if (distance < -2.5) distance += 5;
    
    const tf = getTransform(distance)
    
    // Add subtle float
    const floatY = tf.pos[1] + Math.sin(t * 0.42 + floatDelay) * 0.13

    // Smooth Lerp Animations
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, tf.pos[0], 0.1)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, floatY, 0.1)
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, tf.pos[2], 0.1)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, tf.rotY, 0.1)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, tf.rotX, 0.1)
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, tf.scale, 0.1))

    if (glowRef.current) {
      const absD = Math.abs(distance)
      const focusPulse = (1 - Math.min(absD, 1)) * 0.5 
      const timePulse = (Math.sin(t * 1.3) + 1) * 0.5
      glowRef.current.material.emissiveIntensity = 0.1 + focusPulse + timePulse * 0.3
    }
    if (scanRef.current) {
      scanRef.current.position.y = ((t * 0.5 + floatDelay * 0.2) % 1) * H - H/2
      scanRef.current.material.opacity = 0.03 + Math.sin(t*2)*0.02
    }
  })

  return (
    <group ref={groupRef}
      onPointerOver={(e) => { 
        e.stopPropagation(); 
        const currentMod = ((targetIndexRef.current % 5) + 5) % 5;
        let diff = physicalIndex - currentMod;
        if (diff > 2.5) diff -= 5;
        if (diff < -2.5) diff += 5;
        targetIndexRef.current += diff;
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}>
      <mesh position={[0, 0, -0.15]}>
        <planeGeometry args={[W+2.2, H+2.2]}/>
        <meshBasicMaterial color={glowColor} transparent opacity={0.03}
          blending={THREE.AdditiveBlending} depthWrite={false}/>
      </mesh>
      <mesh position={[0, 0, -0.025]}>
        <boxGeometry args={[W+0.2, H+0.2, 0.055]}/>
        <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.92}
          emissive={glowColor} emissiveIntensity={0.05}/>
      </mesh>
      <mesh ref={glowRef} position={[0, 0, -0.022]}>
        <boxGeometry args={[W+0.27, H+0.27, 0.028]}/>
        <meshStandardMaterial color={glowColor} emissive={glowColor}
          emissiveIntensity={0.28} transparent opacity={0.24}/>
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[W, H]}/>
        <meshBasicMaterial map={tex} toneMapped={false}/>
      </mesh>
      <mesh ref={scanRef} position={[0, 0, 0.055]}>
        <planeGeometry args={[W, 0.16]}/>
        <meshBasicMaterial color={glowColor} transparent opacity={0.055}
          blending={THREE.AdditiveBlending} depthWrite={false}/>
      </mesh>
      <Brackets W={W} H={H} color={glowColor}/>
      <mesh position={[0, -H/2 - 0.065, 0.04]}>
        <planeGeometry args={[W, 0.07]}/>
        <meshBasicMaterial color={glowColor} transparent opacity={0.2}/>
      </mesh>
    </group>
  )
}

/* ─── CARD LAYOUT ─── */
const CARDS = [
  { url:"/photos/hero.jpg",   physicalIndex: 2, delay:0,   color:"#00FF94" },
  { url:"/photos/photo7.jpg", physicalIndex: 1, delay:1.1, color:"#00D4FF" },
  { url:"/photos/photo5.jpg", physicalIndex: 3, delay:0.7, color:"#00FF94" },
  { url:"/photos/photo2.jpg", physicalIndex: 0, delay:1.8, color:"#8B5CF6" },
  { url:"/photos/photo9.jpg", physicalIndex: 4, delay:1.4, color:"#00D4FF" },
]

/* ─── CAMERA PARALLAX ─── */
function CamRig({ mx, my }) {
  useFrame((state) => {
    state.camera.position.x += (mx * 2.0 - state.camera.position.x) * 0.05
    state.camera.position.y += (-my * 2.0 - state.camera.position.y) * 0.05
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

/* ─── ACCENT ORBS ─── */
function AccentOrb({ position, color, size=0.22, speed=0.8, delay=0 }) {
  const ref = useRef()
  useFrame(s => {
    if (!ref.current) return
    const t = s.clock.elapsedTime * speed + delay
    ref.current.position.y = position[1] + Math.sin(t) * 0.28
    ref.current.rotation.y = t * 0.45
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 22, 22]}/>
      <MeshDistortMaterial color={color} emissive={color} emissiveIntensity={0.55}
        distort={0.45} speed={2.5} transparent opacity={0.58}/>
    </mesh>
  )
}

/* ─── MAIN EXPORT ─── */
function CarouselController({ scrollIndexRef, targetIndexRef }) {
  useFrame(() => {
    scrollIndexRef.current = THREE.MathUtils.lerp(scrollIndexRef.current, targetIndexRef.current, 0.08)
  })
  return null
}

export default function HeroScene({ mouseX=0, mouseY=0 }) {
  const targetIndexRef = useRef(2)
  const scrollIndexRef = useRef(2)

  return (
    <Canvas camera={{ position:[0, 0, 12], fov:55 }}
      dpr={[1,1.8]} gl={{ antialias:true, alpha:true, logarithmicDepthBuffer:true }}
      style={{ background:"transparent" }}>

      <ambientLight intensity={0.22}/>
      <directionalLight position={[5, 8, 7]}   intensity={1.1}  color="#ffffff"/>
      <pointLight      position={[-6, 4, 6]}   intensity={3.8}  color="#00FF94" distance={24}/>
      <pointLight      position={[ 9,-3, 5]}   intensity={2.8}  color="#00D4FF" distance={20}/>
      <pointLight      position={[ 2, 0, 10]}  intensity={1.5}  color="#ffffff"  distance={16}/>

      <CamRig mx={mouseX} my={mouseY} />
      <CarouselController scrollIndexRef={scrollIndexRef} targetIndexRef={targetIndexRef} />

      <group>
        <Suspense fallback={null}>
          {CARDS.map((c, i) => (
            <DepthCard key={i} physicalIndex={c.physicalIndex} floatDelay={c.delay} url={c.url} scrollIndexRef={scrollIndexRef} targetIndexRef={targetIndexRef} glowColor={c.color}/>
          ))}
        </Suspense>
      </group>

      <AccentOrb position={[-9, 2.5,-7]}  color="#00FF94" size={0.20} speed={0.72} delay={0}/>
      <AccentOrb position={[10.5,-2,-6]}  color="#00D4FF" size={0.17} speed={1.0}  delay={1.2}/>
      <AccentOrb position={[ 2, 5.5,-9]}  color="#8B5CF6" size={0.14} speed={0.58} delay={2.0}/>

      <Sparkles count={55} scale={22} size={1.4} speed={0.22} color="#00FF94" opacity={0.32}/>
      <Particles count={450}/>
    </Canvas>
  )
}

// src/components/AiSphere.jsx
import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, MeshTransmissionMaterial, Environment, Float, PresentationControls } from '@react-three/drei'
import * as THREE from 'three'

function RefractiveCube({ isLight }) {
  const mesh = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, Math.cos(t / 2) / 10 + state.mouse.y / 2, 0.05)
    mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, Math.sin(t / 2) / 10 + state.mouse.x / 2, 0.05)
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.8}>
      <RoundedBox ref={mesh} args={[2.9, 2.9, 2.9]} radius={0.14} smoothness={5}>
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0.2}
          chromaticAberration={0.08}
          anisotropy={0.3}
          distortion={0.5}
          distortionScale={0.2}
          temporalDistortion={0.1}
          transmission={1}
          ior={1.2}
          envMapIntensity={isLight ? 0.15 : 1.5}
          color={isLight ? "#f0f9ff" : "#93c5fd"}
          roughness={isLight ? 0.0 : 0.0}
          clearcoat={1}
          clearcoatRoughness={isLight ? 0.0 : 0.0}
        />
      </RoundedBox>
    </Float>
  )
}

export default function AISphere() {
  const [isLight, setIsLight] = useState(
    document.documentElement.classList.contains("light")
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains("light"))
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 25 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={isLight ? 1.2 : 0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />

        <PresentationControls
          global
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 6, Math.PI / 6]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <RefractiveCube isLight={isLight} />
        </PresentationControls>

        <Environment preset={isLight ? "dawn" : "city"} />
      </Canvas>
    </div>
  )
}
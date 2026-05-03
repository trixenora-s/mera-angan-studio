'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

function FloatingGeometry() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#4c1d95"
          emissiveIntensity={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  )
}

export default function DesktopHero3D() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />

      <FloatingGeometry />

      <Sparkles
        count={50}
        scale={[20, 20, 20]}
        size={2}
        speed={0.3}
        opacity={0.6}
        color="#fbbf24"
      />

      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <Text
          position={[0, -3, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          ✨ Premium Quality ✨
        </Text>
      </Float>
    </>
  )
}
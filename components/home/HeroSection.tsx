'use client'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Text, Sparkles } from '@react-three/drei'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const DesktopHero3D = dynamic(() => import('./DesktopHero3D'), { ssr: false })

export default function HeroSection() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/30 to-pink-900/20"
      />
      
      {/* 3D Canvas - Desktop Only */}
      {!isMobile && (
        <div className="absolute inset-0 z-10">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <Suspense fallback={null}>
              <DesktopHero3D />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Mobile Gradient Animation */}
      {isMobile && (
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(45deg, #1e3a8a 0%, #7c3aed 25%, #ec4899 50%, #1e3a8a 75%, #7c3aed 100%)',
              'linear-gradient(45deg, #ec4899 0%, #1e3a8a 25%, #7c3aed 50%, #ec4899 75%, #1e3a8a 100%)',
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center text-white px-4 py-20"
      >
        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6 leading-tight"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Make Every
          <br />
          <span className="text-6xl md:text-8xl lg:text-9xl">Moment</span>
          <br />
          Magical ✨
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-blue-100/90 max-w-3xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Premium decoration & event planning for every celebration. 
          From intimate gatherings to grand weddings.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link
            href="/events"
            className="group bg-white text-gray-900 px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-3"
          >
            <span>Explore Events</span>
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          
          <Link
            href="/gallery"
            className="group border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
          >
            View Gallery
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
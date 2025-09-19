'use client'

import { motion } from "framer-motion"

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center h-screen overflow-hidden">
      
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse z-10" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse z-10" />

      {/* Main Hero content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 px-6"
      >
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            Fetii AI
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-10">
          Empowering optimized analysis for riders, drivers, and companies. 
          Make smarter rideshare decisions with speed, clarity, and confidence.
        </p>

        {/* Animated Bot / Typing effect */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex items-center justify-center mb-10"
        >
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce text-white text-2xl">
            🤖
          </div>
          <div className="ml-4 text-left">
            <p className="text-white font-mono bg-gray-800/70 px-3 py-1 rounded shadow animate-pulse">
              Typing...
            </p>
          </div>
        </motion.div>

        {/* Call-to-action button */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <a
            href="/chat"
            className="px-8 py-3 text-white font-bold rounded-none border-2 border-purple-400 shadow-[0_0_10px_rgba(128,0,255,0.7)]
                       bg-gray-900/70
                       hover:shadow-[0_0_20px_rgba(255,0,255,0.8)] hover:scale-105 
                       transition-all duration-300"
          >
            Try it Now
          </a>
        </div>
      </motion.div>
    </section>
  )
}

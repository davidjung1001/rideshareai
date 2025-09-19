'use client'

import { motion } from "framer-motion"

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 px-6 overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />

      {/* Main Hero content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Fetii AI 
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-10">
          Quickly match rideshare groups, find optimal times, and make planning
          effortless. Built for speed, optimized for you.
        </p>

        {/* Animated Bot / Typing effect */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex items-center justify-center mb-10"
        >
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            🤖
          </div>
          <div className="ml-4 text-left">
            <p className="text-white font-mono bg-gray-800 px-3 py-1 rounded shadow animate-pulse">
              Typing...
            </p>
          </div>
        </motion.div>

       {/* Call to action buttons */}
<div className="flex flex-col sm:flex-row gap-6 justify-center">
  <a
    href="/chat"
    className="px-8 py-3 text-white font-bold rounded-none border-2 border-purple-400 shadow-[0_0_10px_rgba(128,0,255,0.7)] 
               bg-gray-800 
               hover:shadow-[0_0_20px_rgba(255,0,255,0.8)] hover:scale-105 
               transition-all duration-300"
  >
    Try it Now
  </a>
  <a
    href="#features"
    className="px-8 py-3 text-gray font-bold rounded-none border-2 border-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.6)] 
               bg-transparent 
               hover:bg-cyan-500 hover:shadow-[0_0_18px_rgba(0,255,255,0.9)] hover:scale-105 
               transition-all duration-300"
  >
    Learn More
  </a>
</div>
      </motion.div>
    </section>
  )
}

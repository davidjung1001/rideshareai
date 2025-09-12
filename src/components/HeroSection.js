"use client"

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center text-center h-screen bg-gradient-to-r from-blue-50 to-white px-4">
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
        AI Rideshare Assistant
      </h1>
      <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-8">
        Quickly match rideshare groups, find optimal times, and make planning effortless.
      </p>
      <a
        href="/chat"
        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
      >
        Try it Now
      </a>
    </section>
  )
}

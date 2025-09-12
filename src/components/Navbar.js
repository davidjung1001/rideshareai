"use client"

import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md fixed top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          HackAI
        </Link>
        <div className="space-x-6">
          <Link href="/chat" className="text-gray-700 hover:text-blue-600 font-medium">
            Chat
          </Link>
          <Link href="#features" className="text-gray-700 hover:text-blue-600 font-medium">
            Features
          </Link>
        </div>
      </div>
    </nav>
  )
}

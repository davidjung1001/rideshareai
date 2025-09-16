'use client'

import { ArrowLeft } from "lucide-react"
import Chat from '@/components/Chat'
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

// Dynamically import TripMap to disable SSR

export default function ChatPage() {
  

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
  
  {/* Header */}
  <div className="flex items-center w-full max-w-md p-4">
    <button onClick={() => window.history.back()} className="mr-4">
      <ArrowLeft className="w-6 h-6"/>
    </button>
    <h1 className="text-lg font-semibold">AI Rideshare Chat</h1>
  </div>

  {/* Chat */}
  <div className="flex-1 w-full max-w-md rounded-3xl shadow-xl overflow-hidden">
    <Chat />
  </div>

</div>

  )
}

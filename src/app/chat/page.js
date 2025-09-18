'use client'

import { useState } from "react"
import Chat from "@/components/Chat"
import CompanyChat from "@/components/CompanyChat"

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState("rideshare") // default

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4">
      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-6">
        AI Rideshare Chat
      </h1>

      {/* Chat container */}
      <div
        className="
          relative                 /* Needed for absolute toggle */
          w-full 
          h-[80vh]
          max-w-3xl
          bg-gray-800/90
          rounded-2xl
          shadow-md
          flex flex-col
          overflow-hidden
          bg-transparent
        "
      >
        {/* Left toggle (absolute so it doesn't break layout) */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <button
            className={`px-3 py-1 rounded-xl font-semibold text-sm ${activeChat === "rideshare" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}`}
            onClick={() => setActiveChat("rideshare")}
          >
            Rideshare
          </button>
          <button
            className={`px-3 py-1 rounded-xl font-semibold text-sm ${activeChat === "predictor" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}`}
            onClick={() => setActiveChat("predictor")}
          >
            Predictor
          </button>
        </div>

        {/* Chat content */}
        {activeChat === "rideshare" ? <Chat /> : <CompanyChat />}
      </div>
    </div>
  )
}

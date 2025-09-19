"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Chat from "@/components/Chat"
import CompanyChat from "@/components/CompanyChat"
import { ArrowLeft, Robot } from "lucide-react"

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState("rideshare")
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col items-center p-6 relative overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-6 z-10 relative">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="text-white p-2 rounded-full hover:bg-gray-800 transition shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Title centered */}
        <div className="flex items-center justify-center flex-1">
          <span className="text-purple-400 text-xl mr-2">🤖</span>
          <h1 className="text-3xl font-bold text-white tracking-wide">Fetii AI</h1>
        </div>

        {/* Toggle buttons on the right */}
        <div className="hidden sm:flex gap-2">
          {["rideshare", "mapView"].map(chat => (
            <button
              key={chat}
              onClick={() => setActiveChat(chat)}
              className={`
                px-4 py-2 font-semibold text-sm rounded-none border-2
                ${activeChat === chat
                  ? "border-purple-500 text-white shadow-[0_0_10px_rgba(128,0,255,0.7)]"
                  : "border-gray-700 text-gray-400 hover:border-purple-400 hover:text-white transition-all"}
              `}
            >
              {chat === "rideshare" ? "Rideshare" : "Map View"}
            </button>
          ))}
        </div>

        {/* Toggle dropdown (mobile) */}
        <div className="sm:hidden">
          <select
            value={activeChat}
            onChange={(e) => setActiveChat(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-700 shadow-md"
          >
            <option value="rideshare">Rideshare</option>
            <option value="mapView">Map View</option>
          </select>
        </div>
      </div>

      {/* Chat container */}
      <div
        className="
          relative
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
        {activeChat === "rideshare" ? <Chat /> : <CompanyChat />}
      </div>
    </div>
  )
}

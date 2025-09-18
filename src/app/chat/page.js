'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Chat from "@/components/Chat"
import CompanyChat from "@/components/CompanyChat"
import { ArrowLeft } from "lucide-react" // optional icon

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState("rideshare") // default
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4">
      {/* Back arrow + Title */}
      <div className="w-full max-w-3xl flex items-center mb-6">
        <button
          onClick={() => router.push("/")}
          className="text-white p-2 rounded-full hover:bg-gray-700 transition mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-white">
          AI Rideshare Chat
        </h1>
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
        {/* Left toggle */}
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

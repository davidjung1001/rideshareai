'use client'

import { ArrowLeft } from "lucide-react"
import Chat from '@/components/Chat'
import { useRouter } from "next/navigation"

export default function ChatPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900 p-4">

      {/* Header */}
      <header className="flex items-center mb-4">
        <button
          onClick={() => router.push('/')}
          className="p-2 hover:bg-gray-200 rounded transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 text-2xl font-semibold">AI Rideshare Chat</h1>
      </header>

      {/* Chat Container */}
      <main className="flex-1 flex justify-center">
        <div className="flex-1 max-w-full sm:max-w-4xl bg-gradient-to-b from-white to-gray-200 rounded-2xl shadow-xl overflow-hidden flex flex-col p-2 sm:p-4">
          <Chat />
        </div>
      </main>
    </div>
  )
}

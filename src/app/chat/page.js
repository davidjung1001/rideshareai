'use client'

import Chat from "@/components/Chat"

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-white mb-6">AI Rideshare Chat</h1>
      <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <Chat />
      </div>
    </div>
  )
}

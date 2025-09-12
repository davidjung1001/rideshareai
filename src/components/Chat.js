'use client'

import { useState, useRef, useEffect } from "react"

export default function Chat() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef(null)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: "user", text: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")

    try {
      const res = await fetch("https://rideshareai.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      })

      if (!res.ok) throw new Error("Network response was not ok")

      const data = await res.json()
      setMessages(prev => [...prev, { role: "bot", text: data.answer || data.reply }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: "bot", text: "Error: could not reach server." }])
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-full max-h-full bg-gray-900 text-white">
      {/* Messages */}
      <div className="flex-1 flex flex-col justify-end p-4 space-y-2 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-gray-400 self-center mt-4 text-center">
            Ask any rideshare question...
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[75%] p-3 rounded-2xl break-words text-sm shadow-md ${
              m.role === "user"
                ? "bg-blue-600 self-end text-white rounded-br-none"
                : "bg-gray-700 self-start text-white rounded-bl-none"
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex items-center p-3 bg-gray-800 border-t border-gray-700 flex-shrink-0">
        <input
          type="text"
          className="flex-1 p-2 px-4 rounded-full bg-gray-700 text-white focus:outline-none placeholder-gray-400 text-sm"
          placeholder="Type a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-700 transition text-sm font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from "react"

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef(null)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMessage = { role: "user", text: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "bot", text: data.answer || data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", text: "Error: could not reach server." }])
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col w-full h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-end space-y-2">
        {messages.length === 0 && (
          <div className="text-gray-400 self-center mt-4">
            Ask any rideshare question...
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[75%] p-3 rounded-2xl break-words text-sm ${
              m.role === "user"
                ? "bg-blue-600 self-end text-white rounded-br-none shadow-md"
                : "bg-gray-700 self-start text-white rounded-bl-none shadow-md"
            }`}
          >
            {m.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex items-center p-3 bg-gray-700 border-t border-gray-600 flex-shrink-0">
        <input
          type="text"
          className="flex-1 p-2 px-4 rounded-full bg-gray-600 text-white focus:outline-none placeholder-gray-400 text-sm"
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

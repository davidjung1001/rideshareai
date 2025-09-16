'use client'

import { useState, useRef, useEffect } from "react"

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: "user", text: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("https://rideshareai.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      })

      if (!res.ok) throw new Error("Network response was not ok")

      const data = await res.json()

      // Typing effect simulation
      const botText = data.reply || data.answer || ""
      let current = ""
      for (let char of botText) {
        current += char
        setMessages(prev => {
          const newMessages = [...prev]
          const last = newMessages[newMessages.length - 1]
          if (last?.role === "bot") {
            last.text = current
          } else {
            newMessages.push({ role: "bot", text: current })
          }
          return newMessages
        })
        await new Promise(r => setTimeout(r, 15)) // typing speed
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: "bot", text: "Error: could not reach server." }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-900">

      {/* Messages */}
      <div className="flex-1 flex flex-col justify-end p-6 space-y-3 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-gray-500 self-center mt-4 text-center">
            Ask any rideshare question...
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-3 break-words text-sm shadow-sm max-w-[60%] ${
              m.role === "user"
                ? "self-end bg-blue-50 text-blue-900 rounded-xl"
                : "self-start bg-gray-100 text-gray-900 rounded-xl"
            }`}
          >
            {m.text}{m.role === "bot" && loading && <span className="animate-pulse">|</span>}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex p-4 border-t border-gray-300 bg-white flex-shrink-0 space-x-2">
        <input
          type="text"
          className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          placeholder="Type a question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-semibold text-sm"
        >
          Send
        </button>
      </div>
    </div>
  )
}

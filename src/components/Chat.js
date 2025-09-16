"use client"

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
        // faster typing speed (or remove completely for instant response)
        await new Promise(r => setTimeout(r, 3)) 
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
    <div className="flex flex-col h-[70vh] bg-gray-900 text-gray-900 rounded-md shadow-lg overflow-hidden">
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2">
        {messages.length === 0 && (
          <div className="text-gray-400 self-center mt-4 text-center">
            Ask any rideshare question...
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[75%] px-4 py-2 text-sm break-words rounded-xl ${
              m.role === "user"
                ? "self-end bg-blue-500 text-white"
                : "self-start bg-gray-800 text-white"
            }`}
          >
            {m.text}
            {m.role === "bot" && loading && <span className="animate-pulse ml-1">|</span>}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-gray-700 bg-gray-900">
        <div className="flex items-center bg-gray-800 rounded-full px-2 py-1">
          <input
            type="text"
            className="flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
            placeholder="Type a question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-semibold text-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

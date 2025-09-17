"use client"

import { useState, useRef, useEffect } from "react"

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // -------------------------------
  // Helper component to render AI
  // -------------------------------
  const RenderAIResponse = ({ text }) => {
    const lines = text.split("\n")
    let tableRows = []
    const elements = []

    lines.forEach((line, i) => {
      line = line.trim()
      if (!line) return

      // Headings
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-blue-500 my-1">{line.replace("# ", "")}</h1>
        )
        return
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-xl font-bold text-blue-400 my-1">{line.replace("## ", "")}</h2>
        )
        return
      }

      // Table rows
      if (line.includes("\t") || line.includes("|")) {
        const cells = line.split(/\t|\|/).map(c => c.trim())
        tableRows.push(cells)
        return
      }

      // Render table if we finished collecting rows
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-2">
            <table className="table-auto border border-gray-700 w-full text-sm">
              <thead>
                <tr>
                  {tableRows[0].map((cell, idx) => (
                    <th key={idx} className="border px-2 py-1 bg-gray-700 text-white">{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="bg-gray-800">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border px-2 py-1 text-white">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        tableRows = []
      }

      // Normal paragraph
      elements.push(
        <p key={i} className="text-sm text-white whitespace-pre-wrap my-1">{line}</p>
      )
    })

    return <>{elements}</>
  }

  // -------------------------------
  // Send message to backend
  // -------------------------------
  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: "user", text: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
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
        await new Promise(r => setTimeout(r, 3)) // typing speed
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { role: "bot", text: "Error: could not reach server." }])
    } finally {
      setLoading(false)
    }
  }

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex flex-col h-[70vh] bg-gray-900 text-gray-900 rounded-md shadow-lg overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4
      scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700">
        {messages.length === 0 && (
          <div className="text-gray-400 self-center mt-4 text-center">
            Ask any rideshare question...
          </div>
        )}

        {messages.map((m, i) => (
          m.role === "user" ? (
            // User bubble
            <div
              key={i}
              className="max-w-[75%] self-end bg-blue-500 text-white px-4 py-2 text-sm rounded-xl shadow"
            >
              {m.text}
            </div>
          ) : (
            // Bot response as plain text, no bubble
            <div key={i} className="max-w-3xl self-start text-left">
              <RenderAIResponse text={m.text} />
              {loading && <span className="animate-pulse text-blue-400 text-sm">Typing...</span>}
            </div>
          )
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

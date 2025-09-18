"use client"

import { useState, useRef, useEffect } from "react"
import MessageBubble from "./MessageBubble"

export default function Chat() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    // -------------------------------
    // Helper component to render AI
    // -------------------------------
    const RenderAIResponse = ({ text }) => {
  if (!text) return null

  const sections = text.split(/^---$/m).map(s => s.trim()).filter(Boolean)

  return (
    <div className="flex flex-col gap-6 text-white">
      {sections.map((sec, idx) => {
        const lines = sec.split("\n").map(l => l.trim()).filter(Boolean)
        if (!lines.length) return null

        let tableRows = []
        const elements = []

        lines.forEach((line, i) => {
          if (!line) return

          // Headings
          if (line.startsWith("# ")) {
            elements.push(<h1 key={i} className="text-2xl font-bold text-white my-2">{line.replace("# ", "")}</h1>)
            return
          }
          if (line.startsWith("## ")) {
            elements.push(<h2 key={i} className="text-xl font-semibold text-white border-b border-gray-600 my-1 pb-1">{line.replace("## ", "")}</h2>)
            return
          }

          if (line.startsWith("### ")) {
            elements.push(<h3 key={i} className="text-lg font-medium text-white border-l-4 border-blue-500 pl-2 my-1">{line.replace("### ", "")}</h3>)
            return
          }

          // Bullet points
          if (line.startsWith("-")) {
            const formattedLine = line.replace(/^-+\s*/, "").split("**").map((part, idx) =>
              idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
            )
            elements.push(<li key={i} className="ml-6 list-disc text-sm">{formattedLine}</li>)
            return
          }

          // Table row
          if (line.includes("|")) {
            let cells = line.split("|").map(c => c.trim()).filter(c => c)
            if (!cells.every(c => /^-*$/.test(c))) tableRows.push(cells)
            return
          }

          // If we reach a non-table line and tableRows exist, render table
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

          // Paragraph with **bold**
          const formattedLine = line.split("**").map((part, idx) =>
            idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
          )
          elements.push(<p key={i} className="text-sm whitespace-pre-wrap my-1">{formattedLine}</p>)
        })

        // Flush table at end of section if exists
        if (tableRows.length > 0) {
          elements.push(
            <div key={`table-end-${idx}`} className="overflow-x-auto my-2">
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
        }

        return <div key={idx} className="flex flex-col gap-2">{elements}</div>
      })}
    </div>
  )
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
        <div className="flex flex-col h-full">
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
                        <MessageBubble key={i} message={m} />
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

            {/* Fixed input bar */}
            <div className="fixed bottom-4 left-0 w-full flex justify-center px-4">
                <div className="flex w-full max-w-3xl bg-gray-800 rounded-full shadow-lg px-4 py-2 items-center">
                    <input
                        type="text"
                        placeholder="Type a question..."
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none px-4 py-2 rounded-full text-base"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMessage()}
                    />
                    <button
                        onClick={sendMessage}
                        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-semibold text-base"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}

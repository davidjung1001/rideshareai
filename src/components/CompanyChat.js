"use client"

import { useState, useRef, useEffect } from "react"
import MessageBubble from "./MessageBubble"

export default function CompanyChat() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    // Reuse your RenderAIResponse from Chat.js
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
            if (line.startsWith("#")) {
                const cleanLine = line.replace(/^#+\s*/, "")
                elements.push(
                    <div key={i} className="text-blue-400 font-bold text-lg uppercase my-2 border-b border-gray-600">
                        {cleanLine}
                    </div>
                )
                return
            }
            if (line.startsWith("-")) {
                const cleanLine = line.replace(/^-+\s*/, "").replace(/\*\*(.*?)\*\*/g, (_, b) => `<strong>${b}</strong>`)
                elements.push(
                    <li key={i} className="ml-6 list-disc text-white" dangerouslySetInnerHTML={{ __html: cleanLine }} />
                )
                return
            }

            // Table rows
            if (line.includes("|")) {
                let cells = line.split("|").map(c => c.trim()).filter(c => c)
                if (cells.every(c => /^-*$/.test(c))) return
                if (cells.length) tableRows.push(cells)
                return
            }

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

            elements.push(
                <p key={i} className="text-sm text-white whitespace-pre-wrap my-1">{line}</p>
            )
        })

        return <>{elements}</>
    }

    // -------------------------------
    // Send message to /company-chat
    // -------------------------------
    const sendMessage = async () => {
        if (!input.trim()) return
        const userMessage = { role: "user", text: input }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setLoading(true)

        try {
            const res = await fetch("http://127.0.0.1:8000/company-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: input }),
            })

            if (!res.ok) throw new Error("Network response was not ok")
            const data = await res.json()
            const botText = data.reply || data.answer || ""
            setMessages(prev => [...prev, { role: "bot", text: botText }])
        } catch (err) {
            console.error(err)
            setMessages(prev => [...prev, { role: "bot", text: "Error: server unreachable." }])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700">
                {messages.length === 0 && (
                    <div className="text-gray-400 self-center mt-4 text-center">
                        Ask the predictor about trip demand...
                    </div>
                )}

                {messages.map((m, i) =>
                    m.role === "user" ? (
                        <MessageBubble key={i} message={m} />
                    ) : (
                        <div key={i} className="max-w-3xl self-start text-left">
                            <RenderAIResponse text={m.text} />
                            {loading && <span className="animate-pulse text-blue-400 text-sm">Typing...</span>}
                        </div>
                    )
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="fixed bottom-4 left-0 w-full flex justify-center px-4">
                <div className="flex w-full max-w-3xl bg-gray-800 rounded-full shadow-lg px-4 py-2 items-center">
                    <input
                        type="text"
                        placeholder="Ask about demand (e.g., Friday 18)..."
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none px-4 py-2 rounded-full text-sm"
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

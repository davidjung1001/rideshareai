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


                        console.log("LINE DEBUG:", JSON.stringify(line))

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


                        // Helper function to render a table (keep as-is)
                        const renderTable = (rows, key) => (
                            <div key={key} className="overflow-x-auto my-2">
                                <table className="table-auto border border-gray-700 w-full text-sm">
                                    <thead>
                                        <tr>
                                            {rows[0].map((cell, idx) => (
                                                <th key={idx} className="border px-2 py-1 bg-gray-700 text-white">{cell}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.slice(1).map((row, rIdx) => (
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

                        // Table row
                        if (line.includes("|")) {
                            let cells = line.split("|").map(c => c.trim()).filter(c => c)
                            // ignore separator rows like |---|---|
                            const isSeparator = cells.every(c => /^-+$/.test(c))

                            if (!isSeparator) {
                                tableRows.push(cells)
                            }

                            // Check if next line is not a table row
                            const nextLine = lines[i + 1]
                            const nextCells = nextLine?.split("|").map(c => c.trim()).filter(c => c) || []
                            const isNextSeparator = nextCells.length > 0 && nextCells.every(c => /^-+$/.test(c))
                            const isNextTableRow = nextLine && nextLine.includes("|") && !isNextSeparator



                            // Flush table immediately if next line is not a table row
                            if (!isNextTableRow && !isNextSeparator && tableRows.length > 0) {
                                elements.push(renderTable(tableRows, `table-${i}`))
                                tableRows = []
                            }
                            return
                        }

                        if (line.trim() === "" && tableRows.length > 0) {
                            elements.push(renderTable(tableRows, `table-blank-${i}`))
                            tableRows = []
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


                        // Remove the "flush only on heading" block — it's no longer needed


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
            const res = await fetch("https://rideshareai.onrender.com/chat", {
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
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-2 py-2
                [scrollbar-width:thin] 
                [scrollbar-color:#8F00FF_transparent]
                hover:[scrollbar-color:#a64dff_transparent]">
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
                <div className="flex w-full max-w-3xl bg-gray-900/70 backdrop-blur-md border border-cyan-500 rounded-none shadow-lg px-4 py-2 items-center gap-2">
                    <input
                        type="text"
                        placeholder="Type a question..."
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none px-4 py-2 text-base"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMessage()}
                    />
                    <button
                        onClick={sendMessage}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-none shadow-[0_0_10px_rgba(128,0,255,0.7)] font-semibold transition-all"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}

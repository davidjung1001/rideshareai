"use client";
import React from "react";
import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message }) {
  if (message.role === "user") {
    return (
      <div className="max-w-[75%] self-end bg-blue-500 text-white px-4 py-2 text-sm rounded-xl shadow">
        {message.text}
      </div>
    );
  }

  return (
    <div className="self-center bg-gray-800 text-white px-6 py-4 rounded-lg shadow w-full max-w-2xl text-left space-y-3">
      <h2 className="text-lg font-bold text-blue-400">AI Response</h2>
      <hr className="border-gray-600" />
      <ReactMarkdown
        components={{
          table: ({ node, ...props }) => (
            <table className="table-auto border-collapse border border-gray-500 w-full" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border border-gray-500 px-2 py-1 bg-gray-700 text-left" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-gray-500 px-2 py-1" {...props} />
          ),
        }}
      >
        {message.text}
      </ReactMarkdown>
    </div>
  );
}

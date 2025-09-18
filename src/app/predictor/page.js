"use client"

import CompanyChat from "@/components/CompanyChat"

export default function PredictorPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4">
      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-6">
        Trip Demand Predictor
      </h1>

      {/* Chat container */}
      <div
        className="
          w-full 
          h-[80vh]           /* Tall enough but not full screen */
          max-w-3xl          /* Desktop max width */
          bg-gray-800/90     
          rounded-2xl        
          shadow-md 
          flex flex-col 
          overflow-hidden
          bg-transparent
        "
      >
        <CompanyChat />
      </div>
    </div>
  )
}

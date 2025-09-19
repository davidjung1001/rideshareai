import dynamic from "next/dynamic"

// Client-only import
const HotZoneMap = dynamic(() => import("./HotZoneMap"), { ssr: false })

export default function CompanyChat() {
  return (
    <div className="h-full w-full">
      <HotZoneMap />
    </div>
  )
}

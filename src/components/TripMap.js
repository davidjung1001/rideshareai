"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { useEffect, useState } from "react"

// Default marker fix for Leaflet in React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
})

export default function TripMap() {
  const [trips, setTrips] = useState([])

  useEffect(() => {
  async function fetchTrips() {
    try {
      const res = await fetch("https://rideshareai.onrender.com/trips")
      const data = await res.json()
      // Ensure it's an array
      setTrips(Array.isArray(data) ? data : data.trips || [])
    } catch (err) {
      console.error("Failed to fetch trips:", err)
      setTrips([])
    }
  }
  fetchTrips()
}, [])

  return (
    <MapContainer center={[30.2672, -97.7431]} zoom={12} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {trips.map((trip, i) => (
        <Marker key={i} position={[trip.pickup_latitude, trip.pickup_longitude]}>
          <Popup>
            <div>
              <b>Pickup:</b> {trip.pickup_address} <br />
              <b>Dropoff:</b> {trip.dropoff_address} <br />
              <b>Passengers:</b> {trip.total_passengers}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Custom icons for pickups and drop-offs
const pickupIcon = new L.Icon({
  iconUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const dropoffIcon = new L.Icon({
  iconUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export default function HotZoneMap() {
  const pickups = [
    { lat: 30.2849, lng: -97.7383, name: "West Campus" }, // top pickup
  ]

  const dropoffs = [
    { lat: 30.2655, lng: -97.7420, name: "Downtown Station" },
    { lat: 30.2700, lng: -97.7490, name: "The Domain" },
    { lat: 30.2672, lng: -97.7431, name: "Sixth Street (West)" },
    { lat: 30.2678, lng: -97.7340, name: "Sixth Street (East)" },
    { lat: 30.2835, lng: -97.7385, name: "Moody Center" },
    { lat: 30.2830, lng: -97.7325, name: "Darrell K Royal Stadium" },
  ]

  return (
    <MapContainer
      center={[30.2672, -97.7431]}
      zoom={14}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "80vh" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
      />

      {pickups.map((p, idx) => (
        <Marker key={`pickup-${idx}`} position={[p.lat, p.lng]} icon={pickupIcon}>
          <Popup>{p.name} (Pickup)</Popup>
        </Marker>
      ))}

      {dropoffs.map((d, idx) => (
        <Marker key={`dropoff-${idx}`} position={[d.lat, d.lng]} icon={dropoffIcon}>
          <Popup>{d.name} (Drop-off)</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

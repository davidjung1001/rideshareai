"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function RideshareMap() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetch("/api/trips") // your FastAPI endpoint
      .then((res) => res.json())
      .then((data) => setTrips(data));
  }, []);

  if (trips.length === 0) return <p>Loading map...</p>;

  // Center map on average pickup location
  const center = [
    trips.reduce((sum, t) => sum + t.pickup_latitude, 0) / trips.length,
    trips.reduce((sum, t) => sum + t.pickup_longitude, 0) / trips.length,
  ];

  return (
    <MapContainer center={center} zoom={12} style={{ height: "600px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {trips.map((trip) => (
        <Marker
          key={trip.trip_id + "-pickup"}
          position={[trip.pickup_latitude, trip.pickup_longitude]}
        >
          <Popup>
            <strong>Pickup:</strong> {trip.pickup_address} <br />
            <strong>Time:</strong> {trip.trip_date_and_time} <br />
            <strong>Passengers:</strong> {trip.total_passengers}
          </Popup>
        </Marker>
      ))}

      {trips.map((trip) => (
        <Marker
          key={trip.trip_id + "-dropoff"}
          position={[trip.dropoff_latitude, trip.dropoff_longitude]}
          icon={new L.Icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-red.png", iconSize: [25, 41], iconAnchor: [12, 41] })}
        >
          <Popup>
            <strong>Dropoff:</strong> {trip.dropoff_address} <br />
            <strong>Time:</strong> {trip.trip_date_and_time} <br />
            <strong>Passengers:</strong> {trip.total_passengers}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

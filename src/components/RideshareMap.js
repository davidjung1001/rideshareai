"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import react-leaflet components (client only)
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

export default function RideshareMap() {
  const [trips, setTrips] = useState([]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [dropIcon, setDropIcon] = useState(null);

  useEffect(() => {
    // Import Leaflet on client
    import("leaflet").then(L => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Create dropoff icon
      setDropIcon(
        new L.Icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-red.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      );

      setLeafletLoaded(true);
    });

    fetch("https://rideshareai.onrender.com/trips")
      .then(res => res.json())
      .then(setTrips)
      .catch(console.error);
  }, []);

  if (!trips.length || !leafletLoaded) return <p>Loading map...</p>;

  const center = [
    trips.reduce((sum, t) => sum + t.pick_up_latitude, 0) / trips.length,
    trips.reduce((sum, t) => sum + t.pick_up_longitude, 0) / trips.length,
  ];

  return (
    <MapContainer center={center} zoom={12} style={{ height: "600px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {trips.map(trip => (
        <Marker key={trip.trip_id + "-pickup"} position={[trip.pick_up_latitude, trip.pick_up_longitude]}>
          <Popup>
            <strong>Pickup:</strong> {trip.pick_up_address} <br />
            <strong>Time:</strong> {trip.trip_date_and_time} <br />
            <strong>Passengers:</strong> {trip.total_passengers}
          </Popup>
        </Marker>
      ))}

      {dropIcon &&
        trips.map(trip => (
          <Marker
            key={trip.trip_id + "-dropoff"}
            position={[trip.drop_off_latitude, trip.drop_off_longitude]}
            icon={dropIcon}
          >
            <Popup>
              <strong>Dropoff:</strong> {trip.drop_off_address} <br />
              <strong>Time:</strong> {trip.trip_date_and_time} <br />
              <strong>Passengers:</strong> {trip.total_passengers}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}

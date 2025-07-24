import { Package, PackageEvent } from "@/types";
import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PackageDetailProps {
  packages: Package;
  onBack: () => void;
}

const PackageDetail: React.FC<PackageDetailProps> = ({ packages, onBack }) => {

  const [events, setEvents] = useState<PackageEvent[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/packages/${packages.package_id}`, {
      method: "GET",
      headers: { Authorization: "Bearer aamira-secret-token" },
    })
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
      });

    const map = L.map('map').setView([packages.lat || 39.7684, packages.lon || -86.1581], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    if (packages.lat && packages.lon) {
      L.marker([packages.lat, packages.lon]).addTo(map);
    }

    return () => {
      map.remove();
    };
  }, [packages]);

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Back
      </button>
      <h2 className="text-xl font-bold">Package {packages.package_id}</h2>
      <div id="map" className="h-64 my-4"></div>
      <h3 className="text-lg font-semibold">Event History</h3>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Timestamp</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Note</th>
            <th className="px-4 py-2 border">Location</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td className="px-4 py-2 border text-center">
                {new Date(event.event_timestamp).toLocaleString()}
              </td>
              <td className="px-4 py-2 border text-center">{event.status}</td>
              <td className="px-4 py-2 border text-center">{event.note || "—"}</td>
              <td className="px-4 py-2 border text-center">
                {event.lat && event.lon ? `${event.lat}, ${event.lon}` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PackageDetail;

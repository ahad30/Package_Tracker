import { Package, PackageEvent } from "@/types";
import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SkeletonTable from "../Skeleton/SkeletonTable";

interface PackageDetailProps {
  packages: Package;
  onBack: () => void;
}

const PackageDetail: React.FC<PackageDetailProps> = ({ packages, onBack }) => {
  const [events, setEvents] = useState<PackageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/packages/${packages.package_id}`, {
      method: "GET",
      headers: { Authorization: "Bearer aamira-secret-token" },
    })
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    setMapLoading(true);
    const map = L.map('map').setView([packages.lat || 39.7684, packages.lon || -86.1581], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    if (packages.lat && packages.lon) {
      L.marker([packages.lat, packages.lon]).addTo(map)
        .on('add', () => setMapLoading(false));
    } else {
      setMapLoading(false);
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
      <h2 className="text-xl font-bold text-center">Package No: {packages.package_id}</h2>
      <h3 className="text-lg font-semibold mb-3 mt-4">Location:</h3>

      
      {/* Map Loading State */}
      <div className="relative">
        {mapLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-10 flex items-center justify-center">
            <span className="text-gray-500">Loading map...</span>
          </div>
        )}
        
        <div id="map" className="h-64 my-4"></div>
      </div>

      <h3 className="text-lg font-semibold mb-3">Event History:</h3>
      
      {loading ? (
        <SkeletonTable rows={5} columns={4} />
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Timestamp</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Note</th>
              <th className="px-4 py-2 border">Location</th>
              <th className="px-4 py-2 border">ETA</th>

            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? (
              events.map((event) => (
                <tr key={event.id}>
                  <td className="px-4 py-2 border text-center">
                    {new Date(event.event_timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 border text-center">{event.status}</td>
                  <td className="px-4 py-2 border text-center">{event.note || "—"}</td>
                  <td className="px-4 py-2 border text-center">
                    {event.lat && event.lon ? `${event.lat}, ${event.lon}` : "—"}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {event.eta ? new Date(event.eta).toLocaleString() : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center border font-bold text-gray-500">
                  No events found for this package
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PackageDetail;
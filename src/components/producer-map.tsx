import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapProducer = {
  id: string;
  name: string;
  region: string;
  category: "farm" | "vendor" | "grant";
  lat: number;
  lng: number;
};

const COLORS: Record<MapProducer["category"], string> = {
  farm: "#10b981", // emerald
  vendor: "#06b6d4", // cyan
  grant: "#d946ef", // fuchsia
};

function FlyTo({ target }: { target: LatLngExpression | null }) {
  const map = useMap();
  const lastRef = useRef<string | null>(null);
  useEffect(() => {
    if (!target) return;
    const key = JSON.stringify(target);
    if (key === lastRef.current) return;
    lastRef.current = key;
    map.flyTo(target, 9, { duration: 1.1 });
  }, [target, map]);
  return null;
}

type Props = {
  producers: MapProducer[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

export default function ProducerMap({ producers, activeId, onSelect }: Props) {
  const active = producers.find((p) => p.id === activeId);
  const target: LatLngExpression | null = active ? [active.lat, active.lng] : null;

  return (
    <MapContainer
      center={[23.9738, 120.982]}
      zoom={7}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: "1rem", background: "#f6f8f6" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FlyTo target={target} />
      {producers.map((p) => {
        const isActive = p.id === activeId;
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={isActive ? 11 : 7}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: COLORS[p.category],
              fillOpacity: isActive ? 1 : 0.85,
            }}
            eventHandlers={{ click: () => onSelect(p.id) }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={1}>
              <div style={{ fontSize: 12 }}>
                <strong>{p.name}</strong>
                <div style={{ opacity: 0.7 }}>{p.region}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

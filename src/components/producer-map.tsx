import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type MapProducer = {
  id: string;
  name: string;
  region: string;
  category: "farm" | "vendor" | "grant";
  lat: number;
  lng: number;
};

type Props = {
  producers: MapProducer[];
  activeId: string;
  onSelect: (id: string) => void;
};

export default function ProducerMapLeaflet({ producers, activeId, onSelect }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 初始化 Leaflet 地圖
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [23.8, 120.96], // 台灣中心點
        zoom: 7.5,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;

      // 💡 重點修復：延遲觸發 invalidateSize 確保地圖抓得到容器尺寸不空白
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }

    const map = mapRef.current;

    // 清除舊標記
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // 建立小農標記
    producers.forEach((p) => {
      const color =
        p.category === "farm"
          ? "#059669" // emerald
          : p.category === "vendor"
          ? "#d97706" // amber
          : "#d946ef"; // fuchsia

      const marker = L.circleMarker([p.lat, p.lng], {
        radius: activeId === p.id ? 10 : 7,
        fillColor: color,
        color: "#ffffff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);

      marker.on("click", () => {
        onSelect(p.id);
      });

      markersRef.current[p.id] = marker;
    });
  }, [producers, activeId, onSelect]);

  // 當高亮的小農改變時，飛到該點並調整地圖大小
  useEffect(() => {
    const activeP = producers.find((p) => p.id === activeId);
    if (activeP && mapRef.current) {
      mapRef.current.flyTo([activeP.lat, activeP.lng], 9, { duration: 1.2 });
      mapRef.current.invalidateSize();
    }
  }, [activeId, producers]);

  return (
    /* 🟢 修復重點：直接為 Leaflet 的容器加上 h-[520px] 絕對高度，確保地圖 100% 渲染出來 */
    <div
      ref={mapContainerRef}
      className="w-full h-[520px] rounded-3xl z-10"
      style={{ height: "520px" }}
    />
  );
}
"use client";

import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { LatLng, MappableLocation } from "@/lib/geo";

const LAGOS: LatLng = { lat: 6.5244, lng: 3.3792 };

/**
 * Free basemap sources requiring NO Google Cloud account, NO credit card, and NO API keys:
 * 1. ESRI World Street Map - crisp high-resolution street view with full Lagos road network & landmarks.
 * 2. ESRI World Light Gray Canvas - minimal clean aesthetic for modern dashboard UI.
 * 3. OpenStreetMap - open-source global fallback.
 */
const TILE_SOURCES = [
  {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 19,
  },
  {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
    maxZoom: 16,
  },
  {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  },
];

function pinIcon(verified: boolean) {
  return L.divIcon({
    className: "ql-pin",
    html: `<span class="ql-pin-body" style="--ql-pin-color:${verified ? "#1676f7" : "#9aa8ba"}"></span><span class="ql-pin-shadow"></span>`,
    iconSize: [34, 44],
    iconAnchor: [17, 42],
    popupAnchor: [0, -40],
  });
}

const YOU_ICON = L.divIcon({
  className: "ql-you",
  html: '<span class="ql-you-pulse"></span><span class="ql-you-dot"></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -14],
});

function Recenter({ point }: { point: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (point) map.setView([point.lat, point.lng], 13, { animate: true });
  }, [map, point]);
  return null;
}

function InvalidateMapSize() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function LagosMap({
  userPosition,
  locations,
}: {
  userPosition: LatLng | null;
  locations: MappableLocation[];
}) {
  const [tileSource, setTileSource] = useState(0);
  const [tilesUnavailable, setTilesUnavailable] = useState(false);

  return (
    <MapContainer
      center={[LAGOS.lat, LAGOS.lng]}
      zoom={11}
      scrollWheelZoom={true}
      zoomControl={false}
      className="lagos-map"
      style={{ width: "100%", height: "100%" }}
    >
      <InvalidateMapSize />
      <Recenter point={userPosition} />
      <TileLayer
        key={tileSource}
        url={TILE_SOURCES[tileSource].url}
        attribution={TILE_SOURCES[tileSource].attribution}
        maxZoom={TILE_SOURCES[tileSource].maxZoom}
        eventHandlers={{
          tileerror: () => {
            if (tileSource >= TILE_SOURCES.length - 1) setTilesUnavailable(true);
            else setTileSource((index) => index + 1);
          },
          tileload: () => setTilesUnavailable(false),
        }}
      />
      {tilesUnavailable && (
        <div className="map-tile-error" role="status">
          Map tiles could not load. Check your connection and try again.
        </div>
      )}
      {userPosition && (
        <Marker position={[userPosition.lat, userPosition.lng]} icon={YOU_ICON}>
          <Popup>Your approximate location. This stays in your browser.</Popup>
        </Marker>
      )}
      {locations.map((location) => {
        const verified = location.status !== "unverified" && location.coordsVerified;
        return (
          <Marker key={location.id} position={[location.lat, location.lng]} icon={pinIcon(verified)}>
            <Popup>
              <strong>{location.name}</strong>
              <br />
              {location.area} · {location.status.replaceAll("_", " ")}
              <br />
              <a href={`/location/${location.id}`}>View details</a>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
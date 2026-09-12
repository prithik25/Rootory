"use client";
import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Search, Check, X, LoaderCircle } from "lucide-react";
import {
  reverseGeocodeCoords,
  searchLocations,
  type LocationOption,
} from "@/lib/locations";

export function LocationMap({
  initialLat,
  initialLon,
  initialLabel,
  onSelectLocation,
  onClose,
}: {
  initialLat: number;
  initialLon: number;
  initialLabel?: string;
  onSelectLocation: (lat: number, lon: number, label: string) => void;
  onClose: () => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [pinnedLat, setPinnedLat] = useState(initialLat);
  const [pinnedLon, setPinnedLon] = useState(initialLon);
  const [locationName, setLocationName] = useState(initialLabel || "Loading location…");
  const [locationDetails, setLocationDetails] = useState("");
  const [resolving, setResolving] = useState(false);

  // Map search state
  const [mapSearch, setMapSearch] = useState("");
  const [searchResults, setSearchResults] = useState<LocationOption[]>([]);
  const [searching, setSearching] = useState(false);

  // Map references
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const resolveTimer = useRef<NodeJS.Timeout | null>(null);

  // Function to update location name when pin moves
  const updateAddress = (lat: number, lon: number) => {
    if (resolveTimer.current) clearTimeout(resolveTimer.current);
    setResolving(true);
    resolveTimer.current = setTimeout(async () => {
      const res = await reverseGeocodeCoords(lat, lon);
      setLocationName(res.label);
      setLocationDetails(res.details || "");
      setResolving(false);
    }, 300);
  };

  useEffect(() => {
    let active = true;
    let mapInstance: any = null;

    async function init() {
      const L = (await import("leaflet")).default;
      if (!active || !mapContainerRef.current) return;

      const customPin = L.divIcon({
        className: "custom-leaflet-pin",
        html: `<div style="background:#183e32;color:white;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.35);border:2.5px solid white;"><span style="transform:rotate(45deg);font-size:16px;">🌱</span></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLon],
        zoom: 12,
        zoomControl: true,
      });
      mapInstance = map;
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([initialLat, initialLon], {
        draggable: true,
        icon: customPin,
      }).addTo(map);
      markerRef.current = marker;

      // Click on map to move pin
      map.on("click", (e: any) => {
        const lat = Number(e.latlng.lat.toFixed(2));
        const lon = Number(e.latlng.lng.toFixed(2));
        marker.setLatLng([lat, lon]);
        setPinnedLat(lat);
        setPinnedLon(lon);
        updateAddress(lat, lon);
      });

      // Drag marker
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        const lat = Number(pos.lat.toFixed(2));
        const lon = Number(pos.lng.toFixed(2));
        setPinnedLat(lat);
        setPinnedLon(lon);
        updateAddress(lat, lon);
      });

      // Initial address resolve
      updateAddress(initialLat, initialLon);

      // Invalidate size after modal render
      setTimeout(() => {
        if (active && map) map.invalidateSize();
      }, 200);
    }

    void init();

    return () => {
      active = false;
      if (resolveTimer.current) clearTimeout(resolveTimer.current);
      if (mapInstance) mapInstance.remove();
    };
  }, []);

  const jumpToLocation = (lat: number, lon: number, name: string) => {
    setPinnedLat(lat);
    setPinnedLon(lon);
    setLocationName(name);
    setSearchResults([]);
    setMapSearch("");
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 14, { duration: 1 });
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
    }
    updateAddress(lat, lon);
  };

  const handleSearch = async (query: string) => {
    setMapSearch(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const res = await searchLocations(query);
    setSearchResults(res);
    setSearching(false);
  };

  const handleGpsCenter = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(2));
        const lon = Number(pos.coords.longitude.toFixed(2));
        jumpToLocation(lat, lon, "Your GPS location");
      },
      () => {},
      { timeout: 8000 },
    );
  };

  const handleConfirm = () => {
    onSelectLocation(pinnedLat, pinnedLon, locationName);
    onClose();
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #dce4ce",
        overflow: "hidden",
        boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
        margin: "10px 0 16px",
      }}
    >
      {/* Map Header & Search */}
      <div
        style={{
          padding: "10px 12px",
          background: "#f4f7ee",
          borderBottom: "1px solid #e1e8d7",
          display: "flex",
          gap: 6,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          className="search-field"
          style={{
            flex: 1,
            margin: 0,
            background: "#fff",
            borderRadius: 8,
            padding: "4px 8px",
            minWidth: 160,
          }}
        >
          <Search size={14} style={{ color: "#758766" }} />
          <input
            placeholder="Search village, city, farm area…"
            value={mapSearch}
            onChange={(e) => void handleSearch(e.target.value)}
            style={{
              fontSize: 12,
              border: "none",
              outline: "none",
              width: "100%",
              background: "transparent",
            }}
          />
          {mapSearch && (
            <button
              type="button"
              className="icon-button borderless small-icon"
              onClick={() => handleSearch("")}
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button
          type="button"
          className="button secondary"
          style={{
            padding: "5px 9px",
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          onClick={handleGpsCenter}
          title="Center map on your GPS"
        >
          <Navigation size={12} />
          GPS
        </button>

        <button
          type="button"
          className="icon-button borderless small-icon"
          onClick={onClose}
          aria-label="Close map"
        >
          <X size={15} />
        </button>
      </div>

      {/* Search results dropdown if searching */}
      {searchResults.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid #e1e8d7",
            maxHeight: 140,
            overflowY: "auto",
            padding: "4px 8px",
          }}
        >
          {searchResults.map((r) => (
            <button
              key={`${r.name}-${r.lat}-${r.lon}`}
              type="button"
              style={{
                width: "100%",
                textAlign: "left",
                padding: "6px 8px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 12,
                borderRadius: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f4f7ee")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
              onClick={() => jumpToLocation(r.lat, r.lon, r.name)}
            >
              <strong>{r.name}</strong>
              <small style={{ color: "#758766" }}>
                {r.nearbyHub || r.state}
              </small>
            </button>
          ))}
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: 250,
          background: "#e8ece1",
          position: "relative",
          zIndex: 1,
        }}
      />

      {/* Pinned Info Footer */}
      <div
        style={{
          padding: "10px 12px",
          background: "#fafcf7",
          borderTop: "1px solid #e1e8d7",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 160 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13,
              fontWeight: 600,
              color: "#183e32",
            }}
          >
            <MapPin size={14} style={{ color: "#48613d" }} />
            <span>{locationName}</span>
            {resolving && <LoaderCircle size={12} className="spin" />}
          </div>
          <div style={{ fontSize: 11, color: "#758766", marginLeft: 19 }}>
            {locationDetails ? `${locationDetails} · ` : ""}
            {pinnedLat.toFixed(2)}°N, {pinnedLon.toFixed(2)}°E
          </div>
        </div>

        <button
          type="button"
          className="button primary"
          style={{
            padding: "7px 14px",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
          onClick={handleConfirm}
        >
          <Check size={14} />
          Confirm this pin
        </button>
      </div>
    </div>
  );
}

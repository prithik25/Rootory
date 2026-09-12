"use client";
import { useState, useEffect, useRef } from "react";
import {
  CloudSun,
  CloudRain,
  Droplets,
  Wind,
  MapPin,
  RefreshCw,
  Info,
  LoaderCircle,
  Search,
  X,
  Navigation,
} from "lucide-react";
import {
  POPULAR_LOCATIONS,
  searchLocations,
  type LocationOption,
} from "@/lib/locations";
import { LocationMap } from "./location-map";

type Weather = {
  temperature: number;
  humidity: number;
  wind: number;
  rainProbability: number | null;
  time: string;
  timezone: string;
};

export function LiveWeather() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [place, setPlace] = useState("Detecting location…");
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Location selector & Map state
  const [selecting, setSelecting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationOption[]>(
    POPULAR_LOCATIONS.slice(0, 12),
  );
  const [searching, setSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const activeCoords = useRef<{ lat: number; lon: number; label: string }>({
    lat: 18.52,
    lon: 73.86,
    label: "Pune",
  });
  const lastFetch = useRef<number>(0);

  async function loadForecast(lat: number, lon: number, label: string) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(
        `/api/weather?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}`,
      );
      const b = await r.json();
      if (!r.ok) throw Error(b.error || "Weather unavailable");
      setWeather(b);
      setPlace(label);
      lastFetch.current = Date.now();
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Weather unavailable");
    } finally {
      setBusy(false);
    }
  }

  function detectGpsLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("GPS not available in this browser. Choose a city below.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(2));
        const lon = Number(pos.coords.longitude.toFixed(2));
        const label = "Your location";
        activeCoords.current = { lat, lon, label };
        setIsAutoDetected(true);
        setSelecting(false);
        try {
          localStorage.setItem(
            "rootory_weather_coords",
            JSON.stringify({ lat, lon, label, isAuto: true }),
          );
        } catch {}
        void loadForecast(lat, lon, label);
      },
      () => {
        setBusy(false);
        setError("GPS permission denied or timed out. Pick a city below.");
      },
      { timeout: 8000, maximumAge: 300000, enableHighAccuracy: false },
    );
  }

  useEffect(() => {
    let isMounted = true;

    // 1. Check for previously saved coordinates for immediate display
    let initialLat = 18.52;
    let initialLon = 73.86;
    let initialLabel = "Pune";

    try {
      const cached = localStorage.getItem("rootory_weather_coords");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (
          parsed &&
          typeof parsed.lat === "number" &&
          typeof parsed.lon === "number"
        ) {
          initialLat = parsed.lat;
          initialLon = parsed.lon;
          initialLabel = parsed.label || "Your location";
          setIsAutoDetected(Boolean(parsed.isAuto));
        }
      }
    } catch {}

    activeCoords.current = {
      lat: initialLat,
      lon: initialLon,
      label: initialLabel,
    };
    setPlace(initialLabel);

    // Initial load immediately
    void loadForecast(initialLat, initialLon, initialLabel);

    // 2. Auto-detect live location via browser Geolocation API
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!isMounted) return;
          const lat = Number(pos.coords.latitude.toFixed(2));
          const lon = Number(pos.coords.longitude.toFixed(2));
          const label = "Your location";
          activeCoords.current = { lat, lon, label };
          setIsAutoDetected(true);
          try {
            localStorage.setItem(
              "rootory_weather_coords",
              JSON.stringify({ lat, lon, label, isAuto: true }),
            );
          } catch {}
          void loadForecast(lat, lon, label);
        },
        () => {
          // If denied or timed out, keep current coords seamlessly
        },
        { timeout: 8000, maximumAge: 300000, enableHighAccuracy: false },
      );
    }

    // 3. Auto-update every 5 minutes (300,000 ms)
    const intervalTimer = setInterval(() => {
      if (!isMounted) return;
      if (document.hidden) return;
      void loadForecast(
        activeCoords.current.lat,
        activeCoords.current.lon,
        activeCoords.current.label,
      );
    }, 5 * 60 * 1000);

    // 4. Refresh when tab becomes visible if 5+ minutes elapsed
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const elapsed = Date.now() - lastFetch.current;
        if (elapsed >= 5 * 60 * 1000) {
          void loadForecast(
            activeCoords.current.lat,
            activeCoords.current.lon,
            activeCoords.current.label,
          );
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isMounted = false;
      clearInterval(intervalTimer);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleManualRefresh = () => {
    void loadForecast(
      activeCoords.current.lat,
      activeCoords.current.lon,
      activeCoords.current.label,
    );
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!val.trim()) {
      setSearchResults(POPULAR_LOCATIONS.slice(0, 12));
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceTimer.current = setTimeout(async () => {
      const results = await searchLocations(val);
      setSearchResults(results);
      setSearching(false);
    }, 250);
  };

  const selectLocation = (loc: LocationOption) => {
    activeCoords.current = { lat: loc.lat, lon: loc.lon, label: loc.name };
    setIsAutoDetected(false);
    setSelecting(false);
    setSearchQuery("");
    setSearchResults(POPULAR_LOCATIONS.slice(0, 12));
    try {
      localStorage.setItem(
        "rootory_weather_coords",
        JSON.stringify({
          lat: loc.lat,
          lon: loc.lon,
          label: loc.name,
          isAuto: false,
        }),
      );
    } catch {}
    void loadForecast(loc.lat, loc.lon, loc.name);
  };

  return (
    <section className="weather-card" aria-label="Live weather forecast">
      <div className="row between" style={{ alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Weather near your garden</h3>
        <button
          className="icon-button borderless small-icon"
          onClick={handleManualRefresh}
          disabled={busy}
          aria-label="Refresh weather forecast"
          title="Refresh forecast (auto-updates every 5m)"
          style={{ opacity: busy ? 0.6 : 1 }}
        >
          <RefreshCw size={14} className={busy ? "spin" : ""} />
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          margin: "8px 0 10px",
          flexWrap: "wrap",
        }}
      >
        <MapPin size={13} style={{ color: "#758766", flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#32482c" }}>
          {place}
        </span>
        {isAutoDetected && (
          <span
            className="sample-tag"
            style={{ fontSize: 9, padding: "2px 6px" }}
          >
            Auto-detected
          </span>
        )}
        <button
          type="button"
          className="text-button"
          style={{
            fontSize: 11,
            padding: "2px 6px",
            textDecoration: "underline",
            cursor: "pointer",
            fontWeight: 500,
          }}
          onClick={() => setSelecting(!selecting)}
        >
          {selecting ? "Close" : "Change"}
        </button>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            color: "#889777",
          }}
        >
          Auto-updates every 5m
        </span>
      </div>

      {/* Easy Location Picker */}
      {selecting && (
        <div
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid #dce4ce",
            borderRadius: 12,
            padding: 12,
            margin: "8px 0 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              marginBottom: 8,
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
              }}
            >
              <Search size={14} style={{ color: "#758766" }} />
              <input
                autoFocus
                placeholder="Search city (e.g. Goa, Pune, Jaipur)…"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{
                  fontSize: 12,
                  border: "none",
                  outline: "none",
                  width: "100%",
                  background: "transparent",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="icon-button borderless small-icon"
                  onClick={() => handleSearchChange("")}
                  style={{ padding: 2 }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <button
              type="button"
              className="button secondary"
              style={{ padding: "5px 10px", fontSize: 11 }}
              onClick={() => setSelecting(false)}
            >
              Done
            </button>
          </div>

          {/* GPS and Map Pin Buttons */}
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <button
              type="button"
              className="button secondary"
              style={{
                flex: 1,
                padding: "6px 8px",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
              onClick={detectGpsLocation}
            >
              <Navigation size={12} />
              My GPS Location
            </button>
            <button
              type="button"
              className="button primary"
              style={{
                flex: 1,
                padding: "6px 8px",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
              onClick={() => setShowMap(!showMap)}
            >
              <MapPin size={12} />
              {showMap ? "Hide Map" : "Pin on Map"}
            </button>
          </div>

          {/* Interactive Map Component */}
          {showMap && (
            <LocationMap
              initialLat={activeCoords.current.lat}
              initialLon={activeCoords.current.lon}
              initialLabel={place}
              onSelectLocation={(lat, lon, label) => {
                selectLocation({
                  name: label,
                  state: "",
                  lat,
                  lon,
                });
                setShowMap(false);
              }}
              onClose={() => setShowMap(false)}
            />
          )}

          <div style={{ fontSize: 11, color: "#758766", marginBottom: 6 }}>
            {searchQuery ? "Matching locations:" : "Popular agricultural hubs:"}
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              maxHeight: 160,
              overflowY: "auto",
            }}
          >
            {searchResults.map((loc) => {
              const isCurrent = place
                .toLowerCase()
                .includes(loc.name.toLowerCase());
              return (
                <button
                  key={`${loc.name}-${loc.lat}-${loc.lon}`}
                  type="button"
                  className={`sample-tag ${isCurrent ? "active" : ""}`}
                  style={{
                    cursor: "pointer",
                    background: isCurrent ? "#48613d" : "#ffffffcc",
                    color: isCurrent ? "#fff" : "#48613d",
                    border: isCurrent
                      ? "1px solid #48613d"
                      : "1px solid #d7dfcd",
                    padding: "4px 8px",
                    fontSize: 11,
                    borderRadius: 6,
                    textAlign: "left",
                  }}
                  onClick={() => selectLocation(loc)}
                >
                  <strong>{loc.name}</strong>{" "}
                  <span style={{ fontSize: 10, opacity: 0.85 }}>
                    {loc.nearbyHub ? `(${loc.nearbyHub})` : loc.state ? `· ${loc.state}` : ""}
                  </span>
                </button>
              );
            })}
            {searching && (
              <span
                style={{
                  fontSize: 11,
                  color: "#758766",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: 4,
                }}
              >
                <LoaderCircle size={12} className="spin" /> Searching…
              </span>
            )}
            {!searching && searchResults.length === 0 && (
              <div style={{ width: "100%", padding: "4px 0" }}>
                <p style={{ fontSize: 11, color: "#758766", margin: "0 0 6px" }}>
                  Location not in quick list.
                </p>
                <button
                  type="button"
                  className="button secondary"
                  style={{ fontSize: 11, padding: "5px 10px", width: "100%" }}
                  onClick={() => setShowMap(true)}
                >
                  <MapPin size={12} /> Open map to pin your exact location
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {busy && !weather && (
        <div
          style={{
            padding: "20px 0",
            textAlign: "center",
            color: "#758766",
          }}
        >
          <LoaderCircle
            className="spin"
            size={22}
            style={{ margin: "0 auto 6px" }}
          />
          <p style={{ margin: 0, fontSize: 12 }}>
            Detecting location & loading live forecast…
          </p>
        </div>
      )}

      {error && !weather && (
        <div style={{ margin: "12px 0" }}>
          <p
            role="status"
            style={{ fontSize: 12, color: "#c2410c", margin: "0 0 8px" }}
          >
            {error}
          </p>
          <button
            className="button secondary"
            onClick={handleManualRefresh}
            disabled={busy}
          >
            Retry forecast
          </button>
        </div>
      )}

      {weather && (
        <>
          <div className="weather-main">
            <div>
              <strong>{Math.round(weather.temperature)}°C</strong>
              <p>Live conditions</p>
            </div>
            {weather.rainProbability && weather.rainProbability > 30 ? (
              <CloudRain size={40} />
            ) : (
              <CloudSun size={40} />
            )}
          </div>

          <div className="weather-metrics">
            <span>
              <Droplets size={14} /> {weather.humidity}% humidity
            </span>
            <span>
              <Wind size={14} /> {weather.wind} km/h wind
            </span>
            <span>
              <CloudRain size={14} />{" "}
              {weather.rainProbability !== null
                ? `${weather.rainProbability}% rain`
                : "No rain"}
            </span>
          </div>

          <div className="weather-advice">
            <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p>
                Check soil moisture before watering. Weather alone does not
                diagnose plant health.
              </p>
              <small>
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · `
                  : ""}
                Open-Meteo forecast
              </small>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

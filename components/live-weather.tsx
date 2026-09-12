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
} from "lucide-react";

type Weather = {
  temperature: number;
  humidity: number;
  wind: number;
  rainProbability: number | null;
  time: string;
  timezone: string;
};

const CITIES: Record<string, [number, number]> = {
  Pune: [18.52, 73.86],
  Mumbai: [19.08, 72.88],
  Nashik: [20.0, 73.79],
  Bengaluru: [12.97, 77.59],
  Delhi: [28.61, 77.21],
};

export function LiveWeather() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [place, setPlace] = useState("Detecting location…");
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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
    };
  }, []);

  const handleManualRefresh = () => {
    void loadForecast(
      activeCoords.current.lat,
      activeCoords.current.lon,
      activeCoords.current.label,
    );
  };

  const handleCityChange = (cityName: string) => {
    const point = CITIES[cityName];
    if (!point) return;
    activeCoords.current = { lat: point[0], lon: point[1], label: cityName };
    setIsAutoDetected(false);
    try {
      localStorage.setItem(
        "rootory_weather_coords",
        JSON.stringify({
          lat: point[0],
          lon: point[1],
          label: cityName,
          isAuto: false,
        }),
      );
    } catch {}
    void loadForecast(point[0], point[1], cityName);
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

      <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "6px 0 12px" }}>
        <MapPin size={13} style={{ color: "#758766" }} />
        <span style={{ fontSize: 12, fontWeight: 500 }}>{place}</span>
        {isAutoDetected && (
          <span className="sample-tag" style={{ fontSize: 9, padding: "2px 6px" }}>
            Auto-detected
          </span>
        )}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#889777" }}>
          Auto-updates every 5m
        </span>
      </div>

      {busy && !weather && (
        <div style={{ padding: "20px 0", textAlign: "center", color: "#758766" }}>
          <LoaderCircle className="spin" size={22} style={{ margin: "0 auto 6px" }} />
          <p style={{ margin: 0, fontSize: 12 }}>Detecting location & loading live forecast…</p>
        </div>
      )}

      {error && !weather && (
        <div style={{ margin: "12px 0" }}>
          <p role="status" style={{ fontSize: 12, color: "#c2410c", margin: "0 0 8px" }}>
            {error}
          </p>
          <button className="button secondary" onClick={handleManualRefresh} disabled={busy}>
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
              {weather.rainProbability !== null ? `${weather.rainProbability}% rain` : "No rain"}
            </span>
          </div>

          <div className="weather-advice">
            <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p>Check soil moisture before watering. Weather alone does not diagnose plant health.</p>
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

      <details style={{ marginTop: 12, fontSize: 11 }}>
        <summary style={{ cursor: "pointer", color: "#758766" }}>
          Change area manually
        </summary>
        <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.keys(CITIES).map((c) => (
            <button
              key={c}
              className={`sample-tag ${place === c ? "active" : ""}`}
              style={{
                cursor: "pointer",
                background: place === c ? "#48613d" : undefined,
                color: place === c ? "#fff" : undefined,
              }}
              onClick={() => handleCityChange(c)}
            >
              {c}
            </button>
          ))}
          {typeof navigator !== "undefined" && "geolocation" in navigator && (
            <button
              className="sample-tag"
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const lat = Number(pos.coords.latitude.toFixed(2));
                    const lon = Number(pos.coords.longitude.toFixed(2));
                    const label = "Your location";
                    activeCoords.current = { lat, lon, label };
                    setIsAutoDetected(true);
                    void loadForecast(lat, lon, label);
                  },
                  () => {},
                  { timeout: 8000 },
                );
              }}
            >
              Detect my GPS
            </button>
          )}
        </div>
      </details>
    </section>
  );
}

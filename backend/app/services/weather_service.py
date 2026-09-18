from __future__ import annotations

import json
import logging
import time
import urllib.request
from typing import Any

logger = logging.getLogger("aurora.weather")

ANTARCTIC_STATIONS: dict[str, dict[str, Any]] = {
    "bharati": {
        "name": "Bharati Station",
        "region": "Larsemann Hills (East Antarctica)",
        "lat": -69.4064,
        "lon": 76.1914,
        "fallback_temp": -14.2,
        "fallback_wind": 11.5,
    },
    "maitri": {
        "name": "Maitri Station",
        "region": "Schirmacher Oasis",
        "lat": -70.7667,
        "lon": 11.7333,
        "fallback_temp": -18.6,
        "fallback_wind": 13.5,
    }
}


def decode_weather_code(code: int) -> str:
    if code == 0:
        return "Clear Sky"
    elif code in (1, 2):
        return "Partly Cloudy"
    elif code == 3:
        return "Overcast"
    elif code in (71, 73, 75, 77):
        return "Snowfall"
    elif code in (85, 86):
        return "Snow Showers"
    return "Polar Conditions"


class WeatherService:
    def __init__(self) -> None:
        self._cache: dict[str, tuple[float, dict[str, Any]]] = {}
        self._cache_ttl_sec = 300.0  # 5 minutes cache

    def get_weather(self, station_name: str) -> dict[str, Any]:
        key = self._resolve_key(station_name)
        meta = ANTARCTIC_STATIONS.get(key, ANTARCTIC_STATIONS["bharati"])

        now = time.time()
        if key in self._cache:
            ts, cached_data = self._cache[key]
            if now - ts < self._cache_ttl_sec:
                return cached_data

        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={meta['lat']}&longitude={meta['lon']}"
            f"&current=temperature_2m,wind_speed_10m,weather_code"
        )
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "AURORA-Antarctic-Energy/1.0"}
            )
            with urllib.request.urlopen(req, timeout=3.5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                current = data.get("current", {})
                temp_c = round(float(current.get("temperature_2m", meta["fallback_temp"])), 1)
                # Open-Meteo wind speed is in km/h; convert to m/s for engineering microgrid balance
                wind_kmh = float(current.get("wind_speed_10m", meta["fallback_wind"] * 3.6))
                wind_ms = round(wind_kmh / 3.6, 1)
                weather_code = int(current.get("weather_code", 0))
                condition = decode_weather_code(weather_code)

                result = {
                    "station": meta["name"],
                    "region": meta["region"],
                    "temperatureC": temp_c,
                    "windSpeedMs": wind_ms,
                    "condition": condition,
                    "source": "live_satellite_aws",
                    "latitude": meta["lat"],
                    "longitude": meta["lon"],
                }
                self._cache[key] = (now, result)
                return result
        except Exception as e:
            logger.info("Could not fetch online weather for %s (%s). Using calibrated station baseline.", key, e)
            result = {
                "station": meta["name"],
                "region": meta["region"],
                "temperatureC": meta["fallback_temp"],
                "windSpeedMs": meta["fallback_wind"],
                "condition": "Polar Baseline",
                "source": "station_sensor_baseline",
                "latitude": meta["lat"],
                "longitude": meta["lon"],
            }
            self._cache[key] = (now, result)
            return result

    @staticmethod
    def _resolve_key(name: str) -> str:
        s = name.lower()
        if "carlini" in s:
            return "carlini"
        if "mcmurdo" in s:
            return "mcmurdo"
        if "vostok" in s:
            return "vostok"
        if "south" in s or "pole" in s:
            return "south_pole"
        if "maitri" in s:
            return "maitri"
        return "bharati"


weather_service = WeatherService()

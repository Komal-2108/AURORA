from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock

# pyrefly: ignore [missing-import]
from ..core.config import settings
# pyrefly: ignore [missing-import]
from ..models.station import StationState


class StateService:
    def __init__(self) -> None:
        self._lock = Lock()
        self._states = {
            "bharati": StationState("bharati", settings.seed_fuel_litres, settings.seed_battery_soc),
            "maitri": StationState("maitri", settings.seed_fuel_litres * 0.91, 68.0),
            "generic": StationState("generic", settings.seed_fuel_litres * 0.82, 61.0),
        }

    def get(self, station: str) -> StationState:
        key = station.lower()
        with self._lock:
            if key not in self._states:
                self._states[key] = StationState(key, settings.seed_fuel_litres, settings.seed_battery_soc)
            return self._states[key]

    def set_mode(self, station: str, mode: str) -> None:
        self.get(station).mode = mode

    SCENARIO_PRESETS = {
        "scenario_1_normal": {
            "load_kw": 200.0,
            "solar_kw": 80.0,
            "wind_kw": 60.0,
            "battery_soc": 70.0,
            "critical_load_kw": 100.0,
            "essential_load_kw": 60.0,
            "flexible_load_kw": 40.0,
            "fuel_litres": 218400.0,
            "mode": "Normal",
            "weather_condition": "Clear polar sky",
            "temperature_c": -18.6,
            "wind_speed_ms": 12.4,
        },
        "scenario_2_polar_storm": {
            "load_kw": 200.0,
            "solar_kw": 10.0,
            "wind_kw": 15.0,
            "battery_soc": 65.0,
            "critical_load_kw": 100.0,
            "essential_load_kw": 60.0,
            "flexible_load_kw": 40.0,
            "fuel_litres": 182000.0,
            "mode": "Polar Storm",
            "weather_condition": "Severe Polar Storm",
            "temperature_c": -29.2,
            "wind_speed_ms": 28.5,
        },
        "scenario_3_critical_shortage": {
            "load_kw": 250.0,
            "solar_kw": 10.0,
            "wind_kw": 10.0,
            "battery_soc": 20.0,
            "critical_load_kw": 125.0,
            "essential_load_kw": 75.0,
            "flexible_load_kw": 50.0,
            "fuel_litres": 38000.0,
            "mode": "Critical Shortage",
            "weather_condition": "Extreme Deep Freeze",
            "temperature_c": -34.8,
            "wind_speed_ms": 16.0,
        },
    }

    # Backward compatibility aliases
    SCENARIO_PRESETS["normal"] = SCENARIO_PRESETS["scenario_1_normal"]
    SCENARIO_PRESETS["scenario_1"] = SCENARIO_PRESETS["scenario_1_normal"]
    SCENARIO_PRESETS["normal_operations"] = SCENARIO_PRESETS["scenario_1_normal"]

    SCENARIO_PRESETS["polar_storm"] = SCENARIO_PRESETS["scenario_2_polar_storm"]
    SCENARIO_PRESETS["scenario_2"] = SCENARIO_PRESETS["scenario_2_polar_storm"]
    SCENARIO_PRESETS["blizzard"] = SCENARIO_PRESETS["scenario_2_polar_storm"]

    SCENARIO_PRESETS["critical_shortage"] = SCENARIO_PRESETS["scenario_3_critical_shortage"]
    SCENARIO_PRESETS["scenario_3"] = SCENARIO_PRESETS["scenario_3_critical_shortage"]
    SCENARIO_PRESETS["shortage"] = SCENARIO_PRESETS["scenario_3_critical_shortage"]
    SCENARIO_PRESETS["battery_depleted"] = SCENARIO_PRESETS["scenario_3_critical_shortage"]
    SCENARIO_PRESETS["fuel_conservation"] = SCENARIO_PRESETS["scenario_2_polar_storm"]

    def set_scenario(self, station: str, scenario: str, battery_soc: float | None = None, fuel_litres: float | None = None) -> StationState:
        state = self.get(station)
        sc_lower = scenario.lower().replace(" ", "_").replace("—", "_").replace("-", "_")
        with self._lock:
            state.scenario = scenario
            preset = self.SCENARIO_PRESETS.get(sc_lower)
            if not preset:
                # Look for partial matches like normal, polar, storm, shortage, critical
                if "storm" in sc_lower or "blizzard" in sc_lower or "2" in sc_lower:
                    preset = self.SCENARIO_PRESETS["scenario_2_polar_storm"]
                elif "shortage" in sc_lower or "critical" in sc_lower or "3" in sc_lower:
                    preset = self.SCENARIO_PRESETS["scenario_3_critical_shortage"]
                else:
                    preset = self.SCENARIO_PRESETS["scenario_1_normal"]

            if preset:
                state.battery_soc = preset["battery_soc"]
                state.fuel_litres = preset["fuel_litres"]
                state.mode = preset["mode"]
                state.load_kw = preset["load_kw"]
                state.solar_kw = preset["solar_kw"]
                state.wind_kw = preset["wind_kw"]
                state.critical_load_kw = preset["critical_load_kw"]
                state.essential_load_kw = preset["essential_load_kw"]
                state.flexible_load_kw = preset["flexible_load_kw"]
                state.weather_condition = preset["weather_condition"]
                state.temperature_c = preset["temperature_c"]
                state.wind_speed_ms = preset["wind_speed_ms"]

            if battery_soc is not None:
                state.battery_soc = float(max(5.0, min(95.0, battery_soc)))
            if fuel_litres is not None:
                state.fuel_litres = float(max(0.0, fuel_litres))
            return state

    def mark_optimized(self, station: str) -> None:
        self.get(station).last_optimization = datetime.now(timezone.utc).isoformat()


state_service = StateService()

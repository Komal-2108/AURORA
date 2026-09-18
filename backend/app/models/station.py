from dataclasses import dataclass


@dataclass
class StationState:
    station: str
    fuel_litres: float
    battery_soc: float
    mode: str = "Normal"
    scenario: str = "normal"
    last_optimization: str | None = None
    load_kw: float | None = 200.0
    solar_kw: float | None = 80.0
    wind_kw: float | None = 60.0
    critical_load_kw: float | None = 100.0
    essential_load_kw: float | None = 60.0
    flexible_load_kw: float | None = 40.0
    weather_condition: str | None = "Clear polar sky"
    temperature_c: float | None = -18.6
    wind_speed_ms: float | None = 12.4


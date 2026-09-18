from __future__ import annotations

# pyrefly: ignore [missing-import]
from ..core.config import settings
from .forecast_service import ForecastService
from .state_service import state_service
from .weather_service import weather_service


class DashboardService:
    def __init__(self, forecast_service: ForecastService):
        self.forecast = forecast_service

    def snapshot(self, station: str) -> dict:
        row = self.forecast.simulator.latest(station)
        state = state_service.get(station)

        load = float(state.load_kw) if state.load_kw is not None else float(row["load_kw"])
        solar = float(state.solar_kw) if state.solar_kw is not None else float(row["solar_kw"])
        wind = float(state.wind_kw) if state.wind_kw is not None else float(row["wind_kw"])
        critical = float(state.critical_load_kw) if state.critical_load_kw is not None else round(load * 0.5, 1)
        essential = float(state.essential_load_kw) if state.essential_load_kw is not None else round(load * 0.3, 1)
        flexible = float(state.flexible_load_kw) if state.flexible_load_kw is not None else round(load - critical - essential, 1)

        renewable_pct = min(100.0, (solar + wind) / max(load, 1e-6) * 100.0)
        diesel_needed = max(0.0, load - solar - wind)
        active_gens = 1 if diesel_needed <= settings.generator_capacity_kw else (2 if diesel_needed <= settings.generator_capacity_kw * 2 else 3)
        if diesel_needed <= 5.0 and state.battery_soc > 30:
            active_gens = 0

        # Physical fuel consumption: generator burn rate (0.29 L/kWh) applied to required diesel output
        effective_gen_kw = max(settings.generator_min_kw if active_gens > 0 else 0.0, min(settings.generator_capacity_kw * max(1, active_gens), diesel_needed))
        daily_consumption = max(180.0, effective_gen_kw * 24 * settings.generator_fuel_l_per_kwh)
        days = round(state.fuel_litres / daily_consumption, 0)

        # Retrieve Antarctic station weather or scenario-defined weather
        w = weather_service.get_weather(station)
        temp_c = state.temperature_c if state.temperature_c is not None else w["temperatureC"]
        wind_ms = state.wind_speed_ms if state.wind_speed_ms is not None else w["windSpeedMs"]
        condition = state.weather_condition if state.weather_condition is not None else w["condition"]

        return {
            "station": station,
            "timestamp": row["timestamp"].isoformat(),
            "loadKw": round(load, 2),
            "batterySoc": round(state.battery_soc, 1),
            "fuelLitres": round(state.fuel_litres, 0),
            "renewablePct": round(renewable_pct, 1),
            "daysToExhaustion": round(days, 0),
            "solarKw": round(solar, 2),
            "windKw": round(wind, 2),
            "criticalLoadKw": round(critical, 2),
            "essentialLoadKw": round(essential, 2),
            "flexibleLoadKw": round(flexible, 2),
            "thermalKw": round(float(row.get("heating_load_kw", 112.0)), 2),
            "temperatureC": temp_c,
            "windSpeedMs": wind_ms,
            "weatherCondition": condition,
            "weatherSource": w.get("source", "live"),
            "dailyConsumptionLitres": round(daily_consumption, 0),
            "activeGenerators": active_gens,
            "mode": state.mode,
            "scenario": state.scenario,
            "model": "XGBoost",
            "metrics": self.forecast.metrics,
        }


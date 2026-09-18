from .forecast_service import ForecastService
from .state_service import state_service


class EnergyService:
    def __init__(self, forecast_service: ForecastService):
        self.forecast = forecast_service

    def live(self, station: str) -> dict:
        row = self.forecast.simulator.latest(station)
        state = state_service.get(station)
        load = float(state.load_kw) if state.load_kw is not None else float(row["load_kw"])
        solar = float(state.solar_kw) if state.solar_kw is not None else float(row["solar_kw"])
        wind = float(state.wind_kw) if state.wind_kw is not None else float(row["wind_kw"])
        critical = float(state.critical_load_kw) if state.critical_load_kw is not None else round(load * 0.5, 1)
        essential = float(state.essential_load_kw) if state.essential_load_kw is not None else round(load * 0.3, 1)
        flexible = float(state.flexible_load_kw) if state.flexible_load_kw is not None else round(load - critical - essential, 1)

        return {
            "timestamp": row["timestamp"].isoformat(),
            "load_kw": round(load, 2),
            "solar_kw": round(solar, 2),
            "wind_kw": round(wind, 2),
            "critical_load_kw": round(critical, 2),
            "essential_load_kw": round(essential, 2),
            "flexible_load_kw": round(flexible, 2),
            "diesel_kw": max(0.0, load - solar - wind),
            "battery_kw": -48.0 if state.battery_soc > 40 else 0.0,
            "thermal_kw": float(row.get("heating_load_kw", 112.0)),
            "battery_soc": state.battery_soc,
            "fuel_litres": state.fuel_litres,
        }

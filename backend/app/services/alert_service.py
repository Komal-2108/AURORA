from datetime import datetime, timezone
# pyrefly: ignore [missing-import]
from ..core.config import settings
from .state_service import state_service


class AlertService:
    def build(self, station: str) -> list[dict]:
        state = state_service.get(station)
        now = datetime.now()
        t1 = (now.replace(minute=max(0, (now.minute - 15) % 60))).strftime("%I:%M %p")
        t2 = (now.replace(minute=max(0, (now.minute - 45) % 60))).strftime("%I:%M %p")
        alerts = []
        sc = (state.scenario or "").lower()

        if "storm" in sc or "blizzard" in sc or "2" in sc:
            alerts.append({
                "id": "polar-storm-alert",
                "severity": "warning",
                "title": "Polar Storm Renewable Reduction",
                "body": "Severe weather event in progress. Renewable output heavily suppressed (Solar 10 kW, Wind 15 kW).",
                "timestamp": "Active",
                "action": "Dispatch auxiliary generators and conserve battery storage",
            })
        elif "shortage" in sc or "critical" in sc or "3" in sc:
            alerts.append({
                "id": "critical-shortage-alert",
                "severity": "danger",
                "title": "Critical Power Shortage",
                "body": "Station demand surge to 250 kW with only 20 kW renewable generation and depleted battery reserve.",
                "timestamp": "Urgent",
                "action": "Shed flexible load (50 kW) immediately and engage backup generation",
            })

        alerts.extend([
            {
                "id": "fuel-efficiency",
                "severity": "warning" if "storm" in sc or "shortage" in sc else "info",
                "title": "Fuel dispatch watch",
                "body": "Generator burn profile tracked against real-time electrical deficit.",
                "timestamp": t1,
                "action": "Shift flexible load and re-run optimization",
            },
            {
                "id": "polar-weather",
                "severity": "info",
                "title": "Polar environmental telemetry",
                "body": f"Ambient condition: {state.weather_condition or 'Active'} · Wind {state.wind_speed_ms or 12.4} m/s.",
                "timestamp": t2,
                "action": "Monitor renewable generation and battery SOC",
            },
        ])

        if state.fuel_litres < settings.fuel_reserve_litres * 1.5:
            alerts.insert(0, {
                "id": "fuel-risk",
                "severity": "danger",
                "title": "Fuel reserve risk",
                "body": "Projected fuel inventory is approaching the conservation threshold.",
                "timestamp": "Now",
                "action": "Activate Fuel Conservation Mode",
            })
        if state.battery_soc < 25:
            alerts.insert(0, {
                "id": "battery-risk",
                "severity": "danger",
                "title": "Battery reserve low",
                "body": f"Battery state of charge ({state.battery_soc:.0f}%) is below the 25% safety reserve floor.",
                "timestamp": "Now",
                "action": "Halt discretionary discharge and prioritize critical loads",
            })
        return alerts

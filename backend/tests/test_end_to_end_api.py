import pytest
from fastapi.testclient import TestClient

try:
    from backend.app.main import app
except ModuleNotFoundError:
    from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["ml"] == "connected"


def test_dashboard_bharati():
    res = client.get("/api/dashboard?station=bharati")
    assert res.status_code == 200
    data = res.json()
    assert data["station"] == "bharati"
    assert "loadKw" in data
    assert "batterySoc" in data
    assert "fuelLitres" in data
    assert "renewablePct" in data
    assert "solarKw" in data
    assert "windKw" in data
    assert "thermalKw" in data


def test_load_forecast():
    res = client.get("/api/forecast/load?station=bharati&horizon=24")
    assert res.status_code == 200
    data = res.json()
    assert len(data["points"]) == 96
    assert data["points"][0]["value_kw"] > 0


def test_renewable_forecast():
    res = client.get("/api/forecast/renewable?station=bharati&horizon=24")
    assert res.status_code == 200
    data = res.json()
    assert len(data["points"]) == 96
    assert "solar_kw" in data["points"][0]
    assert "wind_kw" in data["points"][0]


def test_energy_live():
    res = client.get("/api/energy/live?station=bharati")
    assert res.status_code == 200
    data = res.json()
    assert "load_kw" in data
    assert "solar_kw" in data
    assert "wind_kw" in data
    assert "thermal_kw" in data


def test_fuel_status():
    res = client.get("/api/fuel/status?station=bharati")
    assert res.status_code == 200
    data = res.json()
    assert "fuelLitres" in data
    assert "daysToExhaustion" in data
    assert "risk" in data


def test_battery_status():
    res = client.get("/api/battery/status?station=bharati")
    assert res.status_code == 200
    data = res.json()
    assert "soc" in data
    assert "capacityKwh" in data


def test_alerts():
    res = client.get("/api/alerts?station=bharati")
    assert res.status_code == 200
    data = res.json()
    assert "alerts" in data
    assert len(data["alerts"]) >= 1


def test_simulation_scenario():
    res = client.post("/api/simulation/scenario", json={"station": "bharati", "scenario": "blizzard"})
    assert res.status_code == 200
    data = res.json()
    assert data["scenario"] == "blizzard"
    assert data["batterySoc"] == 42.0

    # Reset to normal
    res2 = client.post("/api/simulation/scenario", json={"station": "bharati", "scenario": "normal"})
    assert res2.status_code == 200
    assert res2.json()["batterySoc"] == 72.0


def test_optimization_run_and_history():
    res = client.post("/api/optimization/run", json={"station": "bharati", "mode": "Normal", "horizon": "24 Hours"})
    assert res.status_code == 200
    data = res.json()
    assert "fuel_saved_litres" in data
    assert "dispatch" in data
    assert len(data["dispatch"]) > 0
    assert "solver" in data

    hist_res = client.get("/api/optimization/history?limit=5")
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert "runs" in hist_data
    assert len(hist_data["runs"]) >= 1

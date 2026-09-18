const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'false').toLowerCase() === 'true';

let currentClientScenario = 'scenario_1_normal';
let mockDashboard = {
  station: 'bharati',
  scenario: 'scenario_1_normal',
  loadKw: 200,
  solarKw: 80,
  windKw: 60,
  batterySoc: 70,
  criticalLoadKw: 100,
  essentialLoadKw: 60,
  flexibleLoadKw: 40,
  fuelLitres: 218400,
  renewablePct: 70,
  daysToExhaustion: 174,
  thermalKw: 112,
  mode: 'Normal',
  weatherCondition: 'Clear polar sky',
  temperatureC: -18.6,
  windSpeedMs: 12.4,
  model: 'XGBoost',
  metrics: { mae_kw: 16.12, rmse_kw: 20.08, mape_pct: 5.81, r2: 0.713 }
};

async function request(path, options = {}) {
  if (USE_MOCK) return null;
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {'Content-Type':'application/json', ...(options.headers || {})},
    });
    if (!response.ok) throw new Error(`AURORA API error ${response.status}`);
    return await response.json();
  } catch (err) {
    if (path.includes('/api/dashboard') || path.includes('/api/simulation/scenario')) {
      return null;
    }
    throw err;
  }
}

export const api = {
  async getDashboard(station = 'bharati') {
    const data = await request(`/api/dashboard?station=${encodeURIComponent(station)}`);
    return data || mockDashboard;
  },
  async getForecasts(station = 'bharati', horizon = 24) {
    const [load, renewable] = await Promise.all([
      request(`/api/forecast/load?station=${encodeURIComponent(station)}&horizon=${horizon}`),
      request(`/api/forecast/renewable?station=${encodeURIComponent(station)}&horizon=${horizon}`),
    ]);
    if (load && renewable) return {load, renewable};
    return {load:null, renewable:null};
  },
  async getEnergyLive(station = 'bharati') {
    return request(`/api/energy/live?station=${encodeURIComponent(station)}`);
  },
  async getFuelStatus(station = 'bharati') {
    return request(`/api/fuel/status?station=${encodeURIComponent(station)}`);
  },
  async getBatteryStatus(station = 'bharati') {
    return request(`/api/battery/status?station=${encodeURIComponent(station)}`);
  },
  async getAlerts(station = 'bharati') {
    return request(`/api/alerts?station=${encodeURIComponent(station)}`);
  },
  async getOptimizationHistory(limit = 10) {
    const data = await request(`/api/optimization/history?limit=${limit}`);
    return data?.runs || [];
  },
  async runOptimization({station, mode, horizon}) {
    const data = await request('/api/optimization/run', {method:'POST', body:JSON.stringify({station: station.toLowerCase().split(' ')[0], mode, horizon})});
    if (data) return {
      ...data,
      fuelSavedLitres: data.fuel_saved_litres,
      renewableUtilization: data.renewable_utilization,
    };
    await new Promise(resolve => setTimeout(resolve, 700));
    return {station,mode,horizon,fuelSavedLitres:184,reliability:99.98,renewableUtilization:41,dispatch:[],recommendations:[]};
  },
  async runScenario({station, scenario, batterySoc, fuelLitres}) {
    const presets = {
      scenario_1_normal: { loadKw: 200, solarKw: 80, windKw: 60, batterySoc: 70, criticalLoadKw: 100, essentialLoadKw: 60, flexibleLoadKw: 40, mode: 'Normal', weatherCondition: 'Clear polar sky', temperatureC: -18.6, windSpeedMs: 12.4, fuelLitres: 218400, renewablePct: 70 },
      scenario_2_polar_storm: { loadKw: 200, solarKw: 10, windKw: 15, batterySoc: 65, criticalLoadKw: 100, essentialLoadKw: 60, flexibleLoadKw: 40, mode: 'Polar Storm', weatherCondition: 'Severe Polar Storm', temperatureC: -29.2, windSpeedMs: 28.5, fuelLitres: 182000, renewablePct: 12.5 },
      scenario_3_critical_shortage: { loadKw: 250, solarKw: 10, windKw: 10, batterySoc: 20, criticalLoadKw: 125, essentialLoadKw: 75, flexibleLoadKw: 50, mode: 'Critical Shortage', weatherCondition: 'Extreme Deep Freeze', temperatureC: -34.8, windSpeedMs: 16.0, fuelLitres: 38000, renewablePct: 8.0 },
    };
    presets.normal = presets.scenario_1_normal;
    presets.polar_storm = presets.scenario_2_polar_storm;
    presets.blizzard = presets.scenario_2_polar_storm;
    presets.critical_shortage = presets.scenario_3_critical_shortage;

    const preset = presets[scenario] || presets.scenario_1_normal;
    mockDashboard = {
      ...mockDashboard,
      ...preset,
      scenario,
      batterySoc: batterySoc ?? preset.batterySoc,
      fuelLitres: fuelLitres ?? preset.fuelLitres,
    };

    const res = await request('/api/simulation/scenario', {
      method: 'POST',
      body: JSON.stringify({
        station: station.toLowerCase().split(' ')[0],
        scenario,
        battery_soc: batterySoc,
        fuel_litres: fuelLitres
      })
    });
    return res || mockDashboard;
  }
};


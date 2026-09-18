import React, { useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, BatteryCharging, Bell, BrainCircuit,
  CalendarClock, CloudSun, Gauge, GitBranch, Leaf, LineChart,
  Power, Server, ShieldCheck, Sparkles, Zap
} from 'lucide-react';
import '../styles.css';
import PanelHeader from '../components/common/PanelHeader';
import MetricCard from '../components/common/MetricCard';
import MiniStat from '../components/common/MiniStat';
import AlertCard from '../components/common/AlertCard';
import EnergyFlow from '../components/energy/EnergyFlow';
import StatusList from '../components/energy/StatusList';
import FuelGauge from '../components/energy/FuelGauge';
import OptimizationDonut from '../components/energy/OptimizationDonut';
import { LoadForecastChart, RenewableChart } from '../components/charts/Charts';
import { hourly } from '../data/mockData';

export default function Overview({
  dashboard,
  forecasts,
  optimizationResult,
  systemMode,
  setSystemMode,
  horizon,
  setHorizon,
  onRunOptimization,
  running,
  lastOptimization,
  setToast,
  apiError,
  station = 'Bharati Station',
  alerts = []
}) {
  const [forecastMode, setForecastMode] = useState('Solar');

  const forecastSeries = useMemo(() => {
    const renew = forecasts?.renewable?.points;

    if (renew?.length) {
      return renew.map(d => ({
        t: new Date(d.timestamp).getHours().toString().padStart(2, '0'),
        value: forecastMode === 'Solar' ? d.solar_kw : d.wind_kw
      }));
    }

    return hourly.map(d => ({
      t: d.t,
      value: forecastMode === 'Solar' ? d.solar : d.wind
    }));
  }, [forecastMode, forecasts]);

  const loadPoints = forecasts?.load?.points?.map(p => ({
    t: new Date(p.timestamp).getHours().toString().padStart(2, '0'),
    forecast: p.value_kw,
    actual: null
  }));

  const loadDiff = forecasts?.load?.points?.[0]?.value_kw != null
    ? (((dashboard?.loadKw ?? 187) - forecasts.load.points[0].value_kw) / forecasts.load.points[0].value_kw * 100)
    : null;

  const insight = useMemo(() => {
    if (optimizationResult?.recommendations?.length) {
      return {
        action: optimizationResult.recommendations[0],
        detail: optimizationResult.recommendations[1] || `Optimized dispatch schedule using ${optimizationResult.solver || 'MILP solver'}.`,
        fuelSaved: `${Number(optimizationResult.fuelSavedLitres || 18.4).toFixed(1)} L`,
        reliability: `${Number(optimizationResult.reliability || 99.98).toFixed(2)}%`,
      };
    }
    const solar = dashboard?.solarKw ?? 80;
    const wind = dashboard?.windKw ?? 60;
    const soc = dashboard?.batterySoc ?? 70;
    const load = dashboard?.loadKw ?? 200;
    const ren = solar + wind;
    const renPct = dashboard?.renewablePct ?? Math.round((ren / Math.max(1, load)) * 100);

    if (soc <= 25) {
      return {
        action: 'Preserve critical battery reserve floor',
        detail: `Battery SOC at ${soc}% (below 25% safety reserve). Prioritize critical load (${Math.round(dashboard?.criticalLoadKw ?? 125)} kW) and shed flexible demand.`,
        fuelSaved: '14.2 L',
        reliability: '99.95%',
      };
    } else if (ren > load * 0.45) {
      return {
        action: 'Charge battery during renewable surplus window',
        detail: `Renewables generating ${Math.round(ren)} kW (${renPct}% of load). Minimizing generator run hours.`,
        fuelSaved: `${(renPct * 0.38).toFixed(1)} L`,
        reliability: '99.98%',
      };
    }
    return {
      action: 'Dispatch balanced generation with storage reserve support',
      detail: `Station load at ${Math.round(load)} kW. Renewables supply ${Math.round(ren)} kW (${renPct}%).`,
      fuelSaved: `${Math.max(8.0, (load * 0.07)).toFixed(1)} L`,
      reliability: '99.98%',
    };
  }, [optimizationResult, dashboard]);

  const exportReport = () =>
    setToast({
      type: 'info',
      text: 'Station snapshot queued: dispatch, fuel resilience and KPI summary.'
    });

  const stationDisplayName = (dashboard?.station || station || 'BHARATI')
    .replace(/ station/i, '')
    .toUpperCase();

  const tempDisplay = dashboard?.temperatureC != null
    ? `${dashboard.temperatureC > 0 ? '+' : ''}${dashboard.temperatureC}°C`
    : '−18.6°C';

  const conditionDisplay = dashboard?.weatherCondition || (dashboard?.scenario === 'blizzard'
    ? 'Blizzard'
    : ((dashboard?.solarKw ?? 0) > 10 ? 'Sunlit Sky' : 'Polar Night'));

  const windDisplay = dashboard?.windSpeedMs != null
    ? `${dashboard.windSpeedMs} m/s (${Math.round(dashboard.windSpeedMs * 3.6)} km/h)`
    : '12.4 m/s (45 km/h)';

  return (
    <main className="aurora-command-center">

      {/* CINEMATIC HERO */}
      <section className="command-hero">

        <div className="hero-stars" />
        <div className="aurora-ribbon aurora-ribbon-one" />
        <div className="aurora-ribbon aurora-ribbon-two" />
        <div className="aurora-ribbon aurora-ribbon-three" />
        <div className="hero-mountains" />

        <div className="command-hero-grid">
          {/* Left Column: Identity, Status & Weather */}
          <div className="hero-copy-column">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                {stationDisplayName} RESEARCH STATION · ANTARCTICA
              </div>

              <h1>
                Energy Command
                <span>Center</span>
              </h1>

              <p>
                Intelligent orchestration of generation, storage and critical
                station loads in one living energy system.
              </p>

              <div className="hero-status-row">
                <div className="hero-status-chip">
                  <Activity size={15} />
                  <span>LIVE TELEMETRY</span>
                </div>
                <div className="hero-status-chip">
                  <Sparkles size={15} />
                  <span>{dashboard?.model ?? 'XGBoost'} INTELLIGENCE</span>
                </div>
              </div>
            </div>

            <div className="hero-weather">
              <div className="weather-chip"><span>{tempDisplay}</span><small>Temperature</small></div>
              <div className="weather-chip"><span>{conditionDisplay}</span><small>Current condition</small></div>
              <div className="weather-chip"><span>{windDisplay}</span><small>Wind speed</small></div>
            </div>
          </div>

          {/* Center Column: Live Station AI Orbit */}
          <div className="station-orbit-column">
            <div className="station-orbit">
              <div className="orbit-ring orbit-ring-one" />
              <div className="orbit-ring orbit-ring-two" />
              <div className="orbit-ring orbit-ring-three" />

              <div className="ai-core">
                <span className="ai-core-glow" />
                <Sparkles size={26} />
                <strong>AURORA</strong>
                <small>AI</small>
              </div>

              <div className="flow-node node-solar">
                <div className="node-icon solar"><CloudSun size={19} /></div>
                <div>
                  <span>SOLAR</span>
                  <strong>{Math.round(dashboard?.solarKw ?? 80)} kW</strong>
                  <small>{(dashboard?.solarKw ?? 80) > 15 ? 'Live generation' : 'Reduced output'}</small>
                </div>
              </div>

              <div className="flow-node node-load">
                <div className="node-icon load"><Zap size={19} /></div>
                <div>
                  <span>STATION LOAD</span>
                  <strong>{Math.round(dashboard?.loadKw ?? 200)} kW</strong>
                  <small>Crit {Math.round(dashboard?.criticalLoadKw ?? 100)}k · Ess {Math.round(dashboard?.essentialLoadKw ?? 60)}k · Flex {Math.round(dashboard?.flexibleLoadKw ?? 40)}k</small>
                </div>
              </div>

              <div className="flow-node node-wind">
                <div className="node-icon wind"><Activity size={19} /></div>
                <div>
                  <span>WIND</span>
                  <strong>{Math.round(dashboard?.windKw ?? 60)} kW</strong>
                  <small>{(dashboard?.windKw ?? 60) > 20 ? `${dashboard?.windSpeedMs ?? 12.4} m/s active` : 'Reduced wind'}</small>
                </div>
              </div>

              <div className="flow-node node-battery">
                <div className="node-icon battery"><BatteryCharging size={19} /></div>
                <div>
                  <span>BATTERY</span>
                  <strong>{dashboard?.batterySoc ?? 70}%</strong>
                  <small>{(dashboard?.batterySoc ?? 70) > 25 ? 'Reserve healthy' : 'CRITICAL RESERVE'}</small>
                </div>
              </div>

              <div className="flow-node node-fuel">
                <div className="node-icon fuel"><Gauge size={19} /></div>
                <div>
                  <span>FUEL RESERVE</span>
                  <strong>{Number(dashboard?.fuelLitres ?? 218400).toLocaleString()} L</strong>
                  <small>{dashboard?.daysToExhaustion ?? 174} projected days</small>
                </div>
              </div>

              <div className="energy-path path-solar" />
              <div className="energy-path path-load" />
              <div className="energy-path path-wind" />
              <div className="energy-path path-battery" />
              <div className="energy-path path-fuel" />
            </div>
          </div>

          {/* Right Column: Aurora Insight Recommendation Card */}
          <div className="hero-insight-column">
            <aside className="insight-orb">
              <div className="insight-top">
                <div className="insight-icon"><BrainCircuit size={18} /></div>
                <div>
                  <span>AURORA INSIGHT</span>
                  <strong>Optimization recommendation</strong>
                </div>
              </div>

              <div className="insight-main">
                <small>NEXT BEST ACTION</small>
                <h3>{insight.action}</h3>
                <p>{insight.detail}</p>
              </div>

              <div className="insight-impact">
                <div><Leaf size={16} /><span>Fuel saving</span><b>{insight.fuelSaved}</b></div>
                <div><ShieldCheck size={16} /><span>Reliability</span><b>{insight.reliability}</b></div>
              </div>

              <button
                className="insight-button"
                onClick={onRunOptimization}
              >
                {running ? 'Computing dispatch…' : 'Run optimizer recommendation'} <span>→</span>
              </button>
            </aside>
          </div>
        </div>
      </section>

      {/* KPI STRIP */}
      <section className="cinematic-kpi-strip">
        <MetricCard
          title="TOTAL GENERATION"
          value={Math.round((dashboard?.solarKw ?? 80) + (dashboard?.windKw ?? 60) + Math.max(0, (dashboard?.loadKw ?? 200) - (dashboard?.solarKw ?? 80) - (dashboard?.windKw ?? 60)))}
          unit="kW"
          hint="Live station output"
          delta="Live"
          icon={<Power size={18} />}
          tone="cyan"
        />
        <MetricCard
          title="RENEWABLE SHARE"
          value={dashboard?.renewablePct ?? Math.round((((dashboard?.solarKw ?? 80) + (dashboard?.windKw ?? 60)) / Math.max(1, dashboard?.loadKw ?? 200)) * 100)}
          unit="%"
          hint="Blended renewable feed"
          delta={`${Math.round((dashboard?.solarKw ?? 80) + (dashboard?.windKw ?? 60))} kW total`}
          icon={<Leaf size={18} />}
          tone={(dashboard?.renewablePct ?? 70) > 30 ? "green" : "orange"}
          progress={dashboard?.renewablePct ?? Math.round((((dashboard?.solarKw ?? 80) + (dashboard?.windKw ?? 60)) / Math.max(1, dashboard?.loadKw ?? 200)) * 100)}
        />
        <MetricCard
          title="SYSTEM RELIABILITY"
          value={optimizationResult?.reliability ? Number(optimizationResult.reliability).toFixed(2) : "99.98"}
          unit="%"
          hint="Critical load protection"
          delta={optimizationResult ? `${optimizationResult.solver?.split(' ')[0] || 'AI'}` : "Stable"}
          icon={<ShieldCheck size={18} />}
          tone="purple"
        />
        <MetricCard
          title="FUEL ENDURANCE"
          value={dashboard?.daysToExhaustion ?? 174}
          unit="days"
          hint="Projected strategic reserve"
          delta={dashboard?.dailyConsumptionLitres ? `${Math.round(dashboard.dailyConsumptionLitres)} L/day` : "Stable"}
          icon={<Gauge size={18} />}
          tone="orange"
        />
      </section>

      {/* INTELLIGENCE DECK */}
      <section className="command-deck">

        <div className="panel cinematic-panel deck-constellation wide-panel">
          <PanelHeader
            title="LIVE ENERGY CONSTELLATION"
            subtitle="Generation → intelligence → storage → critical loads"
            icon={<GitBranch size={16} />}
            action={<span className="live-label"><i /> LIVE</span>}
          />
          <div className="constellation-wrap">
            <EnergyFlow dashboard={dashboard} />
          </div>
        </div>

        <div className="panel cinematic-panel deck-load-forecast">
          <PanelHeader
            title="AI LOAD FORECAST"
            subtitle="Next operating horizon"
            icon={<LineChart size={16} />}
            action={<span className="ai-badge"><Sparkles size={12} /> AI MODEL</span>}
          />
          <LoadForecastChart data={loadPoints} />
        </div>

        <div className="panel cinematic-panel deck-renewable">
          <PanelHeader
            title="RENEWABLE WINDOW"
            subtitle="Weather-aware generation forecast"
            icon={<CloudSun size={16} />}
            action={
              <div className="segmented cinematic-segmented">
                <button
                  className={forecastMode === 'Solar' ? 'selected' : ''}
                  onClick={() => setForecastMode('Solar')}
                >
                  Solar
                </button>
                <button
                  className={forecastMode === 'Wind' ? 'selected' : ''}
                  onClick={() => setForecastMode('Wind')}
                >
                  Wind
                </button>
              </div>
            }
          />
          <RenewableChart data={forecastSeries} mode={forecastMode} />
        </div>

        <div className="panel cinematic-panel deck-optimization optimization-cinematic">
          <PanelHeader
            title="TODAY'S OPTIMIZATION"
            subtitle="AI dispatch strategy against conventional baseline"
            icon={<BrainCircuit size={16} />}
            action={<span className="optimization-badge">SIMULATION SAFE</span>}
          />

          <div className="optimization-layout">
            <OptimizationDonut
              renewablePct={optimizationResult?.renewableUtilization ?? dashboard?.renewablePct ?? 41}
              batteryPct={optimizationResult?.dispatch?.length
                ? Math.round(optimizationResult.dispatch.reduce((acc, p) => acc + Math.max(0, p.battery_kw || 0) * 0.25, 0) / Math.max(1, optimizationResult.dispatch.reduce((acc, p) => acc + (p.load_kw || 0) * 0.25, 0)) * 100)
                : 15}
              dieselPct={optimizationResult?.renewableUtilization != null
                ? Math.max(0, Math.round(100 - optimizationResult.renewableUtilization - 15))
                : (dashboard ? Math.max(0, Math.round(100 - (dashboard.renewablePct || 0) - 15)) : 44)}
              totalKwh={optimizationResult?.dispatch?.length
                ? optimizationResult.dispatch.reduce((acc, p) => acc + (p.load_kw || 0) * 0.25, 0)
                : (dashboard?.loadKw ? dashboard.loadKw * 24 : null)}
            />

            <div className="optimization-metrics">
              <div className="opt-row"><span><i className="legend-dot cyan" />Renewables used</span><strong>{optimizationResult?.renewableUtilization ?? dashboard?.renewablePct ?? 41}%</strong></div>
              <div className="opt-row"><span><i className="legend-dot purple" />Battery reserve</span><strong>{dashboard?.batterySoc ?? 72}% SOC</strong></div>
              <div className="opt-row"><span><i className="legend-dot amber" />Diesel / CHP</span><strong>{optimizationResult?.renewableUtilization != null ? Math.max(0, Math.round(100 - optimizationResult.renewableUtilization - 15)) : (dashboard ? Math.max(0, Math.round(100 - (dashboard.renewablePct || 0) - 15)) : 44)}%</strong></div>
              <div className="divider" />

              <div className="compare-grid">
                <MiniStat label="Fuel saved" value={`${Number(optimizationResult?.fuelSavedLitres ?? 184).toFixed(1)} L`} trend={optimizationResult ? (optimizationResult.solver?.split(' ')[0] || 'AI result') : 'simulation'} good />
                <MiniStat label="CO₂ avoided" value={`${Math.round(Number(optimizationResult?.fuelSavedLitres ?? 184) * 2.68)} kg`} trend="estimated" good />
                <MiniStat label="Reliability" value={`${Number(optimizationResult?.reliability ?? 99.98).toFixed(2)}%`} trend="Critical load" good />
                <MiniStat label="Optimization" value={optimizationResult ? 'Active' : 'Standby'} trend={optimizationResult?.mode || systemMode} good />
              </div>
            </div>
          </div>
        </div>

        <div className="panel cinematic-panel deck-fuel fuel-cinematic">
          <PanelHeader
            title="FUEL RESILIENCE"
            subtitle="Strategic reserve outlook"
            icon={<Gauge size={16} />}
          />
          <FuelGauge litres={dashboard?.fuelLitres} capacity={350000} />

          <div className="fuel-cells">
            <div><span>Avg/day</span><strong>{dashboard?.dailyConsumptionLitres ? `${Math.round(dashboard.dailyConsumptionLitres).toLocaleString()} L` : '1,250 L'}</strong></div>
            <div><span>Reserve trigger</span><strong>30,000 L</strong></div>
          </div>

          <div className="risk-banner">
            <AlertTriangle size={15} />
            <div>
              <strong>
                {(dashboard?.fuelLitres ?? 218400) < 30000
                  ? 'Critical reserve buffer warning'
                  : (dashboard?.scenario === 'fuel_conservation' ? 'Fuel conservation policy engaged' : 'Reserve watch active')}
              </strong>
              <span>
                {(dashboard?.fuelLitres ?? 218400) < 30000
                  ? 'Immediate load shedding and thermal recovery required.'
                  : 'Conservation mode engages automatically below strategic buffer.'}
              </span>
            </div>
          </div>
        </div>

        <div className="panel cinematic-panel deck-status">
          <PanelHeader
            title="SYSTEM STATUS"
            subtitle="Component health and readiness"
            icon={<Server size={16} />}
          />
          <StatusList dashboard={dashboard} />
        </div>

        <div className="panel cinematic-panel deck-events">
          <PanelHeader
            title="STATION EVENTS"
            subtitle="Signals requiring operator awareness"
            icon={<Bell size={16} />}
          />

          {alerts && alerts.length > 0 ? (
            alerts.slice(0, 3).map(a => (
              <AlertCard
                key={a.id}
                severity={a.severity}
                title={a.title}
                body={a.body}
                time={a.timestamp}
                onClick={() => setToast({
                  type: a.severity === 'danger' ? 'error' : (a.severity === 'warning' ? 'warning' : 'info'),
                  text: `Action recommended: ${a.action || a.body}`
                })}
              />
            ))
          ) : (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#7ba1be', fontSize: '13px' }}>
              <ShieldCheck size={28} style={{ color: '#66e6a5', margin: '0 auto 8px', display: 'block' }} />
              All station subsystems operating within nominal parameters.
            </div>
          )}

          <div className="maintenance-strip">
            <CalendarClock size={14} />
            <span>Generator {dashboard?.activeGenerators === 1 ? '2' : '3'} scheduled rotation</span>
            <b>{dashboard?.scenario === 'generator_derate' ? 'Derate active' : 'in 2 days'}</b>
          </div>
        </div>
      </section>

      {/* CONTROL CONSOLE */}
      <section className="control-bar cinematic-control-bar">
        <div className="mode-control">
          <span className="control-label">SYSTEM MODE</span>
          <div className="segmented cinematic-segmented">
            <button className={systemMode === 'Normal' ? 'selected' : ''} onClick={() => setSystemMode('Normal')}>Normal</button>
            <button className={systemMode === 'Fuel Conservation' ? 'selected warning' : ''} onClick={() => setSystemMode('Fuel Conservation')}>Fuel Conservation</button>
            <button className={systemMode === 'Emergency' ? 'selected danger' : ''} onClick={() => setSystemMode('Emergency')}>Emergency</button>
          </div>
        </div>

        <div className="horizon-control">
          <span className="control-label">OPTIMIZATION HORIZON</span>
          <div className="segmented cinematic-segmented">
            {['24 Hours', '7 Days', '30 Days', '180 Days'].map(item => (
              <button
                key={item}
                className={horizon === item ? 'selected' : ''}
                onClick={() => setHorizon(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="run-control">
          <div className="last-run">LAST OPTIMIZATION <b>{lastOptimization || 'Standby'}</b></div>

          <button
            className={`primary-btn aurora-run-btn ${running ? 'busy' : ''}`}
            onClick={onRunOptimization}
          >
            {running
              ? <><Sparkles className="spin" size={15} /> Optimizing…</>
              : <><Sparkles size={15} /> Run AURORA</>}
          </button>

          <button className="ghost-btn cinematic-export" onClick={exportReport}>
            Export snapshot
          </button>
        </div>
      </section>

      <footer className="footer-note cinematic-footer">
        <span>{apiError ? `Backend unavailable · ${apiError}` : 'Live telemetry synchronized with AURORA API'}</span>
        <span><ShieldCheck size={13} /> Control actions remain simulation-safe</span>
        <span>Model: {dashboard?.model ?? 'XGBoost'} · MAE {Number(dashboard?.metrics?.mae_kw ?? 16.12).toFixed(2)} kW · Data quality 99.1%</span>
      </footer>
    </main>
  );
}

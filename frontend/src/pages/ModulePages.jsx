import React from 'react';
import {
  Activity, ArrowDown, BarChart3, BatteryCharging, Bell, BrainCircuit,
  CloudSun, Database, Download, Gauge, GitBranch, Leaf, Server, Settings,
  ShieldCheck, SlidersHorizontal, Sparkles, Sun, ThermometerSnowflake,
  TrendingDown, Wind, Zap, Radio, Orbit, Cpu, Waves, Flame, FileBarChart2,
  TriangleAlert, CircleGauge
} from 'lucide-react';

import '../styles.css';
import PanelHeader from '../components/common/PanelHeader';
import SimpleModuleCard from '../components/common/SimpleModuleCard';
import AlertCard from '../components/common/AlertCard';
import {
  DispatchBars, EnergyMixChart, FuelRiskChart,
  LoadForecastChart, RenewableChart, BatteryChart
} from '../components/charts/Charts';
import FuelGauge from '../components/energy/FuelGauge';
import BatteryPanel from '../components/energy/BatteryPanel';
import { simulationScenarios } from '../data/mockData';

function PageHero({ eyebrow, title, description, icon, tone = 'violet', children }) {
  return (
    <section className={`module-hero module-hero-${tone}`}>
      <div className="module-stars" />
      <div className="module-grid-lines" />
      <div className="module-glow glow-a" />
      <div className="module-glow glow-b" />
      <div className="module-hero-copy">
        <div className="module-eyebrow"><span />{eyebrow}</div>
        <div className="module-title-row">
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <div className="module-hero-icon">{icon}</div>
        </div>
        {children}
      </div>
    </section>
  );
}

function HeroStats({ items }) {
  return (
    <div className="module-hero-stats">
      {items.map(([label, value, note], i) => (
        <div className="hero-stat" key={label} style={{ animationDelay: `${i * .08}s` }}>
          <span>{label}</span><strong>{value}</strong><small>{note}</small>
        </div>
      ))}
    </div>
  );
}

function ModuleWrap({ children, page = '' }) {
  return <main className={`warm-module ${page}`}>{children}</main>;
}

function SectionLabel({ children, icon }) {
  return <div className="section-label">{icon}{children}<span /></div>;
}

const Timeline = ({ alerts }) => {
  const items = (alerts && alerts.length > 0)
    ? alerts.map(a => [
      a.timestamp || 'Recent',
      a.title,
      a.severity === 'danger' ? 'warning' : (a.severity === 'warning' ? 'warning' : 'info')
    ])
    : [
      ['10:15', 'Fuel alert raised', 'warning'],
      ['09:45', 'Optimization completed', 'success'],
      ['09:12', 'Wind forecast updated', 'info'],
      ['08:52', 'Generator 2 maintenance scheduled', 'neutral'],
      ['08:30', 'Battery reserve recalculated', 'success']
    ];
  return <div className="timeline warm-timeline">
    {items.map(([time, title, kind], i) => <div className="timeline-row" key={time + title + i} style={{ animationDelay: `${i * .09}s` }}>
      <span className="timeline-time">{time}</span><i className={`timeline-dot ${kind}`} />
      <div><strong>{title}</strong><span>Station event</span></div>
    </div>)}
  </div>;
};

export function LiveMonitor({ dashboard, energyLive }) {
  const load = energyLive?.load_kw ?? dashboard?.loadKw ?? 200;
  const thermal = energyLive?.thermal_kw ?? dashboard?.thermalKw ?? 112;
  const solar = energyLive?.solar_kw ?? dashboard?.solarKw ?? 80;
  const wind = energyLive?.wind_kw ?? dashboard?.windKw ?? 60;

  const critical = energyLive?.critical_load_kw ?? dashboard?.criticalLoadKw ?? Math.round(load * 0.5);
  const essential = energyLive?.essential_load_kw ?? dashboard?.essentialLoadKw ?? Math.round(load * 0.3);
  const flexible = energyLive?.flexible_load_kw ?? dashboard?.flexibleLoadKw ?? Math.round(load - critical - essential);

  return <ModuleWrap page="live-page">
    <PageHero eyebrow="REAL-TIME STATION TELEMETRY" title="Live Monitor"
      description="A living view of station demand, power quality and thermal conditions."
      icon={<Radio size={28} />} tone="cyan">
      <HeroStats items={[
        ['CURRENT LOAD', `${Math.round(load)} kW`, 'Instantaneous telemetry'],
        ['RENEWABLE INPUT', `${Math.round(solar + wind)} kW`, 'Solar + Wind live'],
        ['THERMAL DEMAND', `${Math.round(thermal)} kWth`, 'Heating envelope']
      ]} />
    </PageHero>

    <section className="live-stage">
      <div className="live-copy">
        <SectionLabel icon={<Activity size={15} />}>LIVE SIGNAL</SectionLabel>
        <div className="live-value">{Math.round(load)}<span> kW</span></div>
        <p>Station demand stream active. Telemetry synchronized with Antarctic base monitoring gateway.</p>
        <div className="live-chip"><i /> STREAMING · TELEMETRY HEALTHY</div>
      </div>
      <div className="wave-machine">
        <div className="wave-orbit orbit-1" /><div className="wave-orbit orbit-2" />
        <div className="wave-core"><Activity size={34} /></div>
        <div className="monitor-bars">
          {Array.from({ length: 32 }).map((_, i) => <i key={i} style={{ height: `${25 + ((i * 17) % 65)}%`, animationDelay: `${i * .035}s` }} />)}
        </div>
      </div>
    </section>

    <div className="module-grid warm-grid">
      <SimpleModuleCard icon={<Activity />} title="Total Demand" value={`${Math.round(load)} kW`} note="Real-time station load" />
      <SimpleModuleCard icon={<Zap />} title="Renewable Feed" value={`${Math.round(solar + wind)} kW`} note={`Solar ${Math.round(solar)} kW · Wind ${Math.round(wind)} kW`} />
      <SimpleModuleCard icon={<ThermometerSnowflake />} title="Thermal demand" value={`${Math.round(thermal)} kWth`} note="Station heating circuit" />
    </div>

    <div className="panel warm-panel" style={{ marginTop: '16px', padding: '16px 20px' }}>
      <PanelHeader title="LOAD CATEGORY ALLOCATION" subtitle={`Strict category sum: ${critical} + ${essential} + ${flexible} = ${Math.round(load)} kW (100%)`} icon={<Zap size={16} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '14px' }}>
        <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,110,135,0.08)', border: '1px solid rgba(255,110,135,0.25)' }}>
          <div style={{ color: '#ff8da1', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>CRITICAL LOAD</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#edf7ff', margin: '4px 0' }}>{critical} <span style={{ fontSize: '12px', color: '#8aa4ba' }}>kW</span></div>
          <div style={{ fontSize: '11px', color: '#7ba1be' }}>Guaranteed life support, hospital, command radio ({Math.round((critical / load) * 100)}%)</div>
        </div>
        <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(104,220,255,0.08)', border: '1px solid rgba(104,220,255,0.25)' }}>
          <div style={{ color: '#68dcff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>ESSENTIAL LOAD</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#edf7ff', margin: '4px 0' }}>{essential} <span style={{ fontSize: '12px', color: '#8aa4ba' }}>kW</span></div>
          <div style={{ fontSize: '11px', color: '#7ba1be' }}>Auxiliary heating, labs, water treatment ({Math.round((essential / load) * 100)}%)</div>
        </div>
        <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(180,140,255,0.08)', border: '1px solid rgba(180,140,255,0.25)' }}>
          <div style={{ color: '#cbb3ff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}>FLEXIBLE LOAD</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#edf7ff', margin: '4px 0' }}>{flexible} <span style={{ fontSize: '12px', color: '#8aa4ba' }}>kW</span></div>
          <div style={{ fontSize: '11px', color: '#7ba1be' }}>Non-critical compute, discretionary heaters ({Math.round((flexible / load) * 100)}%)</div>
        </div>
      </div>
    </div>
  </ModuleWrap>;
}

export function Forecasting({ forecasts, dashboard }) {
  const loadPoints = forecasts?.load?.points?.map(p => ({
    t: new Date(p.timestamp).getHours().toString().padStart(2, '0'),
    forecast: p.value_kw, actual: null
  })) || undefined;

  const [mode, setMode] = React.useState('Solar');
  const renewSeries = forecasts?.renewable?.points?.map(p => ({
    t: new Date(p.timestamp).getHours().toString().padStart(2, '0'),
    value: mode === 'Solar' ? p.solar_kw : p.wind_kw
  })) || undefined;

  const r2 = forecasts?.load?.metrics?.r2 ?? dashboard?.metrics?.r2 ?? 0.713;
  const mae = forecasts?.load?.metrics?.mae_kw ?? dashboard?.metrics?.mae_kw ?? 16.12;

  return <ModuleWrap page="forecast-page">
    <PageHero eyebrow="PREDICTIVE INTELLIGENCE" title="Forecasting"
      description="AI models look ahead so the station can act before weather and load conditions change."
      icon={<BrainCircuit size={28} />} tone="violet">
      <HeroStats items={[
        ['MODEL CONFIDENCE', `${(Number(r2) * 100).toFixed(1)}%`, 'R² XGBoost score'],
        ['FORECAST MAE', `${Number(mae).toFixed(2)} kW`, 'Evaluation error'],
        ['DATA QUALITY', '99.8%', '15-min cadence']
      ]} />
    </PageHero>

    <div className="forecast-atmosphere"><span /><span /><span /></div>
    <section className="two-col warm-two-col">
      <div className="panel warm-panel chart-panel">
        <PanelHeader title="AI LOAD FORECAST" subtitle="24-hour rolling prediction (15-min intervals)" icon={<BrainCircuit size={16} />} />
        <LoadForecastChart data={loadPoints} />
      </div>
      <div className="panel warm-panel chart-panel">
        <PanelHeader
          title="RENEWABLE FORECAST"
          subtitle="Weather-aware generation outlook"
          icon={<CloudSun size={16} />}
          action={
            <div className="segmented cinematic-segmented">
              <button className={mode === 'Solar' ? 'selected' : ''} onClick={() => setMode('Solar')}>Solar</button>
              <button className={mode === 'Wind' ? 'selected' : ''} onClick={() => setMode('Wind')}>Wind</button>
            </div>
          }
        />
        <RenewableChart mode={mode} data={renewSeries} />
      </div>
    </section>

    <div className="forecast-insight-row">
      <div className="forecast-insight"><Cpu /><div><span>MODEL STATUS</span><strong>{dashboard?.model || 'XGBoost'} Model Online</strong><small>Recursive 96-step lag pipeline active</small></div><b>ONLINE</b></div>
      <div className="forecast-insight"><Waves /><div><span>WEATHER FEED</span><strong>Antarctic Environmental Signal</strong><small>Atmospheric pressure, radiation & wind inputs</small></div><b>LIVE</b></div>
    </div>
  </ModuleWrap>;
}

export function Optimization({ optimizationResult, onRunOptimization, running, systemMode, setSystemMode, horizon, setHorizon }) {
  const fuelSaved = Number(optimizationResult?.fuelSavedLitres ?? 184).toFixed(1);
  const renewUtil = Math.round(Number(optimizationResult?.renewableUtilization ?? 41));
  const solver = optimizationResult?.solver || "AI Decision Engine";
  const reliability = Number(optimizationResult?.reliability ?? 99.98).toFixed(2);
  const recommendations = optimizationResult?.recommendations || [
    "Prioritize renewable generation before diesel/CHP.",
    "Keep the battery above the configured reserve threshold (25% SOC).",
    "Protect critical loads during polar weather deficits."
  ];

  return <ModuleWrap page="optimization-page">
    <PageHero eyebrow="AURORA DECISION ENGINE" title="Optimization"
      description="Balance fuel, renewable energy, storage and reliability across the operating horizon."
      icon={<Sparkles size={28} />} tone="purple">
      <HeroStats items={[
        ['SOLVER', solver.split(' ')[0], 'Optimized dispatch'],
        ['FUEL SAVED', `${fuelSaved} L`, 'vs unmanaged baseline'],
        ['RELIABILITY', `${reliability}%`, 'Critical load protected']
      ]} />
    </PageHero>

    <section className="optimization-stage">
      <div className="optimizer-orbit o1" /><div className="optimizer-orbit o2" /><div className="optimizer-orbit o3" />
      <div className="optimizer-core"><Sparkles size={28} /><span>AURORA</span><small>AI</small></div>
      <div className="optimization-copy">
        <SectionLabel icon={<BrainCircuit size={15} />}>OPTIMIZATION RUNNER</SectionLabel>
        <h2>Find the lowest fuel dispatch.</h2>
        <p>Solver evaluates storage reserves, solar/wind forecasts, and critical load protection to minimize diesel consumption.</p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <button className={`primary-btn aurora-action ${running ? 'busy' : ''}`} onClick={onRunOptimization}>
            <Sparkles size={16} /> {running ? 'Optimizing…' : 'Run AURORA Optimization'}
          </button>
        </div>
      </div>
      <div className="optimization-mini-grid">
        <div><span>Fuel impact</span><strong>{fuelSaved} L</strong></div>
        <div><span>Renewables</span><strong>{renewUtil}%</strong></div>
        <div><span>Reliability</span><strong>{reliability}%</strong></div>
      </div>
    </section>

    <div className="panel warm-panel dispatch-panel">
      <PanelHeader
        title="OPTIMIZED DISPATCH SCHEDULE"
        subtitle={`Solver output · ${optimizationResult?.dispatch?.length || 24} intervals (${solver})`}
        icon={<SlidersHorizontal size={16} />}
      />
      <DispatchBars dispatch={optimizationResult?.dispatch} />
    </div>

    <div className="panel warm-panel" style={{ marginTop: '16px' }}>
      <PanelHeader title="OPTIMIZER RECOMMENDATIONS" subtitle="Actions synthesized from decision model" icon={<BrainCircuit size={16} />} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 18px' }}>
        {recommendations.map((rec, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#cde2f2' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#68dcff' }} />
            {rec}
          </div>
        ))}
      </div>
    </div>
  </ModuleWrap>;
}

export function FuelManagement({ dashboard, fuelStatus }) {
  const litres = Number(fuelStatus?.fuelLitres ?? dashboard?.fuelLitres ?? 218400);
  const days = Number(fuelStatus?.daysToExhaustion ?? dashboard?.daysToExhaustion ?? 174);
  const capacity = Number(fuelStatus?.capacityLitres ?? 350000);
  const reserve = Number(fuelStatus?.reserveLitres ?? 30000);
  const avgDaily = Number(fuelStatus?.dailyConsumptionLitres ?? 1250);
  const risk = fuelStatus?.risk ?? (litres < reserve ? "HIGH" : (litres < reserve * 2 ? "MEDIUM" : "LOW"));
  const pct = Math.min(100, Math.max(0, (litres / capacity) * 100));

  return <ModuleWrap page="fuel-page">
    <PageHero eyebrow="STRATEGIC RESERVE INTELLIGENCE" title="Fuel Management"
      description="Protect long-term station resilience while minimizing unnecessary generator consumption."
      icon={<Flame size={28} />} tone="amber">
      <HeroStats items={[
        ['FUEL REMAINING', `${Math.round(litres).toLocaleString()} L`, `${Math.round(pct)}% capacity`],
        ['ENDURANCE', `${Math.round(days)} DAYS`, 'Projected runout'],
        ['STRATEGIC RESERVE', `${Math.round(reserve).toLocaleString()} L`, 'Safety trigger']
      ]} />
    </PageHero>

    <section className="fuel-banner">
      <div className="fuel-liquid"><span /><span /><span /></div>
      <div>
        <SectionLabel icon={<Gauge size={15} />}>RESERVE RISK LEVEL: {risk}</SectionLabel>
        <strong>{Math.round(days)} days endurance</strong>
        <p>Projected station endurance based on live electrical & thermal consumption.</p>
      </div>
      <div className="fuel-scale"><i /><i /><i /><i /><i /><b style={{ left: `${Math.min(96, Math.max(4, pct))}%` }} /></div>
    </section>

    <section className="two-col warm-two-col">
      <div className="panel warm-panel">
        <PanelHeader title="FUEL INVENTORY GAUGE" subtitle="Remaining volume vs 350,000 L capacity" icon={<Gauge size={16} />} />
        <FuelGauge litres={litres} capacity={capacity} percentage={pct} />
      </div>
      <div className="panel warm-panel">
        <PanelHeader title="FUEL TRAJECTORY OUTLOOK" subtitle="180-day baseline vs conservative dispatch" icon={<TrendingDown size={16} />} />
        <FuelRiskChart fuelLitres={litres} dailyConsumption={avgDaily} />
      </div>
    </section>

    <div className="module-grid warm-grid">
      <SimpleModuleCard icon={<ArrowDown />} title="Daily Consumption" value={`${Math.round(avgDaily).toLocaleString()} L/day`} note="Based on live thermal & electric" />
      <SimpleModuleCard icon={<ShieldCheck />} title="Reserve Buffer" value={`${Math.round(reserve).toLocaleString()} L`} note="Protected survival threshold" />
      <SimpleModuleCard icon={<Leaf />} title="Fuel-linked CO₂" value={`${(litres * 0.00268 / 100).toFixed(1)} t`} note="Inventory carbon footprint" />
    </div>
  </ModuleWrap>;
}

export function BatteryManagement({ dashboard, batteryStatus }) {
  const soc = Number(batteryStatus?.soc ?? dashboard?.batterySoc ?? 72);
  const capacityKwh = Number(batteryStatus?.capacityKwh ?? 800);
  const status = batteryStatus?.status ?? "Operational";
  const minReservePct = Number(batteryStatus?.minReservePct ?? 25);

  return <ModuleWrap page="battery-page">
    <PageHero eyebrow="STORAGE INTELLIGENCE" title="Battery Management"
      description="Maintain strategic charge while responding to renewable availability and station demand."
      icon={<BatteryCharging size={28} />} tone="cyan">
      <HeroStats items={[
        ['STATE OF CHARGE', `${Math.round(soc)}%`, 'Live bank SOC'],
        ['BATTERY CAPACITY', `${capacityKwh} kWh`, 'Total storage'],
        ['STATUS', status, 'Telemetry normal']
      ]} />
    </PageHero>

    <section className="battery-showcase">
      <div className="battery-visual">
        <div className="battery-shell">
          <div className="battery-fill" style={{ width: `${soc}%` }} />
          <span>{Math.round(soc)}%</span>
        </div>
        <div className="charge-particles">
          {Array.from({ length: 12 }).map((_, i) => <i key={i} style={{ animationDelay: `${i * .18}s` }} />)}
        </div>
      </div>
      <div className="battery-copy">
        <SectionLabel icon={<BatteryCharging size={15} />}>CHARGE DISPATCH INTELLIGENCE</SectionLabel>
        <h2>Stored energy, ready when it matters.</h2>
        <p>AURORA continuously protects the battery reserve floor while cycling energy during solar/wind peaks.</p>
        <div className="battery-pills">
          <span>● Reserve floor: {minReservePct}% SOC</span>
          <span>↗ {soc > minReservePct ? 'Reserve Healthy' : 'Reserve Warning'}</span>
        </div>
      </div>
    </section>

    <section className="two-col warm-two-col">
      <BatteryPanel soc={soc} capacityKwh={capacityKwh} status={status} />
      <div className="panel warm-panel">
        <PanelHeader title="BATTERY DISPATCH PROFILE" subtitle="State of charge trajectory" icon={<BatteryCharging size={16} />} />
        <BatteryChart />
      </div>
    </section>
  </ModuleWrap>;
}

export function Reports({ dashboard, optimizationResult, history }) {
  const fuelSaved = Number(optimizationResult?.fuelSavedLitres ?? 184).toFixed(1);
  const renewPct = Math.round(Number(optimizationResult?.renewableUtilization ?? dashboard?.renewablePct ?? 41));
  const runs = history?.length ? history : [];

  return <ModuleWrap page="reports-page">
    <PageHero eyebrow="OPERATIONAL INTELLIGENCE ARCHIVE" title="Reports & Analytics"
      description="Turn station activity into clear operational insights and audit records."
      icon={<FileBarChart2 size={28} />} tone="teal">
      <HeroStats items={[
        ['FUEL SAVED TODAY', `${fuelSaved} L`, 'Optimization yield'],
        ['RENEWABLE SHARE', `${renewPct}%`, 'Clean energy ratio'],
        ['SAVED AUDIT RUNS', `${runs.length || 1}`, 'Database runs logged']
      ]} />
    </PageHero>

    <section className="report-stream">
      <div className="report-copy">
        <SectionLabel icon={<BarChart3 size={15} />}>OPTIMIZATION AUDIT TRAIL</SectionLabel>
        <h2>From telemetry to decisions.</h2>
        <p>Station data and dispatch solutions are persisted to the SQLite database for compliance and audit review.</p>
      </div>
      <div className="data-stream">
        {Array.from({ length: 18 }).map((_, i) => <i key={i} style={{ animationDelay: `${i * .11}s` }} />)}
      </div>
    </section>

    {runs.length > 0 && (
      <div className="panel warm-panel" style={{ marginBottom: '20px' }}>
        <PanelHeader title="RECENT OPTIMIZATION AUDIT LOG" subtitle="Logged to SQLite aurora.db" icon={<Database size={16} />} />
        <div style={{ overflowX: 'auto', padding: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: '#cde2f2' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #233e56', color: '#7ba1be', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>TIMESTAMP</th>
                <th style={{ padding: '8px' }}>STATION</th>
                <th style={{ padding: '8px' }}>MODE</th>
                <th style={{ padding: '8px' }}>HORIZON</th>
                <th style={{ padding: '8px' }}>FUEL SAVED</th>
                <th style={{ padding: '8px' }}>RELIABILITY</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '8px' }}>{new Date(r.created_at).toLocaleString()}</td>
                  <td style={{ padding: '8px', textTransform: 'capitalize' }}>{r.station}</td>
                  <td style={{ padding: '8px' }}>{r.mode}</td>
                  <td style={{ padding: '8px' }}>{r.horizon_hours}h</td>
                  <td style={{ padding: '8px', color: '#66e6a5' }}>+{Number(r.fuel_saved_litres).toFixed(1)} L</td>
                  <td style={{ padding: '8px' }}>{Number(r.reliability_pct).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    <div className="module-grid four warm-grid">
      <SimpleModuleCard icon={<TrendingDown />} title="Fuel Saved" value={`${fuelSaved} L`} note="vs conventional dispatch" />
      <SimpleModuleCard icon={<Leaf />} title="Renewable utilization" value={`${renewPct}%`} note="Clean power share" />
      <SimpleModuleCard icon={<ShieldCheck />} title="Critical uptime" value="99.98%" note="Protected loads" />
      <SimpleModuleCard icon={<Download />} title="Audit Runs" value={`${runs.length || 1}`} note="Available in SQLite" />
    </div>

    <div className="panel warm-panel">
      <PanelHeader title="MONTHLY ENERGY MIX" subtitle="Baseline vs AURORA operating strategy" icon={<BarChart3 size={16} />} />
      <EnergyMixChart />
    </div>
  </ModuleWrap>;
}

export function Alerts({ alerts, setToast, refreshAlerts }) {
  const alertList = alerts?.length ? alerts : [
    { id: "fuel-efficiency", severity: "warning", title: "High fuel consumption", body: "Generator dispatch is above modeled efficiency band.", timestamp: "10:15 AM", action: "Shift flexible load" },
    { id: "polar-night", severity: "info", title: "Polar night approaching", body: "Solar contribution is expected to decline over the coming period.", timestamp: "09:40 AM", action: "Increase wind utilization" }
  ];

  return <ModuleWrap page="alerts-page">
    <PageHero eyebrow="EVENT AWARENESS SYSTEM" title="Alerts & Events"
      description="Surface what needs attention without losing the wider station context."
      icon={<TriangleAlert size={28} />} tone="rose">
      <HeroStats items={[
        ['ACTIVE ALERTS', `${alertList.length}`, 'Live base events'],
        ['SYSTEM HEALTH', '99.98%', 'Reliable'],
        ['TELEMETRY', 'SYNCHRONIZED', 'Real-time stream']
      ]} />
    </PageHero>

    <section className="alert-radar">
      <div className="radar"><i /><i /><i /><b /><span /></div>
      <div>
        <SectionLabel icon={<Bell size={15} />}>PRIORITY RADAR</SectionLabel>
        <h2>Station safety notifications.</h2>
        <p>Only meaningful station events and risk thresholds are promoted to the operator layer.</p>
      </div>
      <div className="radar-status">
        <span><i /> MONITORING</span>
        <span>{alertList.length} ACTIVE ALERTS</span>
      </div>
    </section>

    <section className="two-col warm-two-col">
      <div className="panel warm-panel">
        <PanelHeader title="ACTIVE STATION ALERTS" subtitle="Live priority queue" icon={<Bell size={16} />} />
        {alertList.map(a => (
          <AlertCard
            key={a.id}
            severity={a.severity}
            title={a.title}
            body={a.body}
            time={a.timestamp}
            onClick={() => setToast({ type: a.severity === 'danger' ? 'error' : (a.severity === 'warning' ? 'warning' : 'info'), text: `Action recommended: ${a.action}` })}
          />
        ))}
      </div>
      <div className="panel warm-panel">
        <PanelHeader title="EVENT TIMELINE" subtitle="Latest station activity" icon={<Bell size={16} />} />
        <Timeline alerts={alertList} />
      </div>
    </section>
  </ModuleWrap>;
}

export function SettingsPage({ dashboard, onApplyScenario, setToast }) {
  const scKey = (dashboard?.scenario || '').toLowerCase();
  const currentScenario = (() => {
    if (scKey.includes('shortage') || scKey.includes('3')) return 'scenario_3_critical_shortage';
    if (scKey.includes('storm') || scKey.includes('blizzard') || scKey.includes('2')) return 'scenario_2_polar_storm';
    return 'scenario_1_normal';
  })();

  const activeScenarioObj = simulationScenarios.find(s => s.key === currentScenario) || simulationScenarios[0];

  return <ModuleWrap page="settings-page">
    <PageHero eyebrow="SYSTEM POLICY & SIMULATION CONTROL" title="Settings & Scenarios"
      description="Trigger Antarctic simulation scenarios and configure station operating policies."
      icon={<Settings size={28} />} tone="lavender">
      <HeroStats items={[
        ['ACTIVE SCENARIO', activeScenarioObj.shortName.toUpperCase(), 'Current mode'],
        ['TOTAL DEMAND', `${activeScenarioObj.loadKw} kW`, 'Scenario load'],
        ['RENEWABLE INPUT', `${activeScenarioObj.solarKw + activeScenarioObj.windKw} kW`, 'Solar + Wind']
      ]} />
    </PageHero>

    <section className="settings-stage">
      <div className="settings-orb"><Settings size={34} /><i /><i /><i /></div>
      <div>
        <SectionLabel icon={<CircleGauge size={15} />}>SIMULATION SCENARIO TRIGGER</SectionLabel>
        <h2>Test station resilience under polar extremes.</h2>
        <p>Select a preset scenario below to inject realistic Antarctic weather and reserve perturbations into the live backend.</p>
      </div>
    </section>

    <div className="panel warm-panel settings-panel" style={{ marginBottom: '24px' }}>
      <PanelHeader title="APPLY SIMULATION SCENARIO" subtitle="Simulate weather events & component states" icon={<Sparkles size={16} />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', padding: '16px' }}>
        {simulationScenarios.map(sc => {
          const isActive = currentScenario === sc.key;
          return (
            <div
              key={sc.key}
              onClick={() => onApplyScenario(sc.key)}
              style={{
                padding: '16px',
                borderRadius: '10px',
                background: isActive ? 'rgba(104, 220, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                border: isActive ? '1px solid #68dcff' : '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 16px rgba(104, 220, 255, 0.15)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ color: '#edf7ff', fontSize: '15px' }}>{sc.name}</strong>
                {isActive && (
                  <span style={{
                    fontSize: '10px',
                    color: '#68dcff',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'rgba(104, 220, 255, 0.2)'
                  }}>
                    ACTIVE
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#9eb8cc', margin: '0 0 10px 0', lineHeight: 1.5 }}>{sc.desc}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '11px' }}>
                <span style={{ padding: '3px 7px', borderRadius: '5px', background: 'rgba(255,110,135,0.15)', color: '#ff8da1' }}>
                  Crit: {sc.criticalLoadKw} kW
                </span>
                <span style={{ padding: '3px 7px', borderRadius: '5px', background: 'rgba(104,220,255,0.15)', color: '#68dcff' }}>
                  Ess: {sc.essentialLoadKw} kW
                </span>
                <span style={{ padding: '3px 7px', borderRadius: '5px', background: 'rgba(180,140,255,0.15)', color: '#cbb3ff' }}>
                  Flex: {sc.flexibleLoadKw} kW
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    <div className="panel warm-panel settings-panel">
      <PanelHeader title="STATION POLICIES" subtitle="Safety and dispatch rules" icon={<ShieldCheck size={16} />} />
      <div className="settings-grid">
        {[
          ['Critical load protection', '100% Guaranteed', 'success'],
          ['Strategic fuel reserve floor', '30,000 L trigger', 'info'],
          ['Battery reserve floor', '25% SOC trigger', 'info'],
          ['Forecast update cadence', '15 minutes', 'info']
        ].map(([label, value, type], i) => <div className={`setting-row ${type}`} key={label}>
          <span className="setting-index">0{i + 1}</span>
          <span className="setting-name">{label}</span>
          <b>{value}</b>
        </div>)}
      </div>
    </div>
  </ModuleWrap>;
}

export function HelpPage({ setToast }) {
  return <ModuleWrap page="help-page">
    <PageHero eyebrow="AURORA KNOWLEDGE NETWORK" title="Help & Documentation"
      description="Understand how station intelligence turns raw signals into operational recommendations."
      icon={<Sparkles size={28} />} tone="violet">
      <HeroStats items={[
        ['MODELS', '3 ACTIVE', 'Load + Solar + Wind'],
        ['OPTIMIZER', 'HYBRID', 'MILP + Heuristic'],
        ['TELEMETRY', '15-MIN', 'Maitri dataset']
      ]} />
    </PageHero>

    <section className="knowledge-stage">
      <div className="knowledge-network"><i /><i /><i /><i /><i /><span /></div>
      <div>
        <SectionLabel icon={<Database size={15} />}>SYSTEM ARCHITECTURE</SectionLabel>
        <h2>The intelligence behind the Antarctic station.</h2>
        <p>Explore forecasting, optimization and the data pipeline powering AURORA.</p>
      </div>
    </section>

    <div className="help-grid warm-help-grid">
      <div className="panel warm-panel help-card">
        <div className="help-icon"><Sparkles size={22} /></div>
        <h3>How AURORA Thinks</h3>
        <p>Three XGBoost machine learning models forecast electrical load, solar irradiance, and wind generation on a 15-minute rolling horizon. The optimization engine generates a constraint-aware schedule minimizing diesel usage while preserving battery and thermal envelopes.</p>
        <button className="ghost-btn" onClick={() => setToast({ type: 'info', text: 'Architecture note queued for export.' })}><Download size={14} /> Export architecture note</button>
      </div>
      <div className="panel warm-panel help-card">
        <div className="help-icon"><Database size={22} /></div>
        <h3>Data & Persistence Pipeline</h3>
        <p>Station telemetry $\rightarrow$ feature engineering with lag windows $\rightarrow$ machine learning predictions $\rightarrow$ optimization engine $\rightarrow$ SQLite audit persistence $\rightarrow$ live React command center.</p>
        <button className="ghost-btn" onClick={() => setToast({ type: 'info', text: 'Data pipeline reference opened.' })}>View pipeline <Zap size={14} /></button>
      </div>
    </div>
  </ModuleWrap>;
}

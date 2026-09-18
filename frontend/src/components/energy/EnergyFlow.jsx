import React from 'react';
import { ArrowDown, BatteryCharging, GitBranch, Server, Sun, ThermometerSnowflake, Wind, Zap } from 'lucide-react';

export function EnergyNode({ label, value, sub, icon, tone }) {
  return (
    <div className={`energy-node ${tone}`}>
      <div className="node-icon">{icon}</div>
      <div>
        <div className="node-label">{label}</div>
        <strong>{value}</strong>
        <span>{sub}</span>
      </div>
    </div>
  );
}

export function ArrowFlow({ tone }) {
  return (
    <div className={`arrow-flow ${tone}`}>
      <span />
      <ArrowDown size={15} />
    </div>
  );
}

export default function EnergyFlow({ dashboard }) {
  const solar = dashboard?.solarKw ?? 80;
  const wind = dashboard?.windKw ?? 60;
  const load = dashboard?.loadKw ?? 200;
  const battery = dashboard?.batterySoc ?? 70;
  const diesel = Math.max(0, load - solar - wind);
  const thermal = dashboard?.thermalKw ?? 112;

  // Exact 3 load categories defined per scenario, strictly summing to total load
  const critical = dashboard?.criticalLoadKw != null
    ? Math.round(dashboard.criticalLoadKw)
    : Math.round(load * 0.5);

  const essential = dashboard?.essentialLoadKw != null
    ? Math.round(dashboard.essentialLoadKw)
    : Math.round(load * 0.3);

  // Guarantee critical + essential + flexible strictly equals load
  const flexible = dashboard?.flexibleLoadKw != null
    ? Math.round(dashboard.flexibleLoadKw)
    : Math.round(load - critical - essential);

  const critPct = Math.round((critical / load) * 100);
  const essPct = Math.round((essential / load) * 100);
  const flexPct = Math.round((flexible / load) * 100);

  return (
    <div className="energy-flow-wrap">
      <div className="flow-map">
        <EnergyNode
          label="SOLAR ARRAY"
          value={`${solar.toFixed(0)} kW`}
          sub={solar > 15 ? "Photovoltaics active" : (solar > 0 ? "Low solar irradiance" : "Night / Standby")}
          icon={<Sun size={21} />}
          tone={solar > 20 ? "green" : "orange"}
        />
        <ArrowFlow tone={solar > 20 ? "green" : "orange"} />

        <EnergyNode
          label="WIND FARM"
          value={`${wind.toFixed(0)} kW`}
          sub={wind > 20 ? `${dashboard?.windSpeedMs ?? 12.4} m/s active` : "Low wind velocity"}
          icon={<Wind size={21} />}
          tone={wind > 20 ? "green" : "orange"}
        />
        <ArrowFlow tone={wind > 20 ? "green" : "orange"} />

        <EnergyNode
          label="DIESEL / CHP"
          value={`${diesel.toFixed(0)} kW`}
          sub={`${diesel > 120 ? "3 gens" : (diesel > 60 ? "2 gens" : "1 gen")} · ${diesel > 0 ? "Balancing load" : "Standby"}`}
          icon={<Server size={21} />}
          tone="orange"
        />

        <div className="flow-core">
          <div className="core-ring" />
          <div className="core-inner">
            <Zap size={19} />
            <strong>{Math.round(load)}</strong>
            <span>kW LOAD</span>
          </div>
        </div>

        <div className="side-flow battery">
          <EnergyNode
            label="BATTERY"
            value={`${battery.toFixed(0)}%`}
            sub={battery > 25 ? "Reserve ready" : "CRITICAL RESERVE"}
            icon={<BatteryCharging size={21} />}
            tone={battery > 25 ? "cyan" : "danger"}
          />
        </div>

        <div className="side-flow thermal">
          <EnergyNode
            label="THERMAL / CHP"
            value={`${thermal.toFixed(0)} kWth`}
            sub="Station heating demand"
            icon={<ThermometerSnowflake size={21} />}
            tone="orange"
          />
        </div>
      </div>

      {/* THREE LOAD CATEGORIES BREAKDOWN: Critical, Essential, Flexible */}
      <div className="load-categories-container" style={{
        marginTop: '16px',
        padding: '12px 16px',
        background: 'rgba(8, 24, 38, 0.7)',
        borderRadius: '10px',
        border: '1px solid rgba(104, 220, 255, 0.12)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#97b8cf' }}>
            STATION LOAD CATEGORIES (SUM: {Math.round(load)} kW)
          </span>
          <span style={{ fontSize: '10px', color: '#66e6a5', fontWeight: 600 }}>
            {critical} + {essential} + {flexible} = {Math.round(load)} kW (100%)
          </span>
        </div>

        {/* Multi-segment stacked bar */}
        <div style={{
          display: 'flex',
          height: '8px',
          borderRadius: '4px',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.05)',
          marginBottom: '10px'
        }}>
          <div style={{ width: `${critPct}%`, background: '#ff6e87' }} title={`Critical: ${critical} kW (${critPct}%)`} />
          <div style={{ width: `${essPct}%`, background: '#68dcff' }} title={`Essential: ${essential} kW (${essPct}%)`} />
          <div style={{ width: `${flexPct}%`, background: '#b48cff' }} title={`Flexible: ${flexible} kW (${flexPct}%)`} />
        </div>

        {/* 3 Categories Split Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div style={{
            background: 'rgba(255, 110, 135, 0.08)',
            border: '1px solid rgba(255, 110, 135, 0.25)',
            borderRadius: '8px',
            padding: '8px 10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#ff94a7', fontWeight: 600 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ff6e87' }} />
              CRITICAL
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#edf7ff', marginTop: '2px' }}>
              {critical} <span style={{ fontSize: '10px', color: '#8ba2b5' }}>kW</span>
            </div>
            <div style={{ fontSize: '9px', color: '#7e9ab1', marginTop: '1px' }}>
              Life support · Core power ({critPct}%)
            </div>
          </div>

          <div style={{
            background: 'rgba(104, 220, 255, 0.08)',
            border: '1px solid rgba(104, 220, 255, 0.25)',
            borderRadius: '8px',
            padding: '8px 10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#68dcff', fontWeight: 600 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#68dcff' }} />
              ESSENTIAL
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#edf7ff', marginTop: '2px' }}>
              {essential} <span style={{ fontSize: '10px', color: '#8ba2b5' }}>kW</span>
            </div>
            <div style={{ fontSize: '9px', color: '#7e9ab1', marginTop: '1px' }}>
              Labs · Auxiliary heating ({essPct}%)
            </div>
          </div>

          <div style={{
            background: 'rgba(180, 140, 255, 0.08)',
            border: '1px solid rgba(180, 140, 255, 0.25)',
            borderRadius: '8px',
            padding: '8px 10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#cbb3ff', fontWeight: 600 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#b48cff' }} />
              FLEXIBLE
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#edf7ff', marginTop: '2px' }}>
              {flexible} <span style={{ fontSize: '10px', color: '#8ba2b5' }}>kW</span>
            </div>
            <div style={{ fontSize: '9px', color: '#7e9ab1', marginTop: '1px' }}>
              Deferrable / Sheddable ({flexPct}%)
            </div>
          </div>
        </div>
      </div>

      <div className="flow-legend">
        <span><i className="legend-line green" /> Generation</span>
        <span><i className="legend-line cyan" /> Battery</span>
        <span><i className="legend-line orange" /> Thermal</span>
        <span><i className="legend-line purple" /> Forecasted</span>
      </div>
    </div>
  );
}


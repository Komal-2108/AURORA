import React, { useEffect, useState } from 'react';
import { BatteryWarning, Bell, ChevronDown, CloudSnow, Globe2, Menu, Moon, Radio, Sparkles, Sun, Wind } from 'lucide-react';
import StatusPill from '../common/StatusPill';
import { simulationScenarios } from '../../data/mockData';

export default function Topbar({ station, setStation, menuOpen, setMenuOpen, dashboard, alerts = [], onApplyScenario, soc }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();

  const temp = dashboard?.temperatureC != null
    ? `${dashboard.temperatureC > 0 ? '+' : ''}${dashboard.temperatureC}°C`
    : '−18.6°C';

  const windSpeed = dashboard?.windSpeedMs != null ? `${dashboard.windSpeedMs} m/s` : '12.4 m/s';
  const scKey = (dashboard?.scenario || '').toLowerCase();
  const isStorm = scKey.includes('storm') || scKey.includes('blizzard');
  const isShortage = scKey.includes('shortage') || (dashboard?.batterySoc != null && dashboard.batterySoc <= 25);
  const isSunlit = (dashboard?.solarKw ?? 0) > 20;

  const weatherLabel = dashboard?.weatherCondition || (isStorm ? 'Severe Polar Storm' : (isShortage ? 'Extreme Deep Freeze' : (isSunlit ? 'Clear polar sky' : 'Polar night')));
  const WeatherIcon = isStorm ? CloudSnow : (isShortage ? Wind : (isSunlit ? Sun : Moon));

  const currentScenario = (() => {
    if (scKey.includes('shortage') || scKey.includes('3')) return 'scenario_3_critical_shortage';
    if (scKey.includes('storm') || scKey.includes('blizzard') || scKey.includes('2')) return 'scenario_2_polar_storm';
    return 'scenario_1_normal';
  })();

  const mode = dashboard?.mode
    ? dashboard.mode.toUpperCase()
    : (isShortage ? 'CRITICAL SHORTAGE' : (isStorm ? 'POLAR STORM' : 'NORMAL'));

  const modeTone = isShortage ? 'danger' : (isStorm ? 'warning' : 'success');
  const currentSoc = Number(soc ?? dashboard?.batterySoc ?? 80);

  return (
    <header className="topbar">
      <div className="brand-block">
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation menu">
          <Menu size={19} />
        </button>
        <div className="brand-mark">
          <span className="brand-glyph">A</span>
        </div>
        <div>
          <div className="brand-name">AURORA</div>
          <div className="brand-sub">AI ENERGY INTELLIGENCE</div>
        </div>
      </div>

      <div className="station-selector">
        <div className="station-icon">
          <Globe2 size={17} />
        </div>
        <select value={station} onChange={(e) => setStation(e.target.value)} aria-label="Research station">
          <option>Bharati Station</option>
          <option>Maitri Station</option>
        </select>
        <ChevronDown size={15} className="select-chevron" />
      </div>

      <div className="scenario-selector" title="Simulation Scenario">
        <div className="scenario-icon">
          <Sparkles size={16} />
        </div>
        <select
          value={currentScenario}
          onChange={(e) => onApplyScenario?.(e.target.value)}
          aria-label="Simulation Scenario"
        >
          {simulationScenarios.map((sc) => (
            <option key={sc.key} value={sc.key}>
              {sc.name}
            </option>
          ))}
        </select>
        <ChevronDown size={15} className="select-chevron" />
      </div>

      <div className="top-actions">
        <StatusPill icon={<Radio size={15} />} label="SYSTEM" value={mode} tone={modeTone} />

        {currentSoc < 25 && (
          <div
            className="status-pill danger low-battery-pill"
            role="status"
            aria-live="polite"
            title={`Battery state of charge at ${Math.round(currentSoc)}% — below 25% safety reserve`}
          >
            <span className="low-battery-icon">
              <BatteryWarning size={15} />
            </span>
            <div>
              <small>BATTERY</small>
              <b>Low Battery Reserve</b>
            </div>
          </div>
        )}

        <div className="weather-pill" title={`Antarctic telemetry: ${temp}, Wind: ${windSpeed}`}>
          <div className="weather-icon">
            <WeatherIcon size={18} />
          </div>
          <div>
            <div className="weather-temp">{temp}</div>
            <div className="weather-copy">{weatherLabel} · {windSpeed}</div>
          </div>
        </div>

        <div className="top-time" title="Station Master Clock (Live Real-Time)">
          <div>{formattedTime}</div>
          <span>{formattedDate}</span>
        </div>

        <button className="icon-btn notification" title={`${alerts.length} active station events`}>
          <Bell size={18} />
          {alerts.length > 0 && <span className="dot" />}
        </button>
        <button className="avatar" title="Operator Profile">AR</button>
      </div>
    </header>
  );
}

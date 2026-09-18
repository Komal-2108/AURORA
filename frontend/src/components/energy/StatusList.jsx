import React from 'react';
import { BatteryCharging, CloudSun, Server, Sun, ThermometerSnowflake, Wind } from 'lucide-react';
import { statusItems } from '../../data/mockData';

export default function StatusList({ dashboard }) {
  if (!dashboard) {
    return (
      <div className="status-list">
        {statusItems.map(([name, value, state, iconName]) => (
          <div className="status-row" key={name}>
            <span>{name}</span>
            <strong>{value}</strong>
            <i className={state} />
          </div>
        ))}
      </div>
    );
  }

  const dieselKw = Math.max(0, Math.round((dashboard.loadKw ?? 187) - (dashboard.solarKw ?? 0) - (dashboard.windKw ?? 0)));
  const solarKw = Math.round(dashboard.solarKw ?? 0);
  const windKw = Math.round(dashboard.windKw ?? 0);
  const soc = Math.round(dashboard.batterySoc ?? 72);
  const thermal = Math.round(dashboard.thermalKw ?? 112);
  const temp = dashboard.temperatureC != null ? `${dashboard.temperatureC}°C` : '−18.6°C';
  const windSpd = dashboard.windSpeedMs != null ? `${dashboard.windSpeedMs} m/s` : '12.4 m/s';

  const items = [
    {
      name: 'Generators',
      value: `${dashboard.activeGenerators ?? (dieselKw > 0 ? 1 : 0)} / 3 active (${dieselKw} kW)`,
      state: (dashboard.activeGenerators === 0 ? 'info' : (dashboard.activeGenerators >= 3 ? 'warn' : 'ok')),
      icon: Server
    },
    {
      name: 'Solar system',
      value: solarKw > 0 ? `${solarKw} kW active` : 'Night / Standby',
      state: solarKw > 0 ? 'ok' : 'info',
      icon: Sun
    },
    {
      name: 'Wind system',
      value: windKw > 0 ? `${windKw} kW active (${windSpd})` : 'Low wind (< 3 m/s)',
      state: windKw > 0 ? 'ok' : 'warn',
      icon: Wind
    },
    {
      name: 'Battery system',
      value: `${soc}% SOC (${soc > 30 ? 'Nominal' : 'Reserve low'})`,
      state: soc > 30 ? 'ok' : 'warn',
      icon: BatteryCharging
    },
    {
      name: 'Thermal / CHP',
      value: `${thermal} kWth heating circuit`,
      state: 'ok',
      icon: ThermometerSnowflake
    },
    {
      name: 'Weather station',
      value: `${temp} · ${windSpd}`,
      state: dashboard.scenario === 'blizzard' ? 'warn' : 'ok',
      icon: CloudSun
    }
  ];

  return (
    <div className="status-list">
      {items.map(({ name, value, state, icon: Icon }) => (
        <div className="status-row" key={name}>
          <Icon size={15} />
          <span>{name}</span>
          <strong>{value}</strong>
          <i className={state} />
        </div>
      ))}
    </div>
  );
}

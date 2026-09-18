import React from 'react';
import { BatteryCharging, ShieldCheck } from 'lucide-react';
import PanelHeader from '../common/PanelHeader';

export default function BatteryPanel({ soc = 72, capacityKwh = 800, status = "Operational", currentKw = -48 }) {
  const currentSoc = Math.round(Number(soc ?? 72));
  const storedKwh = Math.round((currentSoc / 100) * capacityKwh);

  return (
    <div className="panel battery-summary">
      <PanelHeader title="BATTERY HEALTH" subtitle="Station storage bank" icon={<BatteryCharging size={16}/>}/>
      <div className="battery-percent">{currentSoc}<span>%</span></div>
      <div className="battery-bar"><span style={{width:`${Math.min(100, Math.max(0, currentSoc))}%`}}/></div>
      <div className="battery-stats">
        <div><span>Stored</span><strong>{storedKwh} / {capacityKwh} kWh</strong></div>
        <div><span>Dispatch</span><strong>{currentKw > 0 ? `+${currentKw} kW` : `${currentKw} kW`}</strong></div>
        <div><span>Status</span><strong>{status}</strong></div>
        <div><span>Health</span><strong>98.4%</strong></div>
      </div>
      <div className="battery-rule">
        <ShieldCheck size={15}/> Reserve floor protected at 25% SOC ({Math.round(capacityKwh * 0.25)} kWh).
      </div>
    </div>
  );
}

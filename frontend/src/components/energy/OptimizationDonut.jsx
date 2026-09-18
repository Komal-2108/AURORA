import React from 'react';
import { COLORS } from '../../data/mockData';

export default function OptimizationDonut({ renewablePct, batteryPct, dieselPct, totalKwh }) {
  const renew = Math.max(5, Math.round(renewablePct ?? 41));
  const batt = Math.max(5, Math.round(batteryPct ?? 24));
  const dies = Math.max(5, Math.round(dieselPct ?? (100 - renew - batt)));
  const shift = Math.max(0, 100 - renew - batt - dies);

  const items = [
    { value: renew, fill: COLORS.green },
    { value: batt, fill: COLORS.cyan },
    { value: dies, fill: COLORS.orange },
    { value: shift, fill: COLORS.purple },
  ].filter(i => i.value > 0);

  const total = items.reduce((s, i) => s + i.value, 0);
  let cursor = 0;
  const conic = items.map(item => {
    const frac = (item.value / total) * 100;
    const start = cursor;
    cursor += frac;
    return `${item.fill} ${start.toFixed(1)}% ${cursor.toFixed(1)}%`;
  }).join(', ');

  const displayKwh = totalKwh ? `${Math.round(totalKwh).toLocaleString()} kWh` : '4,487 kWh';

  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${conic})` }}>
        <div className="donut-inner">
          <strong>{displayKwh}</strong>
          <span>optimized</span>
        </div>
      </div>
      <div className="donut-caption">Dispatch mix</div>
    </div>
  );
}

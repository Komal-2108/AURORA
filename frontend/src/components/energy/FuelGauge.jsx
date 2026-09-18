import React from 'react';

export default function FuelGauge({ litres = 218400, capacity = 350000, percentage }) {
  const currentLitres = Number(litres ?? 218400);
  const pct = percentage != null ? percentage : Math.min(100, Math.max(0, (currentLitres / capacity) * 100));
  const deg = (pct / 100) * 180;

  return (
    <div className="fuel-gauge">
      <div className="gauge-arc">
        <div className="gauge-fill" style={{ transform: `rotate(${deg - 180}deg)` }} />
      </div>
      <div className="gauge-center">
        <span>REMAINING</span>
        <strong>{Math.round(currentLitres).toLocaleString()}</strong>
        <b>L ({Math.round(pct)}%)</b>
      </div>
      <div className="gauge-range">
        <span>E</span>
        <span>F</span>
      </div>
    </div>
  );
}

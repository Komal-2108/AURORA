import React from 'react';

/**
 * Tunable threshold constants for battery ambient state.
 * Easy to configure or adapt for other station health telemetry.
 */
export const BATTERY_THRESHOLDS = {
  CALM_MIN_SOC: 50,    // >= 50% SOC -> Calm state (default / faint teal)
  CAUTION_MIN_SOC: 25, // 25% - 49% SOC -> Caution state (amber/orange glow, slow pulse)
  // < 25% SOC -> Alert state (reserve floor breached: red glow, faster pulse)
};

/**
 * Maps SOC percentage to the ambient state name.
 */
export function getBatteryState(soc) {
  const numericSoc = Number(soc ?? 80);
  if (numericSoc >= BATTERY_THRESHOLDS.CALM_MIN_SOC) return 'calm';
  if (numericSoc >= BATTERY_THRESHOLDS.CAUTION_MIN_SOC) return 'caution';
  return 'alert';
}

/**
 * BatteryAmbientBackground
 *
 * Renders an ambient, non-intrusive soft radial gradient anchored behind cards
 * (top-right battery telemetry region). Features:
 * - 400-600ms smooth crossfade between calm, caution, and alert states
 * - Within-state breathing / pulse animation (calibrated to small opacity delta)
 * - Strict background layering (z-index below cards, pointer-events none)
 * - Accessibility: aria-hidden decorative layer, respects prefers-reduced-motion
 */
export default function BatteryAmbientBackground({ soc = 80 }) {
  const currentState = getBatteryState(soc);

  return (
    <div
      className="battery-ambient-container"
      data-state={currentState}
      data-soc={Math.round(Number(soc ?? 80))}
      aria-hidden="true"
    >
      {/* Calm State Layer (>= 50% SOC): Faint teal / neutral ambient glow */}
      <div
        className={`battery-ambient-layer battery-ambient-calm ${
          currentState === 'calm' ? 'is-active' : ''
        }`}
      />

      {/* Caution State Layer (25-49% SOC): Soft amber/orange radial glow with slow pulse */}
      <div
        className={`battery-ambient-layer battery-ambient-caution ${
          currentState === 'caution' ? 'is-active' : ''
        }`}
      />

      {/* Alert State Layer (< 25% SOC): Soft red glow with faster pulse */}
      <div
        className={`battery-ambient-layer battery-ambient-alert ${
          currentState === 'alert' ? 'is-active' : ''
        }`}
      />
    </div>
  );
}

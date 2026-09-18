import React, { useEffect, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BatteryAmbientBackground from './BatteryAmbientBackground';
import Toast from '../common/Toast';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function AppShell({
  active,
  onNavigate,
  station,
  setStation,
  menuOpen,
  setMenuOpen,
  dashboard,
  batteryStatus,
  soc,
  alerts,
  lastSyncTime,
  onRefresh,
  toast,
  children,
  onExport,
  onApplyScenario
}) {
  const [secondsAgo, setSecondsAgo] = useState(0);
  const batterySoc = Number(soc ?? batteryStatus?.soc ?? dashboard?.batterySoc ?? 80);

  // Globally orchestrate scroll reveal across all pages
  useScrollReveal(active);

  useEffect(() => {
    const updateElapsed = () => {
      if (lastSyncTime) {
        setSecondsAgo(Math.max(0, Math.floor((Date.now() - lastSyncTime) / 1000)));
      }
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  const syncLabel = secondsAgo < 4 ? 'Data synced just now' : `Data synced ${secondsAgo}s ago`;

  return (
    <div className="app-shell">
      <BatteryAmbientBackground soc={batterySoc} />
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="grid-overlay" />
      <Topbar
        station={station}
        setStation={setStation}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        dashboard={dashboard}
        alerts={alerts}
        onApplyScenario={onApplyScenario}
        soc={batterySoc}
      />
      <div className={`workspace ${menuOpen ? 'menu-active' : ''}`}>
        <Sidebar
          active={active}
          onNavigate={(label) => {
            onNavigate(label);
            setMenuOpen(false);
          }}
        />
        <div className="content">
          {active === 'Overview' && (
            <div className="page-head">
              <div>
                <div className="eyebrow">STATION OVERVIEW</div>
                <h1>Energy Command Center</h1>
                <p>
                  AI-guided dispatch, fuel resilience, and renewable coordination.
                </p>
              </div>

              <div className="head-actions">
                <button
                  className="sync-chip"
                  onClick={onRefresh}
                  title="Click to refresh telemetry from AURORA API"
                  style={{
                    cursor: 'pointer',
                    background: 'rgba(23, 49, 72, 0.7)',
                    border: '1px solid rgba(104, 220, 255, 0.2)',
                    color: '#cde2f2'
                  }}
                >
                  <RefreshCw size={13} className={secondsAgo < 2 ? 'spin' : ''} />
                  {syncLabel}
                </button>

                <button className="ghost-btn" onClick={onExport}>
                  <Download size={15} />
                  Export
                </button>
              </div>
            </div>
          )}

          {children}
        </div>
      </div>
      <Toast toast={toast} />
    </div>
  );
}

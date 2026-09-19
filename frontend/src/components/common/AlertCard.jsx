import React from 'react';
import { AlertTriangle, ArrowUpRight, Info, ShieldAlert } from 'lucide-react';

const SEVERITY_ICON = {
  danger: ShieldAlert,
  warning: AlertTriangle,
  info: Info
};

export default function AlertCard({ severity = 'info', title, body, time, onClick }) {
  const Icon = SEVERITY_ICON[severity] || Info;
  return (
    <button className={`alert-card ${severity}`} onClick={onClick}>
      <div className="alert-icon"><Icon size={15} /></div>
      <div className="alert-copy">
        <div><strong>{title}</strong><span>{time}</span></div>
        <p>{body}</p>
        <span className="view-detail">View details <ArrowUpRight size={11} /></span>
      </div>
    </button>
  );
}

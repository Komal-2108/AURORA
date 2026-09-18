from __future__ import annotations

from datetime import datetime
from pathlib import Path
import pandas as pd

from .station_profiles import STATION_PROFILES


def _normalize_dataset(df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values("timestamp").reset_index(drop=True)
    if "wind_speed_ms" not in df.columns and "wind_speed_mps" in df.columns:
        df["wind_speed_ms"] = df["wind_speed_mps"]
    elif "wind_speed_mps" not in df.columns and "wind_speed_ms" in df.columns:
        df["wind_speed_mps"] = df["wind_speed_ms"]
    elif "wind_speed_ms" not in df.columns:
        df["wind_speed_ms"] = 12.0
        df["wind_speed_mps"] = 12.0

    if "pressure_mslp" not in df.columns and "pressure_hpa" in df.columns:
        df["pressure_mslp"] = df["pressure_hpa"]
    elif "pressure_hpa" not in df.columns and "pressure_mslp" in df.columns:
        df["pressure_hpa"] = df["pressure_mslp"]
    elif "pressure_mslp" not in df.columns:
        df["pressure_mslp"] = 990.0
        df["pressure_hpa"] = 990.0

    if "radiation_profile_value" not in df.columns:
        if "solar_radiation_wm2" in df.columns:
            df["radiation_profile_value"] = (df["solar_radiation_wm2"] / 1000.0).clip(0.0, 1.0)
        else:
            df["radiation_profile_value"] = 0.0

    if "solar_availability" not in df.columns:
        df["solar_availability"] = (df["radiation_profile_value"] > 0.005).astype(float)

    if "wind_direction_deg" not in df.columns:
        df["wind_direction_deg"] = 180.0

    if "station_load_kw" not in df.columns and "load_kw" in df.columns:
        df["station_load_kw"] = df["load_kw"]
    elif "load_kw" not in df.columns and "station_load_kw" in df.columns:
        df["load_kw"] = df["station_load_kw"]

    if "solar_kw" not in df.columns:
        df["solar_kw"] = 0.0
    if "wind_kw" not in df.columns:
        df["wind_kw"] = 0.0
    if "heating_load_kw" not in df.columns:
        df["heating_load_kw"] = df.get("load_kw", 180.0) * 0.5
    if "critical_load_kw" not in df.columns:
        df["critical_load_kw"] = df.get("load_kw", 180.0) * 0.4
    if "flexible_load_kw" not in df.columns:
        df["flexible_load_kw"] = df.get("load_kw", 180.0) * 0.2
    return df


class StationSimulator:
    def __init__(self, dataset_path: Path):
        self.dataset_path = dataset_path
        self._datasets: dict[str, pd.DataFrame] = {}

        # 1. Load Maitri 15-minute dataset
        m_df = _normalize_dataset(pd.read_csv(dataset_path, parse_dates=["timestamp"]))
        self._datasets["maitri"] = m_df
        self._data = m_df

        # 2. Check for or generate Bharati 15-minute dataset
        bharati_path = dataset_path.parent / "AURORA_Bharati_15min_Forecasting_Dataset.csv"
        if bharati_path.exists():
            self._datasets["bharati"] = _normalize_dataset(pd.read_csv(bharati_path, parse_dates=["timestamp"]))
        else:
            try:
                from ml.data.generate_synthetic import generate_station_data
                b_df = generate_station_data(2025, "bharati", seed=42)
                b_df.to_csv(bharati_path, index=False)
                self._datasets["bharati"] = _normalize_dataset(b_df)
            except Exception:
                self._datasets["bharati"] = m_df

    def _get_subset(self, station: str) -> pd.DataFrame:
        key = "bharati" if "bharati" in station.lower() else "maitri"
        return self._datasets.get(key, self._data)

    def latest(self, station: str) -> pd.Series:
        subset = self._get_subset(station)

        # Map to current 15-minute time window of the day (96 intervals per 24 hours)
        now = datetime.now()
        step_of_day = (now.hour * 4) + (now.minute // 15)
        day_of_year = now.timetuple().tm_yday
        target_idx = (day_of_year * 96 + step_of_day) % len(subset)

        row = subset.iloc[target_idx].copy()

        # Add realistic micro-telemetry sensor variance (+/- 1%) so live stream pulses
        seed_hash = (now.minute * 60 + now.second) % 100
        jitter = 1.0 + ((seed_hash % 7) - 3) * 0.003
        row["load_kw"] = round(float(row["load_kw"]) * jitter, 2)
        if float(row.get("wind_kw", 0)) > 0:
            row["wind_kw"] = round(float(row["wind_kw"]) * (1.0 + ((seed_hash % 5) - 2) * 0.008), 2)
        return row

    def recent(self, station: str, hours: int = 168) -> pd.DataFrame:
        subset = self._get_subset(station)

        # 15-minute interval: 4 rows per hour. Guarantee at least 120 rows for recursive lag features.
        row_count = max(hours * 4, 120)
        now = datetime.now()
        step_of_day = (now.hour * 4) + (now.minute // 15)
        day_of_year = now.timetuple().tm_yday
        target_idx = (day_of_year * 96 + step_of_day) % len(subset)

        start_idx = max(0, target_idx - row_count)
        result = subset.iloc[start_idx:target_idx].copy()
        if len(result) < row_count:
            result = subset.tail(row_count).copy()
        return result

    def profile(self, station: str) -> dict:
        return STATION_PROFILES.get(station.lower(), STATION_PROFILES["generic"])

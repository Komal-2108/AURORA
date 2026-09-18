from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

from .model import LoadForecastModel
from .preprocess import FEATURES, add_time_features, LAG_STEPS


def make_feature_row(work: pd.DataFrame, ts: pd.Timestamp) -> pd.DataFrame:
    row = work.iloc[-1].copy()
    row["timestamp"] = ts

    # Environmental feature defaults and schema-resilient mapping
    defaults = {
        "temperature_c": -15.0,
        "wind_speed_ms": 12.0,
        "wind_direction_deg": 180.0,
        "pressure_mslp": 990.0,
        "radiation_profile_value": 0.0,
        "solar_availability": 0.0,
    }
    for c, def_val in defaults.items():
        if c in work.columns:
            row[c] = work[c].iloc[-1]
        elif c == "wind_speed_ms" and "wind_speed_mps" in work.columns:
            row[c] = work["wind_speed_mps"].iloc[-1]
        elif c == "pressure_mslp" and "pressure_hpa" in work.columns:
            row[c] = work["pressure_hpa"].iloc[-1]
        elif c == "radiation_profile_value" and "solar_radiation_wm2" in work.columns:
            row[c] = float(np.clip(work["solar_radiation_wm2"].iloc[-1] / 1000.0, 0.0, 1.0))
        elif c == "solar_availability" and "solar_radiation_wm2" in work.columns:
            row[c] = 1.0 if work["solar_radiation_wm2"].iloc[-1] > 5.0 else 0.0
        else:
            row[c] = def_val

    temp = pd.DataFrame([row])
    temp = add_time_features(temp)

    load_col = "station_load_kw" if "station_load_kw" in work.columns else ("load_kw" if "load_kw" in work.columns else work.columns[0])

    for lag in LAG_STEPS:
        temp[f"load_lag_{lag}_15m"] = (
            work[load_col].iloc[-lag]
            if len(work) >= lag else work[load_col].iloc[0]
        )

    for window in (4, 16, 96):
        temp[f"load_roll_{window}"] = work[load_col].tail(window).mean()

    return temp


def recursive_forecast(history: pd.DataFrame, model: LoadForecastModel,
                       horizon: int = 96) -> pd.DataFrame:
    work = history.copy().sort_values("timestamp").reset_index(drop=True)
    work["timestamp"] = pd.to_datetime(work["timestamp"])

    if len(work) < 96:
        raise ValueError("At least 96 historical 15-minute rows are required.")

    output = []
    last_ts = work["timestamp"].iloc[-1]

    for step in range(1, horizon + 1):
        ts = last_ts + pd.Timedelta(minutes=15 * step)
        x = make_feature_row(work, ts)
        pred = float(model.model.predict(x[FEATURES])[0])
        pred = max(0.0, pred)

        row = work.iloc[-1].copy()
        row["timestamp"] = ts
        row["station_load_kw"] = pred
        work = pd.concat([work, pd.DataFrame([row])], ignore_index=True)

        output.append({
            "timestamp": ts,
            "forecast_load_kw": pred,
        })

    return pd.DataFrame(output)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--data", type=Path,
                   default=Path("data/AURORA_Maitri_15min_Forecasting_Dataset.csv"))
    p.add_argument("--model", type=Path,
                   default=Path("models/load_xgb_15min.joblib"))
    p.add_argument("--horizon", type=int, default=96)
    p.add_argument("--output", type=Path,
                   default=Path("artifacts/load_forecast_24h.csv"))
    args = p.parse_args()

    history = pd.read_csv(args.data, parse_dates=["timestamp"])
    model = LoadForecastModel.load(args.model)
    forecast = recursive_forecast(history.tail(200), model, args.horizon)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    forecast.to_csv(args.output, index=False)
    print(forecast.to_string(index=False))
    print(f"Saved: {args.output}")


if __name__ == "__main__":
    main()

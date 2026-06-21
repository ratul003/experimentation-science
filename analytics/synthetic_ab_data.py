"""
synthetic_ab_data.py
Generates synthetic A/B test experiment data matching the structure of
a B2B experimentation platform's output.

Usage:
    python synthetic_ab_data.py --experiments 500 --out data/
"""

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

np.random.seed(42)

ACCOUNT_IDS = [f"acc_{i:04d}" for i in range(80)]
PRODUCT_LINES = ["web_experimentation", "feature_experimentation"]
AGENT_TYPES = ["dev_agent", "copilot", None, None, None]  # ~40% AI-assisted


def generate_experiments(n: int = 500) -> pd.DataFrame:
    records = []

    for i in range(n):
        account = np.random.choice(ACCOUNT_IDS)
        product = np.random.choice(PRODUCT_LINES)
        agent = np.random.choice(AGENT_TYPES)
        ai_assisted = agent is not None

        # AI-assisted experiments attract ~25% more traffic on average —
        # guided setup reduces misconfigured traffic splits.
        base_impressions = np.random.lognormal(mean=8.5, sigma=1.2)
        if ai_assisted:
            base_impressions *= 1.25
        impressions = int(base_impressions)
        qualified = impressions >= 5_000

        # Simulate conversion rates
        baseline_rate = np.random.uniform(0.02, 0.08)
        true_lift = np.random.normal(0.0, 0.08)
        treatment_rate = max(0.001, baseline_rate * (1 + true_lift))

        # Approximate p-value: smaller samples → higher p-values
        noise = np.random.exponential(scale=max(0.1, 1 - impressions / 50_000))
        p_value = round(min(0.999, max(0.001, noise)), 3)
        significant = p_value < 0.05 and qualified

        records.append({
            "experiment_id":        f"exp_{i:05d}",
            "account_id":           account,
            "product_line":         product,
            "ai_assisted":          ai_assisted,
            "agent_type":           agent,
            "impressions":          impressions,
            "qualified":            qualified,
            "baseline_rate":        round(baseline_rate, 4),
            "treatment_rate":       round(treatment_rate, 4),
            "relative_lift":        round(true_lift, 4),
            "p_value":              p_value,
            "significant":          significant,
        })

    return pd.DataFrame(records)


def print_summary(df: pd.DataFrame) -> None:
    overall     = df["qualified"].mean()
    ai_qual     = df[df["ai_assisted"]]["qualified"].mean()
    std_qual    = df[~df["ai_assisted"]]["qualified"].mean()
    lift_pp     = (ai_qual - std_qual) * 100

    print(f"\nGenerated {len(df):,} synthetic experiments")
    print(f"  Overall qualification rate : {overall:.1%}")
    print(f"  AI-assisted                : {ai_qual:.1%}")
    print(f"  Standard                   : {std_qual:.1%}")
    print(f"  Lift                       : +{lift_pp:.1f}pp")
    print(f"\nAccount breakdown ({df['account_id'].nunique()} accounts):")
    print(df.groupby("product_line")["qualified"].agg(["count", "mean"]).rename(columns={"mean": "qual_rate"}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic A/B experiment data")
    parser.add_argument("--experiments", type=int, default=500, help="Number of experiments to generate")
    parser.add_argument("--out", type=str, default="data/", help="Output directory")
    args = parser.parse_args()

    Path(args.out).mkdir(parents=True, exist_ok=True)
    df = generate_experiments(args.experiments)
    out_path = f"{args.out}/synthetic_experiments.csv"
    df.to_csv(out_path, index=False)
    print(f"Saved to {out_path}")
    print_summary(df)

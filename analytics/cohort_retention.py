"""
cohort_retention.py
Cohort analysis: do accounts running more qualified experiments retain better?

Segments accounts by qualified-experiment tier and compares renewal rates.
Uses chi-square test to confirm the relationship is statistically significant.

Usage:
    python cohort_retention.py
"""

import numpy as np
import pandas as pd
from scipy import stats

TIERS = ["0 qualified", "1–4", "5–19", "20+"]


def assign_tier(n: int) -> str:
    if n == 0:
        return "0 qualified"
    if n <= 4:
        return "1–4"
    if n <= 19:
        return "5–19"
    return "20+"


def generate_accounts(n: int = 400, seed: int = 42) -> pd.DataFrame:
    """
    Synthetic account dataset with ground-truth: renewal probability
    increases with qualified experiment count.
    """
    rng = np.random.default_rng(seed)
    qualified_counts = rng.negative_binomial(3, 0.25, size=n)

    # Ground truth: each additional qualified experiment adds ~1.8pp renewal prob
    renewal_probs = np.clip(
        0.40 + qualified_counts * 0.018 + rng.normal(0, 0.06, n),
        0.05, 0.98
    )
    renewed = rng.binomial(1, renewal_probs)

    return pd.DataFrame({
        "account_id":          [f"acc_{i:04d}" for i in range(n)],
        "qualified_exp_count": qualified_counts,
        "tier":                [assign_tier(int(q)) for q in qualified_counts],
        "arr_tier":            rng.choice(["SMB", "Mid-Market", "Enterprise"], n, p=[0.50, 0.35, 0.15]),
        "renewed":             renewed,
    })


def cohort_summary(df: pd.DataFrame) -> pd.DataFrame:
    summary = (
        df.groupby("tier", observed=False)
          .agg(accounts=("account_id", "count"), renewal_rate=("renewed", "mean"))
          .reindex(TIERS)
          .reset_index()
    )
    summary["renewal_pct"] = (summary["renewal_rate"] * 100).round(1)
    return summary


def logistic_regression_check(df: pd.DataFrame) -> None:
    """Simple logit: qualified count → P(renewed), controlling for ARR tier."""
    from scipy.special import expit

    # Encode ARR tier
    arr_map = {"SMB": 0, "Mid-Market": 1, "Enterprise": 2}
    X = np.column_stack([
        np.ones(len(df)),
        df["qualified_exp_count"].values,
        df["arr_tier"].map(arr_map).values,
    ])
    y = df["renewed"].values

    # Gradient descent for logistic regression
    w = np.zeros(X.shape[1])
    lr = 0.01
    for _ in range(2_000):
        p = expit(X @ w)
        grad = X.T @ (p - y) / len(y)
        w -= lr * grad

    print(f"\n  Logistic regression (qualified_count coeff): {w[1]:+.4f}")
    print(f"  → Each additional qualified experiment ≈ +{w[1]*100:.2f}pp log-odds of renewal")


if __name__ == "__main__":
    df = generate_accounts()
    summary = cohort_summary(df)

    print("\nQualified Experiment Cohort → Renewal Rate\n")
    print(f"  {'Tier':<15} {'Accounts':>8}  {'Renewal Rate':>12}")
    print("  " + "─" * 40)
    for _, row in summary.iterrows():
        bar = "█" * int(row["renewal_pct"] / 5)
        print(f"  {row['tier']:<15} {int(row['accounts']):>8}  {row['renewal_pct']:>10.1f}%  {bar}")

    # Chi-square test
    contingency = pd.crosstab(df["tier"], df["renewed"])
    chi2, p, dof, _ = stats.chi2_contingency(contingency)
    print(f"\n  Chi-square: χ²={chi2:.2f}, dof={dof}, p={p:.4f}")
    if p < 0.05:
        print("  → Experiment engagement tier is a statistically significant predictor of renewal.")

    logistic_regression_check(df)

"""
power_analysis.py
Sample size calculator and power curve analysis for conversion rate A/B tests.

Usage:
    python power_analysis.py
"""

import numpy as np
from scipy import stats


def compute_power(
    n: int,
    baseline_rate: float,
    mde: float,
    alpha: float = 0.05,
) -> float:
    """
    Two-sample z-test power for conversion rate experiments.

    n              — impressions per variation
    baseline_rate  — control conversion rate (e.g. 0.03 = 3%)
    mde            — minimum detectable effect as relative lift (e.g. 0.10 = 10%)
    alpha          — significance level (two-tailed)
    """
    treatment_rate = baseline_rate * (1 + mde)
    pooled_rate = (baseline_rate + treatment_rate) / 2
    se = np.sqrt(2 * pooled_rate * (1 - pooled_rate) / n)
    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z = abs(treatment_rate - baseline_rate) / se
    # P(reject H0 | H1 true) — sum both tails
    return float(stats.norm.cdf(z - z_alpha) + stats.norm.cdf(-z - z_alpha))


def compute_mde(
    n: int,
    baseline_rate: float,
    alpha: float = 0.05,
    target_power: float = 0.80,
) -> float:
    """Binary search for the smallest detectable effect at the given power level."""
    lo, hi = 0.001, 2.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if compute_power(n, baseline_rate, mid, alpha) >= target_power:
            hi = mid
        else:
            lo = mid
    return round(hi, 4)


def sample_size_for_power(
    baseline_rate: float,
    mde: float,
    alpha: float = 0.05,
    target_power: float = 0.80,
) -> int:
    """Binary search for minimum n achieving target power."""
    lo, hi = 100, 500_000
    while lo < hi:
        mid = (lo + hi) // 2
        if compute_power(mid, baseline_rate, mde, alpha) >= target_power:
            hi = mid
        else:
            lo = mid + 1
    return lo


def power_table(
    sample_sizes: list[int],
    baseline_rate: float = 0.03,
    mde: float = 0.10,
    alpha: float = 0.05,
) -> None:
    print(f"\nPower Analysis — baseline={baseline_rate:.0%}, MDE={mde:.0%}, α={alpha}")
    print(f"{'Impressions':>12}  {'Power':>7}  {'MDE @ 80%':>10}  Notes")
    print("─" * 58)
    for n in sample_sizes:
        pwr = compute_power(n, baseline_rate, mde, alpha)
        mde_80 = compute_mde(n, baseline_rate, alpha)
        flag = " ← qualified threshold" if n == 5_000 else ""
        print(f"{n:>12,}  {pwr:>6.0%}   {mde_80:>9.0%}  {flag}")


if __name__ == "__main__":
    power_table([500, 1_000, 2_500, 5_000, 10_000, 25_000])

    print("\nMinimum sample sizes to detect common effect sizes at 80% power (α=0.05):")
    print(f"{'MDE':>8}  {'n per variation':>16}")
    print("─" * 28)
    for mde in [0.05, 0.10, 0.15, 0.20, 0.30]:
        n = sample_size_for_power(baseline_rate=0.03, mde=mde)
        print(f"{mde:>8.0%}  {n:>16,}")

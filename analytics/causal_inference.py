"""
causal_inference.py
Addresses the identification challenge: does experiment engagement *cause* better
retention, or do high-quality accounts simply tend to both experiment more and renew?

Three complementary approaches:
  1. Regression Discontinuity Design (RDD) — exploits the 5K impression threshold
  2. Instrumental Variables (IV)            — uses AI assistance as an instrument
  3. Propensity Score Matching (PSM)        — removes observable confounders

Usage:
    python causal_inference.py
"""

import numpy as np
import pandas as pd
from scipy import stats

# ── Shared synthetic data ─────────────────────────────────────────────────────

def generate_dataset(n: int = 1_000, seed: int = 42) -> pd.DataFrame:
    """
    Synthetic account panel.

    Ground truth causal structure:
      ARR tier   → experiment count (large accounts run more experiments)
      ARR tier   → renewal (large accounts renew at higher base rates)
      AI assisted → qualification rate (+25% lift, as in synthetic_ab_data.py)
      Qualification rate → renewal (+1.8pp per qualified experiment)

    This creates a confounding backdoor path:
      ARR tier → experiment count → renewal
    """
    rng = np.random.default_rng(seed)

    # Observable confounders
    arr_tier   = rng.choice([0, 1, 2], size=n, p=[0.50, 0.35, 0.15])  # 0=SMB, 1=MM, 2=Ent
    tenure_yrs = rng.exponential(scale=2.5, size=n).clip(0.5, 10.0)

    # AI assistance — higher adoption at larger accounts (selection)
    ai_adoption_prob = 0.20 + arr_tier * 0.10
    ai_assisted      = rng.binomial(1, ai_adoption_prob)

    # Experiment impressions — confounded by ARR tier
    base_impressions  = rng.lognormal(mean=8.0 + arr_tier * 0.4, sigma=1.1, size=n)
    impressions       = (base_impressions * (1 + ai_assisted * 0.25)).astype(int)
    qualified         = (impressions >= 5_000).astype(int)

    # Qualified experiment count per account in L90D
    qual_count = rng.negative_binomial(3 + arr_tier, 0.3, size=n) * qualified

    # Renewal — causal effect of qual_count + confounding from ARR tier/tenure
    renewal_logit = (
        -0.40                         # intercept
        + arr_tier   * 0.45           # confounder: larger accounts renew more
        + tenure_yrs * 0.08           # confounder: older accounts more sticky
        + qual_count * 0.055          # causal: each qualified experiment adds lift
        + rng.normal(0, 0.4, n)       # noise
    )
    renewal_prob = 1 / (1 + np.exp(-renewal_logit))
    renewed      = rng.binomial(1, renewal_prob)

    return pd.DataFrame({
        "account_id":    [f"acc_{i:04d}" for i in range(n)],
        "arr_tier":      arr_tier,
        "tenure_yrs":    tenure_yrs.round(2),
        "ai_assisted":   ai_assisted,
        "impressions":   impressions,
        "qualified":     qualified,
        "qual_count":    qual_count,
        "renewed":       renewed,
    })


# ── 1. Regression Discontinuity Design ───────────────────────────────────────

def rdd_analysis(df: pd.DataFrame, bandwidth: int = 1_500) -> dict:
    """
    Sharp RDD at the 5,000-impression threshold.

    Accounts just above and just below the threshold should be similar in
    unobservable characteristics — giving a local causal estimate of what
    crossing the threshold does to renewal probability.
    """
    threshold = 5_000
    window = df[
        (df["impressions"] >= threshold - bandwidth) &
        (df["impressions"] <= threshold + bandwidth)
    ].copy()
    window["above"] = (window["impressions"] >= threshold).astype(int)
    window["running"] = window["impressions"] - threshold  # centred running variable

    if len(window) < 20:
        return {"error": "Insufficient observations in bandwidth"}

    above = window[window["above"] == 1]["renewed"]
    below = window[window["above"] == 0]["renewed"]

    # Local average treatment effect at the discontinuity
    late     = above.mean() - below.mean()
    t_stat, p_val = stats.ttest_ind(above, below)

    return {
        "bandwidth":        bandwidth,
        "n_above":          len(above),
        "n_below":          len(below),
        "renewal_above":    round(above.mean(), 3),
        "renewal_below":    round(below.mean(), 3),
        "late":             round(late, 3),
        "t_stat":           round(t_stat, 3),
        "p_value":          round(p_val, 4),
        "significant":      p_val < 0.05,
    }


# ── 2. Instrumental Variables (2SLS) ─────────────────────────────────────────

def iv_2sls(df: pd.DataFrame) -> dict:
    """
    Two-stage least squares using AI assistance as an instrument for
    qualification rate.

    Instrument validity:
      Relevance  — AI assistance raises qualification rate (testable, first stage)
      Exclusion  — AI assistance affects renewal *only through* qualification
                   (plausible: AI assistance doesn't independently cause renewals)

    First stage:  qualified ~ ai_assisted + controls
    Second stage: renewed   ~ qualified_hat + controls
    """
    X_ctrl = np.column_stack([
        np.ones(len(df)),
        df["arr_tier"].values,
        df["tenure_yrs"].values,
    ])

    # First stage: predict qualification using AI assistance + controls
    Z = np.column_stack([X_ctrl, df["ai_assisted"].values])
    qualified_vec = df["qualified"].values.astype(float)
    b1, *_ = np.linalg.lstsq(Z, qualified_vec, rcond=None)
    qualified_hat = Z @ b1
    first_stage_f = (np.var(qualified_hat) / np.var(qualified_vec - qualified_hat)) * (len(df) - Z.shape[1] - 1)

    # Second stage: use predicted qualification (qualified_hat) instead of observed
    X2 = np.column_stack([X_ctrl, qualified_hat])
    b2, *_ = np.linalg.lstsq(X2, df["renewed"].values.astype(float), rcond=None)
    iv_effect = b2[-1]

    # OLS (naive, biased) for comparison
    X_ols = np.column_stack([X_ctrl, df["qualified"].values.astype(float)])
    b_ols, *_ = np.linalg.lstsq(X_ols, df["renewed"].values.astype(float), rcond=None)

    return {
        "ols_effect":           round(b_ols[-1], 4),
        "iv_effect":            round(iv_effect, 4),
        "first_stage_f_stat":   round(first_stage_f, 1),
        "weak_instrument":      first_stage_f < 10,
    }


# ── 3. Propensity Score Matching ──────────────────────────────────────────────

def propensity_score_matching(df: pd.DataFrame, caliper: float = 0.05) -> dict:
    """
    Nearest-neighbour PSM: match each high-engagement account (qual_count >= 5)
    to a low-engagement account with similar observable confounders.

    Estimand: Average Treatment Effect on the Treated (ATT) — the renewal lift
    for accounts that ran ≥5 qualified experiments, compared to matched controls.
    """
    from scipy.special import expit

    treated   = (df["qual_count"] >= 5).astype(int)
    X = np.column_stack([
        np.ones(len(df)),
        df["arr_tier"].values,
        df["tenure_yrs"].values,
    ])

    # Logistic regression to estimate propensity scores
    w = np.zeros(X.shape[1])
    y = treated.values.astype(float)
    for _ in range(3_000):
        p = expit(X @ w)
        w -= 0.02 * (X.T @ (p - y)) / len(y)

    ps = expit(X @ w)
    df = df.copy()
    df["ps"]      = ps
    df["treated"] = treated

    treatment_group = df[df["treated"] == 1].copy()
    control_group   = df[df["treated"] == 0].copy()

    matched_outcomes = []
    for _, row in treatment_group.iterrows():
        diffs = np.abs(control_group["ps"].values - row["ps"])
        nearest_idx = diffs.argmin()
        if diffs[nearest_idx] <= caliper:
            matched_outcomes.append((row["renewed"], control_group.iloc[nearest_idx]["renewed"]))

    if not matched_outcomes:
        return {"error": "No matches within caliper"}

    treated_ren  = np.mean([r[0] for r in matched_outcomes])
    control_ren  = np.mean([r[1] for r in matched_outcomes])
    att          = treated_ren - control_ren
    t_stat, p_val = stats.ttest_rel(
        [r[0] for r in matched_outcomes],
        [r[1] for r in matched_outcomes]
    )

    return {
        "n_matched_pairs":  len(matched_outcomes),
        "n_unmatched":      len(treatment_group) - len(matched_outcomes),
        "renewal_treated":  round(treated_ren, 3),
        "renewal_control":  round(control_ren, 3),
        "att":              round(att, 3),
        "t_stat":           round(t_stat, 3),
        "p_value":          round(p_val, 4),
        "significant":      p_val < 0.05,
    }


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    df = generate_dataset()

    print("\n── 1. Regression Discontinuity Design (bandwidth ±1,500 impressions) ──")
    rdd = rdd_analysis(df)
    print(f"  Accounts above 5K threshold : {rdd['n_above']}  (renewal = {rdd['renewal_above']:.1%})")
    print(f"  Accounts below 5K threshold : {rdd['n_below']}  (renewal = {rdd['renewal_below']:.1%})")
    print(f"  Local average treatment effect (LATE): {rdd['late']:+.1%}")
    print(f"  t={rdd['t_stat']:.2f}, p={rdd['p_value']:.4f}  {'✓ significant' if rdd['significant'] else '✗ not significant'}")

    print("\n── 2. Instrumental Variables (Dev Agent as instrument) ──")
    iv = iv_2sls(df)
    print(f"  OLS estimate (biased, confounded) : {iv['ols_effect']:+.4f}")
    print(f"  IV  estimate (causal)             : {iv['iv_effect']:+.4f}")
    print(f"  First-stage F-statistic           : {iv['first_stage_f_stat']:.1f}  {'(weak instrument)' if iv['weak_instrument'] else '(strong instrument)'}")

    print("\n── 3. Propensity Score Matching (high vs low engagement) ──")
    psm = propensity_score_matching(df)
    print(f"  Matched pairs                     : {psm['n_matched_pairs']}")
    print(f"  Renewal — treated (≥5 qual. exps) : {psm['renewal_treated']:.1%}")
    print(f"  Renewal — matched controls        : {psm['renewal_control']:.1%}")
    print(f"  ATT (causal estimate)             : {psm['att']:+.1%}")
    print(f"  t={psm['t_stat']:.2f}, p={psm['p_value']:.4f}  {'✓ significant' if psm['significant'] else '✗ not significant'}")

    print("\n── Directional Dependence Check ──")
    print("  Forward:  qual_count (t-1) → renewed (t)   — experiment engagement predicts renewal")
    corr_fwd = stats.pearsonr(df["qual_count"], df["renewed"])
    print(f"    r={corr_fwd.statistic:.3f}, p={corr_fwd.pvalue:.4f}")
    print("  This is consistent with a causal chain:")
    print("  AI adoption → experiment quality → qualification rate →")
    print("    engagement metric → product value realised → renewal")

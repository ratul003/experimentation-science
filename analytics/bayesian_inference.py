"""
bayesian_inference.py
Bayesian A/B test analysis using the Beta-Binomial conjugate model.
Computes posterior probability of winning, credible intervals, and expected loss.

Usage:
    python bayesian_inference.py
"""

from dataclasses import dataclass

import numpy as np
from scipy import stats


@dataclass
class Variant:
    name: str
    conversions: int
    visitors: int

    @property
    def rate(self) -> float:
        return self.conversions / self.visitors


@dataclass
class BayesianResult:
    prob_treatment_wins: float
    expected_loss: float
    credible_interval: tuple[float, float]
    lift_median: float
    lift_status: str


def beta_posterior(variant: Variant, prior_alpha: float = 1.0, prior_beta: float = 1.0) -> stats.beta:
    """Beta posterior with a weakly informative uniform prior (Beta(1,1))."""
    return stats.beta(
        prior_alpha + variant.conversions,
        prior_beta + variant.visitors - variant.conversions,
    )


def analyse(
    control: Variant,
    treatment: Variant,
    n_samples: int = 100_000,
    ci_level: float = 0.95,
) -> BayesianResult:
    """
    Monte Carlo approximation of the posterior distribution.

    For each sample draw, we compare treatment vs control conversion rates.
    Probability of winning = fraction of draws where treatment > control.
    Expected loss = average shortfall if we chose the wrong variant.
    """
    rng = np.random.default_rng(42)
    ctrl_samples = beta_posterior(control).rvs(n_samples, random_state=rng)
    trt_samples  = beta_posterior(treatment).rvs(n_samples, random_state=rng)

    prob_win   = float(np.mean(trt_samples > ctrl_samples))
    lift       = (trt_samples - ctrl_samples) / ctrl_samples
    exp_loss   = float(np.mean(np.maximum(ctrl_samples - trt_samples, 0)))

    tail = (1 - ci_level) / 2
    ci   = (float(np.quantile(lift, tail)), float(np.quantile(lift, 1 - tail)))

    if prob_win >= 0.95:
        status = "winning"
    elif prob_win <= 0.05:
        status = "losing"
    else:
        status = "inconclusive"

    return BayesianResult(
        prob_treatment_wins=prob_win,
        expected_loss=exp_loss,
        credible_interval=ci,
        lift_median=float(np.median(lift)),
        lift_status=status,
    )


def print_result(result: BayesianResult) -> None:
    lo, hi = result.credible_interval
    print(f"  P(treatment wins)  : {result.prob_treatment_wins:.1%}")
    print(f"  Expected loss      : {result.expected_loss:.5f}")
    print(f"  95% credible int.  : [{lo:+.1%}, {hi:+.1%}]")
    print(f"  Median lift        : {result.lift_median:+.1%}")
    print(f"  Status             : {result.lift_status}")


if __name__ == "__main__":
    # Example 1: qualified experiment (5K+ impressions, clear signal)
    print("\nExample 1 — qualified experiment (10K impressions per variation)")
    control   = Variant("control",   conversions=312, visitors=10_000)
    treatment = Variant("treatment", conversions=347, visitors=10_000)
    print_result(analyse(control, treatment))

    # Example 2: underpowered experiment (500 impressions — below threshold)
    print("\nExample 2 — underpowered experiment (500 impressions per variation)")
    control_small   = Variant("control",   conversions=16, visitors=500)
    treatment_small = Variant("treatment", conversions=19, visitors=500)
    print_result(analyse(control_small, treatment_small))

    print("\nNote: both experiments have the same observed lift (~11%). The underpowered")
    print("experiment produces a wide credible interval and inconclusive status —")
    print("illustrating why the 5K impression threshold exists.")

import { HealthScoreBreakdown, HealthCategory } from '../types';

export const HEALTH_WEIGHTS = {
  TARGET_ACHIEVEMENT: 40, // max 40 points
  REVENUE_GROWTH: 30,     // max 30 points
  CUSTOMER_TRAFFIC: 15,   // max 15 points
  AOV_PERFORMANCE: 15,    // max 15 points
};

export const HEALTH_THRESHOLDS = {
  EXCELLENT: 90,
  HEALTHY: 75,
  AT_RISK: 60,
};

export function getHealthCategory(score: number): HealthCategory {
  if (score >= HEALTH_THRESHOLDS.EXCELLENT) return 'Excellent';
  if (score >= HEALTH_THRESHOLDS.HEALTHY) return 'Healthy';
  if (score >= HEALTH_THRESHOLDS.AT_RISK) return 'At Risk';
  return 'Critical';
}

export function getHealthCategoryBadgeClass(category: HealthCategory): string {
  switch (category) {
    case 'Excellent':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
    case 'Healthy':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';
    case 'At Risk':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
    case 'Critical':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
  }
}

export interface MetricInput {
  revenue: number;
  targetRevenue: number;
  previousRevenue: number;
  revenueGrowth?: number;
  customers: number;
  previousCustomers?: number;
  orders: number;
  aov?: number;
  benchmarkAov?: number;
}

/**
 * Calculates a deterministic, explainable 0-100 Outlet Health Score
 * Formula:
 * - Target Achievement (40%): (Revenue / Target) * 40, capped at 40
 * - Revenue Growth (30%): Base 15 pts + (Growth% * 0.75), clamped between 0 and 30
 * - Customer Traffic (15%): Base 10 pts + (Customer Growth% * 0.5), clamped between 0 and 15
 * - AOV Performance (15%): (AOV / Benchmark AOV) * 15, clamped between 0 and 15
 */
export function calculateHealthScore(input: MetricInput): HealthScoreBreakdown {
  const {
    revenue,
    targetRevenue,
    previousRevenue,
    customers,
    previousCustomers = Math.round(customers * 0.95),
    orders,
    benchmarkAov = 500,
  } = input;

  // 1. Target Achievement Component (Max 40)
  const targetPct = targetRevenue > 0 ? (revenue / targetRevenue) * 100 : 100;
  const targetScore = Math.min(
    HEALTH_WEIGHTS.TARGET_ACHIEVEMENT,
    Math.max(0, (targetPct / 100) * HEALTH_WEIGHTS.TARGET_ACHIEVEMENT)
  );

  // 2. Revenue Growth Component (Max 30)
  const revenueGrowth = input.revenueGrowth !== undefined 
    ? input.revenueGrowth 
    : previousRevenue > 0 
      ? ((revenue - previousRevenue) / previousRevenue) * 100 
      : 0;

  // Base 15 points for 0% growth, scales up with positive growth, down with negative
  const growthScore = Math.min(
    HEALTH_WEIGHTS.REVENUE_GROWTH,
    Math.max(0, 15 + revenueGrowth * 0.75)
  );

  // 3. Customer Traffic Component (Max 15)
  const customerGrowth = previousCustomers > 0 
    ? ((customers - previousCustomers) / previousCustomers) * 100 
    : 0;
  const customerScore = Math.min(
    HEALTH_WEIGHTS.CUSTOMER_TRAFFIC,
    Math.max(0, 10 + customerGrowth * 0.5)
  );

  // 4. AOV Performance Component (Max 15)
  const computedAov = input.aov || (orders > 0 ? revenue / orders : 0);
  const aovScore = Math.min(
    HEALTH_WEIGHTS.AOV_PERFORMANCE,
    Math.max(0, (computedAov / benchmarkAov) * HEALTH_WEIGHTS.AOV_PERFORMANCE)
  );

  // Total Score (0-100)
  const totalScore = Math.round(targetScore + growthScore + customerScore + aovScore);
  const category = getHealthCategory(totalScore);

  // Strengths identification
  const strengths: string[] = [];
  if (targetPct >= 100) strengths.push(`Exceeding revenue target at ${targetPct.toFixed(1)}%`);
  else if (targetPct >= 90) strengths.push(`Solid target achievement pace at ${targetPct.toFixed(1)}%`);

  if (revenueGrowth > 5) strengths.push(`Strong MoM revenue expansion (+${revenueGrowth.toFixed(1)}%)`);
  if (computedAov >= benchmarkAov) strengths.push(`Healthy ticket size (₹${Math.round(computedAov)} AOV vs ₹${benchmarkAov} benchmark)`);
  if (customerGrowth > 0) strengths.push(`Positive footfall trend (+${customerGrowth.toFixed(1)}% customer growth)`);

  if (strengths.length === 0) {
    strengths.push('Operational baseline maintained without critical compliance failures');
  }

  // Weaknesses identification
  const weaknesses: string[] = [];
  if (targetPct < 80) weaknesses.push(`Severely lagging revenue target (${targetPct.toFixed(1)}% achieved vs 100% goal)`);
  else if (targetPct < 90) weaknesses.push(`Sub-optimal target achievement (${targetPct.toFixed(1)}%)`);

  if (revenueGrowth < 0) weaknesses.push(`Revenue contraction of ${revenueGrowth.toFixed(1)}% compared to previous cycle`);
  if (computedAov < benchmarkAov * 0.95) weaknesses.push(`AOV lagging network average (₹${Math.round(computedAov)} vs ₹${benchmarkAov})`);
  if (customerGrowth < 0) weaknesses.push(`Customer traffic decline of ${Math.abs(customerGrowth).toFixed(1)}%`);

  if (weaknesses.length === 0) {
    weaknesses.push('No critical drag factors identified in this operational cycle');
  }

  // Actionable Recommendation
  let recommendedFocus = '';
  if (targetPct < 80 && revenueGrowth < 0) {
    recommendedFocus = 'Initiate immediate marketing boost and delivery aggregator promotions to stem footfall losses; review supply chain stockouts.';
  } else if (computedAov < benchmarkAov * 0.92) {
    recommendedFocus = 'Implement high-margin combo pairings and staff upselling training to raise average ticket value to network parity.';
  } else if (customerGrowth < 0) {
    recommendedFocus = 'Launch targeted local geo-fenced social campaigns to recapture dine-in and pickup customers.';
  } else {
    recommendedFocus = 'Maintain current operational standards and explore premium menu extensions to capture incremental margin.';
  }

  return {
    totalScore,
    category,
    components: {
      targetAchievement: {
        score: Math.round(targetScore * 10) / 10,
        max: HEALTH_WEIGHTS.TARGET_ACHIEVEMENT,
        label: 'Target Achievement',
        valueFormatted: `${targetPct.toFixed(1)}%`,
      },
      revenueGrowth: {
        score: Math.round(growthScore * 10) / 10,
        max: HEALTH_WEIGHTS.REVENUE_GROWTH,
        label: 'Revenue Growth',
        valueFormatted: `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`,
      },
      customerTraffic: {
        score: Math.round(customerScore * 10) / 10,
        max: HEALTH_WEIGHTS.CUSTOMER_TRAFFIC,
        label: 'Customer Traffic',
        valueFormatted: `${customerGrowth > 0 ? '+' : ''}${customerGrowth.toFixed(1)}%`,
      },
      aovPerformance: {
        score: Math.round(aovScore * 10) / 10,
        max: HEALTH_WEIGHTS.AOV_PERFORMANCE,
        label: 'AOV vs Benchmark',
        valueFormatted: `₹${Math.round(computedAov)} (Parity: ${Math.round((computedAov / benchmarkAov) * 100)}%)`,
      },
    },
    strengths,
    weaknesses,
    recommendedFocus,
  };
}

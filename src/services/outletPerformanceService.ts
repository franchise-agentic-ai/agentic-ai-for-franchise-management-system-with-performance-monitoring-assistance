import { 
  Outlet, 
  OutletPerformance, 
  OutletBenchmarking, 
  TimeSeriesPoint, 
  UnderperformanceDetection, 
  UnderperformanceAlertItem,
  RevenueTrendAnalysis,
  HealthScoreBreakdown
} from '../types';
import { calculateHealthScore } from './healthScoreEngine';
import { mockOutlets, mockPerformances } from './mockData';
import { supabase, isSupabaseConfigured } from './supabase';

export type TimeFrame = '7D' | '30D' | '3M' | '6M' | '12M';
export type MetricType = 'revenue' | 'orders' | 'customers' | 'aov';

// In-memory cache for fast responsive interactions
let cachedOutlets: Outlet[] = [...mockOutlets];
let cachedPerformances: OutletPerformance[] = [...mockPerformances];

/**
 * Fetch latest outlet list (Supabase or fallback mock)
 */
export async function fetchOutlets(): Promise<Outlet[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase!.from('outlets').select('*');
      if (!error && data && data.length > 0) {
        cachedOutlets = data;
        return data;
      }
    } catch (e) {
      console.warn('Supabase fetch outlets failed, using cached mock data', e);
    }
  }
  return cachedOutlets;
}

/**
 * Fetch latest outlet performances
 */
export async function fetchOutletPerformances(): Promise<OutletPerformance[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase!.from('outlet_performance').select('*');
      if (!error && data && data.length > 0) {
        cachedPerformances = data;
        return data;
      }
    } catch (e) {
      console.warn('Supabase fetch performances failed, using cached mock data', e);
    }
  }
  return cachedPerformances;
}

/**
 * Get comprehensive processed benchmarking data with dynamic health scores and ranking
 */
export async function getBenchmarkingData(): Promise<OutletBenchmarking[]> {
  const [outlets, performances] = await Promise.all([fetchOutlets(), fetchOutletPerformances()]);

  // Compute benchmark network AOV
  const totalRev = performances.reduce((acc, p) => acc + p.revenue, 0);
  const totalOrders = performances.reduce((acc, p) => acc + p.orders, 0);
  const benchmarkAov = totalOrders > 0 ? totalRev / totalOrders : 500;

  const enriched: OutletBenchmarking[] = outlets.map((outlet) => {
    const perf = performances.find((p) => p.outlet_id === outlet.id) || {
      outlet_id: outlet.id,
      period: '2023-10',
      revenue: 2000000,
      previous_revenue: 2000000,
      target_revenue: 2100000,
      orders: 4000,
      customers: 3500,
      revenue_growth: 0,
      target_achievement: 95.2,
      aov: 500,
      health_score: 80,
      performance_status: 'Good' as const,
    };

    const healthBreakdown = calculateHealthScore({
      revenue: perf.revenue,
      targetRevenue: perf.target_revenue,
      previousRevenue: perf.previous_revenue,
      revenueGrowth: perf.revenue_growth,
      orders: perf.orders,
      customers: perf.customers,
      aov: perf.aov,
      benchmarkAov,
    });

    const isUnderperforming = healthBreakdown.totalScore < 75 || perf.revenue_growth < -5 || (perf.revenue / perf.target_revenue) < 0.85;
    
    let riskLevel: 'None' | 'Watch' | 'High Risk' | 'Critical' = 'None';
    if (healthBreakdown.totalScore < 60 || perf.revenue_growth < -15) {
      riskLevel = 'Critical';
    } else if (healthBreakdown.totalScore < 75 || perf.revenue_growth < -8) {
      riskLevel = 'High Risk';
    } else if (healthBreakdown.totalScore < 80 || (perf.revenue / perf.target_revenue) < 0.9) {
      riskLevel = 'Watch';
    }

    return {
      outletId: outlet.id,
      name: outlet.name,
      city: outlet.city,
      state: outlet.state,
      revenue: perf.revenue,
      revenueGrowth: perf.revenue_growth,
      targetAchievement: (perf.revenue / perf.target_revenue) * 100,
      customers: perf.customers,
      orders: perf.orders,
      aov: perf.aov,
      healthScore: healthBreakdown.totalScore,
      category: healthBreakdown.category,
      rank: 1, // calculated next
      isUnderperforming,
      riskLevel,
    };
  });

  // Sort by revenue descending to assign ranks
  enriched.sort((a, b) => b.revenue - a.revenue);
  enriched.forEach((item, index) => {
    item.rank = index + 1;
  });

  return enriched;
}

/**
 * Get detailed health score breakdown for an outlet
 */
export async function getOutletHealthBreakdown(outletId: string): Promise<HealthScoreBreakdown | null> {
  const [outlets, performances] = await Promise.all([fetchOutlets(), fetchOutletPerformances()]);
  const perf = performances.find((p) => p.outlet_id === outletId);
  if (!perf) return null;

  const totalRev = performances.reduce((acc, p) => acc + p.revenue, 0);
  const totalOrders = performances.reduce((acc, p) => acc + p.orders, 0);
  const benchmarkAov = totalOrders > 0 ? totalRev / totalOrders : 500;

  return calculateHealthScore({
    revenue: perf.revenue,
    targetRevenue: perf.target_revenue,
    previousRevenue: perf.previous_revenue,
    revenueGrowth: perf.revenue_growth,
    orders: perf.orders,
    customers: perf.customers,
    aov: perf.aov,
    benchmarkAov,
  });
}

/**
 * Historical time-series generator per outlet and timeframe
 */
export function getOutletTimeSeries(outletId?: string, timeframe: TimeFrame = '30D'): TimeSeriesPoint[] {
  // Define time points based on timeframe
  const pointsCount = timeframe === '7D' ? 7 : timeframe === '30D' ? 6 : timeframe === '3M' ? 8 : timeframe === '6M' ? 6 : 12;
  
  const labels: Record<TimeFrame, string[]> = {
    '7D': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    '30D': ['Day 05', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
    '3M': ['Aug W1', 'Aug W3', 'Sep W1', 'Sep W3', 'Oct W1', 'Oct W2', 'Oct W3', 'Oct W4'],
    '6M': ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    '12M': ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  };

  const dates = labels[timeframe] || labels['30D'];

  // Base multipliers depending on outlet
  const outletMultiplierMap: Record<string, { baseRev: number; trend: number; target: number; aov: number }> = {
    out_1: { baseRev: 2450000, trend: 1.12, target: 2300000, aov: 500 }, // Gachibowli (High + Growing)
    out_2: { baseRev: 1850000, trend: 0.86, target: 2400000, aov: 486 }, // Indiranagar (Lagging)
    out_3: { baseRev: 3100000, trend: 1.09, target: 3000000, aov: 508 }, // T Nagar (Solid)
    out_4: { baseRev: 4200000, trend: 1.08, target: 4500000, aov: 538 }, // Bandra (Flagship)
    out_5: { baseRev: 1450000, trend: 0.82, target: 2000000, aov: 467 }, // Pune KP (Severe drop)
    out_6: { baseRev: 1950000, trend: 1.08, target: 1800000, aov: 464 }, // Benz Circle (Beating target)
    out_7: { baseRev: 2100000, trend: 1.02, target: 2200000, aov: 488 }, // MVP Colony (Steady)
  };

  const currentConfig = (outletId && outletMultiplierMap[outletId]) 
    ? outletMultiplierMap[outletId]
    : { baseRev: 17100000, trend: 1.06, target: 18200000, aov: 495 }; // Network total

  const divisor = timeframe === '7D' ? 30 : timeframe === '30D' ? 6 : timeframe === '3M' ? 3 : timeframe === '6M' ? 1 : 1;
  const scaledRev = currentConfig.baseRev / divisor;
  const scaledTarget = currentConfig.target / divisor;

  return dates.map((date, idx) => {
    // Progressive curve based on trend
    const progressFactor = idx / (dates.length - 1);
    const growthWave = Math.sin(idx * 0.8) * 0.05;
    const trendFactor = 1 + (currentConfig.trend - 1) * progressFactor + growthWave;
    
    const rev = Math.round(scaledRev * trendFactor);
    const target = Math.round(scaledTarget * (1 + (idx * 0.01)));
    const aov = Math.round(currentConfig.aov + (Math.sin(idx) * 12));
    const orders = Math.round(rev / aov);
    const customers = Math.round(orders * 0.88);

    return {
      date,
      revenue: rev,
      target,
      orders,
      customers,
      aov,
    };
  });
}

/**
 * Analyze Revenue Trends across the franchise network
 */
export async function analyzeRevenueTrends(timeframe: TimeFrame = '30D'): Promise<RevenueTrendAnalysis> {
  const benchmarking = await getBenchmarkingData();
  const totalRevenue = benchmarking.reduce((sum, o) => sum + o.revenue, 0);
  const totalPrevRevenue = benchmarking.reduce((sum, o) => sum + (o.revenue / (1 + (o.revenueGrowth / 100))), 0);
  const growthPercent = ((totalRevenue - totalPrevRevenue) / totalPrevRevenue) * 100;

  const topContributors = benchmarking
    .filter((o) => o.revenueGrowth > 0)
    .sort((a, b) => b.revenueGrowth - a.revenueGrowth)
    .slice(0, 3)
    .map((o) => ({
      outletName: o.name,
      contributionPercent: Math.round((o.revenue / totalRevenue) * 100),
      revenueGrowth: o.revenueGrowth,
    }));

  const dragOutlets = benchmarking
    .filter((o) => o.revenueGrowth < 0)
    .sort((a, b) => a.revenueGrowth - b.revenueGrowth)
    .map((o) => ({
      outletName: o.name,
      revenueDrop: Math.round(Math.abs(o.revenue * (o.revenueGrowth / 100))),
      growth: o.revenueGrowth,
    }));

  const trendDirection: 'Accelerating' | 'Steady' | 'Decelerating' | 'Declining' = 
    growthPercent > 8 ? 'Accelerating' : growthPercent > 2 ? 'Steady' : growthPercent >= 0 ? 'Decelerating' : 'Declining';

  const insights: string[] = [
    `Franchise network generated ₹${(totalRevenue / 100000).toFixed(1)}L this cycle, recording a net ${growthPercent >= 0 ? '+' : ''}${growthPercent.toFixed(1)}% growth vs previous period.`,
    `Top 3 high-velocity hubs (${topContributors.map(c => c.outletName.split(' - ')[1]).join(', ')}) contributed over ${(topContributors.reduce((s, c) => s + c.contributionPercent, 0))}% of total monthly volume.`,
    `${dragOutlets.length} outlet${dragOutlets.length > 1 ? 's' : ''} experienced revenue contractions (${dragOutlets.map(d => `${d.outletName.split(' - ')[1]} ${d.growth}%`).join(', ')}), representing a combined drag of ₹${(dragOutlets.reduce((s, d) => s + d.revenueDrop, 0) / 100000).toFixed(1)}L.`,
    `Average Order Value (AOV) across the network stands at ₹${Math.round(benchmarking.reduce((s, o) => s + o.aov, 0) / benchmarking.length)}, demonstrating steady customer ticket elasticity.`
  ];

  return {
    currentRevenue: totalRevenue,
    previousRevenue: totalPrevRevenue,
    growthPercent: Math.round(growthPercent * 10) / 10,
    trendDirection,
    bestPeriod: 'Oct 25 (Peak Weekend Festival)',
    worstPeriod: 'Oct 02 (Mon Post-Holiday)',
    topContributors,
    dragOutlets,
    insights,
  };
}

/**
 * Detect underperforming stores with multi-factor criteria
 */
export async function getUnderperformingDetections(): Promise<UnderperformanceDetection[]> {
  const benchmarking = await getBenchmarkingData();
  
  return benchmarking
    .filter((o) => o.isUnderperforming)
    .map((o) => {
      const triggers: string[] = [];
      if (o.healthScore < 60) triggers.push(`Critical Health Score (${o.healthScore}/100)`);
      else if (o.healthScore < 75) triggers.push(`Low Health Score (${o.healthScore}/100)`);

      if (o.revenueGrowth < -10) triggers.push(`Severe MoM revenue decline (${o.revenueGrowth}%)`);
      else if (o.revenueGrowth < 0) triggers.push(`Negative growth (${o.revenueGrowth}%)`);

      if (o.targetAchievement < 80) triggers.push(`Missed sales target by ${(100 - o.targetAchievement).toFixed(1)}%`);
      if (o.aov < 480) triggers.push(`Below benchmark ticket size (₹${o.aov})`);

      let whyFlagged = '';
      let recommendedAction = '';

      if (o.name.includes('KP') || o.city === 'Pune') {
        whyFlagged = 'Revenue dropped -17.1% and store is achieving only 72.5% of sales target due to dine-in traffic loss and spice stockouts.';
        recommendedAction = 'Deploy immediate delivery aggregator discount campaign in 5km radius and prioritize emergency spice replenishment from regional hub.';
      } else if (o.name.includes('Indiranagar') || o.city === 'Bengaluru') {
        whyFlagged = 'Severe staffing absenteeism causing kitchen prep delays (+8 mins) and 13.9% MoM sales slump.';
        recommendedAction = 'Transfer float kitchen staff from Gachibowli for high-volume shifts and initiate expedited culinary hiring.';
      } else {
        whyFlagged = `Performance trailing network targets with health score at ${o.healthScore} and target achievement at ${o.targetAchievement.toFixed(0)}%.`;
        recommendedAction = 'Conduct operational field audit and implement regional promotional bundling.';
      }

      return {
        outletId: o.outletId,
        outletName: o.name,
        city: o.city,
        healthScore: o.healthScore,
        revenueGrowth: o.revenueGrowth,
        targetAchievement: Math.round(o.targetAchievement),
        customerGrowth: o.revenueGrowth < 0 ? -8.4 : 2.1,
        riskLevel: o.riskLevel === 'None' ? 'Watch' : o.riskLevel,
        whyFlagged,
        triggers,
        recommendedAction,
      };
    });
}

/**
 * Get dynamic underperformance alerts
 */
export async function getUnderperformanceAlerts(): Promise<UnderperformanceAlertItem[]> {
  const detections = await getUnderperformingDetections();

  return detections.map((d, i) => ({
    id: `alert_dyn_${i + 1}`,
    outletId: d.outletId,
    outletName: d.outletName,
    severity: d.riskLevel === 'Critical' ? 'Critical' : d.riskLevel === 'High Risk' ? 'High' : 'Watch',
    issue: d.triggers[0] || 'Target variance detected',
    metric: `Growth: ${d.revenueGrowth}% | Target: ${d.targetAchievement}%`,
    detectedTime: i === 0 ? '15m ago' : i === 1 ? '1h ago' : '4h ago',
    recommendedAction: d.recommendedAction,
  }));
}

import { queryOutletPerformanceAgent } from './geminiAgent';

/**
 * Outlet Performance Agent Question & Answer Assistant.
 * Routes through the Business-Aware Multi-Agent Orchestrator.
 */
export async function askOutletPerformanceAgent(question: string): Promise<{ answer: string; relatedOutlets: string[]; keyMetrics: string[] }> {
  return await queryOutletPerformanceAgent(question);
}


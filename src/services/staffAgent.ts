import { 
  StaffAgentScanResult, 
  StaffAgentInsight, 
  WorkforceKPIs, 
  WorkforceOutletMetrics, 
  StaffShortageAssessment, 
  Employee 
} from '../types/workforce';
import { 
  getTenantEmployees, 
  getTenantShifts, 
  getTenantStaffingRequirements, 
  getTenantOutlets, 
  getActiveBusiness, 
  logTenantActivity,
  saveTenantWorkforceInsights
} from './tenantService';
import { 
  calculateWorkforceKPIs, 
  compareOutletWorkforce, 
  detectStaffShortages, 
  identifyHighAndLowPerformers, 
  generateWorkforceAlerts 
} from './staffEngine';
import { GoogleGenAI } from '@google/genai';

const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) 
  || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) 
  || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client in StaffAgent:', err);
  }
}

export type StaffThinkingCallback = (step: string, phase: number, totalPhases: number) => void;

/**
 * Autonomous Staff Agent — Workforce Intelligence
 * Deterministically analyzes multi-outlet workforce, shift coverage, attendance, overtime, and generates structured AI intelligence.
 */
export async function runStaffAgent(
  businessId: string,
  onThinkingStep?: StaffThinkingCallback
): Promise<StaffAgentScanResult> {
  // Phase 1: OBSERVE & QUERY
  if (onThinkingStep) onThinkingStep('Observing multi-outlet employee rosters, active shifts, and attendance logs...', 1, 5);
  await new Promise(r => setTimeout(r, 120));

  const outlets = getTenantOutlets(businessId);
  const employees = getTenantEmployees(businessId);
  const shifts = getTenantShifts(businessId);
  const requirements = getTenantStaffingRequirements(businessId);

  // Phase 2: DETERMINISTIC CALCULATIONS
  if (onThinkingStep) onThinkingStep('Computing deterministic attendance rates, overtime loads, and productivity benchmarks...', 2, 5);
  await new Promise(r => setTimeout(r, 150));

  const outletMetrics = compareOutletWorkforce(outlets, employees, shifts);
  const shortages = detectStaffShortages(shifts, employees, requirements);
  const kpis = calculateWorkforceKPIs(employees, shifts, outletMetrics);
  const { topPerformers, attentionRequired } = identifyHighAndLowPerformers(employees);

  // Phase 3: ANOMALY & RISK DETECTION
  if (onThinkingStep) onThinkingStep('Evaluating shift shortages, overtime burnout, and absenteeism bottlenecks...', 3, 5);
  await new Promise(r => setTimeout(r, 150));

  const insights = generateWorkforceAlerts(outletMetrics, shortages, employees);

  // Phase 4: FORMULATE ACTIONABLE MITIGATIONS
  if (onThinkingStep) onThinkingStep('Synthesizing cross-outlet shift reallocations and optimal crew deployments...', 4, 5);
  await new Promise(r => setTimeout(r, 120));

  // Phase 5: AI EXECUTIVE SUMMARY
  if (onThinkingStep) onThinkingStep('Formulating Executive Workforce Intelligence narrative & actionable recommendations...', 5, 5);
  await new Promise(r => setTimeout(r, 120));

  let summaryNarrative = `Network workforce health score is ${Math.round(outletMetrics.reduce((s, m) => s + m.workforceHealthScore, 0) / (outletMetrics.length || 1))}/100 across ${employees.length} employees in ${outlets.length} outlets. Overall attendance stands at ${kpis.overallAttendanceRate}% with an average productivity score of ${kpis.overallProductivityScore}/100.`;

  if (shortages.length > 0) {
    summaryNarrative += ` Critical operational action required: ${shortages.length} shift shortage(s) detected, notably in ${shortages.map(s => s.outletName).join(', ')}.`;
  }
  if (kpis.totalOvertimeHours > 50) {
    summaryNarrative += ` High overtime load (${kpis.totalOvertimeHours} total hours) detected; rebalancing recommended to prevent chef fatigue.`;
  }

  // Generate LLM narrative if AI client is configured
  if (aiClient) {
    try {
      const prompt = `You are the FranchiseOps Autonomous Staff Agent.
Analyze the following DETERMINISTIC workforce data and generate a concise 3-4 sentence executive briefing. Do NOT invent new numbers.

Data:
- Total Employees: ${kpis.totalEmployees}
- Active: ${kpis.activeHeadcount}, On Leave: ${kpis.onLeaveCount}
- Overall Attendance: ${kpis.overallAttendanceRate}%
- Overall Productivity: ${kpis.overallProductivityScore}/100
- Total Overtime: ${kpis.totalOvertimeHours} hours
- Active Shortages: ${kpis.activeShortagesCount} shifts (${shortages.map(s => `${s.outletName} ${s.shiftType} shift deficit: ${s.deficit}`).join('; ')})
- Top Performing Outlet: ${outletMetrics[0]?.outletName} (${outletMetrics[0]?.workforceHealthScore}/100)
- Highest Risk Outlet: ${outletMetrics[outletMetrics.length - 1]?.outletName} (${outletMetrics[outletMetrics.length - 1]?.workforceHealthScore}/100, Reason: ${outletMetrics[outletMetrics.length - 1]?.primaryRiskReason})

Format:
1. Executive Assessment (2 sentences)
2. Immediate Actionable Prescription (1-2 sentences with specific outlet and shift guidance).`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      if (response.text) {
        summaryNarrative = response.text.trim();
      }
    } catch (e) {
      console.warn('AI generation skipped in StaffAgent, using deterministic narrative:', e);
    }
  }

  const result: StaffAgentScanResult = {
    businessId,
    timestamp: new Date().toISOString(),
    kpis,
    outletMetrics,
    shortages,
    insights,
    topPerformers,
    attentionRequiredEmployees: attentionRequired,
    summaryNarrative
  };

  saveTenantWorkforceInsights(businessId, insights);
  logTenantActivity(businessId, 'Staff Agent', `Completed full workforce scan across ${outlets.length} outlets (${kpis.activeShortagesCount} shortage alerts).`);

  return result;
}

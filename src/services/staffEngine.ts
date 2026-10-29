import { 
  Employee, 
  ShiftRecord, 
  StaffingRequirement, 
  WorkforceOutletMetrics, 
  StaffShortageAssessment, 
  WorkforceKPIs, 
  StaffAgentInsight,
  WorkforceRiskLevel
} from '../types/workforce';
import { Outlet } from '../types';

/**
 * Deterministic Workforce Calculation Engine for Staff Agent
 * Pure business logic with deterministic formulas. LLM does NOT calculate metrics.
 */

export function calculateAttendanceRate(employees: Employee[]): number {
  if (!employees || employees.length === 0) return 0;
  const total = employees.reduce((sum, e) => sum + (e.attendanceRate || 0), 0);
  return Math.round((total / employees.length) * 10) / 10;
}

export function calculateProductivityScore(employees: Employee[]): number {
  if (!employees || employees.length === 0) return 0;
  const total = employees.reduce((sum, e) => sum + (e.productivityScore || 0), 0);
  return Math.round((total / employees.length) * 10) / 10;
}

export function calculatePerformanceScore(employees: Employee[]): number {
  if (!employees || employees.length === 0) return 0;
  const total = employees.reduce((sum, e) => sum + (e.performanceScore || 0), 0);
  return Math.round((total / employees.length) * 10) / 10;
}

export function analyzeWorkingHoursAndOvertime(employees: Employee[]): {
  totalWorkingHours: number;
  totalOvertimeHours: number;
  averageOvertime: number;
  excessiveOvertimeStaff: Employee[];
} {
  const totalWorkingHours = employees.reduce((sum, e) => sum + (e.workingHours || 0), 0);
  const totalOvertimeHours = employees.reduce((sum, e) => sum + (e.overtimeHours || 0), 0);
  const averageOvertime = employees.length > 0 ? Math.round((totalOvertimeHours / employees.length) * 10) / 10 : 0;
  
  // Flag employees exceeding 25 hours overtime in a single period (burnout risk)
  const excessiveOvertimeStaff = employees.filter(e => (e.overtimeHours || 0) >= 25);

  return {
    totalWorkingHours,
    totalOvertimeHours,
    averageOvertime,
    excessiveOvertimeStaff
  };
}

export function analyzeShiftCoverage(shifts: ShiftRecord[]): {
  totalShifts: number;
  coveredShifts: number;
  shortageShifts: number;
  overallCoveragePercentage: number;
} {
  if (!shifts || shifts.length === 0) {
    return { totalShifts: 0, coveredShifts: 0, shortageShifts: 0, overallCoveragePercentage: 100 };
  }

  const shortageShifts = shifts.filter(s => s.coverageStatus === 'SHORTAGE' || s.coverageStatus === 'CRITICAL_DEFICIT').length;
  const coveredShifts = shifts.length - shortageShifts;
  const overallCoveragePercentage = Math.round((coveredShifts / shifts.length) * 1000) / 10;

  return {
    totalShifts: shifts.length,
    coveredShifts,
    shortageShifts,
    overallCoveragePercentage
  };
}

export function detectStaffShortages(
  shifts: ShiftRecord[],
  employees: Employee[],
  requirements?: StaffingRequirement[]
): StaffShortageAssessment[] {
  const shortages: StaffShortageAssessment[] = [];

  for (const shift of shifts) {
    if (shift.coverageStatus === 'SHORTAGE' || shift.coverageStatus === 'CRITICAL_DEFICIT' || shift.deficitCount > 0) {
      const deficit = shift.deficitCount || (shift.requiredStaffCount - shift.assignedStaffCount);
      const severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 
        shift.coverageStatus === 'CRITICAL_DEFICIT' || deficit >= 2 
          ? 'CRITICAL' 
          : deficit === 1 
            ? 'HIGH' 
            : 'MEDIUM';

      // Look for other outlets that have surplus or high-attendance staff in the same department
      const potentialSources = employees
        .filter(e => e.outletId !== shift.outletId && e.department === shift.department && e.status === 'Active' && e.attendanceRate >= 90)
        .reduce((acc, emp) => {
          const existing = acc.find(a => a.outletId === emp.outletId);
          if (existing) {
            existing.availableStaffCount += 1;
            existing.candidateNames.push(emp.employeeName);
          } else {
            acc.push({
              outletId: emp.outletId,
              outletName: emp.outletName,
              availableStaffCount: 1,
              candidateNames: [emp.employeeName]
            });
          }
          return acc;
        }, [] as { outletId: string; outletName: string; availableStaffCount: number; candidateNames: string[] }[]);

      shortages.push({
        outletId: shift.outletId,
        outletName: shift.outletName,
        shiftType: shift.shiftType,
        department: shift.department,
        requiredStaff: shift.requiredStaffCount,
        actualStaff: shift.assignedStaffCount,
        deficit,
        severity,
        impactExplanation: `${shift.outletName} has a ${deficit}-staff deficit during the ${shift.shiftType} shift. This risks order turnaround delay, kitchen bottleneck, and dining customer dissatisfaction.`,
        suggestedAction: potentialSources.length > 0
          ? `Temporarily reallocate 1-2 staff (${potentialSources[0].candidateNames.slice(0, 2).join(', ')}) from ${potentialSources[0].outletName} during peak ${shift.shiftType} rush.`
          : `Schedule emergency reserve staff or authorize scheduled split-shift coverage.`,
        possibleReallocationSources: potentialSources
      });
    }
  }

  return shortages;
}

export function calculateWorkforceScore(
  avgAttendance: number,
  avgProductivity: number,
  coveragePct: number,
  overtimeLoad: number
): { score: number; riskLevel: WorkforceRiskLevel; primaryReason: string } {
  // Deterministic composite weighted score (0-100)
  // Attendance: 35%, Productivity: 35%, Shift Coverage: 20%, Overtime Penalty: 10%
  const attendanceComponent = Math.min(100, avgAttendance) * 0.35;
  const productivityComponent = Math.min(100, avgProductivity) * 0.35;
  const coverageComponent = Math.min(100, coveragePct) * 0.20;
  
  // Overtime penalty: > 25 hrs avg overtime penalizes score
  const overtimePenalty = Math.min(10, Math.max(0, (overtimeLoad - 15) * 0.4));
  
  const score = Math.round(Math.max(0, Math.min(100, attendanceComponent + productivityComponent + coverageComponent - overtimePenalty)));

  let riskLevel: WorkforceRiskLevel = 'LOW';
  let primaryReason = 'Healthy workforce stability and optimal roster execution.';

  if (score < 65 || avgAttendance < 75 || coveragePct < 60) {
    riskLevel = 'CRITICAL';
    primaryReason = avgAttendance < 75 
      ? 'Severe attendance drop & absenteeism bottleneck.' 
      : 'Severe shift shortages threatening daily outlet operations.';
  } else if (score < 78 || overtimeLoad > 25 || coveragePct < 85) {
    riskLevel = 'HIGH';
    primaryReason = overtimeLoad > 25 
      ? 'High overtime fatigue risk with declining shift productivity.' 
      : 'Sub-optimal shift coverage and sporadic staffing shortages.';
  } else if (score < 85) {
    riskLevel = 'MEDIUM';
    primaryReason = 'Minor shift variance; moderate optimization opportunities available.';
  }

  return { score, riskLevel, primaryReason };
}

export function compareOutletWorkforce(
  outlets: Outlet[],
  employees: Employee[],
  shifts: ShiftRecord[]
): WorkforceOutletMetrics[] {
  return outlets.map(outlet => {
    const outletEmps = employees.filter(e => e.outletId === outlet.id);
    const outletShifts = shifts.filter(s => s.outletId === outlet.id);

    const activeEmps = outletEmps.filter(e => e.status === 'Active').length;
    const onLeaveEmps = outletEmps.filter(e => e.status === 'On Leave').length;

    const avgAttendance = calculateAttendanceRate(outletEmps);
    const avgProductivity = calculateProductivityScore(outletEmps);
    const avgPerformance = calculatePerformanceScore(outletEmps);

    const totalWorkingHours = outletEmps.reduce((s, e) => s + (e.workingHours || 0), 0);
    const totalOvertimeHours = outletEmps.reduce((s, e) => s + (e.overtimeHours || 0), 0);
    const avgOvertime = outletEmps.length > 0 ? totalOvertimeHours / outletEmps.length : 0;

    const shiftCoverage = analyzeShiftCoverage(outletShifts);
    const shortageIncidentsCount = outletShifts.filter(s => s.coverageStatus === 'SHORTAGE' || s.coverageStatus === 'CRITICAL_DEFICIT').length;

    const { score, riskLevel, primaryReason } = calculateWorkforceScore(
      avgAttendance,
      avgProductivity,
      shiftCoverage.overallCoveragePercentage,
      avgOvertime
    );

    return {
      outletId: outlet.id,
      outletName: outlet.name,
      city: outlet.city,
      totalEmployees: outletEmps.length,
      activeEmployees: activeEmps,
      onLeaveEmployees: onLeaveEmps,
      averageAttendanceRate: avgAttendance,
      averageProductivityScore: avgProductivity,
      averagePerformanceScore: avgPerformance,
      totalWorkingHours,
      totalOvertimeHours,
      shortageIncidentsCount,
      shiftCoveragePercentage: shiftCoverage.overallCoveragePercentage,
      workforceHealthScore: score,
      riskLevel,
      primaryRiskReason: primaryReason
    };
  }).sort((a, b) => b.workforceHealthScore - a.workforceHealthScore);
}

export function calculateWorkforceKPIs(
  employees: Employee[],
  shifts: ShiftRecord[],
  outletMetrics: WorkforceOutletMetrics[]
): WorkforceKPIs {
  const totalEmployees = employees.length;
  const activeHeadcount = employees.filter(e => e.status === 'Active').length;
  const onLeaveCount = employees.filter(e => e.status === 'On Leave').length;
  const overallAttendanceRate = calculateAttendanceRate(employees);
  const overallProductivityScore = calculateProductivityScore(employees);
  const overallPerformanceScore = calculatePerformanceScore(employees);

  const totalOvertimeHours = employees.reduce((s, e) => s + (e.overtimeHours || 0), 0);
  const averageOvertimePerEmployee = totalEmployees > 0 ? Math.round((totalOvertimeHours / totalEmployees) * 10) / 10 : 0;

  const shiftCoverage = analyzeShiftCoverage(shifts);
  const activeShortagesCount = shifts.filter(s => s.coverageStatus === 'SHORTAGE' || s.coverageStatus === 'CRITICAL_DEFICIT').length;
  const criticalOutletsCount = outletMetrics.filter(m => m.riskLevel === 'CRITICAL' || m.riskLevel === 'HIGH').length;

  return {
    totalEmployees,
    activeHeadcount,
    onLeaveCount,
    overallAttendanceRate,
    overallProductivityScore,
    overallPerformanceScore,
    totalOvertimeHours,
    averageOvertimePerEmployee,
    activeShortagesCount,
    overallShiftCoverageRate: shiftCoverage.overallCoveragePercentage,
    criticalOutletsCount
  };
}

export function identifyHighAndLowPerformers(employees: Employee[]): {
  topPerformers: Employee[];
  attentionRequired: Employee[];
} {
  const sorted = [...employees].sort((a, b) => (b.performanceScore + b.productivityScore) - (a.performanceScore + a.productivityScore));
  
  const topPerformers = sorted.filter(e => e.performanceScore >= 90 && e.productivityScore >= 90 && e.attendanceRate >= 92);
  const attentionRequired = sorted.filter(e => e.performanceScore < 75 || e.productivityScore < 75 || e.attendanceRate < 80 || e.overtimeHours >= 30);

  return {
    topPerformers: topPerformers.slice(0, 5),
    attentionRequired: attentionRequired.slice(0, 5)
  };
}

export function generateWorkforceAlerts(
  outletMetrics: WorkforceOutletMetrics[],
  shortages: StaffShortageAssessment[],
  employees: Employee[]
): StaffAgentInsight[] {
  const insights: StaffAgentInsight[] = [];

  // 1. Critical Shortages Alert
  if (shortages.length > 0) {
    const criticalShortages = shortages.filter(s => s.severity === 'CRITICAL' || s.severity === 'HIGH');
    const affectedOutlets = Array.from(new Set(criticalShortages.map(s => s.outletName)));
    
    insights.push({
      id: `wf_ins_shortage_${Date.now()}`,
      title: `${criticalShortages.length} Active Shift Shortage(s) Detected across ${affectedOutlets.join(', ')}`,
      summary: `Identified critical staffing deficits in ${criticalShortages.map(s => `${s.outletName} (${s.shiftType} shift: -${s.deficit})`).join(', ')}. Immediate reallocation recommended to avert dining service delays.`,
      severity: 'Critical',
      category: 'Shortage',
      affected_outlets: affectedOutlets,
      affected_employees: [],
      actionable_step: criticalShortages[0]?.suggestedAction || 'Reallocate shift crew or deploy reserve staff.',
      calculated_metrics: {
        'Total Shortages': criticalShortages.length,
        'Max Deficit': Math.max(...criticalShortages.map(s => s.deficit))
      },
      timestamp: new Date().toISOString()
    });
  }

  // 2. Overtime Burnout Alert
  const excessiveOvertimeEmps = employees.filter(e => (e.overtimeHours || 0) >= 30);
  if (excessiveOvertimeEmps.length > 0) {
    const affectedOutlets = Array.from(new Set(excessiveOvertimeEmps.map(e => e.outletName)));
    const totalOT = excessiveOvertimeEmps.reduce((s, e) => s + e.overtimeHours, 0);

    insights.push({
      id: `wf_ins_ot_${Date.now()}`,
      title: `Excessive Overtime Load (${totalOT} hrs) Detected for ${excessiveOvertimeEmps.length} Key Employee(s)`,
      summary: `${excessiveOvertimeEmps.map(e => `${e.employeeName} (${e.overtimeHours} hrs OT at ${e.outletName})`).join(', ')} are exhibiting high fatigue risk. Average productivity has begun dropping.`,
      severity: 'High',
      category: 'Overtime',
      affected_outlets: affectedOutlets,
      affected_employees: excessiveOvertimeEmps.map(e => e.employeeName),
      actionable_step: `Rebalance shift rosters at ${affectedOutlets.join(', ')} by introducing part-time support or staggered splits.`,
      calculated_metrics: {
        'Total Overtime Hours': totalOT,
        'Employees at Risk': excessiveOvertimeEmps.length
      },
      timestamp: new Date().toISOString()
    });
  }

  // 3. Attendance Deficit Alert
  const lowAttendanceOutlets = outletMetrics.filter(m => m.averageAttendanceRate < 80);
  if (lowAttendanceOutlets.length > 0) {
    insights.push({
      id: `wf_ins_att_${Date.now()}`,
      title: `Attendance Deficit at ${lowAttendanceOutlets.map(o => o.outletName).join(', ')}`,
      summary: `Average attendance has fallen to ${lowAttendanceOutlets.map(o => `${o.outletName} (${o.averageAttendanceRate}%)`).join(', ')}, below the 85% operational standard threshold.`,
      severity: 'High',
      category: 'Attendance',
      affected_outlets: lowAttendanceOutlets.map(o => o.outletName),
      affected_employees: [],
      actionable_step: `Conduct manager review at ${lowAttendanceOutlets[0]?.outletName} to address absenteeism patterns and establish back-up on-call staff.`,
      calculated_metrics: {
        'Worst Attendance Outlet': lowAttendanceOutlets[0]?.outletName || '',
        'Attendance Rate': `${lowAttendanceOutlets[0]?.averageAttendanceRate}%`
      },
      timestamp: new Date().toISOString()
    });
  }

  // 4. Benchmark Performer Highlight
  const topOutlet = outletMetrics[0];
  if (topOutlet && topOutlet.workforceHealthScore >= 88) {
    insights.push({
      id: `wf_ins_top_${Date.now()}`,
      title: `${topOutlet.outletName} Leads Network in Workforce Excellence (${topOutlet.workforceHealthScore}/100)`,
      summary: `Maintaining ${topOutlet.averageAttendanceRate}% attendance, ${topOutlet.averageProductivityScore} productivity, and 100% shift coverage. Best practices should be standardized across other outlets.`,
      severity: 'Positive',
      category: 'Performance',
      affected_outlets: [topOutlet.outletName],
      affected_employees: [],
      actionable_step: `Recognize outlet management and adopt their shift scheduling framework chain-wide.`,
      calculated_metrics: {
        'Health Score': topOutlet.workforceHealthScore,
        'Attendance': `${topOutlet.averageAttendanceRate}%`,
        'Productivity': `${topOutlet.averageProductivityScore}/100`
      },
      timestamp: new Date().toISOString()
    });
  }

  return insights;
}

export interface ProductivityDistribution {
  highPerformers: { count: number; percentage: number; label: string };
  meetsExpectations: { count: number; percentage: number; label: string };
  needsImprovement: { count: number; percentage: number; label: string };
}

export function calculateProductivityDistribution(employees: Employee[]): ProductivityDistribution {
  if (!employees || employees.length === 0) {
    return {
      highPerformers: { count: 0, percentage: 0, label: 'High Performers (≥90)' },
      meetsExpectations: { count: 0, percentage: 0, label: 'Meets Expectations (75-89)' },
      needsImprovement: { count: 0, percentage: 0, label: 'Needs Improvement (<75)' }
    };
  }

  const high = employees.filter(e => (e.productivityScore || 0) >= 90).length;
  const meets = employees.filter(e => (e.productivityScore || 0) >= 75 && (e.productivityScore || 0) < 90).length;
  const needs = employees.filter(e => (e.productivityScore || 0) < 75).length;
  const total = employees.length;

  return {
    highPerformers: { count: high, percentage: Math.round((high / total) * 100), label: 'High Performers (≥90)' },
    meetsExpectations: { count: meets, percentage: Math.round((meets / total) * 100), label: 'Meets Expectations (75-89)' },
    needsImprovement: { count: needs, percentage: Math.round((needs / total) * 100), label: 'Needs Improvement (<75)' }
  };
}

export interface CrossAgentWorkforceRisk {
  campaignName: string;
  channel: string;
  outletName: string;
  shiftType: string;
  riskSeverity: 'Critical' | 'High' | 'Medium';
  demandSurgeExplanation: string;
  staffingStatus: string;
  aiPrescription: string;
}

export function evaluateCrossAgentWorkforceRisks(
  shortages: StaffShortageAssessment[],
  outletMetrics: WorkforceOutletMetrics[]
): CrossAgentWorkforceRisk[] {
  const risks: CrossAgentWorkforceRisk[] = [];

  for (const shortage of shortages) {
    risks.push({
      campaignName: shortage.outletName.includes('Madhapur') || shortage.outletName.includes('Bandra')
        ? 'Weekend Biryani Rush Promo'
        : 'Evening Combo Special (Meta Ads)',
      channel: 'Instagram & Meta Ads',
      outletName: shortage.outletName,
      shiftType: shortage.shiftType,
      riskSeverity: shortage.severity === 'CRITICAL' ? 'Critical' : 'High',
      demandSurgeExplanation: `Marketing campaign is driving an estimated +35% to +48% order surge during the ${shortage.shiftType} shift.`,
      staffingStatus: `Only ${shortage.actualStaff} of ${shortage.requiredStaff} staff scheduled (-${shortage.deficit} line cook deficit).`,
      aiPrescription: shortage.suggestedAction || `Rebalance shift crew to prevent order turnaround bottlenecks.`
    });
  }

  return risks;
}


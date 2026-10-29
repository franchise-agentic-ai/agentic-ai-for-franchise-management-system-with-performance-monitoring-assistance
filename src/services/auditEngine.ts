import { AuditRecord } from '../types';
import { getTenantAudits, saveTenantAudits, getTenantOutlets, logTenantActivity } from './tenantService';

export interface AuditOverviewMetrics {
  networkComplianceScore: number;
  totalAuditsCount: number;
  openIssuesCount: number;
  overdueActionsCount: number;
  criticalViolationsCount: number;
  resolvedActionsCount: number;
  complianceByCategory: { category: string; score: number; total: number }[];
  complianceByOutlet: { outletId: string; outletName: string; score: number; status: string; openCount: number }[];
}

export interface AuditReport {
  generatedAt: string;
  businessId: string;
  period: string;
  overallScore: number;
  summaryText: string;
  highRiskOutletsCount: number;
  openCorrectiveActionsCount: number;
  topViolationCategory: string;
  outletBreakdown: { outletName: string; score: number; severity: string; openIssues: number }[];
  keyRecommendations: string[];
}

export interface AIAuditInsight {
  id: string;
  title: string;
  finding: string;
  evidence: string[];
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  outletId: string;
  outletName: string;
  category: string;
  recommendation: string;
  impact: string;
}

/**
 * Calculates overall network compliance score (0-100)
 */
export function calculateNetworkAuditScore(businessId: string): number {
  const audits = getTenantAudits(businessId);
  if (!audits || audits.length === 0) return 100;
  const total = audits.reduce((sum, a) => sum + a.compliance_score, 0);
  return Math.round(total / audits.length);
}

/**
 * Get comprehensive audit overview metrics
 */
export function getAuditOverview(businessId: string): AuditOverviewMetrics {
  const audits = getTenantAudits(businessId);
  const outlets = getTenantOutlets(businessId);

  const totalAuditsCount = audits.length;
  const networkComplianceScore = calculateNetworkAuditScore(businessId);
  
  const openIssuesCount = audits.filter(a => a.resolution_status === 'Open' || a.resolution_status === 'In Progress').length;
  const overdueActionsCount = audits.filter(a => a.resolution_status === 'Open' && isOverdue(a.audit_date)).length;
  const criticalViolationsCount = audits.filter(a => a.severity === 'Critical' || a.severity === 'High').length;
  const resolvedActionsCount = audits.filter(a => a.resolution_status === 'Resolved').length;

  // Compliance by Category
  const categories: AuditRecord['category'][] = ['Food Safety', 'SOP & Cleanliness', 'Cash & POS', 'Service Speed', 'Branding'];
  const complianceByCategory = categories.map(cat => {
    const catAudits = audits.filter(a => a.category === cat);
    const avgScore = catAudits.length > 0 
      ? Math.round(catAudits.reduce((s, a) => s + a.compliance_score, 0) / catAudits.length) 
      : 100;
    return {
      category: cat,
      score: avgScore,
      total: catAudits.length,
    };
  });

  // Compliance by Outlet
  const complianceByOutlet = outlets.map(out => {
    const outAudits = audits.filter(a => a.outlet_id === out.id);
    const avgScore = outAudits.length > 0 
      ? Math.round(outAudits.reduce((s, a) => s + a.compliance_score, 0) / outAudits.length) 
      : 100;
    const openCount = outAudits.filter(a => a.resolution_status === 'Open' || a.resolution_status === 'In Progress').length;
    
    let status = 'Excellent';
    if (avgScore < 70 || openCount >= 3) status = 'Critical';
    else if (avgScore < 85 || openCount > 0) status = 'Warning';
    
    return {
      outletId: out.id,
      outletName: out.name,
      score: avgScore,
      status,
      openCount
    };
  });

  return {
    networkComplianceScore,
    totalAuditsCount,
    openIssuesCount,
    overdueActionsCount,
    criticalViolationsCount,
    resolvedActionsCount,
    complianceByCategory,
    complianceByOutlet
  };
}

/**
 * Checks if audit finding is overdue (> 7 days without resolution)
 */
function isOverdue(auditDateStr: string): boolean {
  try {
    const auditDate = new Date(auditDateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - auditDate.getTime()) / (1000 * 3600 * 24));
    return diffDays > 7;
  } catch {
    return false;
  }
}

/**
 * Identifies high-risk outlets based on audit scores and repeated violations
 */
export function getHighRiskAuditOutlets(businessId: string) {
  const audits = getTenantAudits(businessId);
  const outlets = getTenantOutlets(businessId);

  return outlets.map(outlet => {
    const outletAudits = audits.filter(a => a.outlet_id === outlet.id);
    const score = outletAudits.length > 0 
      ? Math.round(outletAudits.reduce((s, a) => s + a.compliance_score, 0) / outletAudits.length)
      : 100;
    const criticalCount = outletAudits.filter(a => a.severity === 'Critical' || a.severity === 'High').length;
    const openCount = outletAudits.filter(a => a.resolution_status === 'Open' || a.resolution_status === 'In Progress').length;
    const overdueCount = outletAudits.filter(a => a.resolution_status === 'Open' && isOverdue(a.audit_date)).length;

    let riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
    if (score < 70 || criticalCount >= 2 || overdueCount > 0) riskLevel = 'Critical';
    else if (score < 82 || openCount >= 2) riskLevel = 'High';
    else if (score < 90) riskLevel = 'Medium';

    return {
      outletId: outlet.id,
      outletName: outlet.name,
      location: outlet.location,
      city: outlet.city,
      score,
      criticalCount,
      openCount,
      overdueCount,
      riskLevel,
      lastAuditDate: outletAudits[0]?.audit_date || new Date().toISOString().split('T')[0]
    };
  }).sort((a, b) => a.score - b.score);
}

/**
 * Updates corrective action status for an audit record
 */
export function updateAuditStatus(
  businessId: string, 
  auditId: string, 
  newStatus: AuditRecord['resolution_status']
): AuditRecord[] {
  const audits = getTenantAudits(businessId);
  const updated = audits.map(a => a.id === auditId ? { ...a, resolution_status: newStatus } : a);
  saveTenantAudits(businessId, updated);
  
  const target = audits.find(a => a.id === auditId);
  logTenantActivity(
    businessId, 
    'Audit Agent', 
    `Updated corrective action status to '${newStatus}' for ${target?.outlet_name || 'outlet'} (${target?.category})`
  );
  return updated;
}

/**
 * Generates AI Audit Insights dynamically from actual audit dataset
 */
export function generateAIAuditInsights(businessId: string): AIAuditInsight[] {
  const audits = getTenantAudits(businessId);
  const insights: AIAuditInsight[] = [];

  // Group by category to find recurring patterns
  const categoryGroups: Record<string, AuditRecord[]> = {};
  audits.forEach(a => {
    if (!categoryGroups[a.category]) categoryGroups[a.category] = [];
    categoryGroups[a.category].push(a);
  });

  // 1. Identify low scoring categories
  Object.entries(categoryGroups).forEach(([cat, recs]) => {
    const avgScore = Math.round(recs.reduce((s, r) => s + r.compliance_score, 0) / recs.length);
    if (avgScore < 80) {
      insights.push({
        id: `ai_ins_cat_${cat}_${Date.now()}`,
        title: `Systemic ${cat} Standard Deficit`,
        finding: `${cat} compliance averages ${avgScore}% across ${recs.length} audit evaluation rounds.`,
        evidence: recs.map(r => `${r.outlet_name || 'Outlet'}: ${r.issue} (Score: ${r.compliance_score}%)`),
        severity: avgScore < 70 ? 'Critical' : 'High',
        outletId: recs[0]?.outlet_id || '',
        outletName: recs.length === 1 ? recs[0]?.outlet_name || 'Network' : `${recs.length} Network Outlets`,
        category: cat,
        recommendation: `Mandate mandatory retraining on ${cat} SOP guidelines and deploy surprise weekly audit checks.`,
        impact: `Mitigates potential health inspection fines and brand reputation loss.`
      });
    }
  });

  // 2. Identify critical issues requiring immediate intervention
  audits.filter(a => a.severity === 'Critical' || a.resolution_status === 'Open').forEach(a => {
    insights.push({
      id: `ai_ins_rec_${a.id}`,
      title: `Unresolved ${a.severity} Compliance Issue at ${a.outlet_name}`,
      finding: `${a.issue} remains in '${a.resolution_status}' state since ${a.audit_date}.`,
      evidence: [
        `Compliance Score: ${a.compliance_score}%`,
        `Assigned Manager: ${a.responsible_person}`,
        `Corrective Action: ${a.corrective_action}`
      ],
      severity: a.severity,
      outletId: a.outlet_id,
      outletName: a.outlet_name,
      category: a.category,
      recommendation: `Escalate to Franchise Operations Lead and enforce target resolution by ${a.responsible_person}.`,
      impact: `Prevents operational escalation and customer service quality decay.`
    });
  });

  return insights;
}

/**
 * Generates an executive audit report
 */
export function generateAuditReport(businessId: string): AuditReport {
  const overview = getAuditOverview(businessId);
  const audits = getTenantAudits(businessId);
  const highRisk = getHighRiskAuditOutlets(businessId);

  const topCategory = [...overview.complianceByCategory].sort((a, b) => a.score - b.score)[0]?.category || 'SOP & Cleanliness';

  return {
    generatedAt: new Date().toISOString(),
    businessId,
    period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    overallScore: overview.networkComplianceScore,
    summaryText: `The franchise network maintains an overall compliance score of ${overview.networkComplianceScore}% across ${overview.totalAuditsCount} evaluations. ${overview.openIssuesCount} corrective action(s) remain open, with ${overview.criticalViolationsCount} high-severity items requiring management review.`,
    highRiskOutletsCount: highRisk.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High').length,
    openCorrectiveActionsCount: overview.openIssuesCount,
    topViolationCategory: topCategory,
    outletBreakdown: overview.complianceByOutlet.map(o => ({
      outletName: o.outletName,
      score: o.score,
      severity: o.status,
      openIssues: o.openCount
    })),
    keyRecommendations: [
      `Enforce rapid resolution of open corrective actions at ${highRisk[0]?.outletName || 'trailing outlets'}.`,
      `Focus training programs on ${topCategory} standard compliance.`,
      `Implement automated daily SOP checklist verification before opening shifts.`
    ]
  };
}

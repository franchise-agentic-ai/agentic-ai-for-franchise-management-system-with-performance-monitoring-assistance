import { AuditRecord } from '../types';
import { 
  getAuditOverview, 
  getHighRiskAuditOutlets, 
  generateAIAuditInsights, 
  generateAuditReport,
  updateAuditStatus,
  AuditOverviewMetrics,
  AIAuditInsight,
  AuditReport
} from './auditEngine';
import { getTenantAudits, addTenantAudit, logTenantActivity } from './tenantService';

export interface AuditAgentScanResult {
  agentName: string;
  status: string;
  businessId: string;
  scanTime: string;
  overview: AuditOverviewMetrics;
  highRiskOutlets: ReturnType<typeof getHighRiskAuditOutlets>;
  aiInsights: AIAuditInsight[];
  openViolations: AuditRecord[];
  recommendationSummary: string;
}

/**
 * Main Audit Agent Scan runner
 * Scans operational compliance, validates standards, detects policy violations, and produces actionable findings.
 */
export function runAuditAgentScan(businessId: string): AuditAgentScanResult {
  const overview = getAuditOverview(businessId);
  const highRisk = getHighRiskAuditOutlets(businessId);
  const insights = generateAIAuditInsights(businessId);
  const audits = getTenantAudits(businessId);
  const openViolations = audits.filter(a => a.resolution_status === 'Open' || a.resolution_status === 'In Progress');

  logTenantActivity(
    businessId, 
    'Audit Agent', 
    `Executed operational compliance scan. (Network Compliance: ${overview.networkComplianceScore}%, ${openViolations.length} open issues)`
  );

  return {
    agentName: 'Audit Agent',
    status: 'Completed',
    businessId,
    scanTime: new Date().toISOString(),
    overview,
    highRiskOutlets: highRisk,
    aiInsights: insights,
    openViolations,
    recommendationSummary: highRisk.length > 0 
      ? `Priority intervention required at ${highRisk[0].outletName} (Compliance: ${highRisk[0].score}%).`
      : `All outlets maintain operational compliance above 85%.`
  };
}

export {
  getAuditOverview,
  getHighRiskAuditOutlets,
  generateAIAuditInsights,
  generateAuditReport,
  updateAuditStatus
};

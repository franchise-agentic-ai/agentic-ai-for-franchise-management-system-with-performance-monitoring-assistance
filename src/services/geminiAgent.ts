import { OutletBenchmarking, RevenueTrendAnalysis, UnderperformanceDetection } from '../types';
import { runBusinessAgentOrchestrator } from './businessAgentOrchestrator';
import { getActiveBusiness } from './tenantService';

/**
 * Gemini AI Agent integration for FranchiseOps Outlet Performance Agent.
 * Upgraded to use the unified Business-Aware Agent Orchestrator with cross-domain correlation.
 */

export interface AgentDiagnosticResult {
  answer: string;
  relatedOutlets: string[];
  keyMetrics: string[];
  isAiGenerated: boolean;
  toolsCalled?: string[];
  reasoningSteps?: string[];
}

/**
 * Ask the Outlet Performance Agent a natural language question about franchise operations.
 * Executes live multi-tool data retrieval, cross-domain reasoning, and dynamic calculations.
 */
export async function queryOutletPerformanceAgent(
  question: string,
  _context?: {
    benchmarking: OutletBenchmarking[];
    revenueTrends: RevenueTrendAnalysis | null;
    underperforming: UnderperformanceDetection[];
  }
): Promise<AgentDiagnosticResult> {
  const business = getActiveBusiness();
  const res = await runBusinessAgentOrchestrator(question, business.id, { currentPage: 'outlet-performance' });

  return {
    answer: res.answer,
    relatedOutlets: res.related_outlets,
    keyMetrics: res.key_metrics,
    isAiGenerated: res.isAiGenerated,
    toolsCalled: res.tools_called,
    reasoningSteps: res.reasoning_steps,
  };
}

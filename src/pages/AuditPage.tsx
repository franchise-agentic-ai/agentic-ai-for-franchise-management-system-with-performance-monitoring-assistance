import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  ChevronRight, 
  Sparkles, 
  RefreshCw, 
  Building2, 
  User, 
  Calendar, 
  Award, 
  TrendingDown, 
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { getActiveBusiness, getTenantAudits, getTenantOutlets, addTenantAudit } from '../services/tenantService';
import { 
  getAuditOverview, 
  getHighRiskAuditOutlets, 
  generateAIAuditInsights, 
  generateAuditReport, 
  updateAuditStatus,
  AuditOverviewMetrics,
  AIAuditInsight,
  AuditReport
} from '../services/auditEngine';
import { AuditRecord, BusinessProfile } from '../types';

export function AuditPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [overview, setOverview] = useState<AuditOverviewMetrics | null>(null);
  const [highRiskOutlets, setHighRiskOutlets] = useState<ReturnType<typeof getHighRiskAuditOutlets>>([]);
  const [aiInsights, setAiInsights] = useState<AIAuditInsight[]>([]);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add new audit form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newOutletId, setNewOutletId] = useState('');
  const [newCategory, setNewCategory] = useState<AuditRecord['category']>('Food Safety');
  const [newScore, setNewScore] = useState(85);
  const [newIssue, setNewIssue] = useState('');
  const [newSeverity, setNewSeverity] = useState<AuditRecord['severity']>('Medium');
  const [newAction, setNewAction] = useState('');
  const [newPerson, setNewPerson] = useState('');

  const refreshData = () => {
    const biz = getActiveBusiness();
    setBusiness(biz);
    const auditData = getTenantAudits(biz.id);
    setAudits(auditData);
    setOverview(getAuditOverview(biz.id));
    setHighRiskOutlets(getHighRiskAuditOutlets(biz.id));
    setAiInsights(generateAIAuditInsights(biz.id));
    setAuditReport(generateAuditReport(biz.id));
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('franchiseops_tenant_changed', refreshData);
    return () => window.removeEventListener('franchiseops_tenant_changed', refreshData);
  }, []);

  const handleStatusChange = (auditId: string, newStatus: AuditRecord['resolution_status']) => {
    updateAuditStatus(business.id, auditId, newStatus);
    refreshData();
  };

  const handleCreateAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const outlets = getTenantOutlets(business.id);
    const selectedOutlet = outlets.find(o => o.id === newOutletId) || outlets[0];
    if (!selectedOutlet) return;

    addTenantAudit(business.id, {
      outlet_id: selectedOutlet.id,
      outlet_name: selectedOutlet.name,
      audit_date: new Date().toISOString().split('T')[0],
      category: newCategory,
      compliance_score: newScore,
      issue: newIssue || 'Routine compliance inspection finding.',
      severity: newSeverity,
      corrective_action: newAction || 'Perform standard operating procedure verification.',
      responsible_person: newPerson || 'Store Manager',
      resolution_status: 'Open'
    });

    setIsAddModalOpen(false);
    setNewIssue('');
    setNewAction('');
    setNewPerson('');
    refreshData();
  };

  const filteredAudits = audits.filter(a => {
    if (categoryFilter !== 'All' && a.category !== categoryFilter) return false;
    if (severityFilter !== 'All' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'All' && a.resolution_status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.outlet_name.toLowerCase().includes(q) || a.issue.toLowerCase().includes(q) || a.responsible_person.toLowerCase().includes(q);
    }
    return true;
  });

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'High': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Medium': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'In Progress': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Escalated': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default: return 'bg-amber-500/20 text-amber-300 border-amber-500/30'; // Open
    }
  };

  const tabs = [
    { id: 'overview', label: 'Audit Overview', icon: ShieldCheck },
    { id: 'records', label: 'Audit Records', icon: FileText, count: audits.length },
    { id: 'compliance', label: 'Compliance Monitoring', icon: Award },
    { id: 'violations', label: 'Violations & Risk', icon: AlertTriangle, count: overview?.criticalViolationsCount },
    { id: 'actions', label: 'Corrective Actions', icon: CheckCircle2, count: overview?.openIssuesCount },
    { id: 'reports', label: 'Audit Reports', icon: FileText },
    { id: 'ai-insights', label: 'AI Audit Insights', icon: Sparkles, badge: 'AI', count: aiInsights.length },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              OPERATIONAL COMPLIANCE
            </span>
            <span className="text-xs text-slate-400">• Multi-Outlet Inspection Suite</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-400 shrink-0" />
            Audit Agent & Compliance Center
          </h1>
          <p className="text-sm text-slate-400">
            Autonomous operational compliance monitoring, standard validation, violation tracking, and corrective action workflows for <span className="text-white font-semibold">{business.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Audit Finding
          </button>
          <button
            onClick={refreshData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Refresh Audit Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500/50'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  isActive ? 'bg-indigo-900/80 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-indigo-400 text-slate-950 uppercase">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-8">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Network Compliance Score</span>
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{overview.networkComplianceScore}%</span>
                <span className={`text-xs font-bold ${overview.networkComplianceScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {overview.networkComplianceScore >= 85 ? 'Target Exceeded' : 'Pacing Low'}
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Weighted average across {overview.totalAuditsCount} audit evaluation rounds</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Action Items</span>
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{overview.openIssuesCount}</span>
                <span className="text-xs font-semibold text-slate-400">Issues pending</span>
              </div>
              <p className="mt-2 text-[11px] text-amber-400 font-medium">
                {overview.overdueActionsCount > 0 ? `⚠️ ${overview.overdueActionsCount} corrective action(s) overdue` : 'No overdue actions'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Violations</span>
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{overview.criticalViolationsCount}</span>
                <span className="text-xs font-semibold text-rose-400">High severity</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Requires mandatory 48-hr corrective review</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved Corrective Actions</span>
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">{overview.resolvedActionsCount}</span>
                <span className="text-xs font-semibold text-emerald-400">Completed</span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Verified by Audit Agent resolution tracking</p>
            </div>
          </div>

          {/* High Risk Outlets & Compliance by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* High-Risk Outlets Radar */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    High-Risk Outlet Intervention Radar
                  </h3>
                  <p className="text-xs text-slate-400">Outlets flagged for low audit scores, open violations, or overdue corrective actions</p>
                </div>
                <button 
                  onClick={() => setSearchParams({ tab: 'violations' })}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  View Violations <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {highRiskOutlets.map((outlet) => (
                  <div key={outlet.outletId} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                        outlet.riskLevel === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                        outlet.riskLevel === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {outlet.score}%
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {outlet.outletName}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            outlet.riskLevel === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                            outlet.riskLevel === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                            'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          }`}>
                            {outlet.riskLevel} Risk
                          </span>
                        </h4>
                        <span className="text-xs text-slate-400">{outlet.location} ({outlet.city}) • {outlet.openCount} open issue(s)</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-300 block">Last Audit</span>
                      <span className="text-[11px] text-slate-500">{outlet.lastAuditDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance by Category Breakdown */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  Compliance by Category
                </h3>
                <p className="text-xs text-slate-400">Performance score by operational SOP pillar</p>
              </div>

              <div className="space-y-4">
                {overview.complianceByCategory.map((cat) => (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{cat.category}</span>
                      <span className={cat.score >= 85 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {cat.score}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          cat.score >= 85 ? 'bg-emerald-500' : cat.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Records Tab */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit records by outlet, issue, or manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Categories</option>
                <option value="Food Safety">Food Safety</option>
                <option value="SOP & Cleanliness">SOP & Cleanliness</option>
                <option value="Cash & POS">Cash & POS</option>
                <option value="Service Speed">Service Speed</option>
                <option value="Branding">Branding</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Outlet & Date</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Compliance Score</th>
                    <th className="p-4">Finding & Issue</th>
                    <th className="p-4">Severity</th>
                    <th className="p-4">Assigned Person</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAudits.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-semibold text-white">
                        <div className="font-bold">{record.outlet_name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" /> {record.audit_date}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-300">
                        <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[11px]">
                          {record.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`font-black text-sm ${
                          record.compliance_score >= 85 ? 'text-emerald-400' : record.compliance_score >= 70 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {record.compliance_score}%
                        </span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="font-semibold text-white truncate" title={record.issue}>{record.issue}</div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5" title={record.corrective_action}>
                          Action: {record.corrective_action}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getSeverityBadgeClass(record.severity)}`}>
                          {record.severity}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">
                        <div className="flex items-center gap-1.5 font-medium">
                          <User className="w-3 h-3 text-slate-500" /> {record.responsible_person}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getStatusBadgeClass(record.resolution_status)}`}>
                          {record.resolution_status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={record.resolution_status}
                          onChange={(e) => handleStatusChange(record.id, e.target.value as any)}
                          className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="Open">Set Open</option>
                          <option value="In Progress">Set In Progress</option>
                          <option value="Resolved">Set Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Corrective Actions Tab */}
      {activeTab === 'actions' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              Corrective Actions & Resolution Tracking
            </h3>
            <p className="text-xs text-slate-400">Manage required operational fixes and assign responsible personnel</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {audits.map((a) => (
                <div key={a.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-400 uppercase">{a.category}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{a.outlet_name}</h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getStatusBadgeClass(a.resolution_status)}`}>
                      {a.resolution_status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{a.issue}</p>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Required Action</span>
                    <p className="text-slate-200 font-medium">{a.corrective_action}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>Assigned: <strong className="text-slate-200">{a.responsible_person}</strong></span>
                    <div className="flex items-center gap-2">
                      {a.resolution_status !== 'Resolved' && (
                        <button
                          onClick={() => handleStatusChange(a.id, 'Resolved')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded transition-all cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Audit Insights Tab */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>DYNAMIC AI AUDIT REASONING ENGINE</span>
            </div>
            <h2 className="text-xl font-bold text-white">Data-Driven Audit Insights & SOP Recommendations</h2>
            <p className="text-xs text-slate-400 max-w-3xl">
              These recommendations are dynamically computed from your active multi-outlet audit records, policy violation rates, and compliance trends.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiInsights.map((ins) => (
              <div key={ins.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{ins.category}</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadgeClass(ins.severity)}`}>
                    {ins.severity} Priority
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{ins.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{ins.finding}</p>

                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Observed Evidence</span>
                  <ul className="space-y-1">
                    {ins.evidence.map((ev, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/20 space-y-1.5">
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block">AI Prescriptive Action</span>
                  <p className="text-xs text-slate-200 font-medium">{ins.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Reports Tab */}
      {activeTab === 'reports' && auditReport && (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 max-w-4xl mx-auto shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">OFFICIAL EXECUTIVE AUDIT REPORT</span>
              <h2 className="text-2xl font-black text-white mt-1">{business.name} Compliance Executive Brief</h2>
              <span className="text-xs text-slate-400">Generated for {auditReport.period} • Network Uptime</span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-indigo-400">{auditReport.overallScore}%</span>
              <span className="text-xs text-slate-400 block font-semibold">Network Compliance</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Executive Summary</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{auditReport.summaryText}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Strategic Recommendations</h4>
            <div className="space-y-2">
              {auditReport.keyRecommendations.map((rec, i) => (
                <div key={i} className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-200 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    {i + 1}
                  </span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Audit Finding Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Record New Audit Finding</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateAudit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Outlet</label>
                <select
                  value={newOutletId}
                  onChange={(e) => setNewOutletId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  {getTenantOutlets(business.id).map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Food Safety">Food Safety</option>
                  <option value="SOP & Cleanliness">SOP & Cleanliness</option>
                  <option value="Cash & POS">Cash & POS</option>
                  <option value="Service Speed">Service Speed</option>
                  <option value="Branding">Branding</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Compliance Score ({newScore}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newScore}
                  onChange={(e) => setNewScore(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Issue / Finding</label>
                <input
                  type="text"
                  placeholder="Describe policy violation or operational issue..."
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Severity</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Corrective Action Required</label>
                <input
                  type="text"
                  placeholder="Required resolution steps..."
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Assigned Person</label>
                <input
                  type="text"
                  placeholder="Person responsible..."
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Finding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

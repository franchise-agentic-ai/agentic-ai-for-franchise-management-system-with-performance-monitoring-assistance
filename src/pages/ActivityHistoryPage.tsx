import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search, 
  Layers, 
  Upload, 
  Check 
} from 'lucide-react';
import { FranchiseOpsLogo } from '../components/brand/FranchiseOpsLogo';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { getActiveBusiness, getTenantActivityLogs } from '../services/tenantService';
import { AgentRunLog, BusinessProfile } from '../types';
import { cn } from '../lib/utils';

export function ActivityHistoryPage() {
  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [logs, setLogs] = useState<AgentRunLog[]>([]);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState('all');

  const loadData = () => {
    const biz = getActiveBusiness();
    setBusiness(biz);
    setLogs(getTenantActivityLogs(biz.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('franchiseops_tenant_changed', loadData);
    return () => window.removeEventListener('franchiseops_tenant_changed', loadData);
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (selectedAgentFilter === 'all') return true;
    return log.agent_name.toLowerCase().includes(selectedAgentFilter.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Agent Activity & Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
              {logs.length} Logged Runs
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Immutable operational activity log tracking data ingestion, agent execution runs, and human approval decisions for {business.name}.
          </p>
        </div>

        {/* Filter */}
        <select
          value={selectedAgentFilter}
          onChange={(e) => setSelectedAgentFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 shadow-2xs"
        >
          <option value="all">All Agents & Engines</option>
          <option value="Outlet Performance">Outlet Performance Agent</option>
          <option value="Inventory">Inventory Agent</option>
          <option value="Staff">Staff Agent</option>
          <option value="Marketing">Marketing Agent</option>
          <option value="Audit">Audit Agent</option>
          <option value="Franchise Intelligence">Franchise Intelligence Engine</option>
        </select>
      </div>

      {/* Activity Stream */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Chronological Agent Execution Log
          </CardTitle>
        </CardHeader>
        <div className="divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No agent activity logged for this filter.</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 p-1.5">
                    <FranchiseOpsLogo className="w-full h-full" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{log.task}</h4>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.summary}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400 font-medium">
                      <span>Agent: <strong className="text-indigo-600 font-semibold">{log.agent_name}</strong></span>
                      <span>•</span>
                      <span>Execution Time: {log.start_time}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                    {log.findings_count} Signal{log.findings_count !== 1 ? 's' : ''} Processed
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

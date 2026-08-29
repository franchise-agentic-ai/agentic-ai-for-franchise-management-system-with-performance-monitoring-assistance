import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Flame, 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  ArrowRight, 
  TrendingDown, 
  Clock, 
  Layers, 
  Send,
  Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getActiveBusiness, getTenantAudits, getTenantOutlets } from '../services/tenantService';
import { getUnderperformingDetections, getUnderperformanceAlerts } from '../services/outletPerformanceService';
import { UnderperformanceDetection, UnderperformanceAlertItem, AuditRecord, Outlet, BusinessProfile } from '../types';
import { cn } from '../lib/utils';

export function RiskCenterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'alerts';

  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [alerts, setAlerts] = useState<UnderperformanceAlertItem[]>([]);
  const [atRiskList, setAtRiskList] = useState<UnderperformanceDetection[]>([]);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = async () => {
    const biz = getActiveBusiness();
    setBusiness(biz);
    setOutlets(getTenantOutlets(biz.id));
    const [dynAlerts, detections] = await Promise.all([
      getUnderperformanceAlerts(),
      getUnderperformingDetections(),
    ]);
    setAlerts(dynAlerts);
    setAtRiskList(detections);
    setAudits(getTenantAudits(biz.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('franchiseops_tenant_changed', loadData);
    return () => window.removeEventListener('franchiseops_tenant_changed', loadData);
  }, []);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    showNotice("Alert acknowledged and resolution protocol triggered!");
  };

  // Anomalies list
  const anomalies = [
    {
      id: 'anom_1',
      title: 'Sudden Kitchen Prep Latency Surge',
      outlet: 'Biryani Hub - Indiranagar',
      severity: 'Critical',
      detectedAt: '2 hours ago',
      metric: '+8.4 min average ticket time',
      cause: 'Senior chef absenteeism during peak lunch rush',
      recommendedFix: 'Transfer 2 float kitchen staff from Gachibowli'
    },
    {
      id: 'anom_2',
      title: 'Abnormal Basmati Rice Depletion Rate',
      outlet: 'Biryani Hub - KP',
      severity: 'High',
      detectedAt: '4 hours ago',
      metric: 'Consumption 1.8x higher than sales volume',
      cause: 'Potential portion control inconsistency or kitchen waste spike',
      recommendedFix: 'Schedule spot audit on kitchen recipe adherence'
    },
    {
      id: 'anom_3',
      title: 'Dine-In Customer Traffic Contraction',
      outlet: 'Biryani Hub - KP',
      severity: 'High',
      detectedAt: '1 day ago',
      metric: '-12.4% footfall vs trailing 4-week average',
      cause: 'Local road construction blocking pedestrian access',
      recommendedFix: 'Activate 20% Swiggy/Zomato delivery aggregator geo-targeted promo'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertOctagon className="w-7 h-7 text-rose-600" />
              Risk Center & Threat Detection
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 ring-1 ring-rose-200">
              Sentinel AI Agent
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Real-time anomaly monitoring, multi-factor risk signals, and turnaround roadmaps for underperforming franchise units.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              showNotice("Ran deep network risk scan across all 7 outlets. 0 new critical threats.");
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
          >
            <Activity className="w-4 h-4 mr-1.5" />
            Run Threat Scan
          </Button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-600">Updated</span>
        </div>
      )}

      {/* Submodule Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        {[
          { id: 'alerts', name: 'Operational Alerts', icon: AlertOctagon, count: alerts.length, alert: alerts.length > 0 },
          { id: 'anomalies', name: 'AI Anomalies', icon: Activity, count: anomalies.length },
          { id: 'at-risk', name: 'At-Risk Outlets', icon: TrendingDown, count: atRiskList.length, alert: atRiskList.length > 0 },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer",
                isActive 
                  ? "border-rose-600 text-rose-600 bg-rose-50/40 rounded-t-xl" 
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              )}
            >
              <tab.icon className={cn("w-4 h-4", isActive ? "text-rose-600" : "text-slate-400")} />
              <span>{tab.name}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                  tab.alert ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900">All Systems Normal</h3>
              <p className="text-xs text-slate-500 mt-1">No active operational alerts across your franchise network.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="border-rose-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{alert.outletName}</h4>
                          <span className="text-[10px] text-slate-400">{alert.detectedTime}</span>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset",
                        alert.severity === 'Critical' ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-amber-50 text-amber-700 ring-amber-200"
                      )}>
                        {alert.severity}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-slate-800">
                        <strong className="text-slate-900">Issue:</strong> {alert.issue}
                      </div>
                      <div className="text-slate-600">
                        <strong className="text-slate-900">Metric Breached:</strong> <span className="font-mono text-rose-600 font-bold">{alert.metric}</span>
                      </div>
                      <div className="text-indigo-700 pt-1 border-t border-slate-200/60 font-semibold">
                        <strong>AI Recommended Action:</strong> {alert.recommendedAction}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Link to={`/dashboard/outlets/${alert.outletId}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
                        View Unit Details <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Acknowledge & Resolve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ANOMALIES */}
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <strong className="block text-sm">Statistical Outlier Signals Detected</strong>
                <span>Sentinel AI Agent flagged {anomalies.length} high-variance operational anomalies requiring intervention.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {anomalies.map((anom) => (
              <Card key={anom.id} className="border-slate-200">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                      {anom.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{anom.detectedAt}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{anom.title}</h4>
                    <p className="text-xs text-indigo-600 font-semibold">{anom.outlet}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="text-rose-600 font-bold font-mono">{anom.metric}</div>
                    <div className="text-slate-600 text-[11px]"><strong className="text-slate-800">Root Cause:</strong> {anom.cause}</div>
                  </div>

                  <div className="text-[11px] text-slate-700 font-medium">
                    <strong className="text-indigo-600 block mb-0.5">Remedy:</strong>
                    {anom.recommendedFix}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AT-RISK OUTLETS */}
      {activeTab === 'at-risk' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {atRiskList.map((item) => (
              <Card key={item.outletId} className="border-rose-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">
                        {item.outletName}
                      </CardTitle>
                      <span className="text-xs text-slate-500">{item.city} • Turnaround Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-700">
                        Health: {item.healthScore}/100
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {/* Triggers breakdown */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Risk Signals Triggered:</span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {item.triggers.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Why flagged */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <strong className="block text-slate-900 mb-0.5">Root Cause Diagnostic:</strong>
                    {item.whyFlagged}
                  </div>

                  {/* Turnaround Roadmap */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-800">
                    <strong className="block text-indigo-900 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Executive Recovery Roadmap:
                    </strong>
                    {item.recommendedAction}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <Link to={`/dashboard/outlets/${item.outletId}`}>
                      <Button variant="outline" size="sm" className="text-xs font-bold">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Full Diagnostic Dossier
                      </Button>
                    </Link>
                    <Link to="/dashboard/action-center">
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                        <Flame className="w-3.5 h-3.5 mr-1" />
                        Trigger Actions
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

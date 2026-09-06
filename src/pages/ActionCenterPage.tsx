import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  ShoppingCart, 
  Users, 
  Megaphone, 
  ClipboardCheck, 
  ArrowRight, 
  Clock, 
  Send, 
  Zap, 
  Check, 
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { FranchiseOpsLogo } from '../components/brand/FranchiseOpsLogo';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getActiveBusiness } from '../services/tenantService';
import { BusinessProfile } from '../types';
import { cn } from '../lib/utils';

interface ActionItem {
  id: string;
  title: string;
  agent: string;
  category: 'Inventory' | 'Staff' | 'Marketing' | 'Audit' | 'Finance';
  outlet: string;
  priority: 'Critical' | 'High' | 'Medium';
  impactDescription: string;
  estImpact: string;
  status: 'Pending' | 'In-Flight' | 'Executed';
}

export function ActionCenterPage() {
  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [actions, setActions] = useState<ActionItem[]>([
    {
      id: 'act_1',
      title: 'Dispatch Emergency Basmati Rice Restock (400kg)',
      agent: 'Inventory Agent',
      category: 'Inventory',
      outlet: 'Biryani Hub - KP (Pune)',
      priority: 'Critical',
      impactDescription: 'Basmati stock is under 2 days buffer. Automated PO to Metro Wholesale ensures 0 stockouts for weekend rush.',
      estImpact: 'Prevents ~₹85,000 lost weekend revenue',
      status: 'Pending'
    },
    {
      id: 'act_2',
      title: 'Reallocate 2 Float Chefs from Gachibowli to Indiranagar',
      agent: 'Staff Agent',
      category: 'Staff',
      outlet: 'Biryani Hub - Indiranagar (Bengaluru)',
      priority: 'Critical',
      impactDescription: 'Addresses 22% weekend absenteeism causing 8 min order latency spike.',
      estImpact: '-35% kitchen prep latency',
      status: 'Pending'
    },
    {
      id: 'act_3',
      title: 'Activate 20% Zomato Geo-Targeted Delivery Discount',
      agent: 'Marketing Agent',
      category: 'Marketing',
      outlet: 'Biryani Hub - KP (Pune)',
      priority: 'High',
      impactDescription: 'Compensate for dine-in traffic dip caused by local street construction.',
      estImpact: '+₹1.4L incremental weekly delivery GMV',
      status: 'Pending'
    },
    {
      id: 'act_4',
      title: 'Issue Food Safety & Hygiene Re-Audit Notice',
      agent: 'Audit Agent',
      category: 'Audit',
      outlet: 'Biryani Hub - Bandra (Mumbai)',
      priority: 'Medium',
      impactDescription: 'Schedule mandatory 48-hour spot audit following kitchen score of 65/100.',
      estImpact: 'Ensures 100% regulatory compliance',
      status: 'Pending'
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExecute = (id: string) => {
    setActions(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: 'Executed' };
      }
      return a;
    }));
    setToastMessage("Action executed successfully and recorded in operational activity trail!");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleExecuteAll = () => {
    setActions(prev => prev.map(a => ({ ...a, status: 'Executed' })));
    setToastMessage("All pending agentic action protocols executed successfully!");
    setTimeout(() => setToastMessage(null), 4000);
  };

  const pendingCount = actions.filter(a => a.status === 'Pending').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Flame className="w-7 h-7 text-indigo-600" />
              Action Center & Execution Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
              Autonomous Operations
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Review and trigger pre-approved multi-agent operational actions with 1-click execution.
          </p>
        </div>

        {pendingCount > 0 && (
          <Button
            onClick={handleExecuteAll}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
          >
            <Zap className="w-4 h-4 mr-1.5" />
            Execute All Pending ({pendingCount})
          </Button>
        )}
      </div>

      {/* Action Notification Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[10px] text-emerald-600">Committed to State</span>
        </div>
      )}

      {/* Action Items List */}
      <div className="space-y-4">
        {actions.map((act) => {
          const isExecuted = act.status === 'Executed';
          return (
            <Card 
              key={act.id} 
              className={cn(
                "transition-all",
                isExecuted ? "bg-slate-50/70 border-slate-200 opacity-80" : "bg-white border-slate-200 shadow-sm hover:shadow-md"
              )}
            >
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ring-1 ring-inset",
                      act.priority === 'Critical' ? "bg-rose-50 text-rose-700 ring-rose-200" :
                      act.priority === 'High' ? "bg-amber-50 text-amber-700 ring-amber-200" :
                      "bg-indigo-50 text-indigo-700 ring-indigo-200"
                    )}>
                      {act.priority} Priority
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {act.category} Agent
                    </span>
                    <span className="text-xs font-bold text-indigo-600">
                      {act.outlet}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">{act.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{act.impactDescription}</p>

                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 pt-1">
                    <FranchiseOpsLogo className="w-3.5 h-3.5" />
                    <span>Projected ROI: {act.estImpact}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isExecuted ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <Check className="w-4 h-4" /> Executed
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleExecute(act.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 mr-1" />
                      Execute Action
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

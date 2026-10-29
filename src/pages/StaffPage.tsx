import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  CalendarCheck, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Award,
  Zap,
  Activity,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Calendar,
  Layers,
  Check,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  AlertOctagon,
  UserCheck,
  Flame,
  SlidersHorizontal,
  Bot,
  Megaphone,
  Briefcase
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  getActiveBusiness, 
  getTenantOutlets, 
  getTenantEmployees, 
  saveTenantEmployees, 
  addTenantEmployee, 
  getTenantShifts, 
  saveTenantShifts,
  getTenantStaffingRequirements,
  logTenantActivity,
  getTenantWorkforceInsights,
  saveTenantWorkforceInsights,
  getTenantCampaigns
} from '../services/tenantService';
import { 
  compareOutletWorkforce, 
  calculateWorkforceKPIs, 
  detectStaffShortages, 
  identifyHighAndLowPerformers,
  analyzeWorkingHoursAndOvertime,
  calculateProductivityDistribution,
  evaluateCrossAgentWorkforceRisks,
  generateWorkforceAlerts
} from '../services/staffEngine';
import { MONTHLY_WORKFORCE_TRENDS } from '../services/workforceData';
import { runStaffAgent } from '../services/staffAgent';
import { 
  Employee, 
  ShiftRecord, 
  StaffingRequirement, 
  WorkforceOutletMetrics, 
  StaffShortageAssessment, 
  WorkforceKPIs, 
  StaffAgentScanResult,
  StaffAgentInsight,
  EmployeeRole,
  EmployeeDepartment,
  ShiftType
} from '../types/workforce';
import { Outlet, BusinessProfile } from '../types';
import { cn } from '../lib/utils';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export function StaffPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [requirements, setRequirements] = useState<StaffingRequirement[]>([]);
  
  // Filter States
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedPerformanceTier, setSelectedPerformanceTier] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'productivityScore' | 'performanceScore' | 'attendanceRate' | 'overtimeHours' | 'employeeName'>('productivityScore');
  const [sortAsc, setSortAsc] = useState(false);

  // Shift Radar Filter
  const [shiftFilterOutlet, setShiftFilterOutlet] = useState<string>('all');
  const [shiftFilterSeverity, setShiftFilterSeverity] = useState<string>('all');

  // UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Autonomous Agent Scanning State
  const [isAgentScanning, setIsAgentScanning] = useState(false);
  const [agentStep, setAgentStep] = useState('');
  const [agentPhase, setAgentPhase] = useState(0);
  const [scanResult, setScanResult] = useState<StaffAgentScanResult | null>(null);

  // Form states for new employee
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<EmployeeRole>('Head Chef');
  const [newDepartment, setNewDepartment] = useState<EmployeeDepartment>('Kitchen');
  const [newShift, setNewShift] = useState<ShiftType>('Morning');
  const [targetOutletId, setTargetOutletId] = useState('');
  const [newAttendance, setNewAttendance] = useState(95);
  const [newProductivity, setNewProductivity] = useState(90);
  const [newHourlyRate, setNewHourlyRate] = useState(250);

  const loadData = () => {
    const biz = getActiveBusiness();
    setBusiness(biz);
    const outs = getTenantOutlets(biz.id);
    setOutlets(outs);
    if (outs.length > 0 && !targetOutletId) {
      setTargetOutletId(outs[0].id);
    }
    const emps = getTenantEmployees(biz.id);
    setEmployees(emps);
    const shfs = getTenantShifts(biz.id);
    setShifts(shfs);
    const reqs = getTenantStaffingRequirements(biz.id);
    setRequirements(reqs);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('franchiseops_tenant_changed', loadData);
    window.addEventListener('franchiseops_data_updated', loadData);
    return () => {
      window.removeEventListener('franchiseops_tenant_changed', loadData);
      window.removeEventListener('franchiseops_data_updated', loadData);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRunStaffAgent = async () => {
    setIsAgentScanning(true);
    setAgentStep('Analyzing multi-outlet workforce data...');
    setAgentPhase(1);

    try {
      const res = await runStaffAgent(business.id, (step, phase, total) => {
        setAgentStep(step);
        setAgentPhase(phase);
      });
      setScanResult(res);
      showNotice('Staff Agent scan completed! Workforce intelligence updated.');
    } catch (err) {
      console.error('Staff agent scan error:', err);
    } finally {
      setIsAgentScanning(false);
    }
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !targetOutletId) return;

    const outName = outlets.find(o => o.id === targetOutletId)?.name || 'Franchise Outlet';
    
    addTenantEmployee(business.id, {
      outletId: targetOutletId,
      outletName: outName,
      employeeName: newName.trim(),
      role: newRole,
      department: newDepartment,
      attendanceRate: Number(newAttendance),
      workingHours: 160,
      overtimeHours: 0,
      productivityScore: Number(newProductivity),
      performanceScore: Number(newProductivity),
      shift: newShift,
      status: 'Active',
      hourlyRate: Number(newHourlyRate),
      joinDate: new Date().toISOString().split('T')[0]
    });

    setIsAddModalOpen(false);
    setNewName('');
    showNotice(`Registered ${newName} as ${newRole} at ${outName}!`);
    loadData();
  };

  const handleQuickRebalance = (shortage: StaffShortageAssessment) => {
    if (!shortage.possibleReallocationSources || shortage.possibleReallocationSources.length === 0) {
      showNotice('No surplus outlets available for instant reallocation.');
      return;
    }

    const source = shortage.possibleReallocationSources[0];
    const candidateName = source.candidateNames[0] || 'Float Staff';

    // Update shift coverage
    const updatedShifts = shifts.map(s => {
      if (s.outletId === shortage.outletId && s.shiftType === shortage.shiftType) {
        return {
          ...s,
          assignedStaffCount: s.assignedStaffCount + 1,
          deficitCount: Math.max(0, s.deficitCount - 1),
          coverageStatus: s.deficitCount <= 1 ? 'OPTIMAL' as const : 'SHORTAGE' as const,
          notes: `Rebalanced +1 staff (${candidateName}) from ${source.outletName}.`
        };
      }
      return s;
    });

    saveTenantShifts(business.id, updatedShifts);
    setShifts(updatedShifts);
    logTenantActivity(business.id, 'Staff Agent', `Reallocated ${candidateName} from ${source.outletName} to ${shortage.outletName} (${shortage.shiftType} shift).`);
    showNotice(`Reallocated ${candidateName} to ${shortage.outletName} to cover ${shortage.shiftType} shortage!`);
  };

  // Pure Deterministic Calculations from Engine
  const outletMetrics = useMemo(() => compareOutletWorkforce(outlets, employees, shifts), [outlets, employees, shifts]);
  const shortages = useMemo(() => detectStaffShortages(shifts, employees, requirements), [shifts, employees, requirements]);
  const kpis = useMemo(() => calculateWorkforceKPIs(employees, shifts, outletMetrics), [employees, shifts, outletMetrics]);
  const { topPerformers, attentionRequired } = useMemo(() => identifyHighAndLowPerformers(employees), [employees]);
  const overtimeStats = useMemo(() => analyzeWorkingHoursAndOvertime(employees), [employees]);
  const productivityDist = useMemo(() => calculateProductivityDistribution(employees), [employees]);
  const crossAgentRisks = useMemo(() => evaluateCrossAgentWorkforceRisks(shortages, outletMetrics), [shortages, outletMetrics]);
  const dynamicInsights = useMemo(() => generateWorkforceAlerts(outletMetrics, shortages, employees), [outletMetrics, shortages, employees]);

  // Filtered and Sorted Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchOutlet = selectedOutlet === 'all' || emp.outletId === selectedOutlet;
      const matchDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
      const matchShift = selectedShift === 'all' || emp.shift === selectedShift;
      
      let matchTier = true;
      if (selectedPerformanceTier === 'excellent') matchTier = emp.productivityScore >= 90;
      else if (selectedPerformanceTier === 'good') matchTier = emp.productivityScore >= 80 && emp.productivityScore < 90;
      else if (selectedPerformanceTier === 'needs_attention') matchTier = emp.productivityScore >= 70 && emp.productivityScore < 80;
      else if (selectedPerformanceTier === 'critical') matchTier = emp.productivityScore < 70 || emp.attendanceRate < 75;

      const matchSearch = searchTerm === '' || 
        emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.outletName.toLowerCase().includes(searchTerm.toLowerCase());

      return matchOutlet && matchDept && matchShift && matchTier && matchSearch;
    }).sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });
  }, [employees, selectedOutlet, selectedDepartment, selectedShift, selectedPerformanceTier, searchTerm, sortField, sortAsc]);

  // Filtered Shifts for Radar
  const filteredShifts = useMemo(() => {
    return shifts.filter(s => {
      const matchOutlet = shiftFilterOutlet === 'all' || s.outletId === shiftFilterOutlet;
      let matchSeverity = true;
      if (shiftFilterSeverity === 'critical') matchSeverity = s.coverageStatus === 'CRITICAL_DEFICIT' || s.deficitCount >= 2;
      else if (shiftFilterSeverity === 'shortage') matchSeverity = s.coverageStatus === 'SHORTAGE' || s.deficitCount > 0;
      else if (shiftFilterSeverity === 'optimal') matchSeverity = s.coverageStatus === 'OPTIMAL';
      return matchOutlet && matchSeverity;
    });
  }, [shifts, shiftFilterOutlet, shiftFilterSeverity]);

  // Chart Data: Outlet workforce comparison
  const outletChartData = useMemo(() => {
    return outletMetrics.map(m => ({
      name: m.outletName.replace('Biryani Hub - ', '').replace('Biryani Express – ', ''),
      productivity: m.averageProductivityScore,
      attendance: m.averageAttendanceRate,
      health: m.workforceHealthScore,
      shortages: m.shortageIncidentsCount,
      overtime: m.totalOvertimeHours
    }));
  }, [outletMetrics]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400/50 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="text-sm font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* COMPACT ENTERPRISE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Workforce & Staff Intelligence
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Staff Agent Active
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Multi-outlet workforce monitoring, productivity intelligence, shift coverage and AI-driven staffing optimization.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={handleRunStaffAgent}
            disabled={isAgentScanning}
            className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-lg shadow-indigo-600/30 flex items-center gap-2 border border-indigo-400/30 h-10 px-4"
          >
            {isAgentScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                <span>Scanning (Phase {agentPhase}/5)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-300" />
                <span>Run Staff Agent Scan</span>
              </>
            )}
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="outline"
            className="border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-2 h-10 px-4"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Employee</span>
          </Button>
        </div>
      </div>

      {/* Autonomous Scan Progress Bar if Active */}
      {isAgentScanning && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-xl p-4 animate-in fade-in shadow-lg">
          <div className="flex items-center justify-between text-xs text-indigo-300 mb-2">
            <span className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
              {agentStep}
            </span>
            <span className="font-mono">Phase {agentPhase} of 5</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 transition-all duration-300" 
              style={{ width: `${(agentPhase / 5) * 100}%` }} 
            />
          </div>
        </div>
      )}

      {/* DYNAMIC CALCULATED KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Headcount</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">{kpis.totalEmployees}</div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" /> {kpis.activeHeadcount} Active | {kpis.onLeaveCount} Leave
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">{kpis.overallAttendanceRate}%</div>
            <div className="text-xs text-slate-400 mt-1">Network standard: 85%</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Productivity</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-400">{kpis.overallProductivityScore} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
            <div className="text-xs text-slate-400 mt-1">Weighted crew score</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shift Coverage</span>
              <ShieldCheck className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold text-violet-400">{kpis.overallShiftCoverageRate}%</div>
            <div className="text-xs text-slate-400 mt-1">Scheduled vs required</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overtime Load</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">{kpis.totalOvertimeHours} hrs</div>
            <div className="text-xs text-slate-400 mt-1">Avg {kpis.averageOvertimePerEmployee} hrs / staff</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Shortages</span>
              <AlertTriangle className={cn("w-4 h-4", kpis.activeShortagesCount > 0 ? "text-rose-400 animate-pulse" : "text-slate-500")} />
            </div>
            <div className={cn("text-2xl font-bold", kpis.activeShortagesCount > 0 ? "text-rose-400" : "text-emerald-400")}>
              {kpis.activeShortagesCount} shifts
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {shortages.length > 0 ? 'Immediate rebalance needed' : 'All shifts covered'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CLEAN SECTION NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => handleTabChange('overview')}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'overview'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          )}
        >
          <Activity className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => handleTabChange('roster')}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'roster'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Employees & Roster ({employees.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('shifts')}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'shifts'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>Shift Coverage & Radar</span>
          {shortages.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
              {shortages.length} Shortages
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabChange('analytics')}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'analytics'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          )}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Performance Analytics</span>
        </button>

        <button
          onClick={() => handleTabChange('agent')}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'agent'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          )}
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Staff Agent Insights</span>
        </button>

        <button
          onClick={() => handleTabChange('cross-agent')}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === 'cross-agent'
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          )}
        >
          <Megaphone className="w-4 h-4 text-violet-400" />
          <span>Cross-Agent Alignment</span>
          {crossAgentRisks.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Assessment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/90 border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Top Benchmark Outlet</div>
                  <div className="text-base font-bold text-white mt-0.5">{outletMetrics[0]?.outletName || 'Gachibowli'}</div>
                  <div className="text-xs text-emerald-400 font-medium">Health Score: {outletMetrics[0]?.workforceHealthScore || 94}/100 • 0 Shortages</div>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/90 border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">High Overtime Strain</div>
                  <div className="text-base font-bold text-white mt-0.5">Indiranagar ({overtimeStats.totalOvertimeHours} hrs)</div>
                  <div className="text-xs text-amber-400 font-medium">{overtimeStats.excessiveOvertimeStaff.length} key staff exceeding 25h threshold</div>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/90 border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Shift Deficit Risk</div>
                  <div className="text-base font-bold text-white mt-0.5">Bandra & Madhapur (Evening)</div>
                  <div className="text-xs text-rose-400 font-medium">Promotional surge exceeds line cook capacity</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row: Historical Trend & Outlet Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/90 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  6-Month Workforce Productivity & Attendance Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MONTHLY_WORKFORCE_TRENDS}>
                      <defs>
                        <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorAttn" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" domain={[60, 100]} fontSize={11} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Area type="monotone" dataKey="productivityScore" name="Productivity (0-100)" stroke="#6366f1" fillOpacity={1} fill="url(#colorProd)" strokeWidth={2} />
                      <Area type="monotone" dataKey="attendanceRate" name="Attendance Rate %" stroke="#10b981" fillOpacity={1} fill="url(#colorAttn)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/90 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Workforce Health & Attendance Across Outlets
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={outletChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-15} textAnchor="end" height={40} />
                      <YAxis stroke="#94a3b8" domain={[0, 100]} fontSize={11} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="health" fill="#6366f1" name="Health Score" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="attendance" fill="#10b981" name="Attendance %" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Roster Spotlight & Action Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card className="bg-slate-900/90 border-slate-800">
              <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Top Workforce Performers Leaderboard
                </CardTitle>
                <button 
                  onClick={() => handleTabChange('roster')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  View All ({employees.length}) <ArrowRight className="w-3 h-3" />
                </button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800/60">
                  {topPerformers.slice(0, 4).map((top, idx) => (
                    <div key={top.employeeId} className="p-3.5 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-white text-sm">{top.employeeName}</div>
                          <div className="text-xs text-slate-400">{top.role} • {top.outletName.replace('Biryani Hub - ', '')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-cyan-400">{top.productivityScore}/100</div>
                        <div className="text-xs text-emerald-400">{top.attendanceRate}% Attendance</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shift Shortage Alerts */}
            <Card className="bg-slate-900/90 border-slate-800">
              <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Active Shift Bottlenecks & Shortages
                </CardTitle>
                <button 
                  onClick={() => handleTabChange('shifts')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  Shift Radar <ArrowRight className="w-3 h-3" />
                </button>
              </CardHeader>
              <CardContent className="p-0">
                {shortages.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    All shifts across all outlets are currently 100% staffed.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {shortages.slice(0, 3).map((s, idx) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-800/30">
                        <div>
                          <div className="font-semibold text-white text-sm flex items-center gap-2">
                            {s.outletName.replace('Biryani Hub - ', '')}
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {s.shiftType} Shift • -{s.deficit} Deficit
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {s.department} • Assigned: {s.actualStaff} of {s.requiredStaff} staff
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleQuickRebalance(s)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-3"
                        >
                          Rebalance
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: EMPLOYEES & ROSTER */}
      {/* ======================================================== */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          {/* Advanced Multi-Parameter Filter Toolbar */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full lg:w-96">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by employee, role, outlet, skills..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Filter Selects */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto">
                <select
                  value={selectedOutlet}
                  onChange={e => setSelectedOutlet(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Outlets ({outlets.length})</option>
                  {outlets.map(o => (
                    <option key={o.id} value={o.id}>{o.name.replace('Biryani Hub - ', '')}</option>
                  ))}
                </select>

                <select
                  value={selectedDepartment}
                  onChange={e => setSelectedDepartment(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Departments</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Front-of-House">Front-of-House</option>
                  <option value="Management">Management</option>
                  <option value="Logistics & Delivery">Logistics & Delivery</option>
                </select>

                <select
                  value={selectedShift}
                  onChange={e => setSelectedShift(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Shifts</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="General">General</option>
                  <option value="Split">Split</option>
                </select>

                <select
                  value={selectedPerformanceTier}
                  onChange={e => setSelectedPerformanceTier(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Performance</option>
                  <option value="excellent">Excellent (≥90)</option>
                  <option value="good">Good (80-89)</option>
                  <option value="needs_attention">Needs Attention (70-79)</option>
                  <option value="critical">Critical (&lt;70)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Showing <strong className="text-white">{filteredEmployees.length}</strong> of {employees.length} team members</span>
              <span className="text-slate-500">Click column headers to sort</span>
            </div>
          </div>

          {/* Master Employee Table */}
          <Card className="bg-slate-900/90 border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 select-none">
                  <tr>
                    <th 
                      onClick={() => toggleSort('employeeName')}
                      className="px-4 py-3.5 cursor-pointer hover:text-white transition-colors"
                    >
                      Employee {sortField === 'employeeName' && (sortAsc ? '▲' : '▼')}
                    </th>
                    <th className="px-4 py-3.5">Role & Dept</th>
                    <th className="px-4 py-3.5">Outlet</th>
                    <th className="px-4 py-3.5 text-center">Shift</th>
                    <th 
                      onClick={() => toggleSort('attendanceRate')}
                      className="px-4 py-3.5 text-center cursor-pointer hover:text-white transition-colors"
                    >
                      Attendance {sortField === 'attendanceRate' && (sortAsc ? '▲' : '▼')}
                    </th>
                    <th 
                      onClick={() => toggleSort('productivityScore')}
                      className="px-4 py-3.5 text-center cursor-pointer hover:text-white transition-colors"
                    >
                      Productivity {sortField === 'productivityScore' && (sortAsc ? '▲' : '▼')}
                    </th>
                    <th 
                      onClick={() => toggleSort('performanceScore')}
                      className="px-4 py-3.5 text-center cursor-pointer hover:text-white transition-colors"
                    >
                      Performance {sortField === 'performanceScore' && (sortAsc ? '▲' : '▼')}
                    </th>
                    <th 
                      onClick={() => toggleSort('overtimeHours')}
                      className="px-4 py-3.5 text-center cursor-pointer hover:text-white transition-colors"
                    >
                      Overtime {sortField === 'overtimeHours' && (sortAsc ? '▲' : '▼')}
                    </th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredEmployees.map(emp => {
                    const isHighPerformer = emp.productivityScore >= 90;
                    const isNeedsAttention = emp.productivityScore < 75 || emp.attendanceRate < 80;
                    const isBurnoutRisk = emp.overtimeHours >= 30;

                    return (
                      <tr key={emp.employeeId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 text-white">
                          <div className="font-semibold">{emp.employeeName}</div>
                          {emp.skills && emp.skills.length > 0 && (
                            <div className="text-xs text-indigo-400 font-normal mt-0.5">
                              {emp.skills.slice(0, 2).join(' • ')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="text-slate-200 font-medium">{emp.role}</div>
                          <div className="text-xs text-slate-400">{emp.department}</div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">
                          {emp.outletName.replace('Biryani Hub - ', '').replace('Biryani Express – ', '')}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                            {emp.shift}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={cn(
                              "font-bold text-xs",
                              emp.attendanceRate >= 90 ? "text-emerald-400" :
                              emp.attendanceRate >= 80 ? "text-amber-400" : "text-rose-400"
                            )}>
                              {emp.attendanceRate}%
                            </span>
                            <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={cn(
                                  "h-1.5 rounded-full",
                                  emp.attendanceRate >= 90 ? "bg-emerald-500" :
                                  emp.attendanceRate >= 80 ? "bg-amber-500" : "bg-rose-500"
                                )} 
                                style={{ width: `${emp.attendanceRate}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-bold inline-block",
                            emp.productivityScore >= 90 ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30" :
                            emp.productivityScore >= 80 ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/30" :
                            "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                          )}>
                            {emp.productivityScore}/100
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-xs font-semibold text-slate-300">
                            {emp.performanceScore}/100
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={cn(
                            "text-xs font-semibold",
                            isBurnoutRisk ? "text-rose-400 font-bold" :
                            emp.overtimeHours > 0 ? "text-amber-300" : "text-slate-500"
                          )}>
                            {emp.overtimeHours > 0 ? `+${emp.overtimeHours} hrs` : '0 hrs'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5",
                            emp.status === 'Active' ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" :
                            emp.status === 'On Leave' ? "bg-amber-500/10 text-amber-300 border border-amber-500/20" :
                            "bg-slate-800 text-slate-400"
                          )}>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              emp.status === 'Active' ? "bg-emerald-400" : "bg-amber-400"
                            )} />
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SHIFT COVERAGE & SHORTAGE RADAR */}
      {/* ======================================================== */}
      {activeTab === 'shifts' && (
        <div className="space-y-6">
          {/* Active Shortage Alerts Panel */}
          {shortages.length > 0 && (
            <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-400">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Active Shift Shortage Radar ({shortages.length} Critical Deficits Detected)
                    </h3>
                    <p className="text-xs text-rose-300">
                      Deterministic engine detected staffing bottlenecks risking kitchen turnaround and guest satisfaction.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortages.map((s, idx) => (
                  <div key={idx} className="bg-slate-900/95 border border-rose-500/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{s.outletName}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        {s.shiftType} Shift • -{s.deficit} Staff Deficit
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {s.impactExplanation}
                    </p>

                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-indigo-300 flex items-start gap-2">
                      <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{s.suggestedAction}</span>
                    </div>

                    {s.possibleReallocationSources && s.possibleReallocationSources.length > 0 && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span className="text-xs text-slate-400">
                          Candidate: <strong className="text-indigo-300">{s.possibleReallocationSources[0].candidateNames[0]}</strong> ({s.possibleReallocationSources[0].outletName.split(' - ')[1]})
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleQuickRebalance(s)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-7 px-3 flex items-center gap-1.5 font-medium"
                        >
                          <span>Rebalance Now</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shift Radar Filtering Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Filter Shift Roster:</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={shiftFilterOutlet}
                onChange={e => setShiftFilterOutlet(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Outlets</option>
                {outlets.map(o => (
                  <option key={o.id} value={o.id}>{o.name.replace('Biryani Hub - ', '')}</option>
                ))}
              </select>

              <select
                value={shiftFilterSeverity}
                onChange={e => setShiftFilterSeverity(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="shortage">Shortages & Deficits</option>
                <option value="critical">Critical Deficits Only</option>
                <option value="optimal">Optimal Shifts Only</option>
              </select>
            </div>
          </div>

          {/* Master Shift Schedule Matrix */}
          <Card className="bg-slate-900/90 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Shift Roster & Staffing Level Matrix ({filteredShifts.length} Shifts)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">Outlet</th>
                      <th className="px-4 py-3.5">Shift</th>
                      <th className="px-4 py-3.5">Timing</th>
                      <th className="px-4 py-3.5 text-center">Required</th>
                      <th className="px-4 py-3.5 text-center">Assigned</th>
                      <th className="px-4 py-3.5 text-center">Coverage</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="px-4 py-3.5">Operational Context & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {filteredShifts.map(s => {
                      const covPct = Math.round((s.assignedStaffCount / (s.requiredStaffCount || 1)) * 100);
                      const isShort = s.coverageStatus === 'SHORTAGE' || s.coverageStatus === 'CRITICAL_DEFICIT';

                      return (
                        <tr key={s.shiftId} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5 font-semibold text-white">
                            {s.outletName.replace('Biryani Hub - ', '').replace('Biryani Express – ', '')}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-200 border border-slate-700">
                              {s.shiftType}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">
                            {s.startTime} - {s.endTime}
                          </td>
                          <td className="px-4 py-3.5 text-center font-semibold text-slate-300">
                            {s.requiredStaffCount} staff
                          </td>
                          <td className="px-4 py-3.5 text-center font-semibold text-white">
                            {s.assignedStaffCount} staff
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={cn(
                              "text-xs font-bold",
                              covPct >= 100 ? "text-emerald-400" :
                              covPct >= 75 ? "text-amber-400" : "text-rose-400"
                            )}>
                              {covPct}%
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1",
                              s.coverageStatus === 'OPTIMAL' ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" :
                              s.coverageStatus === 'CRITICAL_DEFICIT' ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                              "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                            )}>
                              {s.coverageStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-400">
                            {s.notes || 'Full staffing allocated.'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PERFORMANCE & OVERTIME ANALYTICS */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Productivity Distribution Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/90 border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">High Performers (≥90)</span>
                <Award className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{productivityDist.highPerformers.count} <span className="text-sm font-normal text-slate-400">({productivityDist.highPerformers.percentage}%)</span></div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${productivityDist.highPerformers.percentage}%` }} />
              </div>
            </Card>

            <Card className="bg-slate-900/90 border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Meets Expectations (75-89)</span>
                <UserCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">{productivityDist.meetsExpectations.count} <span className="text-sm font-normal text-slate-400">({productivityDist.meetsExpectations.percentage}%)</span></div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${productivityDist.meetsExpectations.percentage}%` }} />
              </div>
            </Card>

            <Card className="bg-slate-900/90 border-slate-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Needs Improvement (&lt;75)</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-white">{productivityDist.needsImprovement.count} <span className="text-sm font-normal text-slate-400">({productivityDist.needsImprovement.percentage}%)</span></div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${productivityDist.needsImprovement.percentage}%` }} />
              </div>
            </Card>
          </div>

          {/* Outlet Comparison Table */}
          <Card className="bg-slate-900/90 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Outlet Workforce Health & Efficiency Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Outlet</th>
                      <th className="px-4 py-3 text-center">Headcount</th>
                      <th className="px-4 py-3 text-center">Attendance Rate</th>
                      <th className="px-4 py-3 text-center">Productivity</th>
                      <th className="px-4 py-3 text-center">Total Overtime</th>
                      <th className="px-4 py-3 text-center">Coverage</th>
                      <th className="px-4 py-3 text-center">Health Score</th>
                      <th className="px-4 py-3 text-center">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {outletMetrics.map(m => (
                      <tr key={m.outletId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-white">
                          {m.outletName.replace('Biryani Hub - ', '').replace('Biryani Express – ', '')}
                        </td>
                        <td className="px-4 py-3.5 text-center text-slate-300">
                          {m.totalEmployees} staff
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={cn(
                            "font-bold",
                            m.averageAttendanceRate >= 90 ? "text-emerald-400" :
                            m.averageAttendanceRate >= 80 ? "text-amber-400" : "text-rose-400"
                          )}>
                            {m.averageAttendanceRate}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center text-cyan-300 font-bold">
                          {m.averageProductivityScore}/100
                        </td>
                        <td className="px-4 py-3.5 text-center text-amber-300">
                          {m.totalOvertimeHours} hrs
                        </td>
                        <td className="px-4 py-3.5 text-center text-violet-300 font-bold">
                          {m.shiftCoveragePercentage}%
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {m.workforceHealthScore}/100
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-bold",
                            m.riskLevel === 'LOW' ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" :
                            m.riskLevel === 'MEDIUM' ? "bg-amber-500/10 text-amber-300 border border-amber-500/30" :
                            "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                          )}>
                            {m.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Overtime Burnout Watchlist */}
          <Card className="bg-slate-900/90 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-400" />
                Overtime Burnout & Fatigue Watchlist (&gt;25 Overtime Hours)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {overtimeStats.excessiveOvertimeStaff.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-400">
                  Zero employees currently exceeding the 25-hour overtime safety threshold.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {overtimeStats.excessiveOvertimeStaff.map(emp => (
                    <div key={emp.employeeId} className="p-4 flex items-center justify-between hover:bg-slate-800/30">
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          {emp.employeeName}
                          <span className="px-2.5 py-0.5 rounded-full text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                            {emp.overtimeHours} hrs Overtime
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {emp.role} at {emp.outletName} • Total Working Hours: {emp.workingHours} hrs
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        Productivity: <span className="text-amber-400 font-semibold">{emp.productivityScore}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: STAFF AGENT INSIGHTS & AI ACTIONS */}
      {/* ======================================================== */}
      {activeTab === 'agent' && (
        <div className="space-y-6">
          <Card className="bg-slate-900/90 border-indigo-500/30 p-6 relative overflow-hidden shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Staff Agent Autonomous Intelligence
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Continuously correlates shift coverage, attendance logs, and chef fatigue to prescribe actionable rebalancings.
                </p>
              </div>

              <Button
                onClick={handleRunStaffAgent}
                disabled={isAgentScanning}
                className="bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 font-medium"
              >
                <RefreshCw className={cn("w-4 h-4", isAgentScanning && "animate-spin")} />
                <span>{isAgentScanning ? 'Scanning...' : 'Trigger Full Scan'}</span>
              </Button>
            </div>

            {/* AI Executive Synthesis */}
            <div className="mt-6 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> AI Executive Synthesis
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {scanResult ? scanResult.summaryNarrative : (
                  `Autonomous scan completed across ${outlets.length} active outlets. Network workforce health score is ${Math.round(outletMetrics.reduce((s, m) => s + m.workforceHealthScore, 0) / (outletMetrics.length || 1))}/100 across ${employees.length} employees. Critical operational action is recommended for ${shortages.length} active shift shortages in ${shortages.map(s => s.outletName.replace('Biryani Hub - ', '')).join(', ')}.`
                )}
              </p>
            </div>

            {/* Dynamic Findings Grid */}
            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Calculated Findings & Alerts ({dynamicInsights.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dynamicInsights.map((ins, i) => (
                  <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{ins.title}</span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-bold",
                        ins.severity === 'Critical' ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                        ins.severity === 'High' ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                        "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      )}>
                        {ins.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{ins.summary}</p>
                    <div className="pt-2 text-xs text-indigo-300 flex items-start gap-1.5 font-medium border-t border-slate-900">
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
                      <span>{ins.actionable_step}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommended Actions */}
            <div className="mt-8 space-y-3">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-400" />
                AI Recommended Actions & Prescriptions
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Staff Reallocation — Bandra Evening Shift</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">High Priority</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    <strong>Issue:</strong> Evening shift shortage (-2 Line Cooks) during marketing promotional peak.
                  </div>
                  <div className="text-xs text-indigo-300">
                    <strong>Action:</strong> Temporarily float 1-2 staff from Gachibowli to Bandra during 18:00 - 23:00 rush.
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => {
                      if (shortages.length > 0) handleQuickRebalance(shortages[0]);
                      else showNotice('Bandra shift already balanced!');
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 font-medium"
                  >
                    Execute Reallocation
                  </Button>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Overtime Load Rebalance — Indiranagar</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">Medium Priority</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    <strong>Issue:</strong> Senior Sous Chef logging 48h overtime this month; severe burnout risk.
                  </div>
                  <div className="text-xs text-indigo-300">
                    <strong>Action:</strong> Adjust upcoming shift allocation to introduce part-time reserve sous chef coverage.
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => showNotice('Overtime mitigation schedule applied to upcoming week roster!')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs h-8 font-medium border border-slate-700"
                  >
                    Schedule Part-Time Support
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: CROSS-AGENT WORKFORCE & MARKETING ALIGNMENT */}
      {/* ======================================================== */}
      {activeTab === 'cross-agent' && (
        <div className="space-y-6">
          <Card className="bg-slate-900/90 border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-500/20 border border-violet-500/40 rounded-xl text-violet-400">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Cross-Agent Workforce & Marketing Alignment
                </h3>
                <p className="text-xs text-slate-400">
                  Staff Agent actively correlates marketing promotional demand spikes with shift staffing levels to detect operational risks before service bottlenecks occur.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {crossAgentRisks.map((risk, idx) => (
                <div key={idx} className="bg-slate-950 border border-violet-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{risk.campaignName}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-bold",
                      risk.riskSeverity === 'Critical' ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" :
                      "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    )}>
                      {risk.riskSeverity} Risk
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <div><strong>Outlet & Shift:</strong> {risk.outletName} ({risk.shiftType} Shift)</div>
                    <div><strong>Marketing Channel:</strong> {risk.channel}</div>
                    <div className="text-amber-300">{risk.demandSurgeExplanation}</div>
                    <div className="text-rose-300">{risk.staffingStatus}</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-violet-300 flex items-start gap-2">
                    <Bot className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white mb-0.5">Cross-Agent Prescription:</strong>
                      {risk.aiPrescription}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" /> Add Team Member
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Employee Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as EmployeeRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Head Chef">Head Chef</option>
                    <option value="Senior Sous Chef">Senior Sous Chef</option>
                    <option value="Line Cook">Line Cook</option>
                    <option value="Kitchen Steward">Kitchen Steward</option>
                    <option value="Store Manager">Store Manager</option>
                    <option value="Assistant Manager">Assistant Manager</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Front-of-House Lead">Front-of-House Lead</option>
                    <option value="Server / Waitstaff">Server / Waitstaff</option>
                    <option value="Delivery Lead">Delivery Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={e => setNewDepartment(e.target.value as EmployeeDepartment)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Kitchen">Kitchen</option>
                    <option value="Front-of-House">Front-of-House</option>
                    <option value="Management">Management</option>
                    <option value="Logistics & Delivery">Logistics & Delivery</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Outlet</label>
                  <select
                    value={targetOutletId}
                    onChange={e => setTargetOutletId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {outlets.map(o => (
                      <option key={o.id} value={o.id}>{o.name.replace('Biryani Hub - ', '')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Shift</label>
                  <select
                    value={newShift}
                    onChange={e => setNewShift(e.target.value as ShiftType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                    <option value="General">General</option>
                    <option value="Split">Split</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Attendance %</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={newAttendance}
                    onChange={e => setNewAttendance(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Productivity Score</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={newProductivity}
                    onChange={e => setNewProductivity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="border-slate-700 text-slate-300"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
                  Add Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

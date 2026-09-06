import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  CalendarCheck, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  UserCheck, 
  Award,
  BarChart2,
  Calendar,
  Send,
  Zap
} from 'lucide-react';
import { FranchiseOpsLogo } from '../components/brand/FranchiseOpsLogo';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getActiveBusiness, getTenantStaff, saveTenantStaff, addTenantStaff, getTenantOutlets } from '../services/tenantService';
import { StaffRecord, Outlet, BusinessProfile } from '../types';
import { formatCurrency, formatNumber, cn } from '../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function StaffPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'performance';

  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form states
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Head Chef');
  const [targetOutletId, setTargetOutletId] = useState('');
  const [newAttendance, setNewAttendance] = useState(95);
  const [newScore, setNewScore] = useState(88);

  const loadData = () => {
    const biz = getActiveBusiness();
    setBusiness(biz);
    const outs = getTenantOutlets(biz.id);
    setOutlets(outs);
    if (outs.length > 0 && !targetOutletId) {
      setTargetOutletId(outs[0].id);
    }
    const staff = getTenantStaff(biz.id);
    setStaffList(staff);
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

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !targetOutletId) return;

    const outName = outlets.find(o => o.id === targetOutletId)?.name || 'Franchise Unit';
    const newRecord: StaffRecord = {
      id: 'stf_' + Date.now(),
      business_id: business.id,
      outlet_id: targetOutletId,
      outlet_name: outName,
      employee_name: newName,
      role: newRole,
      attendance_pct: Number(newAttendance),
      hours_worked: 160,
      performance_score: Number(newScore),
      sales_contribution: 180000,
      status: 'Active'
    };

    addTenantStaff(business.id, newRecord);
    loadData();
    setIsAddModalOpen(false);
    showNotice(`Added staff member ${newName} to ${outName}`);
  };

  const handleReallocateFloatStaff = (fromOutlet: string, toOutlet: string) => {
    showNotice(`Dispatched 2 float team members from ${fromOutlet} to ${toOutlet} for shift stabilization.`);
  };

  // Filtered staff
  const filteredStaff = staffList.filter(s => {
    const matchesOutlet = selectedOutlet === 'all' || s.outlet_id === selectedOutlet;
    const matchesSearch = s.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.outlet_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesOutlet && matchesSearch;
  });

  const avgAttendance = staffList.length > 0 
    ? staffList.reduce((acc, s) => acc + s.attendance_pct, 0) / staffList.length 
    : 0;

  const avgScore = staffList.length > 0 
    ? staffList.reduce((acc, s) => acc + s.performance_score, 0) / staffList.length 
    : 0;

  const staffPerformanceData = outlets.map(o => {
    const outletStaff = staffList.filter(s => s.outlet_id === o.id);
    const avgScoreOutlet = outletStaff.length > 0 ? outletStaff.reduce((a, s) => a + s.performance_score, 0) / outletStaff.length : 80;
    const avgAtt = outletStaff.length > 0 ? outletStaff.reduce((a, s) => a + s.attendance_pct, 0) / outletStaff.length : 90;
    return {
      outlet: o.name.replace('Biryani Hub - ', ''),
      score: Math.round(avgScoreOutlet),
      attendance: Math.round(avgAtt),
      count: outletStaff.length || 8
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-7 h-7 text-indigo-600" />
              Staff & Workforce Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
              Workforce Agent
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Monitor shift attendance, service velocity, employee rankings, and AI-driven float staff reallocations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Staff Member
          </Button>

          <Button 
            variant="outline"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredStaff, null, 2));
              const a = document.createElement('a');
              a.href = dataStr;
              a.download = `staff-intelligence-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
            className="bg-white text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export Staff Dossier
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
          <span className="text-[10px] text-emerald-600">Dispatched</span>
        </div>
      )}

      {/* Submodule Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        {[
          { id: 'performance', name: 'Staff Performance', icon: Award, count: staffList.length },
          { id: 'attendance', name: 'Attendance & Shifts', icon: CalendarCheck, badge: `${Math.round(avgAttendance)}% Avg` },
          { id: 'insights', name: 'Workforce Insights', icon: FranchiseOpsLogo, badge: 'AI Float Shifts' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer",
                isActive 
                  ? "border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-xl" 
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              )}
            >
              <tab.icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
              <span>{tab.name}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-md text-[9px] font-extrabold bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by name, role, outlet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Outlets ({outlets.length})</option>
            {outlets.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>

        <div className="text-xs font-bold text-slate-500 shrink-0">
          Total Headcount: <span className="text-slate-900 font-extrabold">{filteredStaff.length} Employees</span>
        </div>
      </div>

      {/* TAB 1: STAFF PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Workforce</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{staffList.length} Staff</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">100% Onboarded</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Avg Performance Score</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">{Math.round(avgScore)}/100</div>
              <span className="text-[11px] text-indigo-600 font-semibold mt-0.5 block">+3.2 pts vs last month</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Shift Fill Rate</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{Math.round(avgAttendance)}%</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Target: 95%</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">High Performers</span>
              <div className="text-2xl font-black text-purple-600 mt-1">
                {staffList.filter(s => s.performance_score >= 85).length} Staff
              </div>
              <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">Tier 1 Rating (&gt;85)</span>
            </div>
          </div>

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="px-4 py-3.5">Employee & Role</th>
                    <th className="px-4 py-3.5">Assigned Outlet</th>
                    <th className="px-4 py-3.5 text-center">Attendance %</th>
                    <th className="px-4 py-3.5 text-center">Efficiency Score</th>
                    <th className="px-4 py-3.5 text-right">Hours Logged</th>
                    <th className="px-4 py-3.5 text-right">Sales Contribution</th>
                    <th className="px-4 py-3.5 text-center">Shift Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStaff.map((staff) => {
                    const isHigh = staff.performance_score >= 85;
                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{staff.employee_name}</div>
                          <div className="text-[11px] text-slate-500">{staff.role}</div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-700">
                          {staff.outlet_name}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full font-bold text-[11px]",
                            staff.attendance_pct >= 90 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          )}>
                            {staff.attendance_pct}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <span className={cn(
                              "font-black text-xs px-2.5 py-0.5 rounded-xl ring-1",
                              isHigh ? "bg-purple-50 text-purple-700 ring-purple-200" : "bg-indigo-50 text-indigo-700 ring-indigo-200"
                            )}>
                              {staff.performance_score}/100
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                          {staff.hours_worked} hrs
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(staff.sales_contribution)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
                            {staff.status}
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

      {/* TAB 2: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  Outlet-Wise Attendance vs Performance Correlation
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Direct correlation between staff shift compliance and kitchen order fulfillment latency.
                </p>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={staffPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="outlet" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="attendance" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Attendance %" />
                    <Bar dataKey="score" fill="#10b981" radius={[6, 6, 0, 0]} name="Performance Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Shift Absenteeism Hotspots
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-900">
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Indiranagar Shift Shortage:
                  </div>
                  Absenteeism rate reached <strong>22%</strong> on weekend shifts. Correlated with a <strong>8 min</strong> order prep time increase.
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <div className="font-bold text-slate-800">Peak Staffing Hours</div>
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Lunch Rush (12:30 PM - 3:30 PM)</span>
                    <strong className="text-indigo-600">100% Required</strong>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Dinner Rush (7:30 PM - 11:00 PM)</span>
                    <strong className="text-indigo-600">110% Required</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: WORKFORCE INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FranchiseOpsLogo className="w-8 h-8 drop-shadow-md shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Float Staff Reallocation Recommendation</h4>
                      <span className="text-[11px] text-indigo-600 font-semibold">Staff Agent Auto-Optimization</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                    High Priority
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Gachibowli outlet currently maintains a surplus capacity (+3 chefs), whereas Indiranagar is facing severe kitchen delays (-2 chefs). Reallocate 2 float chefs for Friday–Sunday.
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500">Est. Prep Latency Drop: <strong>-35%</strong></span>
                  <Button
                    size="sm"
                    onClick={() => handleReallocateFloatStaff('Gachibowli', 'Indiranagar')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Dispatch Float Staff
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Labor Cost vs Revenue Multiplier</h4>
                      <span className="text-[11px] text-emerald-600 font-semibold">Efficiency Diagnostics</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    Healthy (16.4%)
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Franchise-wide labor expense currently stands at <strong>16.4%</strong> of gross revenue (Benchmark threshold: &lt;18%). Chennai and Bandra units boast top revenue per labor hour (₹1,420/hr).
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500">Top Headcount ROI: <strong>Chennai T Nagar</strong></span>
                  <span className="text-xs font-bold text-indigo-600">Optimal Staffing</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Staff Member</h3>
            <p className="text-xs text-slate-500 mb-4">Register an employee profile with assigned outlet and role.</p>

            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Head Chef">Head Chef</option>
                    <option value="Sous Chef">Sous Chef</option>
                    <option value="Outlet Manager">Outlet Manager</option>
                    <option value="Kitchen Helper">Kitchen Helper</option>
                    <option value="Service Host">Service Host</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Assign Outlet</label>
                  <select
                    value={targetOutletId}
                    onChange={(e) => setTargetOutletId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    {outlets.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Attendance %</label>
                  <input
                    type="number"
                    value={newAttendance}
                    onChange={(e) => setNewAttendance(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Performance Score (0-100)</label>
                  <input
                    type="number"
                    value={newScore}
                    onChange={(e) => setNewScore(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  Save Staff Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

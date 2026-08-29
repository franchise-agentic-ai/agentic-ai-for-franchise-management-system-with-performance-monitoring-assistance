import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Store, 
  CheckCircle2, 
  KeyRound, 
  X, 
  MoreVertical,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  getActiveBusiness, 
  getTenantMembers, 
  inviteTenantMember, 
  getTenantOutlets 
} from '../services/tenantService';
import { BusinessMember, UserRole, Outlet } from '../types';
import { cn } from '../lib/utils';

export function TeamManagementPage() {
  const [business, setBusiness] = useState(getActiveBusiness());
  const [members, setMembers] = useState<BusinessMember[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Invite Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Franchise Manager');
  const [assignedOutlets, setAssignedOutlets] = useState<string[]>([]);

  const loadData = () => {
    const biz = getActiveBusiness();
    setBusiness(biz);
    setMembers(getTenantMembers(biz.id));
    const outs = getTenantOutlets(biz.id);
    setOutlets(outs);
    if (outs.length > 0) {
      setAssignedOutlets([outs[0].id]);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('franchiseops_tenant_changed', loadData);
    return () => window.removeEventListener('franchiseops_tenant_changed', loadData);
  }, []);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    inviteTenantMember(business.id, {
      name,
      email,
      role,
      assigned_outlet_ids: assignedOutlets,
    });

    setName('');
    setEmail('');
    setIsInviteModalOpen(false);
    loadData();
  };

  const toggleOutletAssignment = (outId: string) => {
    if (assignedOutlets.includes(outId)) {
      setAssignedOutlets(assignedOutlets.filter(id => id !== outId));
    } else {
      setAssignedOutlets([...assignedOutlets, outId]);
    }
  };

  const roles: UserRole[] = ['Business Owner', 'Franchise Manager', 'Outlet Manager', 'Analyst'];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Business Team & Role Permissions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
              {members.length} Members Active
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Manage multi-unit team hierarchy, assign outlet scopes, and control role-based access for {business.name}.
          </p>
        </div>

        <Button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add Team Member
        </Button>
      </div>

      {/* TEAM MEMBERS REGISTRY */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Active Team Members ({members.length})
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-bold">User / Employee</th>
                <th className="px-6 py-3.5 font-bold">Role</th>
                <th className="px-6 py-3.5 font-bold">Assigned Outlet Scopes</th>
                <th className="px-6 py-3.5 font-bold">Joined</th>
                <th className="px-6 py-3.5 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{member.name}</div>
                        <div className="text-slate-500 text-[11px] font-mono">{member.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full font-bold text-[11px]",
                      member.role === 'Business Owner' ? "bg-purple-50 text-purple-700 border border-purple-200" :
                      member.role === 'Franchise Manager' ? "bg-indigo-50 text-indigo-700 border border-indigo-200" :
                      member.role === 'Outlet Manager' ? "bg-blue-50 text-blue-700 border border-blue-200" :
                      "bg-slate-100 text-slate-700 border border-slate-200"
                    )}>
                      {member.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {member.role === 'Business Owner' ? (
                      <span className="font-semibold text-slate-700">All Locations (Full Access)</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {member.assigned_outlet_ids.map((outId) => {
                          const o = outlets.find(item => item.id === outId);
                          return (
                            <span key={outId} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                              {o?.name || outId}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-slate-500 font-mono">{member.joined_at}</td>

                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ROLE PERMISSION HIERARCHY MATRIX */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Role-Based Access Control Matrix (RBAC)
          </CardTitle>
          <p className="text-xs text-slate-500">Fine-grained operational and AI permissions per tier.</p>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
              <tr>
                <th className="px-6 py-3">Permission Capability</th>
                <th className="px-6 py-3 text-center">Business Owner</th>
                <th className="px-6 py-3 text-center">Franchise Manager</th>
                <th className="px-6 py-3 text-center">Outlet Manager</th>
                <th className="px-6 py-3 text-center">Analyst</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {[
                { label: 'Manage Business Profile & Billing', owner: true, fm: false, om: false, an: false },
                { label: 'Add & Delete Franchise Locations', owner: true, fm: true, om: false, an: false },
                { label: 'Import / Upload Operational CSV Data', owner: true, fm: true, om: true, an: false },
                { label: 'Trigger "Analyze My Business" AI Scan', owner: true, fm: true, om: false, an: true },
                { label: 'Approve & Execute AI Recommendations', owner: true, fm: true, om: true, an: false },
                { label: 'View Analytics & Export Reports', owner: true, fm: true, om: true, an: true },
              ].map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-semibold text-slate-800">{p.label}</td>
                  <td className="px-6 py-3 text-center">{p.owner ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  <td className="px-6 py-3 text-center">{p.fm ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  <td className="px-6 py-3 text-center">{p.om ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                  <td className="px-6 py-3 text-center">{p.an ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* INVITE TEAM MEMBER MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Franchise Team Member</h3>
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  placeholder="e.g. Ramesh Reddy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  placeholder="ramesh@yourbrand.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role & Responsibility *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {role !== 'Business Owner' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Assign Outlet Scopes</label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                    {outlets.map((o) => {
                      const isAssigned = assignedOutlets.includes(o.id);
                      return (
                        <div 
                          key={o.id}
                          onClick={() => toggleOutletAssignment(o.id)}
                          className={cn(
                            "p-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition-all",
                            isAssigned ? "bg-indigo-600 text-white" : "bg-white text-slate-700 border border-slate-200"
                          )}
                        >
                          <span>{o.name}</span>
                          {isAssigned && <Check className="w-3.5 h-3.5" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                  Create Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

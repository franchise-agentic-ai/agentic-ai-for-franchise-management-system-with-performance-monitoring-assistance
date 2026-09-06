import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Building2, Plus, ChevronDown, Check } from 'lucide-react';
import { FranchiseOpsLogo } from '../brand/FranchiseOpsLogo';
import { getActiveBusiness, getAllBusinesses, setActiveBusiness } from '../../services/tenantService';
import { BusinessProfile } from '../../types';
import { cn } from '../../lib/utils';

export function TopNav() {
  const navigate = useNavigate();
  const [activeBiz, setActiveBiz] = useState<BusinessProfile>(getActiveBusiness());
  const [businesses, setBusinesses] = useState<BusinessProfile[]>(getAllBusinesses());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const refreshTenant = () => {
    setActiveBiz(getActiveBusiness());
    setBusinesses(getAllBusinesses());
  };

  useEffect(() => {
    refreshTenant();
    window.addEventListener('franchiseops_tenant_changed', refreshTenant);
    return () => window.removeEventListener('franchiseops_tenant_changed', refreshTenant);
  }, []);

  const handleSelectBusiness = (b: BusinessProfile) => {
    setActiveBusiness(b);
    setDropdownOpen(false);
  };

  return (
    <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-20">
      {/* Search Input */}
      <div className="flex-1 flex items-center max-w-xl">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border border-slate-200 py-1.5 pl-9 pr-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-xs sm:text-sm bg-slate-50/50"
            placeholder="Search across outlets, sales, staff rosters, or AI recommendations..."
          />
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="ml-4 flex items-center gap-3">
        {/* Multi-Tenant Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="max-w-32 truncate">{activeBiz.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                Switch Franchise Tenant
              </div>
              <div className="max-h-48 overflow-y-auto">
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBusiness(b)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer",
                      b.id === activeBiz.id ? "bg-indigo-50/50 font-bold text-indigo-600" : "text-slate-700"
                    )}
                  >
                    <div className="truncate">
                      <div>{b.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{b.city}, {b.industry}</div>
                    </div>
                    {b.id === activeBiz.id && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                <Link
                  to="/onboarding"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-1.5 w-full text-left px-2 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Onboard New Business
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* AI Copilot Quick Launch */}
        <Link to="/dashboard/intelligence">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer shadow-2xs">
            <FranchiseOpsLogo className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>
        </Link>

        {/* Notifications */}
        <button 
          onClick={() => navigate('/dashboard/recommendations')}
          className="relative p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

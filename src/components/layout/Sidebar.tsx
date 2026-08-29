import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  TrendingUp, 
  BrainCircuit, 
  Lightbulb, 
  Users, 
  Settings, 
  Building2,
  PlusCircle,
  Zap,
  Package,
  Megaphone,
  DollarSign,
  AlertOctagon,
  Bot,
  Flame,
  FileBarChart,
  ChevronDown,
  ChevronRight,
  Sparkles,
  BarChart3,
  CalendarCheck,
  Truck,
  Compass,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getActiveBusiness, getTenantInventory, getTenantAudits } from '../../services/tenantService';
import { BusinessProfile } from '../../types';

interface NavTreeItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  children?: {
    name: string;
    path: string;
    badge?: string | number;
    badgeColor?: string;
  }[];
}

export function Sidebar() {
  const location = useLocation();
  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'Outlets': true,
    'Inventory': true,
    'Staff': false,
    'Marketing': false,
    'Finance': true,
    'Risk Center': true,
  });

  const [lowStockCount, setLowStockCount] = useState<number>(3);

  useEffect(() => {
    const handleTenantChange = () => {
      const biz = getActiveBusiness();
      setBusiness(biz);
      const inv = getTenantInventory(biz.id);
      const low = inv.filter(i => i.status === 'Low Stock' || i.status === 'Stockout Risk').length;
      setLowStockCount(low || 3);
    };
    window.addEventListener('franchiseops_tenant_changed', handleTenantChange);
    return () => window.removeEventListener('franchiseops_tenant_changed', handleTenantChange);
  }, []);

  const toggleExpand = (name: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Keep active section open based on current path
  useEffect(() => {
    const current = location.pathname;
    if (current.includes('/outlets')) setExpandedItems(p => ({ ...p, 'Outlets': true }));
    if (current.includes('/inventory')) setExpandedItems(p => ({ ...p, 'Inventory': true }));
    if (current.includes('/staff')) setExpandedItems(p => ({ ...p, 'Staff': true }));
    if (current.includes('/marketing')) setExpandedItems(p => ({ ...p, 'Marketing': true }));
    if (current.includes('/finance')) setExpandedItems(p => ({ ...p, 'Finance': true }));
    if (current.includes('/risk-center') || current.includes('/risk')) setExpandedItems(p => ({ ...p, 'Risk Center': true }));
  }, [location.pathname]);

  const navItems: NavTreeItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Outlets',
      path: '/dashboard/outlets',
      icon: Store,
      children: [
        { name: 'All Outlets', path: '/dashboard/outlets?tab=all' },
        { name: 'Outlet Performance', path: '/dashboard/outlets?tab=performance' },
        { name: 'Outlet Comparison', path: '/dashboard/outlets?tab=comparison' },
        { name: 'Health Scores', path: '/dashboard/outlets?tab=health-scores' },
      ]
    },
    {
      name: 'Inventory',
      path: '/dashboard/inventory',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      children: [
        { name: 'Stock Overview', path: '/dashboard/inventory?tab=stock' },
        { name: 'Demand Forecast', path: '/dashboard/inventory?tab=forecast' },
        { name: 'Low Stock', path: '/dashboard/inventory?tab=low-stock', badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-500/20 text-amber-300' },
        { name: 'Reorder Recommendations', path: '/dashboard/inventory?tab=reorder' },
      ]
    },
    {
      name: 'Staff',
      path: '/dashboard/staff',
      icon: Users,
      children: [
        { name: 'Staff Performance', path: '/dashboard/staff?tab=performance' },
        { name: 'Attendance', path: '/dashboard/staff?tab=attendance' },
        { name: 'Workforce Insights', path: '/dashboard/staff?tab=insights' },
      ]
    },
    {
      name: 'Marketing',
      path: '/dashboard/marketing',
      icon: Megaphone,
      children: [
        { name: 'Campaigns', path: '/dashboard/marketing?tab=campaigns' },
        { name: 'Campaign Performance', path: '/dashboard/marketing?tab=performance' },
        { name: 'Marketing ROI', path: '/dashboard/marketing?tab=roi' },
      ]
    },
    {
      name: 'Finance',
      path: '/dashboard/finance',
      icon: DollarSign,
      children: [
        { name: 'Revenue', path: '/dashboard/finance?tab=revenue' },
        { name: 'Expenses', path: '/dashboard/finance?tab=expenses' },
        { name: 'Profitability', path: '/dashboard/finance?tab=profitability' },
        { name: 'Forecasts', path: '/dashboard/finance?tab=forecasts' },
      ]
    },
    {
      name: 'Risk Center',
      path: '/dashboard/risk-center',
      icon: AlertOctagon,
      badge: '2 alerts',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      children: [
        { name: 'Alerts', path: '/dashboard/risk-center?tab=alerts', badge: 2, badgeColor: 'bg-rose-500/20 text-rose-300' },
        { name: 'Anomalies', path: '/dashboard/risk-center?tab=anomalies' },
        { name: 'At-Risk Outlets', path: '/dashboard/risk-center?tab=at-risk', badge: 'KP & Ind.', badgeColor: 'bg-rose-500/20 text-rose-300' },
      ]
    },
    {
      name: 'AI Copilot',
      path: '/dashboard/copilot',
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-indigo-500/30 text-indigo-300 border-indigo-500/40',
    },
    {
      name: 'Recommendations',
      path: '/dashboard/recommendations',
      icon: Lightbulb,
      badge: '4 Active',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      name: 'Action Center',
      path: '/dashboard/action-center',
      icon: Flame,
      badge: '3 Ready',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      name: 'Reports',
      path: '/dashboard/reports',
      icon: FileBarChart,
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      icon: Settings,
    }
  ];

  const isParentActive = (item: NavTreeItem) => {
    if (item.path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(item.path);
  };

  const isChildActive = (childPath: string) => {
    const [pathPart, queryPart] = childPath.split('?');
    if (location.pathname !== pathPart) return false;
    if (!queryPart) return !location.search;
    const searchParams = new URLSearchParams(location.search);
    const expectedParams = new URLSearchParams(queryPart);
    for (const [key, value] of expectedParams.entries()) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  };

  return (
    <aside className="w-64 bg-slate-950 flex-shrink-0 flex flex-col min-h-full border-r border-slate-800/80 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="h-[72px] flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <Link to="/dashboard" className="flex items-center gap-2.5 text-white font-black text-base tracking-tight group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <BrainCircuit className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              FranchiseOps AI
            </span>
            <span className="text-[9px] font-bold text-indigo-400 tracking-wider uppercase">Enterprise OS</span>
          </div>
        </Link>
      </div>

      {/* Active Franchise Unit Indicator */}
      <div className="px-3.5 pt-3.5 pb-2">
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition-colors flex items-center justify-between shadow-inner">
          <div className="overflow-hidden pr-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Active Franchise</span>
            </div>
            <span className="text-xs font-bold text-white truncate block mt-0.5">{business.name}</span>
          </div>
          <Link 
            to="/onboarding" 
            title="Switch / Register Franchise" 
            className="text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg p-1.5 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Hierarchy Tree Navigation - scrolls with page, no internal overflow scroll */}
      <div className="py-2 px-2.5 space-y-1 flex-1">
        <div className="px-2 pb-1 pt-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">OPERATIONAL TREE</span>
        </div>

        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems[item.name];
          const activeParent = isParentActive(item);

          return (
            <div key={item.name} className="space-y-0.5">
              <div
                className={cn(
                  "group flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer",
                  activeParent && !hasChildren
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : activeParent && hasChildren
                    ? "bg-slate-900 text-white border border-slate-800"
                    : "hover:bg-slate-900/80 hover:text-white text-slate-400"
                )}
                onClick={() => {
                  if (hasChildren) {
                    toggleExpand(item.name);
                  }
                }}
              >
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className="flex items-center gap-2.5 flex-1 overflow-hidden"
                  onClick={() => {
                    if (hasChildren) {
                      setExpandedItems(p => ({ ...p, [item.name]: true }));
                    }
                  }}
                >
                  <item.icon className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    activeParent ? "text-indigo-400 group-hover:text-indigo-300" : "text-slate-400 group-hover:text-white"
                  )} />
                  <span className="truncate">{item.name}</span>
                </NavLink>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-md text-[10px] font-bold border",
                      item.badgeColor || "bg-indigo-900/50 text-indigo-300 border-indigo-700/50"
                    )}>
                      {item.badge}
                    </span>
                  )}
                  {hasChildren && (
                    <button 
                      type="button"
                      onClick={(e) => toggleExpand(item.name, e)}
                      className="p-0.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-items (Tree branches) */}
              {hasChildren && isExpanded && (
                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-800/80 ml-4.5 my-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {item.children!.map((child) => {
                    const activeChild = isChildActive(child.path);
                    return (
                      <NavLink
                        key={child.name}
                        to={child.path}
                        className={cn(
                          "flex items-center justify-between px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-all",
                          activeChild 
                            ? "bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30"
                            : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                        )}
                      >
                        <span className="truncate">{child.name}</span>
                        {child.badge !== undefined && (
                          <span className={cn(
                            "px-1.5 py-0.2 rounded text-[9px] font-bold",
                            child.badgeColor || "bg-slate-800 text-slate-300"
                          )}>
                            {child.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Profile inside sidebar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 mt-auto">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-black text-xs shadow-sm">
            {business.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="text-xs font-bold text-white truncate">{business.name}</span>
            <span className="text-[10px] text-indigo-400 font-semibold truncate">Multi-Unit HQ</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

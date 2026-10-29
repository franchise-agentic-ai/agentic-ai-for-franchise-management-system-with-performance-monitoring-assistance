import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield } from 'lucide-react';
import { FranchiseOpsLogo } from '../brand/FranchiseOpsLogo';

export function GlobalFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800/80 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group select-none">
              <FranchiseOpsLogo className="w-9 h-9 group-hover:scale-105 transition-transform duration-200 drop-shadow-md" />
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">FranchiseOps AI</span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                  Agentic OS
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              AI-powered franchise management and performance intelligence across multi-unit operations, real-time supply chain buffers, and frontline staffing.
            </p>

            <div className="pt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">All Multi-Agent Telemetry Systems Operational</span>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/dashboard" className="hover:text-orange-400 transition-colors">Dashboard</Link></li>
              <li><Link to="/dashboard/outlets" className="hover:text-orange-400 transition-colors">Outlets</Link></li>
              <li><Link to="/dashboard/inventory" className="hover:text-orange-400 transition-colors">Inventory</Link></li>
              <li><Link to="/dashboard/staff" className="hover:text-orange-400 transition-colors">Staff</Link></li>
              <li><Link to="/dashboard/marketing" className="hover:text-orange-400 transition-colors">Marketing</Link></li>
              <li><Link to="/dashboard/finance" className="hover:text-orange-400 transition-colors">Finance</Link></li>
              <li><Link to="/dashboard/risk-center" className="hover:text-orange-400 transition-colors">Risk Center</Link></li>
              <li><Link to="/dashboard/copilot" className="hover:text-orange-400 transition-colors">AI Copilot</Link></li>
            </ul>
          </div>

          {/* Column 3: Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Solutions</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/solutions/franchise-growth" className="hover:text-orange-400 transition-colors">Franchise Growth Hub</Link></li>
              <li><Link to="/solutions/sop-playbook" className="hover:text-orange-400 transition-colors">SOP & Playbook Center</Link></li>
              <li><Link to="/solutions/operations-intelligence" className="hover:text-orange-400 transition-colors">Operations Intelligence Hub</Link></li>
              <li><Link to="/solutions/compliance-audit" className="hover:text-orange-400 transition-colors">Compliance & Audit Center</Link></li>
              <li><Link to="/solutions/team-onboarding" className="hover:text-orange-400 transition-colors">Team Onboarding Hub</Link></li>
            </ul>
          </div>

          {/* Column 4: Company & Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm mb-6">
              <li><Link to="/" className="hover:text-orange-400 transition-colors">About</Link></li>
              <li><Link to="/demo" className="hover:text-orange-400 transition-colors">Contact</Link></li>
              <li><Link to="/pricing" className="hover:text-orange-400 transition-colors">Pricing</Link></li>
              <li><Link to="/demo" className="hover:text-orange-400 transition-colors">Book a Demo</Link></li>
            </ul>

            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/dashboard/reports" className="hover:text-orange-400 transition-colors">Reports & Dossiers</Link></li>
              <li><Link to="/dashboard/copilot" className="hover:text-orange-400 transition-colors">AI Insights</Link></li>
              <li><Link to="/dashboard/action-center" className="hover:text-orange-400 transition-colors">Action Center</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} FranchiseOps AI Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link to="/pricing" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link to="/pricing" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link to="/pricing" className="hover:text-slate-400 transition-colors">Security & Trust</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

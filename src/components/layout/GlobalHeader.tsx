import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrainCircuit, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export function GlobalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all duration-200 select-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        {/* Left: Branding & Subtitle - positioned at FAR LEFT */}
        <Link
          to="/"
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b3d] via-[#f05a28] to-[#d94814] flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                FranchiseOps AI
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-700 rounded-full border border-orange-200/80 leading-none">
                AGENTIC OS
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 hidden sm:block mt-1 leading-none">
              Franchise Management & Performance Intelligence
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          <Link 
            to="/dashboard" 
            className={cn(
              "text-sm font-semibold transition-colors",
              location.pathname.startsWith('/dashboard') 
                ? "text-[#ff6b3d] font-bold" 
                : "text-slate-700 hover:text-[#ff6b3d]"
            )}
          >
            Platform
          </Link>
          <Link 
            to="/dashboard/intelligence" 
            className="text-sm font-semibold text-slate-700 hover:text-[#ff6b3d] transition-colors"
          >
            Solutions
          </Link>
          <Link 
            to="/pricing" 
            className={cn(
              "text-sm font-semibold transition-colors",
              location.pathname === '/pricing' 
                ? "text-[#ff6b3d] font-bold" 
                : "text-slate-700 hover:text-[#ff6b3d]"
            )}
          >
            Pricing
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-[#ff6b3d] transition-colors"
          >
            <span>Live Demo App</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-md border border-emerald-200">
              Interactive
            </span>
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {!isDashboard && (
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-[#ff6b3d] px-3.5 py-2 rounded-lg hover:bg-slate-100/80 transition-all"
            >
              Sign In
            </Link>
          )}
          <Link to="/demo">
            <Button className="bg-[#ff6b3d] hover:bg-[#e85a2d] text-white font-semibold text-sm rounded-full px-5 py-2.5 shadow-md shadow-orange-500/25 transition-all hover:scale-105 active:scale-95">
              Book a Demo
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Hamburger Button */}
        <button
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col space-y-3">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-800 hover:text-[#ff6b3d] py-1"
            >
              Platform (Dashboard)
            </Link>
            <Link
              to="/dashboard/intelligence"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-800 hover:text-[#ff6b3d] py-1"
            >
              Solutions
            </Link>
            <Link
              to="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-800 hover:text-[#ff6b3d] py-1"
            >
              Pricing
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-[#ff6b3d] py-1"
            >
              <span>Live Demo App</span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-md border border-emerald-200">
                Interactive
              </span>
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            {!isDashboard && (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Sign In
              </Link>
            )}
            <Link
              to="/demo"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1"
            >
              <Button className="w-full bg-[#ff6b3d] hover:bg-[#e85a2d] text-white font-semibold text-sm rounded-xl py-2.5 shadow-md shadow-orange-500/25">
                Book a Demo
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

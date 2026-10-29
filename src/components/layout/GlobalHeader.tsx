import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { FranchiseOpsLogo } from '../brand/FranchiseOpsLogo';
import { getCurrentUser, logoutUser, UserAccount } from '../../services/tenantService';
import { cn } from '../../lib/utils';

export function GlobalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(getCurrentUser());
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    const handleAuth = () => setCurrentUser(getCurrentUser());
    window.addEventListener('franchiseops_auth_changed', handleAuth);
    return () => window.removeEventListener('franchiseops_auth_changed', handleAuth);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all duration-200 select-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        {/* Left: Branding & Subtitle - positioned at FAR LEFT */}
        <Link
          to="/"
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <FranchiseOpsLogo className="w-10 h-10 group-hover:scale-105 transition-transform duration-200 shrink-0 drop-shadow-md" />
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
          <a 
            href="/#solutions" 
            className={cn(
              "text-sm font-semibold transition-colors",
              location.pathname.startsWith('/solutions')
                ? "text-[#ff6b3d] font-bold"
                : "text-slate-700 hover:text-[#ff6b3d]"
            )}
          >
            Solutions
          </a>
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
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-full px-4 py-2 shadow-sm flex items-center gap-1.5 transition-all">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Go to Dashboard ({currentUser.businessName || currentUser.name.split(' ')[0]})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {!isDashboard && (
                <Link
                  to="/login"
                  className={cn(
                    "text-sm font-semibold px-3.5 py-2 rounded-lg transition-all",
                    location.pathname === '/login'
                      ? "text-[#ff6b3d] font-bold bg-orange-50"
                      : "text-slate-700 hover:text-[#ff6b3d] hover:bg-slate-100/80"
                  )}
                >
                  Sign In
                </Link>
              )}
              <Link to="/demo">
                <Button className="bg-[#ff6b3d] hover:bg-[#e85a2d] text-white font-semibold text-sm rounded-full px-5 py-2.5 shadow-md shadow-orange-500/25 transition-all hover:scale-105 active:scale-95">
                  Book a Demo
                </Button>
              </Link>
            </>
          )}
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
            <a
              href="/#solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-slate-800 hover:text-[#ff6b3d] py-1"
            >
              Solutions
            </a>
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
            {currentUser ? (
              <div className="w-full flex items-center gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1"
                >
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl py-2.5">
                    Go to Dashboard
                  </Button>
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="p-2.5 text-slate-400 hover:text-rose-600 rounded-xl bg-slate-100"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {!isDashboard && (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex-1 text-center py-2 text-sm font-semibold rounded-xl transition-colors",
                      location.pathname === '/login'
                        ? "text-[#ff6b3d] bg-orange-50 font-bold border border-orange-200"
                        : "text-slate-700 bg-slate-100 hover:bg-slate-200"
                    )}
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
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

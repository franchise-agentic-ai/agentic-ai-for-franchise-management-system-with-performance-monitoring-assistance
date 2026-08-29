import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';
import { Link } from 'react-router-dom';
import { Search, FileText, PlayCircle, GraduationCap, CheckSquare, LineChart, Settings, Lock, Award, Zap, Star, MapPin, AlertTriangle, BrainCircuit, TrendingUp, Users, Target, CheckCircle2, AlertCircle, Sparkles, Store, Megaphone, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { mockInsights } from '../services/mockData';

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      {/* CLEAR TOP HEADER */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-md shadow-slate-900/5 py-3 border-b border-slate-200/90"
          : "bg-white/90 backdrop-blur-md shadow-xs py-4 border-b border-orange-100/80"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Platform Name */}
          <Link
            to="/"
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b3d] via-[#f05a28] to-[#d94814] flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">FranchiseOps AI</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                  Agentic OS
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 hidden md:block">
                Franchise Management & Performance Intelligence
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#platform" className="text-sm font-semibold text-slate-700 hover:text-[#ff6b3d] transition-colors">
              Platform
            </a>
            <a href="#solutions" className="text-sm font-semibold text-slate-700 hover:text-[#ff6b3d] transition-colors">
              Solutions
            </a>
            <Link to="/pricing" className="text-sm font-semibold text-slate-700 hover:text-[#ff6b3d] transition-colors">
              Pricing
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-[#ff6b3d] transition-colors"
            >
              Live Demo App
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-md border border-emerald-200">
                Interactive
              </span>
            </Link>
          </nav>

          {/* Action / CTA Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-[#ff6b3d] px-4 py-2 rounded-lg hover:bg-slate-100/80 transition-all"
            >
              Sign In
            </Link>
            <Link to="/demo">
              <Button className="bg-[#ff6b3d] hover:bg-[#e85a2d] text-white font-semibold text-sm rounded-full px-5 py-2.5 shadow-md shadow-orange-500/25 transition-all hover:scale-105 active:scale-95">
                Book a Demo
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-white p-6 flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <Link
                to="/"
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <BrainCircuit className="w-6 h-6 text-[#ff6b3d]" />
                <span className="font-bold text-xl">FranchiseOps AI</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-6 h-6 text-slate-600" /></button>
            </div>
            <nav className="flex flex-col gap-6 text-lg font-medium text-slate-800">
              <a href="#platform" onClick={() => setMobileMenuOpen(false)}>Platform</a>
              <a href="#solutions" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/demo" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#ff6b3d] text-white hover:bg-[#e85a2d] py-3 rounded-xl mt-4">Book a Demo</Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* HERO SECTION WITH OPERANDI0 WARM GRADIENT */}
        <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden bg-gradient-to-b from-[#fff6f1] via-[#fff8f4] to-slate-50">
          {/* Subtle background warm ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[650px] bg-gradient-to-b from-[#ffe9dc]/70 via-[#fff6f1]/40 to-transparent blur-3xl -z-10 rounded-full opacity-80 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 text-center">
            {/* Top Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-orange-200/80 text-xs sm:text-sm font-semibold text-slate-700 mb-6 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#ff6b3d]" />
              The Agentic Franchise & Multi-Unit Management Platform
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.08]"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5722] via-[#ff7043] to-[#e64a19]">AI-Powered Intelligence</span> for Smarter Franchise Operations
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
            >
              Connect your franchise data, teams, inventory and operations in one intelligent platform that helps every location perform better.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/demo" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto text-base px-8 py-4 h-auto rounded-full bg-[#ff6b3d] hover:bg-[#e85a2d] text-white shadow-xl shadow-orange-500/25 font-semibold transition-all hover:scale-105 active:scale-95">
                  Book a demo
                </Button>
              </Link>
              <a href="#platform" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto text-base px-8 py-4 h-auto rounded-full bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-semibold shadow-xs transition-all">
                  Explore Platform
                </Button>
              </a>
            </motion.div>
          </div>

          {/* HERO VISUALIZATION */}
          <div className="relative mt-10 md:mt-14 w-full max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8">
            <RotatingHeroMockup />
          </div>
        </section>

        {/* PLATFORM SECTION */}
        <section id="platform" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">Everything you need to operate a smarter franchise network</h2>
              <p className="text-lg text-slate-600">Specialized AI agents continuously monitor operations and provide actionable recommendations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon={<TrendingUp />} 
                title="Outlet Performance" 
                desc="Monitors revenue, targets, and growth across all locations." 
                href="/dashboard/outlets"
                isPrimary
              />
              <FeatureCard icon={<Store />} title="Inventory Agent" desc="Predicts demand and detects stock shortages before they happen." href="/dashboard/inventory" />
              <FeatureCard icon={<Users />} title="Staff Agent" desc="Analyzes workforce performance and staffing optimizations." href="/dashboard/staff" />
              <FeatureCard icon={<Megaphone />} title="Marketing Agent" desc="Tracks campaign ROI and customer acquisition metrics." href="/dashboard/marketing" />
              <FeatureCard icon={<CheckCircle2 />} title="Audit Agent" desc="Automates operational compliance and issue resolution." href="/dashboard/audits" />
              <FeatureCard icon={<BrainCircuit />} title="AI Insights" desc="Cross-domain analysis linking operational metrics to business outcomes." href="/dashboard/insights" />
              <FeatureCard icon={<Target />} title="Recommendations" desc="Human-in-the-loop workflows for executing high-impact actions." href="/dashboard/recommendations" />
              <FeatureCard icon={<AlertCircle />} title="Alert Center" desc="Enterprise-grade alerting for critical operational risks." href="/dashboard/alerts" />
            </div>
          </div>
        </section>

        {/* COLLABORATIVE ONBOARDING & OPERATIONS SECTION (Operandi0 Style) */}
        <section id="solutions" className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold mb-6 border border-orange-200/60">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff6b3d]" />
                  Collaborative Operations & Compliance
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                  Systemize collaborative onboarding and manage legal compliance
                </h2>
                <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
                  The platform seamlessly connects leadership, field directors, and store managers into real-time operational workflows with automated compliance and issue resolution.
                </p>

                <div className="space-y-4">
                  <FeatureLink title="Franchise Growth Hub" href="/demo" />
                  <FeatureLink title="SOP & Playbook Center" href="/demo" />
                  <FeatureLink title="Operations Intelligence Hub" href="/demo" />
                  <FeatureLink title="Compliance & Audit Center" href="/demo" />
                  <FeatureLink title="Team Onboarding Hub" href="/demo" />
                </div>
              </div>

              {/* Right Side: High-res Team Collaboration Photo with Warm Curves matching Operandi0 */}
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/10 border border-orange-100/80 bg-gradient-to-br from-[#ff6b3d]/10 via-[#ffe9dc]/20 to-white p-2 sm:p-3">
                  <img
                    src="/collaborative-team-tablet.jpg"
                    alt="Franchise Operations Team Collaborating with Tablet"
                    className="w-full h-auto object-cover rounded-2xl select-none"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* FINAL CTA SECTION */}
        <section id="contact" className="py-24 bg-gradient-to-b from-white to-[#fff6f1] border-t border-orange-100/60 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs sm:text-sm font-semibold text-orange-600 mb-6 shadow-xs">
              <Sparkles className="w-4 h-4 text-[#ff6b3d]" />
              Start Scaling Your Franchise Network Today
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              Ready to turn franchise operations into your competitive advantage?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join leading multi-unit brands using Agentic AI to automate performance monitoring, optimize frontline operations, and scale with confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/demo" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto text-base px-8 py-4 h-auto rounded-full bg-[#ff6b3d] hover:bg-[#e85a2d] text-white shadow-xl shadow-orange-500/25 font-semibold transition-all hover:scale-105 active:scale-95">
                  Book a Demo
                </Button>
              </Link>
              <a href="#platform" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto text-base px-8 py-4 h-auto rounded-full bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-semibold shadow-xs transition-all">
                  Explore Platform
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-slate-900 py-16 border-t border-slate-800 text-slate-400">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <BrainCircuit className="w-6 h-6 text-indigo-500" />
                <span className="font-bold text-xl tracking-tight text-white">FranchiseOps AI</span>
              </div>
              <p className="text-sm max-w-sm">Agentic AI for Franchise Management System with Performance Monitoring Assistance.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/dashboard/outlets" className="hover:text-white transition-colors">Outlets</Link></li>
                <li><Link to="/dashboard/insights" className="hover:text-white transition-colors">AI Insights</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Subcomponents for the Landing Page

function FeatureLink({ title, href }: { title: string, href: string }) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-3 text-slate-800 font-semibold text-base sm:text-lg hover:text-[#ff6b3d] transition-colors py-1.5"
    >
      <span className="text-[#ff6b3d] font-bold text-xl transition-transform group-hover:translate-x-1.5">→</span>
      <span className="underline decoration-slate-300 group-hover:decoration-[#ff6b3d] underline-offset-4">{title}</span>
    </Link>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  desc, 
  href, 
  isPrimary 
}: { 
  icon: React.ReactNode; 
  title: string; 
  desc: string; 
  href?: string; 
  isPrimary?: boolean;
}) {
  const content = (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        "p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-full group",
        isPrimary
          ? "bg-white border-indigo-200 shadow-md shadow-indigo-500/5 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 ring-2 ring-indigo-500/10"
          : "bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50"
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className={cn(
            "w-12 h-12 rounded-xl shadow-xs border flex items-center justify-center transition-transform group-hover:scale-110 duration-200",
            isPrimary ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/20" : "bg-white border-slate-100 text-indigo-600"
          )}>
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" })}
          </div>

          {isPrimary && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-700">
              Live Agent
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
          <span>{title}</span>
          {href && <span className="text-xs font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">Launch →</span>}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
      </div>

      {href && (
        <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
          <span>Open Dashboard Workspace</span>
          <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
        </div>
      )}
    </motion.div>
  );

  if (href) {
    return (
      <Link to={href} className="block h-full cursor-pointer select-none">
        {content}
      </Link>
    );
  }

  return content;
}

function FlowStep({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex flex-shrink-0 items-center justify-center font-bold text-sm border border-indigo-500/30">
        {num}
      </div>
      <div>
        <h4 className="text-white font-semibold mb-1">{title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function PricingCard({ title, price, desc, isPopular }: { title: string, price: string, desc: string, isPopular?: boolean }) {
  return (
    <div className={cn("p-8 rounded-3xl border bg-white flex flex-col", isPopular ? "border-[#ff6b3d] shadow-xl shadow-orange-100/60 relative ring-1 ring-[#ff6b3d]/20" : "border-slate-200 shadow-xs")}>
      {isPopular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-[#ff6b3d] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-xs">Most Popular</div>}
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <div className="mb-4">
        <span className="text-4xl font-extrabold text-slate-900">{price}</span>
        {price !== 'Custom' && <span className="text-slate-500">/mo</span>}
      </div>
      <p className="text-slate-600 text-sm mb-8">{desc}</p>
      <div className="flex-1" />
      <Link to="/demo">
        <Button className={cn("w-full py-3 h-auto rounded-xl font-semibold", isPopular ? "bg-[#ff6b3d] text-white hover:bg-[#e85a2d] shadow-md shadow-orange-500/20" : "bg-slate-100 text-slate-900 hover:bg-slate-200")}>
          {price === 'Custom' ? 'Contact Sales' : 'Get Started'}
        </Button>
      </Link>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset", className)}>{children}</span>;
}

// REAL Uploaded Dashboard Screenshot Assets (3 images: Gusto Pro, Green Harvest Farms, Nitro Circuit)
const DASHBOARD_SCREENSHOTS = [
  "/hero-dashboard-1.png?v=3",
  "/hero-dashboard-2.png?v=3",
  "/hero-dashboard-3.png?v=3"
];

interface CornerPopupData {
  id: string;
  role: string;
  subtitle: string;
  metric: string;
  metricColor: string;
  initials: string;
  gradientClass: string;
  positionClasses: string;
  floatPathX: number[];
  floatPathY: number[];
  floatRotate: number[];
  durationX: number;
  durationY: number;
  durationRotate: number;
  delay: number;
  cursorFactorX: number;
  cursorFactorY: number;
  springStiffness: number;
  springDamping: number;
}

const DASHBOARD_POPUPS: Record<number, CornerPopupData[]> = {
  // Slide 0: Gusto Pro (Restaurant & Culinary Franchise Ops)
  0: [
    {
      id: "gusto-tl",
      role: "Culinary Directors",
      subtitle: "Gusto Pro Kitchen Ops",
      metric: "99.4% Recipe Compliance",
      metricColor: "text-emerald-700 bg-emerald-50 border-emerald-200/80",
      initials: "CD",
      gradientClass: "from-[#ff6b3d] to-[#d94814]",
      positionClasses: "top-3 sm:top-5 md:top-7 left-3 sm:left-5 md:left-7",
      floatPathX: [0, 11, -8, 5, -10, 0],
      floatPathY: [0, -9, 7, -11, 4, 0],
      floatRotate: [0, 2.2, -1.8, 1.2, 0],
      durationX: 6.4,
      durationY: 5.2,
      durationRotate: 7.1,
      delay: 0,
      cursorFactorX: 25,
      cursorFactorY: 21,
      springStiffness: 160,
      springDamping: 16
    },
    {
      id: "gusto-tr",
      role: "Field Ops Leaders",
      subtitle: "Multi-Unit Live Telemetry",
      metric: "+14.2% MoM Revenue",
      metricColor: "text-orange-700 bg-orange-50 border-orange-200/80",
      initials: "FO",
      gradientClass: "from-emerald-500 to-teal-600",
      positionClasses: "top-3 sm:top-5 md:top-7 right-3 sm:right-5 md:right-7",
      floatPathX: [0, -13, 8, -6, 10, 0],
      floatPathY: [0, 10, -8, 11, -5, 0],
      floatRotate: [0, -2.5, 1.8, -1.4, 0],
      durationX: 7.6,
      durationY: 6.5,
      durationRotate: 8.4,
      delay: 1.2,
      cursorFactorX: 20,
      cursorFactorY: 26,
      springStiffness: 120,
      springDamping: 21
    },
    {
      id: "gusto-bl",
      role: "Kitchen Shift Admins",
      subtitle: "AI Waste Prevention Agent",
      metric: "Inventory Sync: 100% On-Track",
      metricColor: "text-indigo-700 bg-indigo-50 border-indigo-200/80",
      initials: "KA",
      gradientClass: "from-blue-500 to-indigo-600",
      positionClasses: "bottom-3 sm:bottom-5 md:bottom-7 left-3 sm:left-5 md:left-7",
      floatPathX: [0, 10, -12, 7, -5, 0],
      floatPathY: [0, 8, -10, 6, -8, 0],
      floatRotate: [0, 1.9, -2.2, 1.5, 0],
      durationX: 5.6,
      durationY: 7.1,
      durationRotate: 6.8,
      delay: 2.3,
      cursorFactorX: 28,
      cursorFactorY: 17,
      springStiffness: 145,
      springDamping: 18
    },
    {
      id: "gusto-br",
      role: "Store General Managers",
      subtitle: "Frontline Shift Execution",
      metric: "4.9★ Customer Quality Score",
      metricColor: "text-amber-700 bg-amber-50 border-amber-200/80",
      initials: "GM",
      gradientClass: "from-amber-500 to-orange-600",
      positionClasses: "bottom-3 sm:bottom-5 md:bottom-7 right-3 sm:right-5 md:right-7",
      floatPathX: [0, -11, 9, -13, 6, 0],
      floatPathY: [0, -11, 7, -8, 10, 0],
      floatRotate: [0, -2.0, 2.4, -1.6, 0],
      durationX: 8.1,
      durationY: 5.8,
      durationRotate: 9.0,
      delay: 3.5,
      cursorFactorX: 22,
      cursorFactorY: 24,
      springStiffness: 95,
      springDamping: 24
    }
  ],

  // Slide 1: Green Harvest Farms (Vertical Hydroponics & Farm Hygiene Operations)
  1: [
    {
      id: "gh-tl",
      role: "Farm Hygiene & Safety Lead",
      subtitle: "Vertical Hydroponics Hub",
      metric: "Contamination Control: 100% Passed",
      metricColor: "text-emerald-700 bg-emerald-50 border-emerald-200/80",
      initials: "FH",
      gradientClass: "from-emerald-600 to-teal-700",
      positionClasses: "top-3 sm:top-5 md:top-7 left-3 sm:left-5 md:left-7",
      floatPathX: [0, 12, -7, 6, -9, 0],
      floatPathY: [0, -10, 8, -6, 5, 0],
      floatRotate: [0, 2.1, -1.9, 1.4, 0],
      durationX: 6.1,
      durationY: 5.4,
      durationRotate: 7.5,
      delay: 0.3,
      cursorFactorX: 24,
      cursorFactorY: 22,
      springStiffness: 155,
      springDamping: 17
    },
    {
      id: "gh-tr",
      role: "Master Grow Ops Director",
      subtitle: "12 Facilities Synchronized",
      metric: "Climate & Yield AI Active",
      metricColor: "text-teal-700 bg-teal-50 border-teal-200/80",
      initials: "GO",
      gradientClass: "from-teal-500 to-cyan-600",
      positionClasses: "top-3 sm:top-5 md:top-7 right-3 sm:right-5 md:right-7",
      floatPathX: [0, -14, 9, -7, 11, 0],
      floatPathY: [0, 9, -9, 8, -6, 0],
      floatRotate: [0, -2.4, 2.0, -1.5, 0],
      durationX: 7.9,
      durationY: 6.8,
      durationRotate: 8.7,
      delay: 1.5,
      cursorFactorX: 19,
      cursorFactorY: 27,
      springStiffness: 115,
      springDamping: 22
    },
    {
      id: "gh-bl",
      role: "Cold Chain Logistics",
      subtitle: "Automated Sensor Telemetry",
      metric: "Batch Quality Verified",
      metricColor: "text-sky-700 bg-sky-50 border-sky-200/80",
      initials: "CL",
      gradientClass: "from-sky-500 to-blue-600",
      positionClasses: "bottom-3 sm:bottom-5 md:bottom-7 left-3 sm:left-5 md:left-7",
      floatPathX: [0, 11, -10, 8, -6, 0],
      floatPathY: [0, 9, -11, 7, -9, 0],
      floatRotate: [0, 2.0, -2.1, 1.6, 0],
      durationX: 5.9,
      durationY: 7.4,
      durationRotate: 6.9,
      delay: 2.7,
      cursorFactorX: 27,
      cursorFactorY: 18,
      springStiffness: 140,
      springDamping: 19
    },
    {
      id: "gh-br",
      role: "Quality Assurance Lead",
      subtitle: "Operational Audit Score",
      metric: "Safety Certified: 98.8%",
      metricColor: "text-purple-700 bg-purple-50 border-purple-200/80",
      initials: "QA",
      gradientClass: "from-purple-500 to-indigo-600",
      positionClasses: "bottom-3 sm:bottom-5 md:bottom-7 right-3 sm:right-5 md:right-7",
      floatPathX: [0, -10, 8, -12, 7, 0],
      floatPathY: [0, -10, 8, -7, 11, 0],
      floatRotate: [0, -2.2, 2.3, -1.8, 0],
      durationX: 8.4,
      durationY: 6.0,
      durationRotate: 9.3,
      delay: 3.8,
      cursorFactorX: 21,
      cursorFactorY: 25,
      springStiffness: 100,
      springDamping: 23
    }
  ],

  // Slide 2: Nitro Circuit (Gym Floor, Karting, Sports & Safety Operations)
  2: [
    {
      id: "nitro-tl",
      role: "Gym Floor & Safety Lead",
      subtitle: "Incident Prevention Protocol",
      metric: "Pass Requirement: 90% Achieved",
      metricColor: "text-orange-700 bg-orange-50 border-orange-200/80",
      initials: "GF",
      gradientClass: "from-orange-500 to-red-600",
      positionClasses: "top-3 sm:top-5 md:top-7 left-3 sm:left-5 md:left-7",
      floatPathX: [0, 13, -9, 7, -11, 0],
      floatPathY: [0, -11, 9, -8, 6, 0],
      floatRotate: [0, 2.4, -2.0, 1.5, 0],
      durationX: 6.6,
      durationY: 5.3,
      durationRotate: 7.8,
      delay: 0.2,
      cursorFactorX: 26,
      cursorFactorY: 20,
      springStiffness: 165,
      springDamping: 15
    },
    {
      id: "nitro-tr",
      role: "Member Experience Lead",
      subtitle: "Customer Satisfaction Team",
      metric: "4.9★ across 100s of reviews",
      metricColor: "text-purple-700 bg-purple-50 border-purple-200/80",
      initials: "ME",
      gradientClass: "from-violet-500 to-purple-600",
      positionClasses: "top-3 sm:top-5 md:top-7 right-3 sm:right-5 md:right-7",
      floatPathX: [0, -12, 10, -8, 9, 0],
      floatPathY: [0, 11, -7, 9, -7, 0],
      floatRotate: [0, -2.6, 1.9, -1.6, 0],
      durationX: 7.4,
      durationY: 6.3,
      durationRotate: 8.2,
      delay: 1.4,
      cursorFactorX: 21,
      cursorFactorY: 25,
      springStiffness: 125,
      springDamping: 20
    },
    {
      id: "nitro-bl",
      role: "Fleet Maintenance Techs",
      subtitle: "Kart & Equipment Diagnostics",
      metric: "Zero Downtime Protocol Active",
      metricColor: "text-blue-700 bg-blue-50 border-blue-200/80",
      initials: "FM",
      gradientClass: "from-blue-600 to-indigo-700",
      positionClasses: "bottom-3 sm:bottom-5 md:bottom-7 left-3 sm:left-5 md:left-7",
      floatPathX: [0, 12, -11, 9, -7, 0],
      floatPathY: [0, 8, -12, 8, -10, 0],
      floatRotate: [0, 2.2, -2.3, 1.7, 0],
      durationX: 5.7,
      durationY: 7.6,
      durationRotate: 6.6,
      delay: 2.5,
      cursorFactorX: 29,
      cursorFactorY: 19,
      springStiffness: 150,
      springDamping: 17
    },
    {
      id: "nitro-br",
      role: "Frontline Training Admins",
      subtitle: "Interactive Pathway Modules",
      metric: "Module 4/12 Active & Certified",
      metricColor: "text-amber-700 bg-amber-50 border-amber-200/80",
      initials: "TA",
      gradientClass: "from-amber-500 to-orange-600",
      positionClasses: "bottom-3 sm:bottom-5 md:bottom-7 right-3 sm:right-5 md:right-7",
      floatPathX: [0, -13, 7, -11, 8, 0],
      floatPathY: [0, -12, 9, -9, 8, 0],
      floatRotate: [0, -2.1, 2.5, -1.7, 0],
      durationX: 8.6,
      durationY: 5.7,
      durationRotate: 9.5,
      delay: 3.6,
      cursorFactorX: 23,
      cursorFactorY: 23,
      springStiffness: 90,
      springDamping: 25
    }
  ]
};

function RotatingHeroMockup() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Raw mouse coordinates for independent spring calculations per card
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Normalized cursor coordinate from center (-1 to 1)
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    rawMouseX.set(x);
    rawMouseY.set(y);
  };

  const handleMouseLeave = () => {
    rawMouseX.set(0);
    rawMouseY.set(0);
  };

  // Preload all dashboard images into browser memory for zero-latency transitions
  useEffect(() => {
    DASHBOARD_SCREENSHOTS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Automatically rotate displayed image every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % DASHBOARD_SCREENSHOTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const currentPopups = DASHBOARD_POPUPS[activeIndex] || DASHBOARD_POPUPS[0];

  return (
    <div
      className="relative w-full z-10 flex flex-col items-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient soft background glow */}
      <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-indigo-500/15 rounded-3xl blur-3xl -z-10 opacity-70 pointer-events-none" />

      {/* Enterprise SaaS Frame */}
      <div className="relative w-full rounded-2xl md:rounded-3xl p-1.5 sm:p-2.5 md:p-3.5 bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.12)]">
        {/* Strictly bounded showcase canvas */}
        <div className="relative w-full overflow-hidden rounded-xl md:rounded-2xl bg-slate-900/5 aspect-[16/9] flex items-center justify-center">
          {DASHBOARD_SCREENSHOTS.map((src, idx) => {
            const isActive = idx === activeIndex;
            return (
              <motion.div
                key={src}
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0,
                  scale: isActive ? 1 : 0.995,
                  zIndex: isActive ? 10 : 0
                }}
                transition={{
                  duration: 0.75,
                  ease: "easeInOut"
                }}
                className={`absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none ${
                  isActive ? 'pointer-events-auto' : ''
                }`}
              >
                <img 
                  src={src} 
                  alt={`FranchiseOps AI Enterprise Dashboard Preview ${idx + 1}`} 
                  width={1024}
                  height={576}
                  className="w-full h-full object-contain select-none rounded-lg md:rounded-xl"
                  loading="eager"
                  decoding="async"
                  style={{ 
                    imageRendering: 'auto',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                  }}
                />
              </motion.div>
            );
          })}

          {/* 4 INDEPENDENTLY MOVING CORNER POP-UP MESSAGES WITH ASYNCHRONOUS MOTION */}
          <AnimatePresence mode="popLayout">
            {currentPopups.map((popup) => (
              <CornerPopupCard
                key={`${activeIndex}-${popup.id}`}
                popup={popup}
                rawMouseX={rawMouseX}
                rawMouseY={rawMouseY}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Carousel Navigation Indicators */}
      <div className="flex items-center gap-3 mt-6">
        {DASHBOARD_SCREENSHOTS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300 focus:outline-none cursor-pointer",
              idx === activeIndex 
                ? "w-9 bg-[#ff6b3d] shadow-md shadow-orange-500/40" 
                : "w-2.5 bg-slate-300 hover:bg-slate-400"
            )}
            aria-label={`Switch to dashboard slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

interface CornerPopupCardProps {
  popup: CornerPopupData;
  rawMouseX: MotionValue<number>;
  rawMouseY: MotionValue<number>;
}

function CornerPopupCard({ popup, rawMouseX, rawMouseY }: CornerPopupCardProps) {
  // Individual spring physics for each card to ensure completely independent cursor response!
  const smoothX = useSpring(rawMouseX, {
    stiffness: popup.springStiffness,
    damping: popup.springDamping,
    mass: 0.1
  });
  const smoothY = useSpring(rawMouseY, {
    stiffness: popup.springStiffness * 0.94,
    damping: popup.springDamping * 1.06,
    mass: 0.1
  });

  const cursorOffsetX = useTransform(smoothX, (val) => val * popup.cursorFactorX);
  const cursorOffsetY = useTransform(smoothY, (val) => val * popup.cursorFactorY);
  const cursorTilt = useTransform(smoothX, (val) => val * (popup.cursorFactorX > 22 ? 3 : -2.5));

  return (
    <motion.div
      style={{
        x: cursorOffsetX,
        y: cursorOffsetY,
        rotate: cursorTilt
      }}
      className={`absolute ${popup.positionClasses} z-30 select-none hidden sm:flex pointer-events-auto`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 12 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          x: popup.floatPathX,
          y: popup.floatPathY,
          rotate: popup.floatRotate,
          transition: {
            x: {
              repeat: Infinity,
              duration: popup.durationX,
              ease: "easeInOut",
              delay: popup.delay
            },
            y: {
              repeat: Infinity,
              duration: popup.durationY,
              ease: "easeInOut",
              delay: popup.delay * 0.7
            },
            rotate: {
              repeat: Infinity,
              duration: popup.durationRotate,
              ease: "easeInOut",
              delay: popup.delay * 1.2
            },
            default: { duration: 0.5, ease: "easeOut" }
          }
        }}
        exit={{ opacity: 0, scale: 0.8, y: -10, transition: { duration: 0.3 } }}
        whileHover={{ scale: 1.07, y: -5, transition: { duration: 0.2 } }}
        className="flex items-center gap-3 sm:gap-3.5 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_12px_32px_rgba(15,23,42,0.16)] border border-slate-200/90 py-2.5 px-3.5 sm:py-3 sm:px-4 md:py-3.5 md:px-5 max-w-[290px] sm:max-w-[320px] transition-shadow duration-200 hover:shadow-[0_18px_40px_rgba(255,107,61,0.25)] cursor-default"
      >
        {/* 50% Larger Avatar Icon */}
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${popup.gradientClass} flex items-center justify-center text-white font-extrabold text-xs sm:text-sm shadow-md shadow-slate-900/10 flex-shrink-0`}>
          {popup.initials}
        </div>

        {/* Message & Metric Body */}
        <div className="flex flex-col text-left overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
              {popup.role}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate -mt-0.5">
            {popup.subtitle}
          </span>
          <div className="mt-1 flex items-center">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border ${popup.metricColor}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {popup.metric}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


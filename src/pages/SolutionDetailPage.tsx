import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  TrendingUp,
  MapPin,
  Target,
  LineChart,
  Sparkles,
  Building2,
  BookOpen,
  ShieldCheck,
  CheckSquare,
  FileText,
  Layers,
  Activity,
  BarChart3,
  Gauge,
  Users,
  AlertTriangle,
  Award,
  Workflow,
  GraduationCap,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Zap,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { FranchiseOpsLogo } from '../components/brand/FranchiseOpsLogo';
import { GlobalHeader } from '../components/layout/GlobalHeader';
import { GlobalFooter } from '../components/layout/GlobalFooter';
import { Button } from '../components/ui/Button';
import { SOLUTIONS_DATA, SolutionData, SolutionFeature } from '../data/solutionsData';

interface SolutionDetailPageProps {
  slug?: string;
}

export function SolutionDetailPage({ slug: propSlug }: SolutionDetailPageProps) {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const currentSlug = propSlug || routeSlug || 'franchise-growth';
  const solution: SolutionData = SOLUTIONS_DATA[currentSlug] || SOLUTIONS_DATA['franchise-growth'];

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSlug]);

  const relatedSolutions = (solution.relatedSlugs || [])
    .map((s) => SOLUTIONS_DATA[s])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden flex flex-col">
      {/* 1. Global Navigation Header */}
      <GlobalHeader />

      <main className="flex-1">
        {/* 2. Top Breadcrumb & Status Bar */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-[72px] z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs sm:text-sm">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
              <Link to="/" className="hover:text-slate-900 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a href="/#solutions" className="hover:text-slate-900 transition-colors">
                Solutions
              </a>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-orange-600 font-semibold truncate max-w-[200px] sm:max-w-none">
                {solution.title}
              </span>
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-500 font-semibold">
                Autonomous Telemetry Active
              </span>
            </div>
          </div>
        </div>

        {/* 3. HERO SECTION (Desktop Split-Screen, Stacked Mobile) */}
        <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-[#fff6f1] via-[#fffaf7] to-white overflow-hidden border-b border-orange-100/60">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-orange-200/40 via-amber-100/30 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Solution Identity, Heading, Description, CTAs */}
              <div className="lg:col-span-7 space-y-6">
                {/* Category Pill */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-orange-200/80 shadow-xs text-xs font-bold text-orange-600 uppercase tracking-wider"
                >
                  <FranchiseOpsLogo className="w-3.5 h-3.5" />
                  <span>{solution.category}</span>
                </motion.div>

                {/* Primary Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]"
                >
                  {solution.heading}
                </motion.h1>

                {/* Clear Explanatory Paragraph */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl"
                >
                  {solution.description}
                </motion.p>

                {/* Content Sections Checklist Quick-Pills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="pt-2 space-y-2.5"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Included Operational Capabilities:
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                    {solution.contentSections.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white/70 backdrop-blur-xs p-2 rounded-xl border border-orange-100/60 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Solution-Specific CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
                >
                  <Link to={solution.primaryCta.href}>
                    <Button className="w-full sm:w-auto text-sm sm:text-base px-7 py-3.5 h-auto rounded-full bg-[#ff6b3d] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-500/25 font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                      <span>{solution.primaryCta.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Link to={solution.secondaryCta.href}>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto text-sm sm:text-base px-6 py-3.5 h-auto rounded-full bg-white hover:bg-slate-50 border-slate-300 text-slate-700 font-semibold shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      <span>{solution.secondaryCta.label}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </Button>
                  </Link>
                </motion.div>
              </div>

              {/* Right Column: Large Professional Image with Modern Glass Frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="lg:col-span-5 relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/15 border border-orange-200/80 bg-white p-2.5 sm:p-3">
                  <img
                    src={solution.image}
                    alt={solution.imageAlt}
                    className="w-full h-auto max-h-[480px] object-cover rounded-2xl select-none"
                    loading="eager"
                  />

                  {/* Dynamic Floating Telemetry Highlights Badge */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                      <span>Live Telemetry Benchmark</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Synchronized
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
                      {solution.telemetryHighlights.map((stat, i) => (
                        <div key={i} className="px-1">
                          <div className="text-base font-extrabold text-slate-900 leading-tight">
                            {stat.metric}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate font-medium">
                            {stat.label}
                          </div>
                          <div className="text-[9px] font-bold text-orange-600 mt-0.5">
                            {stat.trend}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* 4. KEY CAPABILITIES (Feature Cards Grid) */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3 border border-indigo-100">
                <Zap className="w-3.5 h-3.5" />
                Comprehensive Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Key Capabilities & System Workflows
              </h2>
              <p className="mt-3 text-slate-600 text-base sm:text-lg">
                Engineered specifically for multi-unit franchise organizations seeking operational repeatability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solution.features.map((feature, idx) => (
                <FeatureCardComponent key={idx} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        {/* 5. BUSINESS BENEFITS & OPERATIONAL OUTCOMES */}
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-200">
                <Target className="w-3.5 h-3.5" />
                Business Value & ROI
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Measurable Operational Outcomes
              </h2>
              <p className="mt-3 text-slate-600 text-base">
                How leading franchise groups drive consistent bottom-line returns with this solution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {solution.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm shadow-slate-900/5 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mb-6 group-hover:w-20 transition-all duration-300" />
                  <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">
                    {benefit.metric}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {benefit.label}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. OPERATIONAL WORKFLOW & EXECUTION PREVIEW */}
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
          {/* Ambient Dark Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-br from-indigo-500/10 via-orange-500/10 to-transparent blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3 border border-slate-700">
                <Workflow className="w-3.5 h-3.5" />
                Step-by-Step Lifecycle
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {solution.workflow.title}
              </h2>
              <p className="mt-3 text-slate-400 text-base">
                {solution.workflow.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {solution.workflow.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/80 hover:border-orange-500/50 transition-all duration-200 relative flex flex-col justify-between"
                >
                  <div>
                    <div className="text-3xl font-extrabold text-orange-400/60 mb-4 font-mono">
                      {step.step}
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Interactive CTA strip inside Workflow */}
            <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-lg font-bold text-white">
                  Experience this workflow in the live interactive sandbox
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  Inspect real telemetry, generate AI agent suggestions, and preview store-level metrics.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                <Link to={solution.primaryCta.href} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-[#ff6b3d] hover:bg-[#e85a2d] text-white font-bold text-sm rounded-full px-6 py-3 shadow-md">
                    Launch Interactive App
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 7. RELATED SOLUTIONS GRID */}
        <section className="py-20 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1">
                  Connected Ecosystem
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Explore Other FranchiseOps AI Solutions
                </h2>
              </div>
              <a
                href="/#solutions"
                className="text-xs sm:text-sm font-bold text-[#ff6b3d] hover:text-[#e85a2d] inline-flex items-center gap-1 group"
              >
                <span>View all on landing page</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedSolutions.map((rel) => (
                <Link
                  key={rel.id}
                  to={rel.route}
                  className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-2">
                      {rel.category}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors mb-2 leading-snug">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {rel.purpose}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
                    <span>Learn more</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 8. HIGH-IMPACT BOTTOM CTA BANNER */}
        <section className="py-20 bg-gradient-to-b from-[#fff6f1] to-white border-t border-orange-100/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-orange-200/80 text-xs font-bold text-orange-600 mb-6 shadow-xs">
              <FranchiseOpsLogo className="w-3.5 h-3.5" />
              <span>Scale With Operational Predictability</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4">
              Ready to elevate your {solution.title.toLowerCase()}?
            </h2>
            
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Join top-performing franchise groups using AI-assisted operations to standardize workflows and maximize unit economics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={solution.primaryCta.href} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto text-base px-8 py-4 h-auto rounded-full bg-[#ff6b3d] hover:bg-[#e85a2d] text-white shadow-xl shadow-orange-500/25 font-bold transition-all hover:scale-105 active:scale-95">
                  {solution.primaryCta.label}
                </Button>
              </Link>
              <Link to={solution.secondaryCta.href} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-base px-8 py-4 h-auto rounded-full bg-white hover:bg-slate-50 border-slate-300 text-slate-700 font-semibold shadow-xs transition-all"
                >
                  {solution.secondaryCta.label}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Global Site Footer */}
      <GlobalFooter />
    </div>
  );
}

// Icon mapper for feature cards
function renderIcon(iconName: string) {
  const iconProps = { className: "w-5 h-5 text-indigo-600" };
  switch (iconName) {
    case 'TrendingUp': return <TrendingUp {...iconProps} />;
    case 'MapPin': return <MapPin {...iconProps} />;
    case 'Target': return <Target {...iconProps} />;
    case 'LineChart': return <LineChart {...iconProps} />;
    case 'Sparkles': return <Sparkles {...iconProps} />;
    case 'Building2': return <Building2 {...iconProps} />;
    case 'BookOpen': return <BookOpen {...iconProps} />;
    case 'ShieldCheck': return <ShieldCheck {...iconProps} />;
    case 'CheckSquare': return <CheckSquare {...iconProps} />;
    case 'FileText': return <FileText {...iconProps} />;
    case 'Layers': return <Layers {...iconProps} />;
    case 'Activity': return <Activity {...iconProps} />;
    case 'BarChart3': return <BarChart3 {...iconProps} />;
    case 'Gauge': return <Gauge {...iconProps} />;
    case 'Users': return <Users {...iconProps} />;
    case 'AlertTriangle': return <AlertTriangle {...iconProps} />;
    case 'Award': return <Award {...iconProps} />;
    case 'Workflow': return <Workflow {...iconProps} />;
    case 'GraduationCap': return <GraduationCap {...iconProps} />;
    case 'UserCheck': return <UserCheck {...iconProps} />;
    default: return <Sparkles {...iconProps} />;
  }
}

function FeatureCardComponent({ feature }: { feature: SolutionFeature }) {
  return (
    <div className="bg-slate-50/80 hover:bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-200">
            {renderIcon(feature.iconName)}
          </div>
          {feature.badge && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
              {feature.badge}
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
          {feature.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown } from 'lucide-react';
import { FranchiseOpsLogo } from '../components/brand/FranchiseOpsLogo';
import { Button } from '../components/ui/Button';
import { GlobalHeader } from '../components/layout/GlobalHeader';
import { GlobalFooter } from '../components/layout/GlobalFooter';
import { cn } from '../lib/utils';

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const plans = [
    {
      name: 'Starter',
      description: 'For emerging franchise networks scaling up to 10 locations.',
      monthlyPrice: 499,
      annualPrice: 399,
      locations: 'Up to 10 locations',
      popular: false,
      cta: 'Get Started',
      features: [
        'Up to 10 franchise outlets',
        'Outlet Performance Agent',
        'Real-time revenue & target tracking',
        'Daily dynamic health scores',
        'Standard anomaly detection',
        'Email & Slack notifications',
        'Standard 24h support'
      ]
    },
    {
      name: 'Professional',
      description: 'For growing multi-unit brands requiring autonomous cross-domain intelligence.',
      monthlyPrice: 999,
      annualPrice: 799,
      locations: 'Up to 50 locations',
      popular: true,
      cta: 'Start with Pro',
      features: [
        'Up to 50 franchise outlets',
        'All Starter features included',
        'Full Multi-Agent Suite (Inventory, Staff, Marketing, Audit)',
        'AI Root-Cause Diagnostics & Anomaly Engine',
        'Human-in-the-Loop Approval Workflows',
        'Cross-location Benchmarking & Ranking',
        'Executive Dashboard with Sparklines & KPIs',
        'Priority 24/7 Slack & Phone Support'
      ]
    },
    {
      name: 'Enterprise',
      description: 'For large-scale national and global franchises requiring custom workflows.',
      monthlyPrice: null,
      annualPrice: null,
      locations: '50+ to Unlimited locations',
      popular: false,
      cta: 'Contact Sales',
      features: [
        'Unlimited franchise locations & regions',
        'Custom AI Agent Fine-Tuning & Custom Tools',
        'Point-of-Sale (POS) & ERP API Integrations',
        'Role-Based Access Control (RBAC) & SAML SSO',
        'Dedicated Cloud or On-Prem Deployment',
        'Quarterly Business Reviews & Dedicated Architect',
        '99.99% Enterprise Uptime SLA'
      ]
    }
  ];

  const faqs = [
    {
      q: 'How does billing work when adding new franchise locations?',
      a: 'You can add new outlets at any time. When you cross a tier threshold, billing is automatically prorated for the remainder of your billing cycle with transparent per-store volume tiers.'
    },
    {
      q: 'Can store managers and regional supervisors access different views?',
      a: 'Yes! FranchiseOps AI includes granular role-based access control. Outlet managers only see their own store metrics, while regional directors and super admins have full multi-unit benchmarking access.'
    },
    {
      q: 'How does FranchiseOps AI connect to our existing POS and inventory systems?',
      a: 'We support turnkey integrations with major POS systems (Toast, Square, Clover, Petpooja) as well as direct database webhooks and REST APIs. Our team handles the onboarding and data mapping.'
    },
    {
      q: 'Is there a long-term contract or setup fee?',
      a: 'No hidden setup fees. Monthly plans can be canceled anytime. Annual plans include a 20% discount and complimentary data integration support from our solutions engineering team.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      {/* 1. Global Header */}
      <GlobalHeader />

      {/* 2. Main Content */}
      <main className="flex-1 pt-12 pb-24">
        {/* HERO HEADER */}
        <section className="max-w-7xl mx-auto px-6 text-center pt-8 pb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100/70 border border-orange-200/80 text-[#ff6b3d] text-xs font-bold uppercase tracking-wider mb-6">
            <FranchiseOpsLogo className="w-3.5 h-3.5" />
            Transparent, Value-Driven Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Plans built to scale with your <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#ff6b3d] via-[#f05a28] to-[#d94814] bg-clip-text text-transparent">
              franchise footprint
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Every plan includes our core Agentic AI Engine. Choose the right tier for your network size and operational complexity.
          </p>

          {/* BILLING TOGGLE */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="bg-slate-200/70 p-1 rounded-full flex items-center shadow-inner">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer",
                  billingCycle === 'monthly'
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={cn(
                  "px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  billingCycle === 'annual'
                    ? "bg-[#ff6b3d] text-white shadow-md shadow-orange-500/20"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Annual <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full uppercase">Save 20%</span>
              </button>
            </div>
          </div>
        </section>

        {/* PRICING CARDS */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={cn(
                  "rounded-3xl p-8 bg-white border flex flex-col relative transition-all duration-300",
                  plan.popular
                    ? "border-[#ff6b3d] shadow-2xl shadow-orange-500/10 ring-2 ring-[#ff6b3d]/20 lg:-translate-y-2"
                    : "border-slate-200 shadow-sm hover:shadow-md"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-[#ff6b3d] to-[#d94814] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md shadow-orange-500/30">
                    Most Popular for Multi-Unit
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-slate-500 text-xs mt-1 min-h-[32px]">{plan.description}</p>
                </div>

                <div className="mb-6 pb-6 border-b border-slate-100">
                  {plan.monthlyPrice !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
                        ${billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-slate-500 text-sm font-medium">/month</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-black text-slate-900 tracking-tight">Custom Enterprise</div>
                  )}
                  <span className="text-xs font-bold text-orange-600 block mt-2">{plan.locations}</span>
                </div>

                {/* Features list */}
                <div className="space-y-3 mb-8 flex-1">
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block">Included Features:</span>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link to="/demo">
                  <Button
                    className={cn(
                      "w-full py-3.5 h-auto rounded-xl font-bold text-sm transition-all cursor-pointer",
                      plan.popular
                        ? "bg-[#ff6b3d] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-[0.98]"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQS SECTION */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-600 text-sm mt-2">Everything you need to know about plans, billing, and rollouts.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-[#ff6b3d] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0", isOpen && "rotate-180 text-[#ff6b3d]")} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 3. Global Footer */}
      <GlobalFooter />
    </div>
  );
}

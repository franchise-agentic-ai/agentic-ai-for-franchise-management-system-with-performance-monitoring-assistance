import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GlobalHeader } from '../components/layout/GlobalHeader';
import { GlobalFooter } from '../components/layout/GlobalFooter';

export function BookDemo() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    companyName: '',
    phone: '',
    locations: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fff6f1] via-[#fffaf7] to-white font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      {/* 1. Global Header */}
      <GlobalHeader />

      {/* 2. Main Form Content */}
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-xl mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(255,107,61,0.12)] border border-orange-100/80">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Thank you, {formData.firstName || 'there'}!</h2>
                <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                  Your demo request has been received. One of our franchise operations specialists will reach out to you within 24 hours.
                </p>
                <div className="pt-6">
                  <Link to="/dashboard">
                    <Button className="bg-[#ff6b3d] hover:bg-[#e85a2d] text-white rounded-full px-8 py-3 font-semibold shadow-md shadow-orange-500/20">
                      Explore Live Demo App
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold mb-4 border border-orange-200/60">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    Personalized Platform Tour
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Book a Demo</h1>
                  <p className="mt-2 text-slate-600 text-sm">See how FranchiseOps AI can transform your multi-unit operational efficiency.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">First Name <span className="text-orange-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" 
                        placeholder="John" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Last Name <span className="text-orange-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" 
                        placeholder="Doe" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Work Email <span className="text-orange-500">*</span></label>
                    <input 
                      type="email" 
                      required
                      value={formData.workEmail}
                      onChange={(e) => setFormData({...formData, workEmail: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" 
                      placeholder="john@company.com" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Company Name <span className="text-orange-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" 
                      placeholder="Franchise LLC" 
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Phone Number <span className="text-slate-400 font-normal">(optional)</span></label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" 
                        placeholder="+1 (555) 000-0000" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">No. of Locations <span className="text-slate-400 font-normal">(optional)</span></label>
                      <input 
                        type="text" 
                        value={formData.locations}
                        onChange={(e) => setFormData({...formData, locations: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all" 
                        placeholder="e.g. 5-25 locations" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Message <span className="text-slate-400 font-normal">(optional)</span></label>
                    <textarea 
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all resize-none" 
                      placeholder="Tell us about your multi-unit operations and operational goals..." 
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full py-4 h-auto text-base font-semibold rounded-xl bg-[#ff6b3d] hover:bg-[#e85a2d] text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] mt-2"
                  >
                    Request Demo
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      {/* 3. Global Footer (About Section) */}
      <GlobalFooter />
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Store, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Plus, 
  Trash2,
  Zap,
  Globe,
  MapPin,
  Mail,
  Phone,
  Layers
} from 'lucide-react';
import { FranchiseOpsLogo } from '../components/brand/FranchiseOpsLogo';
import { GlobalFooter } from '../components/layout/GlobalFooter';
import { Button } from '../components/ui/Button';
import { IndustryType, BusinessProfile, Outlet } from '../types';
import { createBusiness, seedDemoDataForBusiness, addTenantOutlet } from '../services/tenantService';
import { runFullBusinessAnalysis } from '../services/franchiseIntelligenceEngine';
import { cn } from '../lib/utils';

export function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationMessage, setCalibrationMessage] = useState('Initializing agentic operating system...');

  // Step 1: Business Profile State
  const [businessName, setBusinessName] = useState('Biryani Express Group');
  const [industry, setIndustry] = useState<IndustryType>('Restaurant');
  const [businessType, setBusinessType] = useState('Fast Casual & Dine-in Chain');
  const [description, setDescription] = useState('Multi-unit culinary franchise expanding across Tier 1 & 2 cities.');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Karnataka');
  const [city, setCity] = useState('Bengaluru');
  const [website, setWebsite] = useState('https://biryaniexpress.example.com');
  const [contactEmail, setContactEmail] = useState('ops@biryaniexpress.com');
  const [contactPhone, setContactPhone] = useState('+91 98450 12345');

  // Step 2: Initial Outlets State
  const [outlets, setOutlets] = useState<Array<{ name: string; city: string; state: string; location: string; manager_name: string; status: 'Active' }>>([
    { name: 'Biryani Express - Indiranagar', city: 'Bengaluru', state: 'Karnataka', location: '100ft Road', manager_name: 'Karthik Raja', status: 'Active' },
    { name: 'Biryani Express - Koramangala', city: 'Bengaluru', state: 'Karnataka', location: '5th Block', manager_name: 'Anita Verma', status: 'Active' },
    { name: 'Biryani Express - HSR Layout', city: 'Bengaluru', state: 'Karnataka', location: 'Sector 2', manager_name: 'Sunil Rao', status: 'Active' },
  ]);

  // Step 3: Operational Ingestion Choice
  const [ingestionOption, setIngestionOption] = useState<'sample' | 'custom'>('sample');

  const handleAddOutletRow = () => {
    setOutlets([
      ...outlets,
      { name: `${businessName} - Store ${outlets.length + 1}`, city, state, location: 'Central Market', manager_name: 'Manager', status: 'Active' }
    ]);
  };

  const handleRemoveOutletRow = (index: number) => {
    if (outlets.length > 1) {
      setOutlets(outlets.filter((_, i) => i !== index));
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsCalibrating(true);
    setCurrentStep(4);

    // 1. Create Business
    setCalibrationMessage('Creating isolated multi-tenant organization...');
    setCalibrationProgress(20);
    await new Promise(r => setTimeout(r, 600));

    const newBiz = createBusiness({
      name: businessName,
      industry,
      business_type: businessType,
      description,
      country,
      state,
      city,
      website,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      currency: 'INR',
    });

    // 2. Add Outlets
    setCalibrationMessage('Registering franchise locations and target registries...');
    setCalibrationProgress(50);
    await new Promise(r => setTimeout(r, 600));

    outlets.forEach(out => {
      addTenantOutlet(newBiz.id, {
        name: out.name,
        city: out.city,
        state: out.state,
        location: out.location,
        manager_name: out.manager_name,
        status: out.status,
      });
    });

    // 3. Seed Ingestion or Baseline
    setCalibrationMessage('Ingesting operational sales, inventory, and workforce baselines...');
    setCalibrationProgress(75);
    await new Promise(r => setTimeout(r, 600));

    if (ingestionOption === 'sample') {
      seedDemoDataForBusiness(newBiz.id, businessName);
    }

    // 4. Run Franchise Intelligence Analysis
    setCalibrationMessage('Calibrating 4-factor health score models & generating first AI insights...');
    setCalibrationProgress(95);
    await new Promise(r => setTimeout(r, 800));

    await runFullBusinessAnalysis(newBiz.id);

    setCalibrationProgress(100);
    setCalibrationMessage('Agentic Operating System fully online!');
    await new Promise(r => setTimeout(r, 500));

    setIsCalibrating(false);
    navigate('/dashboard');
  };

  const industries: IndustryType[] = [
    'Restaurant', 'Retail', 'Education', 'Healthcare', 'Fitness', 'Services', 'Hospitality', 'Other'
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto w-full">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 border border-indigo-100">
            <FranchiseOpsLogo className="w-4 h-4" />
            FranchiseOps AI • New Business Onboarding
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Configure Your Franchise Operating System
          </h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mt-1">
            FranchiseOps AI uses your business information and operational streams to deliver personalized cross-agent intelligence and actionable recommendations.
          </p>
        </div>

        {/* Multi-Step Stepper Bar */}
        <div className="grid grid-cols-4 gap-2 mb-8 max-w-2xl mx-auto">
          {[
            { step: 1, label: 'Business Profile' },
            { step: 2, label: 'Outlets' },
            { step: 3, label: 'Data Baseline' },
            { step: 4, label: 'AI Activation' },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-xs",
                currentStep === s.step ? "bg-indigo-600 text-white shadow-indigo-500/20" :
                currentStep > s.step ? "bg-emerald-500 text-white" :
                "bg-white text-slate-400 border border-slate-200"
              )}>
                {currentStep > s.step ? <CheckCircle2 className="w-5 h-5" /> : s.step}
              </div>
              <span className="text-[11px] font-semibold text-slate-600 mt-1.5 text-center hidden sm:block">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step Card Container */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 sm:p-10">
          {/* STEP 1: BUSINESS PROFILE */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Step 1: Create Business Profile
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your core enterprise details to initialize your isolated multi-tenant workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business / Franchise Name *</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Biryani Express Group"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Industry Sector *</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as IndustryType)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-800"
                  >
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Operating Type</label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. QSR & Cloud Kitchen Chain"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Headquarters City & State</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="City (e.g. Bengaluru)"
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="State (e.g. Karnataka)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="ops@yourcompany.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Website URL (Optional)</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand & Concept Overview</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Describe your franchise model, target audience, and scale..."
                />
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!businessName.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 h-auto flex items-center gap-1.5"
                >
                  Continue to Outlets <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: ADD INITIAL OUTLETS */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-indigo-600" />
                    Step 2: Add Franchise Locations ({outlets.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Register your initial units for automated sales, health scoring, and anomaly tracking.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={handleAddOutletRow} className="text-xs flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Location
                </Button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {outlets.map((out, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Outlet Name</label>
                      <input
                        type="text"
                        value={out.name}
                        onChange={(e) => {
                          const copy = [...outlets];
                          copy[idx].name = e.target.value;
                          setOutlets(copy);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">City</label>
                      <input
                        type="text"
                        value={out.city}
                        onChange={(e) => {
                          const copy = [...outlets];
                          copy[idx].city = e.target.value;
                          setOutlets(copy);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Manager</label>
                        <input
                          type="text"
                          value={out.manager_name}
                          onChange={(e) => {
                            const copy = [...outlets];
                            copy[idx].manager_name = e.target.value;
                            setOutlets(copy);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      {outlets.length > 1 && (
                        <button
                          onClick={() => handleRemoveOutletRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 mt-4 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 h-auto flex items-center gap-1.5"
                >
                  Continue to Data Baseline <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: OPERATIONAL DATA INGESTION */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  Step 3: Choose Operational Data Ingestion Mode
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Populate initial operational streams to activate the Franchise Intelligence Engine.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  onClick={() => setIngestionOption('sample')}
                  className={cn(
                    "p-6 rounded-3xl border-2 cursor-pointer transition-all space-y-3",
                    ingestionOption === 'sample' 
                      ? "border-indigo-600 bg-indigo-50/40 shadow-sm" 
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <FranchiseOpsLogo className="w-10 h-10 drop-shadow-sm" />
                  <h4 className="text-base font-bold text-slate-900">1-Click Fast Baseline (Recommended)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Instantly load a comprehensive initial dataset containing sales histories, ingredient inventory, staff rosters, and compliance audits modeled after high-growth franchises.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% AI Analysis Readiness
                  </span>
                </div>

                <div 
                  onClick={() => setIngestionOption('custom')}
                  className={cn(
                    "p-6 rounded-3xl border-2 cursor-pointer transition-all space-y-3",
                    ingestionOption === 'custom' 
                      ? "border-indigo-600 bg-indigo-50/40 shadow-sm" 
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Manual / Custom CSV Import</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Start with a clean blank canvas and import your actual POS sales, inventory sheets, and workforce CSV files directly inside the Business Data Hub.
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                    <Layers className="w-3.5 h-3.5" /> Granular Control
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                <Button 
                  onClick={handleCompleteOnboarding}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 h-auto flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  Launch Agentic AI Platform <Zap className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: CALIBRATION & AI ORCHESTRATION */}
          {currentStep === 4 && (
            <div className="text-center py-12 space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-center mx-auto animate-bounce">
                <FranchiseOpsLogo className="w-20 h-20 drop-shadow-xl" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Calibrating Franchise Intelligence Engine
                </h3>
                <p className="text-xs font-semibold text-indigo-600">
                  {calibrationMessage}
                </p>
              </div>

              <div className="max-w-md mx-auto w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-500"
                  style={{ width: `${calibrationProgress}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Configuring multi-tenant security barriers and isolated data stores for {businessName}...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Global Footer */}
      <div className="mt-16">
        <GlobalFooter />
      </div>
    </div>
  );
}

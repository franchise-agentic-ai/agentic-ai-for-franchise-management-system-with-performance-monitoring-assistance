import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Save, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Activity,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  getActiveBusiness, 
  updateBusinessProfile, 
  getAllBusinesses, 
  setActiveBusiness,
  calculateOverallBusinessHealthScore,
  calculateBusinessSetupProgress
} from '../services/tenantService';
import { BusinessProfile, IndustryType } from '../types';
import { cn } from '../lib/utils';

export function BusinessProfilePage() {
  const [business, setBusiness] = useState<BusinessProfile>(getActiveBusiness());
  const [allBusinesses, setAllBusinesses] = useState<BusinessProfile[]>(getAllBusinesses());
  const [isSaved, setIsSaved] = useState(false);

  // Form State
  const [name, setName] = useState(business.name);
  const [industry, setIndustry] = useState<IndustryType>(business.industry);
  const [businessType, setBusinessType] = useState(business.business_type);
  const [description, setDescription] = useState(business.description);
  const [website, setWebsite] = useState(business.website || '');
  const [country, setCountry] = useState(business.country);
  const [state, setState] = useState(business.state);
  const [city, setCity] = useState(business.city);
  const [contactEmail, setContactEmail] = useState(business.contact_email);
  const [contactPhone, setContactPhone] = useState(business.contact_phone);

  const loadData = () => {
    const active = getActiveBusiness();
    setBusiness(active);
    setAllBusinesses(getAllBusinesses());
    setName(active.name);
    setIndustry(active.industry);
    setBusinessType(active.business_type);
    setDescription(active.description);
    setWebsite(active.website || '');
    setCountry(active.country);
    setState(active.state);
    setCity(active.city);
    setContactEmail(active.contact_email);
    setContactPhone(active.contact_phone);
  };

  useEffect(() => {
    loadData();
    const handleTenantChange = () => loadData();
    window.addEventListener('franchiseops_tenant_changed', handleTenantChange);
    return () => window.removeEventListener('franchiseops_tenant_changed', handleTenantChange);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateBusinessProfile(business.id, {
      name,
      industry,
      business_type: businessType,
      description,
      website,
      country,
      state,
      city,
      contact_email: contactEmail,
      contact_phone: contactPhone,
    });
    setBusiness(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const healthScore = calculateOverallBusinessHealthScore(business.id);
  const setupProgress = calculateBusinessSetupProgress(business.id);

  const industries: IndustryType[] = [
    'Restaurant', 'Retail', 'Education', 'Healthcare', 'Fitness', 'Services', 'Hospitality', 'Other'
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Business Profile & Tenant Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200">
              ID: {business.id.substring(0, 12)}...
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Manage your franchise enterprise credentials, branding, regional HQ location, and AI operating configuration.
          </p>
        </div>

        {/* Tenant Switcher Pill */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500">Active Tenant:</label>
          <select
            value={business.id}
            onChange={(e) => {
              const selected = allBusinesses.find(b => b.id === e.target.value);
              if (selected) {
                setActiveBusiness(selected);
              }
            }}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          >
            {allBusinesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.industry})</option>
            ))}
          </select>
        </div>
      </div>

      {/* OVERALL BUSINESS HEALTH & SETUP PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composite Health Card */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Composite Business Health
            </CardTitle>
            <p className="text-xs text-slate-500">Overall score across all 5 operational pillars.</p>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className={cn(
              "w-28 h-28 rounded-3xl mx-auto flex flex-col items-center justify-center font-black shadow-inner border-2",
              healthScore.score >= 90 ? "bg-emerald-50 text-emerald-600 border-emerald-300" :
              healthScore.score >= 75 ? "bg-blue-50 text-blue-600 border-blue-300" :
              healthScore.score >= 60 ? "bg-amber-50 text-amber-600 border-amber-300" :
              "bg-rose-50 text-rose-600 border-rose-300"
            )}>
              <span className="text-4xl leading-none">{healthScore.score}</span>
              <span className="text-[10px] uppercase font-bold opacity-60">/ 100</span>
            </div>
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                {healthScore.status} Tier Operations
              </span>
            </div>

            <div className="space-y-2 pt-2 text-left">
              {healthScore.pillars.map((p, i) => (
                <div key={i} className="text-xs">
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>{p.name}</span>
                    <span className="font-mono font-bold text-indigo-600">{p.score} / {p.max}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(p.score / p.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Enterprise Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as IndustryType)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Operating Model</label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Website</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {isSaved ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> Profile Updated Successfully
                  </span>
                ) : <span />}

                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

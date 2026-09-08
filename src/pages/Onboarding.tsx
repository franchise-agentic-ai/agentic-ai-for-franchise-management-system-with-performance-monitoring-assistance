import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  Store, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2,
  Zap,
  Globe,
  MapPin,
  Mail,
  Phone,
  Lock,
  User,
  ShieldCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { FranchiseOpsLogo } from '../components/brand/FranchiseOpsLogo';
import { GlobalFooter } from '../components/layout/GlobalFooter';
import { Button } from '../components/ui/Button';
import { IndustryType } from '../types';
import { createBusiness, registerUserAccount, addTenantOutlet, loginUser } from '../services/tenantService';
import { cn } from '../lib/utils';

export function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationMessage, setCalibrationMessage] = useState('Initializing business tenant...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Owner Credentials & Authentication State
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Franchise & Business Details State
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState<IndustryType>('Restaurant');
  const [businessType, setBusinessType] = useState('QSR / Fast Food Chain');
  const [description, setDescription] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Telangana');
  const [city, setCity] = useState('Hyderabad');
  const [website, setWebsite] = useState('');

  // Step 3: Outlets & Store Locations
  const [outlets, setOutlets] = useState<Array<{ name: string; city: string; state: string; location: string; manager_name: string; status: 'Active' }>>([
    { name: 'Flagship Outlet #1', city: 'Hyderabad', state: 'Telangana', location: 'Main Commercial Hub', manager_name: 'Store Manager', status: 'Active' },
  ]);

  const industries: IndustryType[] = [
    'Restaurant', 'Retail', 'Education', 'Healthcare', 'Fitness', 'Services', 'Hospitality', 'Other'
  ];

  const handleAddOutletRow = () => {
    const baseName = businessName.trim() || 'Franchise Branch';
    setOutlets([
      ...outlets,
      { 
        name: `${baseName} - Branch ${outlets.length + 1}`, 
        city: city || 'Hyderabad', 
        state: state || 'Telangana', 
        location: 'Branch Location', 
        manager_name: 'Branch Manager', 
        status: 'Active' 
      }
    ]);
  };

  const handleRemoveOutletRow = (index: number) => {
    if (outlets.length > 1) {
      setOutlets(outlets.filter((_, i) => i !== index));
    }
  };

  // Step 1 validation
  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!ownerName.trim()) {
      setErrorMsg('Please enter the business owner name.');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid business email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter a valid contact phone number.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-check.');
      return;
    }

    setCurrentStep(2);
  };

  // Step 2 validation
  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!businessName.trim()) {
      setErrorMsg('Please enter your business or franchise name.');
      return;
    }
    if (!city.trim() || !state.trim()) {
      setErrorMsg('Please specify your city and state.');
      return;
    }

    // Update initial outlet name if it was default
    if (outlets.length === 1 && outlets[0].name === 'Flagship Outlet #1') {
      const copy = [...outlets];
      copy[0].name = `${businessName.trim()} - Main Branch`;
      copy[0].city = city.trim();
      copy[0].state = state.trim();
      setOutlets(copy);
    }

    setCurrentStep(3);
  };

  // Step 3 submission & final creation
  const handleCompleteRegistration = async () => {
    setErrorMsg(null);
    setIsCalibrating(true);
    setCurrentStep(4);

    try {
      // 1. Create Business
      setCalibrationMessage('Provisioning isolated multi-tenant business workspace...');
      setCalibrationProgress(25);
      await new Promise(r => setTimeout(r, 600));

      const newBiz = createBusiness({
        name: businessName.trim(),
        industry,
        business_type: businessType.trim() || 'Franchise Chain',
        description: description.trim() || `${businessName} franchise operating in ${city}, ${state}.`,
        country: country.trim() || 'India',
        state: state.trim(),
        city: city.trim(),
        website: website.trim(),
        contact_email: email.trim(),
        contact_phone: phone.trim(),
        currency: 'INR',
      });

      // 2. Register User Account
      setCalibrationMessage('Securing business owner credentials & permissions...');
      setCalibrationProgress(50);
      await new Promise(r => setTimeout(r, 600));

      registerUserAccount({
        name: ownerName.trim(),
        email: email.trim(),
        password: password,
        phone: phone.trim(),
        businessId: newBiz.id,
        businessName: newBiz.name,
      });

      // 3. Add Initial Outlets (clean, no demo sales/inventory)
      setCalibrationMessage('Registering initial franchise branches...');
      setCalibrationProgress(75);
      await new Promise(r => setTimeout(r, 600));

      outlets.forEach(out => {
        if (out.name.trim()) {
          addTenantOutlet(newBiz.id, {
            name: out.name.trim(),
            city: out.city.trim() || city.trim(),
            state: out.state.trim() || state.trim(),
            location: out.location.trim() || 'Central',
            manager_name: out.manager_name.trim() || ownerName.trim(),
            status: out.status,
          });
        }
      });

      // 4. Finalize login & AI initialization
      setCalibrationMessage('Initializing clean business dashboard & AI Assistant...');
      setCalibrationProgress(100);
      await new Promise(r => setTimeout(r, 600));

      // Auto login into the newly created account
      loginUser(email.trim(), password);

      setIsCalibrating(false);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setIsCalibrating(false);
      setCurrentStep(1);
      setErrorMsg(err?.message || 'Failed to complete registration. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-4xl mx-auto w-full">
        {/* Top Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 border border-indigo-100 hover:bg-indigo-100 transition-colors">
            <FranchiseOpsLogo className="w-4 h-4" />
            <span>FranchiseOps AI • New Business Registration</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Register Your Franchise Business
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mt-1">
            Create your isolated business account to start monitoring outlets, inventory, staff, and AI performance insights.
          </p>
        </div>

        {/* Stepper Indicator */}
        <div className="grid grid-cols-4 gap-2 mb-8 max-w-2xl mx-auto">
          {[
            { step: 1, label: 'Owner & Login' },
            { step: 2, label: 'Business Profile' },
            { step: 3, label: 'Outlets Setup' },
            { step: 4, label: 'Activation' },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-xs",
                currentStep === s.step ? "bg-indigo-600 text-white shadow-indigo-500/20 ring-2 ring-indigo-200" :
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

        {/* Error Notice */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 max-w-2xl mx-auto animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Multi-Step Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6 sm:p-10 max-w-2xl mx-auto">
          {/* STEP 1: OWNER & LOGIN CREDENTIALS */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Step 1: Owner Profile & Login Credentials
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set up your personal account credentials for accessing your business workspace.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Owner / Representative Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full pl-9.5 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Ramesh Reddy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (Username) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9.5 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g. ramesh@abcfoods.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9.5 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g. +91 98450 12345"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password * (min. 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9.5 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9.5 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Link to="/login" className="text-xs text-slate-500 hover:text-indigo-600 font-semibold">
                  Already registered? Sign In
                </Link>
                <Button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 h-auto flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Next: Business Profile <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: BUSINESS & FRANCHISE DETAILS */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Step 2: Business & Franchise Information
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your organization details. This will customize your analytics and personalized AI assistant.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business / Franchise Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                    placeholder="e.g. ABC Foods & Beverages"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Industry Sector *
                  </label>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Operating Category / Type
                  </label>
                  <input
                    type="text"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. QSR, Dine-in, Bakery, Retail Chain"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="https://abcfoods.example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Hyderabad"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Telangana"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. India"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brief Business Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Provide a quick overview of your franchise business model..."
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 h-auto flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Next: Outlets Setup <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: INITIAL OUTLETS & LOCATIONS */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-indigo-600" />
                    Step 3: Initial Outlets & Branches ({outlets.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add your starting locations. You can add more later in the Outlets Management section.
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleAddOutletRow} 
                  className="text-xs flex items-center gap-1 font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Location
                </Button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {outlets.map((out, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Location #{idx + 1}</span>
                      {outlets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOutletRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Remove this outlet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
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
                          placeholder="e.g. Banjara Hills Branch"
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
                          placeholder="City"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Store Manager</label>
                        <input
                          type="text"
                          value={out.manager_name}
                          onChange={(e) => {
                            const copy = [...outlets];
                            copy[idx].manager_name = e.target.value;
                            setOutlets(copy);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          placeholder="Manager Name"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Isolation Guarantee Notice */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="font-bold">Clean Workspace & Zero-Leak Data Guarantee:</strong>
                  <p className="text-[11px] text-indigo-700/90 mt-0.5">
                    Your account will start with a completely clean slate. No demo data, sample numbers, or other businesses' information will ever appear in your dashboard.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button 
                  onClick={handleCompleteRegistration}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 h-auto flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Complete Registration & Launch <Zap className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: CALIBRATION & ISOLATED TENANT ACTIVATION */}
          {currentStep === 4 && (
            <div className="text-center py-10 space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-center mx-auto animate-bounce">
                <FranchiseOpsLogo className="w-16 h-16 drop-shadow-xl" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  Creating Your Business Account
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
                Configuring isolated data stores for <strong className="text-slate-700">{businessName}</strong>...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Global Footer */}
      <div className="mt-12">
        <GlobalFooter />
      </div>
    </div>
  );
}

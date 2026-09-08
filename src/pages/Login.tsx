import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { FranchiseOpsLogo } from '../components/brand/FranchiseOpsLogo';
import { GlobalHeader } from '../components/layout/GlobalHeader';
import { GlobalFooter } from '../components/layout/GlobalFooter';
import { Button } from '../components/ui/Button';
import { loginUser, DEFAULT_DEMO_USER } from '../services/tenantService';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@franchiseops.ai');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = loginUser(email, password);
      setIsLoading(false);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      }
    }, 600);
  };

  const handleFillDemo = () => {
    setEmail(DEFAULT_DEMO_USER.email);
    setPassword(DEFAULT_DEMO_USER.password);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      {/* 1. Global Header */}
      <GlobalHeader />

      {/* 2. Main Login Content */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md my-auto">
          {/* Brand Header */}
          <div className="flex justify-center mb-4">
            <Link to="/" className="flex items-center gap-2 group">
              <FranchiseOpsLogo className="w-12 h-12 drop-shadow-md group-hover:scale-105 transition-transform" />
            </Link>
          </div>
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-1 text-center text-xs sm:text-sm text-slate-600">
            Or <Link to="/" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">return to the website</Link>
          </p>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Box */}
          <div className="mt-5 bg-white py-7 px-5 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-8 border border-slate-200">
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-700">
                  Email address
                </label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9.5 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm transition-colors"
                    placeholder="name@business.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-9.5 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-600 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-slate-700 cursor-pointer">
                    Remember me
                  </label>
                </div>

                <div className="text-xs">
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('For demo/registered accounts, you can use your registered password or demo@franchiseops.ai / password123'); }} className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 h-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 text-sm font-bold cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    <>
                      Sign In to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Registration and Demo Options */}
            <div className="mt-5 space-y-3 pt-3 border-t border-slate-100">
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  New to FranchiseOps?
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => navigate('/onboarding')}
                className="w-full py-2.5 px-4 rounded-xl border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Register New Business (Onboarding Wizard)
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Demo Account Box */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    Demo Account (Presentation Mode)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    demo@franchiseops.ai • password123
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg shrink-0 cursor-pointer shadow-2xs"
                >
                  Auto-Fill Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Global Footer */}
      <GlobalFooter />
    </div>
  );
}

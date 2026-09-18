import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import type { User } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Physician' | 'Nurse' | 'Administrator'>('Physician');
  const [hospitalName, setHospitalName] = useState('Lagos State University Teaching Hospital (LUTH)');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const res = await api.register({
          full_name: fullName,
          email,
          password,
          role,
          hospital_name: hospitalName
        });
        onSuccess(res.user);
      } else {
        const res = await api.login({ email, password });
        onSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Authentication failed. Please check your credentials.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await api.login({ email: demoEmail, password: 'password123' });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg('Authentication error. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-medical-500/10 text-medical-600 dark:text-medical-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-2xl font-extrabold tracking-tight">
            {isRegisterMode ? 'Create Clinical Account' : 'Sign In to DiaPredict.AI'}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {isRegisterMode
              ? 'Register a new clinician account for role-based readmission risk assessment.'
              : 'Sign in to access patient records, audit logs, and risk analytics.'}
          </p>
        </div>

        {/* Preset Role Credentials Selector */}
        {!isRegisterMode && (
          <div className="mt-6 rounded-2xl bg-slate-100/80 p-3.5 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Select Role Profile Credentials:</span>
            </div>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('dr.babatunde@hospital.ng')}
                className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-2.5 text-left text-xs shadow-sm hover:border-medical-400 hover:bg-medical-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition"
              >
                <span className="font-bold text-slate-900 dark:text-white">Dr. Babatunde</span>
                <span className="text-[10px] text-medical-600 dark:text-medical-400 font-semibold">Physician (LUTH)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('nurse.chioma@phc.ng')}
                className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-2.5 text-left text-xs shadow-sm hover:border-medical-400 hover:bg-medical-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition"
              >
                <span className="font-bold text-slate-900 dark:text-white">Nurse Chioma</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Nurse (PHC)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@diapredict.ai')}
                className="flex flex-col items-start rounded-xl border border-slate-200 bg-white p-2.5 text-left text-xs shadow-sm hover:border-medical-400 hover:bg-medical-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition"
              >
                <span className="font-bold text-slate-900 dark:text-white">Admin Emeka</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Administrator</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 flex items-center space-x-2 rounded-xl bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Full Name & Title
              </label>
              <div className="relative mt-1">
                <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Dr. Babatunde Ogunlesi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-medical-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Address
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="dr.babatunde@hospital.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-medical-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-medical-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {isRegisterMode && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Clinical Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-medical-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Physician">Attending Physician</option>
                    <option value="Nurse">Nurse Navigator</option>
                    <option value="Administrator">Hospital Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Hospital / Institution
                  </label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-medical-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 flex w-full items-center justify-center space-x-2 rounded-xl bg-medical-600 py-3 text-xs font-bold text-white shadow-lg shadow-medical-500/30 hover:bg-medical-500 active:scale-95 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Authenticating Credentials...</span>
              </>
            ) : (
              <>
                <span>{isRegisterMode ? 'Complete Registration' : 'Sign In to Clinical Portal'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {isRegisterMode ? (
            <span>
              Already have a clinical account?{' '}
              <button
                onClick={() => { setIsRegisterMode(false); setErrorMsg(null); }}
                className="font-bold text-medical-600 hover:underline dark:text-medical-400"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a new clinical staff account?{' '}
              <button
                onClick={() => { setIsRegisterMode(true); setErrorMsg(null); }}
                className="font-bold text-medical-600 hover:underline dark:text-medical-400"
              >
                Register Here
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

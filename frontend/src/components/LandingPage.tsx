import React from 'react';
import { 
  Stethoscope, 
  ShieldCheck, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowRight, 
  HeartPulse, 
  UserCheck, 
  Building2, 
  Sparkles, 
  Globe2, 
  Zap
} from 'lucide-react';
import type { User } from '../types/auth';

interface LandingPageProps {
  onNavigateTab: (tab: 'predictor' | 'batch' | 'history' | 'analytics' | 'system') => void;
  onOpenAuth: () => void;
  currentUser: User | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateTab,
  onOpenAuth,
  currentUser
}) => {
  return (
    <div className="space-y-16 py-4">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-medical-950 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-medical-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 rounded-full bg-medical-500/20 px-4 py-1.5 text-xs font-bold text-medical-300 border border-medical-500/30 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>AI Clinical Decision Support • NDPR & HIPAA Compliant</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.15]">
            Prevent 30-Day Diabetic Readmissions <span className="bg-gradient-to-r from-medical-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Before They Happen</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Precision AI-driven readmission risk scoring, intervention simulation, and 7-day PHC follow-up care pathways tailored for Nigerian clinical encounters and international healthcare institutions.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onNavigateTab('predictor')}
              className="inline-flex items-center space-x-2 rounded-xl bg-medical-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-medical-600/30 hover:bg-medical-500 active:scale-95 transition"
            >
              <Stethoscope className="h-5 w-5" />
              <span>Launch Patient Predictor</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {!currentUser ? (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center space-x-2 rounded-xl bg-white/10 px-6 py-3.5 text-sm font-bold text-white border border-white/20 hover:bg-white/20 active:scale-95 transition backdrop-blur-md"
              >
                <UserCheck className="h-5 w-5 text-emerald-400" />
                <span>Clinical Sign In / Demo Profiles</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigateTab('history')}
                className="inline-flex items-center space-x-2 rounded-xl bg-white/10 px-6 py-3.5 text-sm font-bold text-white border border-white/20 hover:bg-white/20 active:scale-95 transition backdrop-blur-md"
              >
                <FileSpreadsheet className="h-5 w-5 text-medical-300" />
                <span>View Patient Records</span>
              </button>
            )}
          </div>

          {/* Logged In Role Banner */}
          {currentUser && (
            <div className="inline-flex items-center space-x-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Logged in as: <strong>{currentUser.full_name}</strong> ({currentUser.role} • {currentUser.hospital_name})</span>
            </div>
          )}
        </div>
      </section>

      {/* Metrics & Impact Bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl border border-slate-200 p-6 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center space-x-3 text-medical-600 dark:text-medical-400 mb-2">
            <HeartPulse className="h-6 w-6" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Risk Precision</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">0.911 AUC</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ensemble XGBoost & RF Model</p>
        </div>

        <div className="glass rounded-2xl border border-slate-200 p-6 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400 mb-2">
            <ShieldCheck className="h-6 w-6" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Privacy & Security</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">NDPR & HIPAA</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Full JWT Clinical Access Gate</p>
        </div>

        <div className="glass rounded-2xl border border-slate-200 p-6 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-400 mb-2">
            <Globe2 className="h-6 w-6" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Regional Optimization</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Nigerian PHC</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">NHIA & Low-GI Local Staples</p>
        </div>

        <div className="glass rounded-2xl border border-slate-200 p-6 dark:border-slate-800 shadow-sm hover:shadow-md transition">
          <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400 mb-2">
            <Zap className="h-6 w-6" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Real-Time Search</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">&lt; 150 ms</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Instant Baseline EHR Auto-fill</p>
        </div>
      </section>

      {/* Role-Based Clinical Workflows */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Tailored Workflows for Every Role
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            DiaPredict.AI differentiates access permissions to match hospital organization structures and clinical responsibilities.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Physician Card */}
          <div className="glass rounded-3xl border border-slate-200 p-8 dark:border-slate-800 shadow-lg flex flex-col justify-between hover:border-medical-500/50 transition">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-medical-500/10 text-medical-600 dark:text-medical-400">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Attending Physicians</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Evaluate individual patient readmission probability using SHAP feature attributions, run medication intervention simulations, and export official signed EHR clinical reports.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Interactive What-If Simulator</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Printable Signed EHR PDF Export</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Cohort Risk Analytics Access</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigateTab('predictor')}
              className="mt-6 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-900 hover:bg-medical-600 hover:text-white dark:bg-slate-800 dark:text-white dark:hover:bg-medical-600 transition"
            >
              Open Physician Predictor
            </button>
          </div>

          {/* Nurse Navigator Card */}
          <div className="glass rounded-3xl border border-slate-200 p-8 dark:border-slate-800 shadow-lg flex flex-col justify-between hover:border-emerald-500/50 transition">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <UserCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nurse Navigators</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Formulate post-discharge care plans, schedule 7-day PHC follow-ups, deliver low-GI African dietary counseling, and monitor historical patient assessments.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>7-Day PHC Follow-up Care Plans</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Low-GI Staple Meal Guidance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Patient Encounter History Search</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigateTab('history')}
              className="mt-6 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-900 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:text-white dark:hover:bg-emerald-600 transition"
            >
              View Nursing Patient Audit
            </button>
          </div>

          {/* Administrator Card */}
          <div className="glass rounded-3xl border border-slate-200 p-8 dark:border-slate-800 shadow-lg flex flex-col justify-between hover:border-amber-500/50 transition">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hospital Administrators</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Oversee hospital cohort ingestion, import bulk CSV patient records, analyze hospital-wide readmission rates, and inspect system diagnostics.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  <span>Bulk CSV Cohort Dataset Ingestion</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  <span>Hospital-Wide Risk Distribution</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  <span>Developer & System Health API</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onNavigateTab('batch')}
              className="mt-6 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-900 hover:bg-amber-600 hover:text-white dark:bg-slate-800 dark:text-white dark:hover:bg-amber-600 transition"
            >
              Access Batch Ingestion
            </button>
          </div>

        </div>
      </section>

      {/* 3-Step Process */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xl space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-medical-600 dark:text-medical-400">Streamlined Workflow</span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            How DiaPredict.AI Operates
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3 relative">
          
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-medical-600 text-white font-black text-sm">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Enter or Search Patient Baseline</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Input clinical parameters (HbA1c, glucose, medications, hospital stay) or type the patient name to search and auto-fill existing EHR records.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-medical-600 text-white font-black text-sm">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Calculate Risk & Simulate Interventions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The ML ensemble evaluates 30-day readmission risk, highlights key risk factors, and lets clinicians simulate medication/lifestyle adjustments in real time.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-medical-600 text-white font-black text-sm">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Execute Care Plan & Export Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Generate 7-day PHC care instructions and export a formatted, signed EHR clinical PDF report for the patient's medical file.
            </p>
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-medical-900 via-slate-900 to-emerald-950 p-8 text-center text-white shadow-xl space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to Evaluate Patient Readmission Risk?</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Start assessing patients now or sign in to access historical audit logs and hospital cohort analytics.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={() => onNavigateTab('predictor')}
            className="inline-flex items-center space-x-2 rounded-xl bg-medical-500 px-6 py-3 text-xs font-bold text-white shadow-lg hover:bg-medical-400 active:scale-95 transition"
          >
            <Stethoscope className="h-4 w-4" />
            <span>Open Predictor Workspace</span>
          </button>
        </div>
      </section>

    </div>
  );
};

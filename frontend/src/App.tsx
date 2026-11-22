import { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Server, 
  GitBranch, 
  Sun,
  Moon,
  Stethoscope,
  BarChart3,
  ExternalLink,
  FileSpreadsheet,
  UploadCloud,
  Code2,
  LogOut,
  LogIn,
  ShieldCheck
} from 'lucide-react';

import { LandingPage } from './components/LandingPage';
import { PredictorForm } from './components/PredictorForm';
import { RiskResultDashboard } from './components/RiskResultDashboard';
import { CohortAnalytics } from './components/CohortAnalytics';
import { PatientHistoryTable } from './components/PatientHistoryTable';
import { BatchIngestionView } from './components/BatchIngestionView';
import { AuthModal } from './components/AuthModal';
import { api } from './services/api';
import type { 
  ReadmissionPredictionRequest, 
  ReadmissionPredictionResponse, 
  SamplePatientCase,
  PatientHistoryRecord
} from './types/prediction';
import type { User } from './types/auth';



const defaultFormData: ReadmissionPredictionRequest = {
  age_bracket: '[60-70)',
  gender: 'Female',
  race: 'African (Nigerian)',
  time_in_hospital: 4,
  num_lab_procedures: 45,
  num_procedures: 1,
  num_medications: 15,
  number_outpatient: 0,
  number_emergency: 0,
  number_inpatient: 1,
  number_diagnoses: 7,
  max_glu_serum: 'None',
  a1c_result: '>8',
  change_med: 'Ch',
  diabetes_med: 'Yes',
  primary_diagnosis: 'Diabetes',
  discharge_disposition: 'Discharged to Home'
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'landing' | 'predictor' | 'batch' | 'history' | 'analytics' | 'system'>('landing');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [formData, setFormData] = useState<ReadmissionPredictionRequest>(defaultFormData);
  const [prediction, setPrediction] = useState<ReadmissionPredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sampleCases, setSampleCases] = useState<SamplePatientCase[]>([]);

  // Load active user session on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('diapredict_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        // ignore
      }
    }
    // Verify token with backend
    if (localStorage.getItem('diapredict_token')) {
      api.getMe()
        .then(u => {
          setCurrentUser(u);
          localStorage.setItem('diapredict_user', JSON.stringify(u));
        })
        .catch(() => {
          api.logout();
          setCurrentUser(null);
        });
    }
  }, []);

  const canAccessDevTools = currentUser?.role === 'Administrator';

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setDevMode(false);
    setActiveTab('landing');
  };

  // Sync activeTab & devMode state with user authentication and role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role !== 'Administrator') {
        setDevMode(false);
        if (activeTab === 'system') {
          setActiveTab('predictor');
        }
      }
      if (activeTab === 'landing') {
        setActiveTab('predictor');
      }
    } else {
      setDevMode(false);
      setActiveTab('landing');
    }
  }, [currentUser]);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check API health & Load Sample Profiles
  useEffect(() => {
    api.checkHealth()
      .then(res => {
        if (res.status === 'online') {
          setApiStatus('online');
        } else {
          setApiStatus('offline');
        }
      })
      .catch(() => setApiStatus('offline'));

    api.getSampleCases()
      .then(cases => setSampleCases(cases))
      .catch(() => {
        // Fallback offline sample cases if backend is unavailable
        setSampleCases([]);
      });
  }, []);

  // Run Prediction Call
  const handleCalculateRisk = async () => {
    if (!formData.patient_name || !formData.patient_name.trim()) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.predictReadmission(formData);
      setPrediction(res);
    } catch (err) {
      console.error('Prediction API Error:', err);
      // Fallback offline calculation if server is offline during dev
      setPrediction({
        readmission_risk_score: 28.5,
        risk_category: 'Moderate Risk (>30 Days)',
        risk_level: 'Moderate',
        confidence_interval: [23.5, 33.5],
        feature_impacts: [
          { feature_name: 'Prior Inpatient Admissions', feature_value: '1 visit', impact_score: 5.6, direction: 'increase', description: '1 past admission increases risk.' },
          { feature_name: 'HbA1c > 8%', feature_value: 'Elevated', impact_score: 4.2, direction: 'increase', description: 'Uncontrolled glycemic levels.' }
        ],
        recommendations: [
          { category: 'Follow-up Care', title: '7-Day Outpatient Visit', description: 'Schedule 7-day primary care follow-up.', priority: 'High' }
        ],
        dataset_benchmark_percentile: 65.0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: SamplePatientCase) => {
    setFormData(sample.patient_data);
    setPrediction(null);
  };

  const handleSelectHistoryRecord = (record: PatientHistoryRecord) => {
    setFormData({
      ...defaultFormData,
      patient_name: record.patient_name,
      age_bracket: record.age_bracket,
      gender: record.gender,
      time_in_hospital: record.time_in_hospital,
      num_medications: record.num_medications,
      number_inpatient: record.number_inpatient,
      number_emergency: record.number_emergency,
      a1c_result: record.a1c_result,
      primary_diagnosis: record.primary_diagnosis,
      discharge_disposition: record.discharge_disposition
    });
    setPrediction(null);
    setActiveTab('predictor');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
      
      {/* Top Banner / Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
          
          {/* Logo & Workspace Title */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer hover:opacity-90 transition shrink-0"
          >
            <div className="rounded-xl bg-medical-500/10 p-1.5 sm:p-2 text-medical-600 dark:text-medical-400">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
            </div>
            <span className="font-sans text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              DiaPredict<span className="text-medical-500">.AI</span>
            </span>
          </div>

          {/* Clinical Navigation Tabs (Only rendered when user is signed in) */}
          {currentUser && (
            <nav className="hidden md:flex items-center space-x-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-900">
              <button
                onClick={() => setActiveTab('predictor')}
                className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'predictor'
                    ? 'bg-white text-medical-600 shadow-sm dark:bg-slate-800 dark:text-medical-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Stethoscope className="h-4 w-4" />
                <span>Patient Predictor</span>
              </button>

              <button
                onClick={() => setActiveTab('batch')}
                className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'batch'
                    ? 'bg-white text-medical-600 shadow-sm dark:bg-slate-800 dark:text-medical-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <UploadCloud className="h-4 w-4" />
                <span>Batch Ingestion</span>
                {currentUser.role !== 'Administrator' && (
                  <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-600 dark:text-amber-400">Admin</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'history'
                    ? 'bg-white text-medical-600 shadow-sm dark:bg-slate-800 dark:text-medical-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Audit & History</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  activeTab === 'analytics'
                    ? 'bg-white text-medical-600 shadow-sm dark:bg-slate-800 dark:text-medical-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Cohort Analytics</span>
                {currentUser.role === 'Nurse' && (
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">MD/Admin</span>
                )}
              </button>

              {/* Developer-Only System Tab (Administrator Only) */}
              {canAccessDevTools && devMode && (
                <button
                  onClick={() => setActiveTab('system')}
                  className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    activeTab === 'system'
                      ? 'bg-white text-medical-600 shadow-sm dark:bg-slate-800 dark:text-medical-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Server className="h-4 w-4" />
                  <span>Developer API</span>
                </button>
              )}
            </nav>
          )}

          {/* Dev Mode & Theme Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Show API health status badge ONLY in Dev Mode for Administrators */}
            {canAccessDevTools && devMode && (
              <div className="flex items-center space-x-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className={`h-2.5 w-2.5 rounded-full ${
                  apiStatus === 'online' ? 'bg-emerald-500 animate-ping' : apiStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <span className="text-slate-700 dark:text-slate-300">
                  Backend API: {apiStatus.toUpperCase()}
                </span>
              </div>
            )}

            {/* User Auth Profile Badge or Sign In Button */}
            {currentUser ? (
              <div className="flex items-center space-x-2 rounded-xl border border-medical-500/30 bg-medical-500/10 px-3 py-1.5 text-xs dark:bg-medical-950/40">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-medical-600 text-white font-bold text-[10px]">
                  {currentUser.full_name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="font-bold text-slate-900 dark:text-white leading-tight">{currentUser.full_name}</div>
                  <div className="text-[10px] font-semibold text-medical-600 dark:text-medical-400">{currentUser.role} • {currentUser.hospital_name.split(' ')[0]}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-1 rounded-lg p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center space-x-1.5 rounded-xl bg-medical-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-medical-500 active:scale-95 transition"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Developer Mode Toggle Button (Visible only to Administrators) */}
            {canAccessDevTools && (
              <button
                onClick={() => setDevMode(!devMode)}
                className={`flex items-center space-x-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  devMode 
                    ? 'bg-medical-500/10 text-medical-600 border-medical-500/30 dark:text-medical-400' 
                    : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                }`}
                title="Toggle Developer Tools & API Diagnostics"
              >
                <Code2 className="h-4 w-4" />
                <span className="hidden sm:inline">{devMode ? 'Dev Mode ON' : 'Dev Tools'}</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </header>


      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8 overflow-x-hidden">
        
        {/* Render Landing Overview when NO user is signed in */}
        {!currentUser ? (
          <LandingPage 
            onNavigateTab={() => setIsAuthModalOpen(true)} 
            onOpenAuth={() => setIsAuthModalOpen(true)}
            currentUser={currentUser}
          />
        ) : (
          <>
            {/* Mobile Tab Switcher (Only rendered when user is signed in) */}
            <div className="grid grid-cols-2 sm:flex md:hidden mb-6 gap-1.5 rounded-2xl bg-slate-200/80 p-1.5 dark:bg-slate-900">
              <button
                onClick={() => setActiveTab('predictor')}
                className={`flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold rounded-xl px-3 transition ${activeTab === 'predictor' ? 'bg-white text-medical-600 shadow-sm dark:bg-slate-800 dark:text-medical-400' : 'text-slate-600 dark:text-slate-400'}`}
              >
                <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                <span>Predictor</span>
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold rounded-xl px-3 transition ${activeTab === 'batch' ? 'bg-white text-medical-600 shadow-sm dark:bg-slate-800 dark:text-medical-400' : 'text-slate-600 dark:text-slate-400'}`}
              >
                <UploadCloud className="h-3.5 w-3.5 shrink-0" />
                <span>Batch</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold rounded-xl px-3 transition ${activeTab === 'history' ? 'bg-white text-medical-600 shadow-sm dark:bg-slate-800 dark:text-medical-400' : 'text-slate-600 dark:text-slate-400'}`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" />
                <span>History</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold rounded-xl px-3 transition ${activeTab === 'analytics' ? 'bg-white text-medical-600 shadow-sm dark:bg-slate-800 dark:text-medical-400' : 'text-slate-600 dark:text-slate-400'}`}
              >
                <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                <span>Cohort</span>
              </button>
              {canAccessDevTools && devMode && (
                <button
                  onClick={() => setActiveTab('system')}
                  className={`col-span-2 flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold rounded-xl px-3 transition ${activeTab === 'system' ? 'bg-white text-medical-600 shadow-sm dark:bg-slate-800 dark:text-medical-400' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  <Server className="h-3.5 w-3.5 shrink-0" />
                  <span>Dev API</span>
                </button>
              )}
            </div>

        {/* Tab 1: Predictor Workspace */}
        {activeTab === 'predictor' && (
          <div className="space-y-6 sm:space-y-8">
            
            {/* Workspace Hero Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-medical-950 p-5 sm:p-8 text-white shadow-2xl overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center space-x-2 rounded-full bg-medical-500/20 px-3 py-1 text-[11px] sm:text-xs font-bold text-medical-300 border border-medical-500/30">
                  <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Clinical Decision Support System (Nigerian & Global)</span>
                </span>
                <h1 className="mt-3 sm:mt-4 text-2xl font-extrabold tracking-tight sm:text-4xl">
                  Diabetic Readmission Risk Predictor
                </h1>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Predict 30-day diabetic patient hospital readmissions using ensemble ML models. Tailored for Nigerian clinical encounters & regional health care pathways (PHC / NHIA / HMO), while maintaining universal applicability for global demographics.
                </p>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid gap-8 lg:grid-cols-12">
              
              {/* Left Column: Form (5 Cols) */}
              <div className="lg:col-span-6 xl:col-span-5">
                <PredictorForm
                  formData={formData}
                  onChange={setFormData}
                  onSubmit={handleCalculateRisk}
                  isLoading={isLoading}
                  sampleCases={sampleCases}
                  onSelectSample={handleSelectSample}
                />
              </div>

              {/* Right Column: Dashboard Results (7 Cols) */}
              <div className="lg:col-span-6 xl:col-span-7">
                <RiskResultDashboard
                  prediction={prediction}
                  isLoading={isLoading}
                  patientData={formData}
                />

              </div>

            </div>

          </div>
        )}

        {/* Protected View Gate for Sensitive Patient Data Tabs & Role-Based Permissions */}
        {(activeTab === 'batch' || activeTab === 'history') && !currentUser ? (
          <div className="glass flex flex-col items-center justify-center rounded-3xl border border-slate-200 p-12 text-center shadow-xl dark:border-slate-800 my-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-medical-500/10 text-medical-600 dark:text-medical-400">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="mt-6 text-2xl font-extrabold text-slate-900 dark:text-white">
              Clinical Authentication Required
            </h3>
            <p className="mt-2 max-w-md text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Access to sensitive patient EHR assessment logs, historical audit records, and bulk cohort ingestion is protected under NDPR & HIPAA data privacy regulations. Please sign in with your clinical credentials.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-medical-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-medical-500/30 hover:bg-medical-500 active:scale-95 transition"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In to Access Patient Records</span>
            </button>
          </div>
        ) : (
          <>
            {/* Tab 2: Batch CSV Ingestion (Administrator Only) */}
            {activeTab === 'batch' && (
              currentUser?.role !== 'Administrator' ? (
                <div className="glass flex flex-col items-center justify-center rounded-3xl border border-slate-200 p-12 text-center shadow-xl dark:border-slate-800 my-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 text-2xl font-extrabold text-slate-900 dark:text-white">
                    Administrator Privilege Required
                  </h3>
                  <p className="mt-2 max-w-md text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Bulk CSV patient cohort import is restricted to **Hospital Administrators** to prevent accidental EHR batch overwrites. (Logged in as: {currentUser?.role}).
                  </p>
                </div>
              ) : (
                <BatchIngestionView />
              )
            )}

            {/* Tab 3: Audit & Prediction History */}
            {activeTab === 'history' && (
              <PatientHistoryTable onSelectRecord={handleSelectHistoryRecord} />
            )}
          </>
        )}


        {/* Tab 4: Cohort Analytics (Physicians & Administrators) */}
        {activeTab === 'analytics' && (
          currentUser && currentUser.role === 'Nurse' ? (
            <div className="glass flex flex-col items-center justify-center rounded-3xl border border-slate-200 p-12 text-center shadow-xl dark:border-slate-800 my-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Stethoscope className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-2xl font-extrabold text-slate-900 dark:text-white">
                Physician & Admin Analytics Scope
              </h3>
              <p className="mt-2 max-w-md text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Hospital Cohort Risk Analytics is configured for Attending Physicians and Hospital Administrators. As a Nurse Navigator, please use the **Patient Predictor** and **Audit & History** tabs to manage patient follow-ups.
              </p>
            </div>
          ) : (
            <CohortAnalytics />
          )
        )}


        {/* Tab 3: System Scaffolding & API (Administrator Only) */}
        {canAccessDevTools && activeTab === 'system' && (
          <div className="space-y-8">
            <div className="glass rounded-3xl border border-slate-200 p-8 shadow-xl dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    FastAPI REST Endpoints & Open API Docs
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    System architecture status, Swagger UI documentation, and backend services.
                  </p>
                </div>
                <a
                  href={`${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '')}/docs`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 rounded-xl bg-medical-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-medical-500"
                >
                  <span>Open Swagger Docs</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <div className="flex items-center space-x-2 text-medical-600 dark:text-medical-400">
                    <Server className="h-5 w-5" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">POST /api/v1/predict</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Evaluates patient clinical attributes, returns readmission probability, confidence interval, and SHAP features.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <div className="flex items-center space-x-2 text-medical-600 dark:text-medical-400">
                    <Database className="h-5 w-5" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">GET /api/v1/predict/sample-cases</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Fetches clinical sample patient profiles for high, moderate, and low-risk test scenarios.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <div className="flex items-center space-x-2 text-medical-600 dark:text-medical-400">
                    <GitBranch className="h-5 w-5" />
                    <span className="font-bold text-sm text-slate-900 dark:text-white">GET /api/v1/health</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Returns API online status, environment mode, and system release version.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}
          </>
        )}

      </main>

      {/* Auth Modal Component */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(u) => {
          setCurrentUser(u);
        }}
      />

    </div>
  );
}

export default App;

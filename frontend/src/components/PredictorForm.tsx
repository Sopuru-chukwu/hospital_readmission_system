import React, { useState, useEffect } from 'react';
import { 
  User, 
  Clock, 
  Activity, 
  Sparkles, 
  Stethoscope,
  ChevronRight,
  RefreshCw,
  Search,
  CheckCircle2,
  Database,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import type { ReadmissionPredictionRequest, SamplePatientCase, PatientHistoryRecord } from '../types/prediction';

type StepTab = 'demographics' | 'metrics' | 'labs';
const ALL_STEPS: StepTab[] = ['demographics', 'metrics', 'labs'];

interface PredictorFormProps {
  formData: ReadmissionPredictionRequest;
  onChange: (data: ReadmissionPredictionRequest) => void;
  onSubmit: () => void;
  isLoading: boolean;
  sampleCases: SamplePatientCase[];
  onSelectSample: (sample: SamplePatientCase) => void;
}

export const PredictorForm: React.FC<PredictorFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
  sampleCases,
  onSelectSample,
}) => {
  const [activeTab, setActiveTab] = useState<StepTab>('demographics');
  const [visitedSteps, setVisitedSteps] = useState<Set<StepTab>>(() => new Set(['demographics']));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [historyRecords, setHistoryRecords] = useState<PatientHistoryRecord[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [loadedNotice, setLoadedNotice] = useState<string | null>(null);

  const hasPatientName = Boolean(formData.patient_name && formData.patient_name.trim().length > 0);
  const allStepsVisited = ALL_STEPS.every((step) => visitedSteps.has(step));
  const canSubmit = hasPatientName && allStepsVisited;

  // Load past patient records for auto-completion lookup
  useEffect(() => {
    api.getPredictionHistory(50)
      .then(records => setHistoryRecords(records))
      .catch(() => setHistoryRecords([]));
  }, []);

  const handleTabChange = (targetTab: StepTab) => {
    if (targetTab !== 'demographics' && !hasPatientName) {
      setValidationError('Please enter a Patient Name / Hospital Record ID (MRN) before proceeding to the next steps.');
      setActiveTab('demographics');
      return;
    }
    if (targetTab === 'labs' && !visitedSteps.has('metrics')) {
      setValidationError('Please review Step 2 (Admission & Utilization) before proceeding to Step 3.');
      setActiveTab('metrics');
      setVisitedSteps((prev) => new Set(prev).add('metrics'));
      return;
    }
    setValidationError(null);
    setActiveTab(targetTab);
    setVisitedSteps((prev) => new Set(prev).add(targetTab));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPatientName) {
      setValidationError('Patient Name / Hospital Record ID (MRN) is required before submitting.');
      setActiveTab('demographics');
      return;
    }
    if (!allStepsVisited) {
      const nextUnvisited = ALL_STEPS.find((step) => !visitedSteps.has(step)) || 'labs';
      setValidationError('Please go through all 3 clinical parameter steps before submitting.');
      setActiveTab(nextUnvisited);
      setVisitedSteps((prev) => new Set(prev).add(nextUnvisited));
      return;
    }
    setValidationError(null);
    onSubmit();
  };

  const updateField = (field: keyof ReadmissionPredictionRequest, value: string | number) => {
    if (field === 'patient_name') {
      setIsSearching(true);
      setLoadedNotice(null);
      if (String(value).trim().length > 0) {
        setValidationError(null);
      }
      const valStr = String(value).trim();
      if (valStr.length > 2) {
        const exactMatch = historyRecords.find(
          r => r.patient_name.toLowerCase().trim() === valStr.toLowerCase()
        );
        if (exactMatch) {
          handleSelectHistoryRecord(exactMatch);
          return;
        }
      }
    }
    onChange({
      ...formData,
      [field]: value
    });
  };

  const handleSelectHistoryRecord = (record: PatientHistoryRecord) => {
    onChange({
      ...formData,
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
    setIsSearching(false);
    setValidationError(null);
    setActiveTab('demographics');
    setVisitedSteps(new Set(['demographics']));
    setLoadedNotice(`Loaded recorded baseline for ${record.patient_name} (#REC-${record.id}). Please review all 3 steps to submit.`);
  };

  const handleSelectSampleCase = (sample: SamplePatientCase) => {
    onSelectSample(sample);
    setIsSearching(false);
    setValidationError(null);
    setActiveTab('demographics');
    setVisitedSteps(new Set(['demographics']));
    setLoadedNotice(`Loaded preset profile for ${sample.name}. Please review all 3 steps to submit.`);
  };

  // Filter existing history records and samples matching query
  const query = (formData.patient_name || '').trim().toLowerCase();
  const matchingHistory = query.length > 0
    ? historyRecords.filter(r => r.patient_name.toLowerCase().includes(query) || r.primary_diagnosis.toLowerCase().includes(query))
    : [];
  
  const matchingSamples = query.length > 0
    ? sampleCases.filter(s => s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query))
    : [];

  return (
    <div className="glass rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/60">
      
      {/* Header & Quick Sample Profiles */}
      <div className="flex flex-col gap-4 pb-5 sm:pb-6 border-b border-slate-200 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center space-x-2 text-medical-600 dark:text-medical-400 text-xs sm:text-sm font-semibold">
            <Stethoscope className="h-4 w-4" />
            <span>Clinical Input Parameters</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Patient Risk Profile Evaluator
          </h2>
        </div>

        {/* Quick Sample Selector */}
        {sampleCases.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Presets:
            </span>
            {sampleCases.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSampleCase(sample)}
                className="inline-flex items-center space-x-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 sm:px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-medical-50 hover:border-medical-300 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/60"
              >
                <span>{sample.badge}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Form Section Navigation */}
      <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-1 sm:gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => handleTabChange('demographics')}
          className={`flex items-center justify-between sm:justify-start space-x-2 rounded-xl sm:rounded-none border sm:border-0 sm:border-b-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition ${
            activeTab === 'demographics'
              ? 'border-medical-500 bg-medical-500/10 sm:bg-transparent text-medical-600 dark:text-medical-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 shrink-0" />
            <span>1. Demographics & History</span>
          </div>
          {hasPatientName && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('metrics')}
          className={`flex items-center justify-between sm:justify-start space-x-2 rounded-xl sm:rounded-none border sm:border-0 sm:border-b-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition ${
            activeTab === 'metrics'
              ? 'border-medical-500 bg-medical-500/10 sm:bg-transparent text-medical-600 dark:text-medical-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>2. Admission & Utilization</span>
          </div>
          {visitedSteps.has('metrics') && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('labs')}
          className={`flex items-center justify-between sm:justify-start space-x-2 rounded-xl sm:rounded-none border sm:border-0 sm:border-b-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition ${
            activeTab === 'labs'
              ? 'border-medical-500 bg-medical-500/10 sm:bg-transparent text-medical-600 dark:text-medical-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 shrink-0" />
            <span>3. Clinical Labs & Diagnosis</span>
          </div>
          {visitedSteps.has('labs') && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
        </button>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="mt-4 flex items-center space-x-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleFormSubmit} className="mt-6 space-y-6">
        
        {/* Tab 1: Demographics */}
        {activeTab === 'demographics' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3 relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Patient Name / Hospital Record ID (MRN) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2">
                <input
                  type="text"
                  required
                  placeholder="Type patient name or MRN to search existing records (e.g. Babatunde O.)..."
                  value={formData.patient_name || ''}
                  onFocus={() => setIsSearching(true)}
                  onChange={(e) => updateField('patient_name', e.target.value)}
                  className={`block w-full rounded-xl border bg-white p-3 pr-10 text-sm font-medium text-slate-900 focus:border-medical-500 focus:outline-none focus:ring-2 focus:ring-medical-500/20 dark:bg-slate-950 dark:text-white ${
                    validationError && !hasPatientName
                      ? 'border-red-400 dark:border-red-500/60'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Notification when patient record is loaded */}
              {loadedNotice && (
                <div className="mt-2 flex items-center space-x-2 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{loadedNotice}</span>
                </div>
              )}

              {/* Autocomplete Search Dropdown */}
              {isSearching && (matchingHistory.length > 0 || matchingSamples.length > 0) && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Matching Hospital Records</span>
                    <button 
                      type="button" 
                      onClick={() => setIsSearching(false)} 
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      Close ✕
                    </button>
                  </div>

                  {/* Past Database Records */}
                  {matchingHistory.map((rec) => (
                    <div
                      key={`hist-${rec.id}`}
                      onClick={() => handleSelectHistoryRecord(rec)}
                      className="flex items-center justify-between rounded-xl p-2.5 hover:bg-medical-50 dark:hover:bg-slate-800 cursor-pointer transition"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-medical-500/10 text-medical-600 dark:text-medical-400">
                          <Database className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {rec.patient_name} <span className="text-[10px] font-normal text-slate-400">#REC-{rec.id}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {rec.primary_diagnosis} • {rec.age_bracket} • {rec.gender}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.risk_level === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        rec.risk_level === 'Moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {rec.risk_score}% Risk
                      </span>
                    </div>
                  ))}

                  {/* Sample Presets */}
                  {matchingSamples.map((sample) => (
                    <div
                      key={`sample-${sample.id}`}
                      onClick={() => handleSelectSampleCase(sample)}
                      className="flex items-center justify-between rounded-xl p-2.5 hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer transition"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {sample.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                            {sample.description}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        {sample.badge}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Age Bracket
              </label>
              <select
                value={formData.age_bracket}
                onChange={(e) => updateField('age_bracket', e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-900 focus:border-medical-500 focus:outline-none focus:ring-2 focus:ring-medical-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {['[30-40)', '[40-50)', '[50-60)', '[60-70)', '[70-80)', '[80-90)', '[90-100)'].map(age => (
                  <option key={age} value={age}>{age} years</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => updateField('gender', e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-900 focus:border-medical-500 focus:outline-none focus:ring-2 focus:ring-medical-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Race / Ethnicity
              </label>
              <select
                value={formData.race}
                onChange={(e) => updateField('race', e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-900 focus:border-medical-500 focus:outline-none focus:ring-2 focus:ring-medical-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="African (Nigerian)">African (Nigerian)</option>
                <option value="African (Other)">African (Other Regional)</option>
                <option value="AfricanAmerican">African American</option>
                <option value="Caucasian">Caucasian</option>
                <option value="Hispanic">Hispanic</option>
                <option value="Asian">Asian</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Prior Inpatient Admissions (Past Year)
              </label>
              <div className="mt-2 flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.number_inpatient}
                  onChange={(e) => updateField('number_inpatient', parseInt(e.target.value))}
                  className="w-full accent-medical-500 h-2 rounded-lg bg-slate-200 dark:bg-slate-800"
                />
                <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-lg bg-medical-50 px-2.5 py-1 text-sm font-bold text-medical-600 dark:bg-medical-950 dark:text-medical-400 border border-medical-200 dark:border-medical-800">
                  {formData.number_inpatient}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Emergency Room Visits (Past Year)
              </label>
              <div className="mt-2 flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.number_emergency}
                  onChange={(e) => updateField('number_emergency', parseInt(e.target.value))}
                  className="w-full accent-medical-500 h-2 rounded-lg bg-slate-200 dark:bg-slate-800"
                />
                <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-lg bg-medical-50 px-2.5 py-1 text-sm font-bold text-medical-600 dark:bg-medical-950 dark:text-medical-400 border border-medical-200 dark:border-medical-800">
                  {formData.number_emergency}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Outpatient Visits (Past Year)
              </label>
              <div className="mt-2 flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={formData.number_outpatient}
                  onChange={(e) => updateField('number_outpatient', parseInt(e.target.value))}
                  className="w-full accent-medical-500 h-2 rounded-lg bg-slate-200 dark:bg-slate-800"
                />
                <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-lg bg-medical-50 px-2.5 py-1 text-sm font-bold text-medical-600 dark:bg-medical-950 dark:text-medical-400 border border-medical-200 dark:border-medical-800">
                  {formData.number_outpatient}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Metrics */}
        {activeTab === 'metrics' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Time in Hospital (Days)
              </label>
              <div className="mt-2 flex items-center space-x-3">
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={formData.time_in_hospital}
                  onChange={(e) => updateField('time_in_hospital', parseInt(e.target.value))}
                  className="w-full accent-medical-500 h-2 rounded-lg bg-slate-200 dark:bg-slate-800"
                />
                <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-lg bg-medical-50 px-2.5 py-1 text-sm font-bold text-medical-600 dark:bg-medical-950 dark:text-medical-400 border border-medical-200 dark:border-medical-800">
                  {formData.time_in_hospital} d
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Number of Medications Administered
              </label>
              <div className="mt-2 flex items-center space-x-3">
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={formData.num_medications}
                  onChange={(e) => updateField('num_medications', parseInt(e.target.value))}
                  className="w-full accent-medical-500 h-2 rounded-lg bg-slate-200 dark:bg-slate-800"
                />
                <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-lg bg-medical-50 px-2.5 py-1 text-sm font-bold text-medical-600 dark:bg-medical-950 dark:text-medical-400 border border-medical-200 dark:border-medical-800">
                  {formData.num_medications}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Number of Lab Procedures
              </label>
              <div className="mt-2 flex items-center space-x-3">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={formData.num_lab_procedures}
                  onChange={(e) => updateField('num_lab_procedures', parseInt(e.target.value))}
                  className="w-full accent-medical-500 h-2 rounded-lg bg-slate-200 dark:bg-slate-800"
                />
                <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-lg bg-medical-50 px-2.5 py-1 text-sm font-bold text-medical-600 dark:bg-medical-950 dark:text-medical-400 border border-medical-200 dark:border-medical-800">
                  {formData.num_lab_procedures}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Comorbid Diagnoses Count
              </label>
              <div className="mt-2 flex items-center space-x-3">
                <input
                  type="range"
                  min="1"
                  max="16"
                  value={formData.number_diagnoses}
                  onChange={(e) => updateField('number_diagnoses', parseInt(e.target.value))}
                  className="w-full accent-medical-500 h-2 rounded-lg bg-slate-200 dark:bg-slate-800"
                />
                <span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-lg bg-medical-50 px-2.5 py-1 text-sm font-bold text-medical-600 dark:bg-medical-950 dark:text-medical-400 border border-medical-200 dark:border-medical-800">
                  {formData.number_diagnoses}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Discharge Location / Status
              </label>
              <select
                value={formData.discharge_disposition}
                onChange={(e) => updateField('discharge_disposition', e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-900 focus:border-medical-500 focus:outline-none focus:ring-2 focus:ring-medical-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="Discharged to Home">Discharged to Home</option>
                <option value="SNF">Skilled Nursing Facility (SNF)</option>
                <option value="Rehab">Rehabilitation Facility</option>
                <option value="Left AMA">Left Against Medical Advice (AMA)</option>
                <option value="Hospice">Hospice Care</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 3: Labs & Diagnoses */}
        {activeTab === 'labs' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                HbA1c Test Result
              </label>
              <select
                value={formData.a1c_result}
                onChange={(e) => updateField('a1c_result', e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-900 focus:border-medical-500 focus:outline-none focus:ring-2 focus:ring-medical-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="None">None (Not Tested)</option>
                <option value="Norm">Normal (&lt; 7%)</option>
                <option value=">7">Elevated (&gt; 7%)</option>
                <option value=">8">Severe High (&gt; 8%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Glucose Serum Test
              </label>
              <select
                value={formData.max_glu_serum}
                onChange={(e) => updateField('max_glu_serum', e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-900 focus:border-medical-500 focus:outline-none focus:ring-2 focus:ring-medical-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="None">None (Not Tested)</option>
                <option value="Norm">Normal</option>
                <option value=">200">High (&gt; 200 mg/dL)</option>
                <option value=">300">Very High (&gt; 300 mg/dL)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Primary ICD-9 Category
              </label>
              <select
                value={formData.primary_diagnosis}
                onChange={(e) => updateField('primary_diagnosis', e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-900 focus:border-medical-500 focus:outline-none focus:ring-2 focus:ring-medical-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="Diabetes">Diabetes Mellitus (250.xx)</option>
                <option value="Circulatory">Circulatory (Heart failure, CAD, HTN)</option>
                <option value="Respiratory">Respiratory (Pneumonia, COPD)</option>
                <option value="Digestive">Digestive System</option>
                <option value="Genitourinary">Genitourinary (Kidney/CKD)</option>
                <option value="Musculoskeletal">Musculoskeletal</option>
                <option value="Other">Other / Injury</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Diabetes Med Change During Stay?
              </label>
              <select
                value={formData.change_med}
                onChange={(e) => updateField('change_med', e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-900 focus:border-medical-500 focus:outline-none focus:ring-2 focus:ring-medical-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="Ch">Yes (Medication Dose/Type Changed)</option>
                <option value="No">No (Unchanged)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Diabetic Medication Prescribed?
              </label>
              <select
                value={formData.diabetes_med}
                onChange={(e) => updateField('diabetes_med', e.target.value)}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-900 focus:border-medical-500 focus:outline-none focus:ring-2 focus:ring-medical-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        )}

        {/* Submit & Calculate Button */}
        <div className="pt-4 space-y-3 border-t border-slate-200 dark:border-slate-800">
          {!canSubmit && (
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>
                {!hasPatientName
                  ? 'Enter a Patient Name / MRN and go through all 3 steps to submit.'
                  : `Review all 3 steps (${visitedSteps.size}/3 visited) to enable submission.`}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {activeTab !== 'demographics' && (
                <button
                  type="button"
                  onClick={() => handleTabChange(activeTab === 'labs' ? 'metrics' : 'demographics')}
                  className="flex-1 sm:flex-initial rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  Previous Step
                </button>
              )}
              {activeTab !== 'labs' && (
                <button
                  type="button"
                  onClick={() => handleTabChange(activeTab === 'demographics' ? 'metrics' : 'labs')}
                  className="flex-1 sm:flex-initial rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white"
                >
                  Next Step
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !canSubmit}
              title={!canSubmit ? 'Please enter a patient name and complete all 3 steps first' : 'Calculate Readmission Risk'}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-medical-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-medical-500/30 transition hover:bg-medical-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-medical-600 disabled:active:scale-100"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Calculating Risk Score...</span>
                </>
              ) : (
                <>
                  <span>Calculate Readmission Risk</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

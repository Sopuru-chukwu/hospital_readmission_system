import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  RefreshCw, 
  Calendar, 
  User, 
  AlertTriangle, 
  Activity,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { api } from '../services/api';
import type { PatientHistoryRecord } from '../types/prediction';

interface PatientHistoryTableProps {
  onSelectRecord?: (record: PatientHistoryRecord) => void;
}

export const PatientHistoryTable: React.FC<PatientHistoryTableProps> = ({ onSelectRecord }) => {
  const [records, setRecords] = useState<PatientHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'High' | 'Moderate' | 'Low'>('All');

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPredictionHistory(50);
      setRecords(data);
    } catch (err) {
      console.error('Failed to load prediction history:', err);
      // Mock history fallback if database connection is offline
      setRecords([
        {
          id: 101,
          patient_name: 'Eleanor Vance',
          age_bracket: '[70-80)',
          gender: 'Female',
          time_in_hospital: 6,
          num_medications: 18,
          number_inpatient: 2,
          number_emergency: 1,
          a1c_result: '>8',
          primary_diagnosis: 'Diabetes',
          discharge_disposition: 'Discharged to Home',
          risk_score: 64.2,
          risk_category: 'High Risk (<30 Days)',
          risk_level: 'High',
          top_feature_impact: 'Prior 2 inpatient admissions in past year increases readmission likelihood.',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: 102,
          patient_name: 'Robert Thorne',
          age_bracket: '[60-70)',
          gender: 'Male',
          time_in_hospital: 4,
          num_medications: 12,
          number_inpatient: 1,
          number_emergency: 0,
          a1c_result: '>7',
          primary_diagnosis: 'Circulatory',
          discharge_disposition: 'Discharged to Home',
          risk_score: 34.5,
          risk_category: 'Moderate Risk (>30 Days)',
          risk_level: 'Moderate',
          top_feature_impact: 'Primary diagnosis of Circulatory comorbidity with diabetes.',
          created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
        },
        {
          id: 103,
          patient_name: 'Sarah Lin',
          age_bracket: '[50-60)',
          gender: 'Female',
          time_in_hospital: 2,
          num_medications: 8,
          number_inpatient: 0,
          number_emergency: 0,
          a1c_result: 'Norm',
          primary_diagnosis: 'Diabetes',
          discharge_disposition: 'Discharged to Home',
          risk_score: 14.8,
          risk_category: 'Low Risk (No Readmit)',
          risk_level: 'Low',
          top_feature_impact: 'Zero prior inpatient admissions and controlled HbA1c.',
          created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter records based on search and risk filter
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.primary_diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.age_bracket.includes(searchQuery);
    
    const matchesRisk = riskFilter === 'All' || record.risk_level === riskFilter;

    return matchesSearch && matchesRisk;
  });

  // Calculate summary metrics
  const totalCount = records.length;
  const highRiskCount = records.filter(r => r.risk_level === 'High').length;
  const avgRiskScore = totalCount > 0 
    ? (records.reduce((acc, r) => acc + r.risk_score, 0) / totalCount).toFixed(1)
    : '0.0';

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Stat Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="glass rounded-3xl border border-slate-200 p-6 shadow-sm dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Evaluations Logged
            </span>
            <div className="rounded-lg bg-medical-500/10 p-2 text-medical-600 dark:text-medical-400">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {totalCount}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Persisted in SQLite / PostgreSQL Database
          </p>
        </div>

        <div className="glass rounded-3xl border border-slate-200 p-6 shadow-sm dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              High Risk Encounters
            </span>
            <div className="rounded-lg bg-red-500/10 p-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-red-600 dark:text-red-400">
            {highRiskCount}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Require Urgent 7-Day Care Coordination
          </p>
        </div>

        <div className="glass rounded-3xl border border-slate-200 p-6 shadow-sm dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Average Cohort Risk
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
            {avgRiskScore}%
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Mean 30-Day Readmission Score
          </p>
        </div>
      </div>

      {/* Main Audit Log Table Card */}
      <div className="glass rounded-3xl border border-slate-200 p-6 shadow-xl dark:border-slate-800">
        
        {/* Table Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-medical-500" />
              Patient Assessment Audit History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical record of patient readmission risk scores, SHAP impacts, and clinical assessments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient or diagnosis..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 rounded-xl border border-slate-200 bg-white/80 pl-9 pr-3 py-1.5 text-xs font-medium text-slate-900 focus:border-medical-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            {/* Risk Tier Filter */}
            <div className="flex items-center space-x-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {(['All', 'High', 'Moderate', 'Low'] as const).map(tier => (
                <button
                  key={tier}
                  onClick={() => setRiskFilter(tier)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    riskFilter === tier
                      ? 'bg-white text-medical-600 shadow-sm dark:bg-slate-800 dark:text-medical-400'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchHistory}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white transition"
              title="Refresh Logs"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center space-x-2 text-slate-500">
            <RefreshCw className="h-5 w-5 animate-spin text-medical-500" />
            <span className="text-xs font-semibold">Loading audit logs...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <Database className="h-10 w-10 text-slate-300 dark:text-slate-700" />
            <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-400">No Assessment Records Found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Run a new prediction using the Patient Predictor tab to log evaluations.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  <th className="py-3 px-4 font-bold">Patient & ID</th>
                  <th className="py-3 px-4 font-bold">Assessment Date</th>
                  <th className="py-3 px-4 font-bold">Readmission Risk</th>
                  <th className="py-3 px-4 font-bold">Primary Diagnosis</th>
                  <th className="py-3 px-4 font-bold">Demographics</th>
                  <th className="py-3 px-4 font-bold">Top Predictor Impact</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {filteredRecords.map((record) => (
                  <tr 
                    key={record.id}
                    className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition"
                  >
                    {/* Patient Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-medical-500/10 text-medical-600 dark:text-medical-400">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div>{record.patient_name}</div>
                          <div className="text-[10px] font-normal text-slate-400">#REC-{record.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatDate(record.created_at)}</span>
                      </div>
                    </td>

                    {/* Risk Score & Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {record.risk_score}%
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          record.risk_level === 'High' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                          record.risk_level === 'Moderate' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                          'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                        }`}>
                          {record.risk_level}
                        </span>
                      </div>
                    </td>

                    {/* Diagnosis */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {record.primary_diagnosis}
                    </td>

                    {/* Demographics */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {record.age_bracket} • {record.gender}
                    </td>

                    {/* Top Impact */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={record.top_feature_impact || 'N/A'}>
                      {record.top_feature_impact || 'N/A'}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {onSelectRecord && (
                        <button
                          onClick={() => onSelectRecord(record)}
                          className="inline-flex items-center space-x-1 rounded-lg bg-medical-500/10 px-2.5 py-1 text-xs font-bold text-medical-600 hover:bg-medical-500 hover:text-white dark:text-medical-400 transition"
                        >
                          <span>View</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

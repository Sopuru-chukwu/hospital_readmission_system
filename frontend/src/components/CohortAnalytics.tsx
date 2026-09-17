import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Database, TrendingUp, Layers, Award, Target, Users } from 'lucide-react';

export const CohortAnalytics: React.FC = () => {
  const readmissionDistData = [
    { name: 'No Readmission', count: 54864, fill: '#10b981' },
    { name: 'Readmitted >30 Days', count: 35545, fill: '#f59e0b' },
    { name: 'Readmitted <30 Days', count: 11357, fill: '#ef4444' }
  ];

  const topPredictorsData = [
    { name: 'Inpatient Visits', weight: 88 },
    { name: 'Discharge Status', weight: 76 },
    { name: 'Emergency Visits', weight: 68 },
    { name: 'HbA1c > 8%', weight: 62 },
    { name: 'Time in Hospital', weight: 55 },
    { name: 'Medications Count', weight: 48 },
    { name: 'Age Bracket', weight: 42 },
  ];

  return (
    <div className="space-y-8">
      
      {/* Overview Stats Header */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="glass rounded-3xl border border-slate-200 p-6 shadow-sm dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cohort Size
            </span>
            <div className="rounded-lg bg-medical-500/10 p-2 text-medical-600 dark:text-medical-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
            101,766
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            UCI US Hospitals Diabetic Admissions Dataset
          </p>
        </div>

        <div className="glass rounded-3xl border border-slate-200 p-6 shadow-sm dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Model ROC-AUC
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
            0.911
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Cross-Validated Gradient Boosted Ensemble
          </p>

        </div>

        <div className="glass rounded-3xl border border-slate-200 p-6 shadow-sm dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              30-Day Rate
            </span>
            <div className="rounded-lg bg-red-500/10 p-2 text-red-600 dark:text-red-400">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
            11.16%
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Acute 30-Day Unplanned Readmission Baseline
          </p>
        </div>

        <div className="glass rounded-3xl border border-slate-200 p-6 shadow-sm dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Features Modeled
            </span>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
            47
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Clinical, Demographic & Diagnostic Attributes
          </p>
        </div>

      </div>

      {/* Distribution & ROC Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Dataset Class Distribution */}
        <div className="glass rounded-3xl border border-slate-200 p-6 shadow-xl dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-medical-500" />
            Readmission Class Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Breakdown across 101,766 hospital encounter records
          </p>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={readmissionDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {readmissionDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number | string) => [Number(value).toLocaleString(), 'Patient Encounters']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Feature Importance */}
        <div className="glass rounded-3xl border border-slate-200 p-6 shadow-xl dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-medical-500" />
            Global Predictor Feature Importance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Top clinical attributes contributing to model predictions across population
          </p>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPredictorsData} margin={{ top: 10, right: 30, left: 40, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="weight" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

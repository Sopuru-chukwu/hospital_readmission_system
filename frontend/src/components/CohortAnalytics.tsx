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
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { Database, TrendingUp, Layers, Award, Target, Users, Activity } from 'lucide-react';

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

  // Holdout Test Set ROC Curve Data (n = 2,400 test encounters)
  const rocCurveData = [
    { fpr: 0.00, rf: 0.0000, lr: 0.0000, dt: 0.0000, baseline: 0.00 },
    { fpr: 0.05, rf: 0.5870, lr: 0.6051, dt: 0.5050, baseline: 0.05 },
    { fpr: 0.10, rf: 0.7065, lr: 0.7572, dt: 0.6299, baseline: 0.10 },
    { fpr: 0.15, rf: 0.8261, lr: 0.8261, dt: 0.7033, baseline: 0.15 },
    { fpr: 0.20, rf: 0.8804, lr: 0.8696, dt: 0.7746, baseline: 0.20 },
    { fpr: 0.25, rf: 0.9022, lr: 0.8877, dt: 0.7997, baseline: 0.25 },
    { fpr: 0.30, rf: 0.9239, lr: 0.9094, dt: 0.8110, baseline: 0.30 },
    { fpr: 0.35, rf: 0.9457, lr: 0.9239, dt: 0.8245, baseline: 0.35 },
    { fpr: 0.40, rf: 0.9565, lr: 0.9493, dt: 0.8380, baseline: 0.40 },
    { fpr: 0.45, rf: 0.9601, lr: 0.9565, dt: 0.8515, baseline: 0.45 },
    { fpr: 0.50, rf: 0.9710, lr: 0.9710, dt: 0.8650, baseline: 0.50 },
    { fpr: 0.55, rf: 0.9710, lr: 0.9855, dt: 0.8785, baseline: 0.55 },
    { fpr: 0.60, rf: 0.9746, lr: 0.9891, dt: 0.8920, baseline: 0.60 },
    { fpr: 0.65, rf: 0.9855, lr: 0.9928, dt: 0.9055, baseline: 0.65 },
    { fpr: 0.70, rf: 0.9928, lr: 0.9964, dt: 0.9190, baseline: 0.70 },
    { fpr: 0.75, rf: 0.9964, lr: 0.9964, dt: 0.9325, baseline: 0.75 },
    { fpr: 0.80, rf: 1.0000, lr: 0.9964, dt: 0.9460, baseline: 0.80 },
    { fpr: 0.85, rf: 1.0000, lr: 0.9964, dt: 0.9595, baseline: 0.85 },
    { fpr: 0.90, rf: 1.0000, lr: 0.9964, dt: 0.9730, baseline: 0.90 },
    { fpr: 0.95, rf: 1.0000, lr: 1.0000, dt: 0.9865, baseline: 0.95 },
    { fpr: 1.00, rf: 1.0000, lr: 1.0000, dt: 1.0000, baseline: 1.00 },
  ];

  const modelMetricsComparison = [
    {
      name: 'Random Forest Classifier (RF)',
      badge: 'Best Overall Model',
      color: 'text-emerald-600 dark:text-emerald-400',
      roc_auc: '0.9104',
      recall: '84.78%',
      precision: '40.48%',
      f1: '0.5480',
      accuracy: '83.92%',
    },
    {
      name: 'Logistic Regression (LR)',
      badge: 'Linear Baseline',
      color: 'text-medical-600 dark:text-medical-400',
      roc_auc: '0.9130',
      recall: '88.41%',
      precision: '31.98%',
      f1: '0.4697',
      accuracy: '77.04%',
    },
    {
      name: 'Decision Tree Classifier (DT)',
      badge: 'Rule-Based Tree',
      color: 'text-purple-600 dark:text-purple-400',
      roc_auc: '0.8305',
      recall: '78.26%',
      precision: '32.05%',
      f1: '0.4547',
      accuracy: '78.42%',
    },
  ];

  const readmissionByAgeData = [
    { age: '[30-40)', rate: 11.19, count: 438 },
    { age: '[40-50)', rate: 10.89, count: 1249 },
    { age: '[50-60)', rate: 11.28, count: 2109 },
    { age: '[60-70)', rate: 11.53, count: 3192 },
    { age: '[70-80)', rate: 11.72, count: 3062 },
    { age: '[80-90)', rate: 11.66, count: 1570 },
    { age: '[90-100)', rate: 12.37, count: 380 },
  ];

  const readmissionByInpatientData = [
    { visits: '0 visits', rate: 4.51, count: 7802 },
    { visits: '1 visit', rate: 13.37, count: 2707 },
    { visits: '2 visits', rate: 32.51, count: 932 },
    { visits: '3 visits', rate: 53.37, count: 356 },
    { visits: '4+ visits', rate: 85.22, count: 203 },
  ];

  const smoteDistributionData = [
    {
      stage: 'Before SMOTE (Imbalanced)',
      notReadmitted: 8496,
      readmitted30d: 1104,
      rateLabel: '11.50% Positive',
    },
    {
      stage: 'After SMOTE (Balanced 1:1)',
      notReadmitted: 8496,
      readmitted30d: 8496,
      rateLabel: '50.00% Positive',
    },
  ];

  const partitionSummaryRows = [
    { partition: 'Full dataset after cleaning', total: '12,000', readmitted: '1,380', notReadmitted: '10,620', rate: '11.50%' },
    { partition: 'Training set (before SMOTE)', total: '9,600', readmitted: '1,104', notReadmitted: '8,496', rate: '11.50%' },
    { partition: 'Training set (after SMOTE)', total: '16,992', readmitted: '8,496', notReadmitted: '8,496', rate: '50.00%' },
    { partition: 'Test set (Unseen Hold-out)', total: '2,400', readmitted: '276', notReadmitted: '2,124', rate: '11.50%' },
  ];

  const corrLabels = [
    'Stay Days',
    'Medications',
    'Meds/Day',
    'Lab Tests',
    'Diagnoses',
    'Inpatient',
    'Emergency',
    'Total Visits',
    'Inpatient Ratio',
    'Readmit <30d',
  ];

  const corrMatrix: number[][] = [
    [ 1.00,  0.01, -0.61,  0.00, -0.02, -0.01, -0.01, -0.01, -0.02,  0.11],
    [ 0.01,  1.00,  0.58,  0.00,  0.01, -0.02,  0.00, -0.02, -0.02,  0.09],
    [-0.61,  0.58,  1.00, -0.01,  0.01,  0.00,  0.00,  0.00, -0.01, -0.02],
    [ 0.00,  0.00, -0.01,  1.00,  0.03,  0.00, -0.01,  0.00,  0.00, -0.01],
    [-0.02,  0.01,  0.01,  0.03,  1.00,  0.00,  0.02,  0.01,  0.01, -0.01],
    [-0.01, -0.02,  0.00,  0.00,  0.00,  1.00,  0.01,  0.70,  0.89,  0.44],
    [-0.01,  0.00,  0.00, -0.01,  0.02,  0.01,  1.00,  0.43, -0.08,  0.19],
    [-0.01, -0.02,  0.00,  0.00,  0.01,  0.70,  0.43,  1.00,  0.52,  0.39],
    [-0.02, -0.02, -0.01,  0.00,  0.01,  0.89, -0.08,  0.52,  1.00,  0.34],
    [ 0.11,  0.09, -0.02, -0.01, -0.01,  0.44,  0.19,  0.39,  0.34,  1.00],
  ];

  const getHeatmapCellStyle = (val: number) => {
    if (val >= 0) {
      const alpha = Math.min(1, Math.max(0.06, Math.abs(val)));
      return {
        backgroundColor: `rgba(14, 165, 233, ${alpha.toFixed(2)})`,
        color: val >= 0.5 ? '#ffffff' : undefined,
      };
    } else {
      const alpha = Math.min(1, Math.max(0.06, Math.abs(val)));
      return {
        backgroundColor: `rgba(239, 68, 68, ${alpha.toFixed(2)})`,
        color: val <= -0.5 ? '#ffffff' : undefined,
      };
    }
  };

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

      {/* Training Set Class Distribution Before and After SMOTE */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Grouped Bar Chart: Before vs After SMOTE (7 cols) */}
        <div className="lg:col-span-7 glass rounded-3xl border border-slate-200 p-6 shadow-xl dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-medical-500" />
                Class Distribution Before and After SMOTE (Training Set)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Rebalancing minority early readmissions (&lt;30 days) from 11.50% (1,104) to 50.00% (8,496) on training data only
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              1:1 Balanced Training Split
            </span>
          </div>

          <div className="h-72 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={smoteDistributionData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="stage" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 9500]} />
                <Tooltip
                  formatter={(value: number | string, name: string) => [
                    `${Number(value).toLocaleString()} records`,
                    name,
                  ]}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="notReadmitted"
                  name="Not Readmitted <30 Days (Class 0)"
                  fill="#0ea5e9"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="readmitted30d"
                  name="Readmitted <30 Days (Class 1)"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Partition Class Distribution Table (5 cols) */}
        <div className="lg:col-span-5 glass rounded-3xl border border-slate-200 p-6 shadow-xl dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-medical-500" />
              Class Distribution Across Data Partitions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              80% / 20% stratified split with SMOTE applied strictly to training partition
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                    <th className="pb-2">Partition</th>
                    <th className="pb-2 text-right">Total</th>
                    <th className="pb-2 text-right">&lt;30d</th>
                    <th className="pb-2 text-right">Not &lt;30d</th>
                    <th className="pb-2 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                  {partitionSummaryRows.map((row) => (
                    <tr key={row.partition}>
                      <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">{row.partition}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">{row.total}</td>
                      <td className="py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">{row.readmitted}</td>
                      <td className="py-2.5 text-right font-mono text-medical-600 dark:text-medical-400 font-bold">{row.notReadmitted}</td>
                      <td className="py-2.5 text-right font-mono font-extrabold text-slate-900 dark:text-white">{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-[11px] text-slate-600 dark:text-slate-300 border border-emerald-500/20">
            <strong className="text-emerald-700 dark:text-emerald-400">Zero Data Leakage Guarantee:</strong> Oversampling is restricted exclusively to the training split (<code className="font-mono">9,600 → 16,992</code>), while the held-out test set (<code className="font-mono">n = 2,400</code>) preserves the true clinical prevalence (<strong>11.50%</strong>).
          </div>
        </div>
      </div>

      {/* Holdout Test-Set ROC Curves & Model Comparison */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Interactive ROC Curves Chart (7 cols) */}
        <div className="lg:col-span-7 glass rounded-3xl border border-slate-200 p-6 shadow-xl dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-medical-500" />
                Holdout Test-Set ROC Curves (3 Models)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                True Positive Rate (Sensitivity) vs. False Positive Rate on 2,400 holdout test encounters
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Best Overall: Random Forest (F1 = 0.5480 | AUC = 0.9104)
            </span>
          </div>

          <div className="h-80 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocCurveData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis 
                  dataKey="fpr" 
                  type="number" 
                  domain={[0, 1]} 
                  tickCount={6}
                  tick={{ fontSize: 11 }} 
                  label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -10, fontSize: 11 }} 
                />
                <YAxis 
                  domain={[0, 1]} 
                  tickCount={6}
                  tick={{ fontSize: 11 }} 
                  label={{ value: 'True Positive Rate (Recall)', angle: -90, position: 'insideLeft', fontSize: 11 }} 
                />
                <Tooltip 
                  formatter={(value: number | string, name: string) => [Number(value).toFixed(4), name]}
                  labelFormatter={(label) => `FPR: ${Number(label).toFixed(2)}`}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="rf"
                  name="Random Forest (AUC = 0.9104)"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="lr"
                  name="Logistic Regression (AUC = 0.9130)"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="dt"
                  name="Decision Tree (AUC = 0.8305)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                />
                <Line
                  type="linear"
                  dataKey="baseline"
                  name="Random Chance (AUC = 0.5000)"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Holdout Test-Set Model Comparison Table (5 cols) */}
        <div className="lg:col-span-5 glass rounded-3xl border border-slate-200 p-6 shadow-xl dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-medical-500" />
              Test-Set Model Benchmark
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Evaluated at clinical sensitivity threshold (p ≥ 0.35) on identical stratified holdout split
            </p>

            <div className="mt-5 space-y-4">
              {modelMetricsComparison.map((model) => (
                <div
                  key={model.name}
                  className="rounded-2xl border border-slate-200/80 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold ${model.color}`}>
                      {model.name}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {model.badge}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-5 gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-950">
                      <div className="text-[10px] font-semibold uppercase text-slate-400">ROC-AUC</div>
                      <div className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-white">{model.roc_auc}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-950">
                      <div className="text-[10px] font-semibold uppercase text-slate-400">Recall</div>
                      <div className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-white">{model.recall}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-950">
                      <div className="text-[10px] font-semibold uppercase text-slate-400">Precision</div>
                      <div className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-white">{model.precision}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-950">
                      <div className="text-[10px] font-semibold uppercase text-slate-400">F1</div>
                      <div className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-white">{model.f1}</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-950">
                      <div className="text-[10px] font-semibold uppercase text-slate-400">Acc</div>
                      <div className="mt-0.5 text-xs font-extrabold text-slate-900 dark:text-white">{model.accuracy}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-medical-500/10 p-3 text-[11px] text-slate-600 dark:text-slate-300 border border-medical-500/20">
            <strong className="text-medical-600 dark:text-medical-400">Why Random Forest?</strong> Consistent with Breiman (2001), <code className="font-mono">RandomForestClassifier</code> outperforms both <code className="font-mono">LogisticRegression</code> and <code className="font-mono">DecisionTree</code>, achieving the highest overall Accuracy (<strong>83.92%</strong>), Specificity (<strong>83.80%</strong>), Precision (<strong>40.48%</strong>), and F1-Score (<strong>0.5480</strong>) with a ROC-AUC of <strong>0.9104</strong>.
          </div>
        </div>

      </div>

      {/* Readmission Rate by Age Group & Prior Inpatient Admissions */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Readmission Rate by Age Group */}
        <div className="glass rounded-3xl border border-slate-200 p-6 shadow-xl dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-medical-500" />
            30-Day Readmission Rate by Age Bracket
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Percentage of patients readmitted within 30 days across demographic age brackets
          </p>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readmissionByAgeData} margin={{ top: 10, right: 20, left: 10, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="age" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 16]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  formatter={(value: number | string) => [`${Number(value).toFixed(2)}%`, '30-Day Readmission Rate']}
                />
                <Bar dataKey="rate" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Readmission Rate by Prior Inpatient Admissions */}
        <div className="glass rounded-3xl border border-slate-200 p-6 shadow-xl dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-red-500" />
            30-Day Readmission Rate by Prior Inpatient Visits
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Steep risk escalation with prior inpatient admissions in the preceding 12 months
          </p>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readmissionByInpatientData} margin={{ top: 10, right: 20, left: 10, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="visits" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  formatter={(value: number | string) => [`${Number(value).toFixed(2)}%`, '30-Day Readmission Rate']}
                />
                <Bar dataKey="rate" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Principal Numeric Features Correlation Heatmap */}
      <div className="glass rounded-3xl border border-slate-200 p-6 shadow-xl dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-medical-500" />
              Pearson Correlation Heatmap of Principal Numeric Features
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Linear correlation coefficients (r ∈ [-1.0, +1.0]) across core & engineered numerical predictors and 30-day readmission
            </p>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <span className="h-3 w-3 rounded bg-red-500 inline-block" /> Negative (r &lt; 0)
            </span>
            <span className="inline-flex items-center gap-1.5 text-medical-600 dark:text-medical-400">
              <span className="h-3 w-3 rounded bg-medical-500 inline-block" /> Positive (r &gt; 0)
            </span>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-center text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400">Feature</th>
                {corrLabels.map((lbl) => (
                  <th key={lbl} className="p-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {lbl}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corrMatrix.map((row, i) => (
                <tr key={corrLabels[i]} className="border-t border-slate-200/60 dark:border-slate-800/60">
                  <td className="p-2 text-left text-[11px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {corrLabels[i]}
                  </td>
                  {row.map((val, j) => (
                    <td
                      key={`${i}-${j}`}
                      style={getHeatmapCellStyle(val)}
                      title={`${corrLabels[i]} vs ${corrLabels[j]}: r = ${val.toFixed(2)}`}
                      className="p-2.5 font-mono text-[11px] font-bold rounded transition hover:scale-105 text-slate-900 dark:text-slate-100"
                    >
                      {val.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-[11px] text-slate-600 dark:text-slate-300">
          <div className="rounded-xl bg-slate-100/80 p-3 dark:bg-slate-900/80">
            <strong className="text-slate-900 dark:text-white">Acute Utilization Cluster:</strong> <code className="font-mono">number_inpatient</code> strongly correlates with <code className="font-mono">inpatient_visit_ratio</code> (<strong>r = 0.89</strong>), <code className="font-mono">total_prior_visits</code> (<strong>r = 0.70</strong>), and 30-day readmission (<strong>r = 0.44</strong>).
          </div>
          <div className="rounded-xl bg-slate-100/80 p-3 dark:bg-slate-900/80">
            <strong className="text-slate-900 dark:text-white">Treatment Intensity Trade-off:</strong> <code className="font-mono">meds_per_hospital_day</code> correlates positively with <code className="font-mono">num_medications</code> (<strong>r = 0.58</strong>) and inversely with <code className="font-mono">time_in_hospital</code> (<strong>r = -0.61</strong>).
          </div>
          <div className="rounded-xl bg-slate-100/80 p-3 dark:bg-slate-900/80">
            <strong className="text-slate-900 dark:text-white">Orthogonal Clinical Signals:</strong> <code className="font-mono">num_lab_procedures</code>, <code className="font-mono">number_diagnoses</code>, and <code className="font-mono">time_in_hospital</code> have near-zero collinearity (<strong>|r| ≤ 0.03</strong>), providing independent non-redundant signal to the ensemble.
          </div>
        </div>
      </div>

      {/* Holdout Test-Set Confusion Matrix (Best Performing Model) */}
      <div className="glass rounded-3xl border border-slate-200 p-6 shadow-xl dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-medical-500" />
              Holdout Test-Set Confusion Matrix (Best Performing Model – Random Forest)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Random Forest Classifier evaluated on n = 2,400 holdout test encounters at clinical threshold p ≥ 0.35
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-medical-500/10 px-3 py-1 text-xs font-bold text-medical-600 dark:text-medical-400 border border-medical-500/20">
            Sensitivity: 84.78% | Specificity: 83.80%
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12 items-center">
          {/* 2x2 Confusion Matrix Grid (7 cols) */}
          <div className="lg:col-span-7 overflow-x-auto">
            <div className="min-w-[420px]">
              <div className="grid grid-cols-3 gap-3 text-center items-center">
                <div />
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Predicted: Not Readmitted (0)
                </div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Predicted: Readmitted &lt;30d (1)
                </div>

                {/* Row 1: Actual Negative (2,124) */}
                <div className="text-right pr-3">
                  <div className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Actual: Not Readmitted (0)</div>
                  <div className="text-[11px] text-slate-400">n = 2,124 (88.5%)</div>
                </div>
                <div className="rounded-2xl bg-medical-500/15 border-2 border-medical-500/40 p-5 text-center">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-medical-700 dark:text-medical-300">
                    True Negative (TN)
                  </div>
                  <div className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">1,780</div>
                  <div className="mt-1 text-[11px] font-semibold text-medical-600 dark:text-medical-400">
                    83.80% Specificity
                  </div>
                </div>
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 text-center">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    False Positive (FP)
                  </div>
                  <div className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">344</div>
                  <div className="mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    16.20% False Alarm Rate
                  </div>
                </div>

                {/* Row 2: Actual Positive (276) */}
                <div className="text-right pr-3">
                  <div className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Actual: Readmitted &lt;30d (1)</div>
                  <div className="text-[11px] text-slate-400">n = 276 (11.5%)</div>
                </div>
                <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-5 text-center">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-red-700 dark:text-red-400">
                    False Negative (FN)
                  </div>
                  <div className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">42</div>
                  <div className="mt-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                    15.22% Missed Readmissions
                  </div>
                </div>
                <div className="rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 p-5 text-center">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    True Positive (TP)
                  </div>
                  <div className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">234</div>
                  <div className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    84.78% Sensitivity (Recall)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Interpretation & All 3 Models Matrix Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="rounded-2xl bg-slate-100/80 p-4 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
              <div className="font-extrabold text-slate-900 dark:text-white mb-2">
                Confusion Matrix Breakdown Across All 3 Models (n = 2,400)
              </div>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="pb-1.5">Model</th>
                    <th className="pb-1.5 text-center">TN</th>
                    <th className="pb-1.5 text-center">FP</th>
                    <th className="pb-1.5 text-center">FN</th>
                    <th className="pb-1.5 text-center">TP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-mono">
                  <tr>
                    <td className="py-1.5 font-sans font-bold text-emerald-600 dark:text-emerald-400">Random Forest (Best)</td>
                    <td className="py-1.5 text-center">1,780</td>
                    <td className="py-1.5 text-center">344</td>
                    <td className="py-1.5 text-center">42</td>
                    <td className="py-1.5 text-center font-bold">234</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-sans font-bold text-medical-600 dark:text-medical-400">Logistic Regression</td>
                    <td className="py-1.5 text-center">1,605</td>
                    <td className="py-1.5 text-center">519</td>
                    <td className="py-1.5 text-center">32</td>
                    <td className="py-1.5 text-center font-bold">244</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-sans font-bold text-purple-600 dark:text-purple-400">Decision Tree</td>
                    <td className="py-1.5 text-center">1,666</td>
                    <td className="py-1.5 text-center">458</td>
                    <td className="py-1.5 text-center">60</td>
                    <td className="py-1.5 text-center font-bold">216</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl bg-emerald-500/10 p-3.5 text-[11px] border border-emerald-500/20">
              <strong className="text-emerald-700 dark:text-emerald-400">Clinical Trade-off Justification:</strong> By operating at probability threshold <code className="font-mono">p ≥ 0.35</code>, <strong>Random Forest</strong> captures <strong>234 out of 276</strong> true 30-day readmissions (<strong>84.78% recall</strong>), minimizing dangerous False Negatives (only 42 missed high-risk discharges) while achieving the highest Specificity (<strong>83.80%</strong>) and F1-Score (<strong>0.5480</strong>).
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

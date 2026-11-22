import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Activity, 
  CheckSquare,
  Award,
  Printer
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import type { ReadmissionPredictionRequest, ReadmissionPredictionResponse } from '../types/prediction';
import { InterventionSimulator } from './InterventionSimulator';
import { ClinicalReportModal } from './ClinicalReportModal';

interface RiskResultDashboardProps {
  prediction: ReadmissionPredictionResponse | null;
  isLoading: boolean;
  patientData?: ReadmissionPredictionRequest;
}

export const RiskResultDashboard: React.FC<RiskResultDashboardProps> = ({
  prediction,
  isLoading,
  patientData
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="glass flex h-96 flex-col items-center justify-center rounded-3xl border border-slate-200 p-8 shadow-xl dark:border-slate-800">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-medical-200 border-t-medical-600 dark:border-medical-950 dark:border-t-medical-400" />
          <Activity className="absolute h-6 w-6 text-medical-600 dark:text-medical-400 animate-pulse" />
        </div>
        <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">
          Evaluating Risk Variables & SHAP Attribution...
        </h3>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Parsing clinical lab indicators, comorbidity index, and prior utilization...
        </p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="glass flex h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
        <div className="rounded-full bg-slate-100 p-4 text-slate-400 dark:bg-slate-900 dark:text-slate-600">
          <Activity className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-700 dark:text-slate-300">
          Ready for Risk Prediction
        </h3>
        <p className="mt-2 max-w-sm text-xs text-slate-500 dark:text-slate-400">
          Configure patient parameters on the left and click "Calculate Readmission Risk" or select a clinical profile preset.
        </p>
      </div>
    );
  }

  const {
    readmission_risk_score,
    risk_category,
    risk_level,
    confidence_interval,
    feature_impacts,
    recommendations,
    dataset_benchmark_percentile
  } = prediction;

  // Prepare chart data for SHAP bar plot
  const chartData = feature_impacts.map((item) => ({
    name: item.feature_name,
    score: item.impact_score,
    valueStr: item.feature_value,
    direction: item.direction
  })).reverse();

  const getRiskColor = (level: string) => {
    if (level === 'High') return {
      badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
      ring: 'text-red-500',
      gradient: 'from-red-500 to-rose-600'
    };
    if (level === 'Moderate') return {
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      ring: 'text-amber-500',
      gradient: 'from-amber-500 to-orange-600'
    };
    return {
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      ring: 'text-emerald-500',
      gradient: 'from-emerald-500 to-teal-600'
    };
  };

  const colors = getRiskColor(risk_level);

  return (
    <div className="space-y-6">
      
      {/* Risk Score & Benchmark Meter Card */}
      <div className="glass rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/60">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              30-Day Readmission Risk Score
            </span>
            {patientData?.patient_name && (
              <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="truncate">Patient: {patientData.patient_name}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center space-x-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
              title="Generate & Print EHR Summary PDF"
            >
              <Printer className="h-3.5 w-3.5 text-medical-600 dark:text-medical-400" />
              <span>Print EHR Report</span>
            </button>

            <span className={`inline-flex items-center space-x-1 rounded-full border px-3 py-1 text-xs font-bold ${colors.badge}`}>
              {risk_level === 'High' ? <ShieldAlert className="h-3.5 w-3.5" /> : risk_level === 'Moderate' ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              <span>{risk_category}</span>
            </span>
          </div>
        </div>


        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          
          {/* Main Score & Circle Gauge */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:space-x-6 text-center sm:text-left">
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="h-28 w-28 sm:h-32 sm:w-32 transform -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  className={`transition-all duration-1000 ease-out stroke-current ${colors.ring}`}
                  strokeWidth="10"
                  strokeDasharray={326}
                  strokeDashoffset={326 - (326 * readmission_risk_score) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {readmission_risk_score}%
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  Probability
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">95% Confidence Interval</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {confidence_interval[0]}% – {confidence_interval[1]}%
              </div>

              <div className="mt-3 flex items-center justify-center sm:justify-start space-x-2 text-xs text-slate-600 dark:text-slate-400">
                <Award className="h-4 w-4 text-medical-500 shrink-0" />
                <span>Dataset Percentile: <strong>{dataset_benchmark_percentile}th</strong></span>
              </div>
            </div>
          </div>

          {/* Clinical Alert Callout */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60 w-full md:max-w-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Clinical Context
            </h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {risk_level === 'High' 
                ? 'High risk of readmission within 30 days. Priority care coordination and early outpatient follow-up mandatory.'
                : risk_level === 'Moderate'
                ? 'Moderate risk profile. Recommend targeted medication reconciliation and glycemic monitoring.'
                : 'Standard low risk profile. Proceed with standard discharge instructions.'}
            </p>
          </div>

        </div>

      </div>

      {/* SHAP Feature Attribution Breakdown Chart */}
      <div className="glass rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-medical-500 shrink-0" />
              <span>SHAP Feature Contribution Analysis</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Impact of key patient factors driving risk score UP (Red) or DOWN (Green)
            </p>
          </div>
        </div>

        {/* Recharts Bar Graph */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 16, left: 10, bottom: 5 }}
            >
              <XAxis type="number" domain={[-10, 15]} tick={{ fontSize: 10 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 10 }} 
                width={105} 
              />
              <Tooltip 
                formatter={(value: number | string, _name: string, props: { payload: { valueStr: string } }) => [
                  `${Number(value) > 0 ? '+' : ''}${value} points (${props.payload.valueStr})`, 
                  'Risk Impact'
                ]}
              />
              <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.score > 0 ? '#ef4444' : '#10b981'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Individual Feature Cards */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {feature_impacts.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-start space-x-3 rounded-2xl border border-slate-200 bg-white/70 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className={`mt-0.5 rounded-lg p-2 ${
                item.direction === 'increase' 
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}>
                {item.direction === 'increase' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>{item.feature_name}</span>
                  <span className={item.direction === 'increase' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                    {item.impact_score > 0 ? `+${item.impact_score}` : item.impact_score}%
                  </span>
                </div>
                <div className="mt-0.5 text-slate-500 dark:text-slate-400 leading-snug">
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Clinical Discharge Recommendations */}
      <div className="glass rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center space-x-2 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          <CheckSquare className="h-5 w-5 text-medical-500 shrink-0" />
          <h3>Recommended Clinical Interventions</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Evidence-based discharge interventions tailored to mitigate this patient's specific risk drivers:
        </p>

        <div className="mt-4 space-y-3">
          {recommendations.map((rec, idx) => (
            <div 
              key={idx} 
              className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 rounded-full bg-medical-500/10 p-1.5 text-medical-600 dark:text-medical-400 shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {rec.title}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {rec.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>

              <span className={`self-start shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                rec.priority === 'High' 
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                  : rec.priority === 'Medium'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
              }`}>
                {rec.priority} Priority
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive What-If Intervention Simulator */}
      <InterventionSimulator
        baseRiskScore={readmission_risk_score}
        riskLevel={risk_level}
      />

      {/* Clinical EHR Report Modal */}
      {patientData && (
        <ClinicalReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          prediction={prediction}
          patientData={patientData}
        />
      )}

    </div>
  );


};

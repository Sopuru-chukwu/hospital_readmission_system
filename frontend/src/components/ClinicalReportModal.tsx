import React from 'react';
import { Printer, X, ShieldAlert, CheckCircle2, AlertTriangle, FileText, Activity, Stethoscope } from 'lucide-react';
import type { ReadmissionPredictionRequest, ReadmissionPredictionResponse } from '../types/prediction';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: ReadmissionPredictionResponse;
  patientData: ReadmissionPredictionRequest;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  prediction,
  patientData
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      
      {/* Modal Card Container */}
      <div className="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 print:border-none print:shadow-none">
        
        {/* Action Controls (Hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4 dark:border-slate-800 print:hidden">
          <div className="flex items-center space-x-2 text-medical-600 dark:text-medical-400 font-bold text-xs sm:text-sm">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <span>Clinical EHR Discharge Report</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 sm:space-x-2 rounded-xl bg-medical-600 px-3 sm:px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-medical-500 transition"
            >
              <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable EHR Report Paper Sheet */}
        <div id="printable-ehr-report" className="mt-5 sm:mt-6 space-y-5 sm:space-y-6 text-slate-900 dark:text-slate-100 print:mt-0 print:text-black">
          
          {/* Hospital & Report Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b-2 border-slate-900 pb-5 sm:pb-6 dark:border-slate-700">
            <div>
              <div className="flex items-center space-x-2 text-medical-700 dark:text-medical-400 font-extrabold text-lg sm:text-xl tracking-tight">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                <span>DiaPredict<span className="text-slate-900 dark:text-white">.AI Health Network</span></span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Clinical Decision Support System (CDSS) • Diabetic Readmission Risk Evaluation
              </p>
            </div>
            <div className="sm:text-right text-xs text-slate-500 dark:text-slate-400">
              <div className="font-bold text-slate-800 dark:text-slate-200">CONFIDENTIAL MEDICAL RECORD</div>
              <div className="mt-0.5">Date: {currentDate}</div>
              <div>Report ID: #EHR-2026-{Math.floor(1000 + Math.random() * 9000)}</div>
              {(() => {
                const uStr = localStorage.getItem('diapredict_user');
                if (uStr) {
                  try {
                    const u = JSON.parse(uStr);
                    return (
                      <div className="mt-1 text-[11px] font-bold text-medical-700 dark:text-medical-400">
                        Evaluated By: {u.full_name} ({u.role})
                      </div>
                    );
                  } catch (e) {}
                }
                return (
                  <div className="mt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                    [PRE-ADMISSION EVALUATION]
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Patient Demographics Summary Box */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60 print:bg-slate-100 print:border-slate-300">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-medical-500" />
              Patient Encounter Profile
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Patient Name:</span>
                <strong className="text-slate-900 dark:text-white text-sm">{patientData.patient_name || 'Anonymous Patient'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Age & Gender:</span>
                <strong className="text-slate-900 dark:text-white">{patientData.age_bracket} • {patientData.gender}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Primary Diagnosis:</span>
                <strong className="text-slate-900 dark:text-white">{patientData.primary_diagnosis}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Discharge Status:</span>
                <strong className="text-slate-900 dark:text-white">{patientData.discharge_disposition}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Hospital Stay:</span>
                <strong className="text-slate-900 dark:text-white">{patientData.time_in_hospital} Days</strong>
              </div>
              <div>
                <span className="text-slate-500 block">HbA1c Result:</span>
                <strong className="text-slate-900 dark:text-white">{patientData.a1c_result}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Prior Admissions:</span>
                <strong className="text-slate-900 dark:text-white">{patientData.number_inpatient} Inpatient / {patientData.number_emergency} ER</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Medications Count:</span>
                <strong className="text-slate-900 dark:text-white">{patientData.num_medications} Meds prescribed</strong>
              </div>
            </div>
          </div>

          {/* Risk Score Summary Banner */}
          <div className="rounded-2xl border border-slate-300 p-4 sm:p-5 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Evaluated 30-Day Readmission Risk Probability
                </span>
                <div className="flex flex-wrap items-baseline gap-2 sm:space-x-3 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                    {prediction.readmission_risk_score}%
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    (95% CI: {prediction.confidence_interval[0]}% – {prediction.confidence_interval[1]}%)
                  </span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className={`inline-flex items-center space-x-1 rounded-full px-3 py-1 text-xs font-extrabold border ${
                  prediction.risk_level === 'High' ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                  prediction.risk_level === 'Moderate' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                  'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                }`}>
                  {prediction.risk_level === 'High' ? <ShieldAlert className="h-4 w-4" /> : prediction.risk_level === 'Moderate' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>{prediction.risk_category}</span>
                </span>
                <div className="mt-1.5 text-xs text-slate-500">
                  Cohort Percentile Benchmark: <strong>{prediction.dataset_benchmark_percentile}th Percentile</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Key Drivers (SHAP Feature Breakdown) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Primary Machine Learning Risk Contributors (SHAP Analysis)
            </h4>
            <div className="space-y-2 text-xs">
              {prediction.feature_impacts.map((feat, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-slate-200 p-2.5 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{feat.feature_name}</span>
                    <span className="text-slate-500 text-[11px] ml-2">({feat.feature_value})</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{feat.description}</p>
                  </div>
                  <span className={`self-start sm:self-auto shrink-0 font-bold px-2 py-0.5 rounded ${
                    feat.direction === 'increase' ? 'text-red-600 bg-red-50 dark:bg-red-950/40' : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                  }`}>
                    {feat.impact_score > 0 ? `+${feat.impact_score}` : feat.impact_score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Care Plan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Required Clinical Discharge Orders & Interventions
            </h4>
            <div className="space-y-2 text-xs">
              {prediction.recommendations.map((rec, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 dark:text-white">{rec.title}</span>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Disclaimer & Clinical Decision Support Notice */}
          <div className="rounded-xl bg-slate-100 p-3 text-[10px] text-slate-500 dark:bg-slate-900 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
            <strong>Clinical Decision Support Disclaimer:</strong> This machine learning assessment provides statistical 30-day readmission risk estimations based on ensemble clinical data modeling. It is designed to assist care planning and does not replace attending physician clinical judgment or formal diagnostic evaluation.
          </div>

          {/* Medical Staff Attestation & Signatures */}
          <div className="mt-8 border-t border-slate-300 pt-6 dark:border-slate-800 print:mt-12">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Clinical Attestation & Discharge Verification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-xs">
              <div>
                <div className="h-10 border-b border-dashed border-slate-400"></div>
                <div className="mt-1 font-bold text-slate-800 dark:text-slate-200">Attending Physician Signature</div>
                <div className="text-slate-400 text-[10px]">MD / DO License # ___________________</div>
              </div>
              <div>
                <div className="h-10 border-b border-dashed border-slate-400"></div>
                <div className="mt-1 font-bold text-slate-800 dark:text-slate-200">Discharge Nurse Specialist</div>
                <div className="text-slate-400 text-[10px]">RN / BSN Signature & Date</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

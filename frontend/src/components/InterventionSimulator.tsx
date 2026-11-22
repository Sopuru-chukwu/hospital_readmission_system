import React, { useState } from 'react';
import { Sliders, CheckCircle2, TrendingDown, Sparkles } from 'lucide-react';

interface InterventionOption {
  id: string;
  title: string;
  category: string;
  reductionPercentage: number;
  description: string;
}

const INTERVENTIONS: InterventionOption[] = [
  {
    id: 'pcp_followup',
    title: '7-Day Primary Care / PHC Clinic Visit',
    category: 'PHC & Outpatient',
    reductionPercentage: 12.5,
    description: 'Scheduled consultation at local Primary Health Center (PHC) or clinic within 7 days of discharge.'
  },
  {
    id: 'nhia_hmo_support',
    title: 'NHIA / Health Insurance Medication Subsidy',
    category: 'Insurance & Access',
    reductionPercentage: 10.0,
    description: 'Enrollment in NHIA / HMO prescription subsidy program to ensure affordable access to insulin & oral hypoglycemics.'
  },
  {
    id: 'nigerian_dietary_plan',
    title: 'Regional Low-GI Dietary Plan (Yam/Garri Portioning)',
    category: 'Nutrition & Diet',
    reductionPercentage: 8.5,
    description: 'Targeted nutrition counseling replacing high-GI white rice/cassava staples with Ofada rice, unripe plantain, & vegetable soups.'
  },
  {
    id: 'dsme_program',
    title: 'Diabetes Self-Management Education (DSME)',
    category: 'Patient Education',
    reductionPercentage: 8.0,
    description: '1-on-1 diabetes educator training on glucose monitoring, warning signs, and medication timing.'
  },
  {
    id: 'med_reconciliation',
    title: 'Pharmacist Medication Reconciliation',
    category: 'Pharmacotherapy',
    reductionPercentage: 7.0,
    description: 'Pharmacist review to prevent multi-drug interactions and optimize dosing schedule.'
  },
  {
    id: 'cgm_device',
    title: 'Telehealth & Mobile Follow-up Navigator',
    category: 'Digital Health',
    reductionPercentage: 6.0,
    description: 'Weekly mobile phone / SMS check-ins and remote glucose logging support.'
  }
];

interface InterventionSimulatorProps {
  baseRiskScore: number;
  riskLevel: 'High' | 'Moderate' | 'Low';
}

export const InterventionSimulator: React.FC<InterventionSimulatorProps> = ({
  baseRiskScore,
  riskLevel
}) => {
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([
    'pcp_followup' // default selected
  ]);

  const toggleIntervention = (id: string) => {
    if (selectedInterventions.includes(id)) {
      setSelectedInterventions(selectedInterventions.filter(item => item !== id));
    } else {
      setSelectedInterventions([...selectedInterventions, id]);
    }
  };

  // Calculate projected risk reduction
  const totalReductionPercentage = selectedInterventions.reduce((sum, id) => {
    const item = INTERVENTIONS.find(inv => inv.id === id);
    return sum + (item ? item.reductionPercentage : 0);
  }, 0);

  // Apply relative reduction: projected = base * (1 - totalReduction / 100)
  const relativeFactor = Math.max(0.2, 1 - totalReductionPercentage / 100);
  const projectedRiskScore = Math.max(3.0, Number((baseRiskScore * relativeFactor).toFixed(1)));
  const absoluteReduction = Number((baseRiskScore - projectedRiskScore).toFixed(1));

  // Determine updated risk level
  const getSimulatedRiskTier = (score: number): { level: 'High' | 'Moderate' | 'Low'; color: string } => {
    if (score >= 50) return { level: 'High', color: 'text-red-500 bg-red-500/10 border-red-500/30' };
    if (score >= 25) return { level: 'Moderate', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    return { level: 'Low', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
  };

  const simulatedTier = getSimulatedRiskTier(projectedRiskScore);

  return (
    <div className="glass rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xl dark:border-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4 dark:border-slate-800/80">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-medical-500 shrink-0" />
            <span>"What-If" Care Plan Intervention Simulator</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Simulate the impact of post-discharge clinical interventions on readmission risk
          </p>
        </div>
        <span className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 rounded-full bg-medical-500/10 px-3 py-1 text-xs font-semibold text-medical-600 dark:text-medical-400 border border-medical-500/20">
          <Sparkles className="h-3.5 w-3.5" />
          Interactive CDSS
        </span>
      </div>

      {/* Dynamic Comparative Risk Gauge */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 rounded-2xl bg-slate-100/70 p-5 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
        
        {/* Baseline Risk */}
        <div className="flex flex-col justify-between rounded-xl bg-white p-4 shadow-sm dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Current Unadjusted Risk
          </span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {baseRiskScore}%
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              riskLevel === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              riskLevel === 'Moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            }`}>
              {riskLevel} Risk
            </span>
          </div>
          <div className="mt-3 h-2.5 w-full rounded-full bg-slate-200 overflow-hidden dark:bg-slate-800">
            <div 
              className={`h-full rounded-full ${riskLevel === 'High' ? 'bg-red-500' : riskLevel === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, baseRiskScore)}%` }}
            />
          </div>
        </div>

        {/* Projected Risk Post-Intervention */}
        <div className="flex flex-col justify-between rounded-xl bg-white p-4 shadow-sm dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Projected Intervention Risk
            </span>
            {absoluteReduction > 0 && (
              <span className="inline-flex items-center text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                <TrendingDown className="h-3.5 w-3.5 mr-0.5" />
                -{absoluteReduction}%
              </span>
            )}
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {projectedRiskScore}%
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${simulatedTier.color}`}>
              {simulatedTier.level} Risk
            </span>
          </div>
          <div className="mt-3 h-2.5 w-full rounded-full bg-slate-200 overflow-hidden dark:bg-slate-800">
            <div 
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, projectedRiskScore)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Intervention Selectors */}
      <div className="mt-6 space-y-3">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider dark:text-slate-400">
          Select Clinical Care Plan Interventions:
        </h4>

        <div className="space-y-2.5">
          {INTERVENTIONS.map((inv) => {
            const isSelected = selectedInterventions.includes(inv.id);
            return (
              <div
                key={inv.id}
                onClick={() => toggleIntervention(inv.id)}
                className={`flex items-start space-x-3 rounded-2xl border p-3.5 transition cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500/50 bg-emerald-50/50 dark:border-emerald-500/30 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-white/50 hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-900/30 dark:hover:bg-slate-900/70'
                }`}
              >
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition ${
                  isSelected ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-700'
                }`}>
                  {isSelected && <CheckCircle2 className="h-4 w-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {inv.title}
                    </span>
                    <span className="self-start sm:self-auto shrink-0 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      -{inv.reductionPercentage}% relative risk
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-snug">
                    {inv.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

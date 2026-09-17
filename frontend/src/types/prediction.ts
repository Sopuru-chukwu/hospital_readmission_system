export interface ReadmissionPredictionRequest {
  patient_name?: string;
  age_bracket: string;
  gender: string;
  race: string;
  time_in_hospital: number;
  num_lab_procedures: number;
  num_procedures: number;
  num_medications: number;
  number_outpatient: number;
  number_emergency: number;
  number_inpatient: number;
  number_diagnoses: number;
  max_glu_serum: string;
  a1c_result: string;
  change_med: string;
  diabetes_med: string;
  primary_diagnosis: string;
  discharge_disposition: string;
}

export interface FeatureImpact {
  feature_name: string;
  feature_value: string;
  impact_score: number;
  direction: 'increase' | 'decrease';
  description: string;
}

export interface ClinicalRecommendation {
  category: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ReadmissionPredictionResponse {
  readmission_risk_score: number;
  risk_category: string;
  risk_level: 'High' | 'Moderate' | 'Low';
  confidence_interval: [number, number];
  feature_impacts: FeatureImpact[];
  recommendations: ClinicalRecommendation[];
  dataset_benchmark_percentile: number;
}

export interface SamplePatientCase {
  id: string;
  name: string;
  badge: string;
  description: string;
  patient_data: ReadmissionPredictionRequest;
}

export interface PatientHistoryRecord {
  id: number;
  patient_name: string;
  age_bracket: string;
  gender: string;
  time_in_hospital: number;
  num_medications: number;
  number_inpatient: number;
  number_emergency: number;
  a1c_result: string;
  primary_diagnosis: string;
  discharge_disposition: string;
  risk_score: number;
  risk_category: string;
  risk_level: 'High' | 'Moderate' | 'Low';
  top_feature_impact?: string;
  created_at: string;
}


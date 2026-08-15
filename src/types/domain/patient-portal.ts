import type { SupportedLanguage } from 'src/i18n';
import type { ThemeMode } from 'src/hooks/common/use-theme-mode';

export type PatientAddress = {
  street: string;
  number: string;
  city: string;
  neighborhood: string;
  state: string;
  zipCode: string;
};

export type PatientSelfProfile = {
  id?: string;
  name?: string;
  email?: string;
  document?: string | null;
  status?: string | number | null;
  birthDate?: string | null;
  gender?: string | number | null;
  phone: string;
  profilePhoto: string;
};

export type PatientNutritionist = {
  name: string;
  phone?: string | null;
  crn?: string | null;
  specification?: string | null;
  profilePhoto?: string | null;
  address?: PatientAddress | null;
  about?: string | null;
};

export type PatientPreferences = {
  theme: ThemeMode;
  preferredLanguage: SupportedLanguage;
};

export type MeasurementPoint = {
  metric: string;
  evaluationId: string;
  evaluationDateUtc: string;
  value: number;
};

export type MeasurementTrend = {
  metric: string;
  initialValue: number;
  finalValue: number;
  delta: number;
};

export type AnthropometricEvolution = {
  patientId?: string;
  periodStartUtc?: string | null;
  periodEndUtc?: string | null;
  totalEvaluations: number;
  summary?: Record<string, number | null | undefined>;
  trends: MeasurementTrend[];
  points: MeasurementPoint[];
};

export const ANTHROPOMETRY_METRICS = {
  weight: 'Weight',
  bodyFatPercentage: 'BodyFatPercentage',
  leanMass: 'LeanMass',
  fatMass: 'FatMass',
  waist: 'WaistCircumference',
  abdomen: 'AbdominalCircumference',
  hip: 'HipCircumference',
  rightArm: 'RightRelaxedArmCircumference',
  leftArm: 'LeftRelaxedArmCircumference',
  rightThigh: 'RightThighCircumference',
  leftThigh: 'LeftThighCircumference',
} as const;

export type MacroBreakdown = {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
};

export type NutritionalSummary = {
  macros?: MacroBreakdown | null;
  micros?: Record<string, number> | null;
};

export type PatientMealItem = {
  id: string;
  food?: { id?: string; description?: string; energyKcal?: number; portionSize?: number } | null;
  quantity?: number | null;
  quantityInGrams?: number | null;
  detailsHomemadeMeasure?: {
    id?: string;
    description?: string;
    quantityInGrams?: number;
  } | null;
  notes?: string | null;
  order?: number | null;
  isOptional?: boolean;
  portionLabel?: string | null;
  isEquivalentes?: boolean;
  parentMealItemId?: string | null;
  equivalents?: PatientMealItem[] | null;
};

export type PatientMeal = {
  id: string;
  name: string;
  description?: string | null;
  time?: string | null;
  isSubstitute?: boolean;
  idPrincipalMeal?: string | null;
  items?: PatientMealItem[] | null;
  substitute?: PatientMeal[] | null;
  summary?: NutritionalSummary | null;
};

export type PatientMealPlan = {
  id: string;
  name: string;
  status?: string | number | null;
  daysOfWeek: Array<string | number>;
  meals?: PatientMeal[] | null;
  targets?: MacroBreakdown | null;
  summary?: NutritionalSummary | null;
  days?: string | null;
  listSummary?: string | null;
  lastUpdatedAt?: string | null;
  deliveryAt?: string | null;
};

export type CapabilityResult<T> =
  | { status: 'available'; data: T }
  | { status: 'unavailable'; data: null };

import type { PagedResult, PagedRequest } from '../api';

// ----------------------------------------------------------------------

export type WorkspaceStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

// ----------------------------------------------------------------------

export type WorkspaceListItem = {
  id: string;
  patientId: string;
  patientName: string;
  nextAppointment?: string;
  lastAnthropometry?: string;
  lastAnamnesis?: string;
  lastSend?: string;
  planStatus: WorkspaceStatus | null;
  anthropometryStatus: WorkspaceStatus | null;
  anamnesisStatus: WorkspaceStatus | null;
};

export type WorkspaceListApiItem = {
  patientId: string;
  patientName: string;
  nextAppointment?: string | null;
  lastAnthropometry?: string | null;
  lastAnamnesis?: string | null;
  lastAnamnese?: string | null;
  lastSend?: string | null;
  planStatus?: number | string | null;
  anthropometryStatus?: number | string | null;
  anamnesisStatus?: number | string | null;
};

export type WorkspaceListQuery = PagedRequest & {
  value?: string;
  status?: WorkspaceStatus | 'todos';
  orderByField?:
    | 'patientId'
    | 'patientName'
    | 'nextAppointment'
    | 'lastAnthropometry'
    | 'lastAnamnesis'
    | 'planStatus'
    | 'anthropometryStatus'
    | 'anamnesisStatus'
    | 'lastSend';
  order?: 'asc' | 'desc';
};

export type WorkspaceListResponse = PagedResult<WorkspaceListItem>;
export type WorkspaceListApiResponse = PagedResult<WorkspaceListApiItem>;

// ----------------------------------------------------------------------

export type WorkspaceSectionKind = 'anthropometry' | 'anamnesis' | 'evolution' | 'documents';
export type WorkspaceSectionItem = { id: string; primary: string; secondary?: string };

// ----------------------------------------------------------------------

export type WorkspaceMealPlanDayOfWeek = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type WorkspaceMealPlanListRequest = {
  patientId: string;
  nutritionistId?: string | null;
  status?: number | null;
  dayOfWeek?: WorkspaceMealPlanDayOfWeek;
  onlyToday?: boolean;
  pageIndex?: number;
  pageSize?: number;
};

export type WorkspaceMealPlanApiItem = {
  id?: string | null;
  mealPlanId?: string | null;
  name?: string | null;
  status?: number | string | null;
  updatedAt?: string | null;
  lastUpdate?: string | null;
  days?: string | null;
  daysDescription?: string | null;
  mealsCount?: number | null;
  itemsCount?: number | null;
  lastDelivery?: string | null;
};

export type WorkspaceMealPlanApiResponse = PagedResult<WorkspaceMealPlanApiItem>;

// ----------------------------------------------------------------------

export type WorkspacePlanItem = {
  id: string;
  name: string;
  status: WorkspaceStatus | null;
  updatedAt?: string;
  days?: string;
  mealsCount?: number;
  itemsCount?: number;
  lastDelivery?: string;
};

export type WorkspacePlanQuery = {
  patientId?: string;
  nutritionistId?: string;
  status?: number | null;
  dayOfWeek?: WorkspaceMealPlanDayOfWeek;
  onlyToday?: boolean;
  pageIndex?: number;
  pageSize?: number;
};

export type WorkspacePlanResponse = PagedResult<WorkspacePlanItem>;

// ----------------------------------------------------------------------

export type WorkspaceAnthropometryProtocol = 'MifflinStJeor' | 'HarrisBenedict' | 'FaoOms';
export type EnergyCalculationGender = 'Male' | 'Female';

export type WorkspaceAnthropometryListItem = {
  id: string;
  evaluationDateUtc: string;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  bodyFatPercentage?: number | null;
  leanMass?: number | null;
  abdominalCircumference?: number | null;
  hipCircumference?: number | null;
  whr?: number | null;
  hasNutritionGoal: boolean;
  energyProtocol?: WorkspaceAnthropometryProtocol | null;
  tdeeKcal?: number | null;
  createdAt: string;
};

export type WorkspaceAnthropometryDetail = {
  id: string;
  patientId: string;
  evaluationDateUtc: string;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  bodyFatPercentage?: number | null;
  musclePercentage?: number | null;
  abdominalCircumference?: number | null;
  hipCircumference?: number | null;
  rightRelaxedArmCircumference?: number | null;
  leftRelaxedArmCircumference?: number | null;
  rightFlexedArmCircumference?: number | null;
  leftFlexedArmCircumference?: number | null;
  rightForearmCircumference?: number | null;
  leftForearmCircumference?: number | null;
  rightWristCircumference?: number | null;
  leftWristCircumference?: number | null;
  neckCircumference?: number | null;
  shoulderCircumference?: number | null;
  chestCircumference?: number | null;
  waistCircumference?: number | null;
  rightCalfCircumference?: number | null;
  leftCalfCircumference?: number | null;
  rightThighCircumference?: number | null;
  leftThighCircumference?: number | null;
  rightProximalThighCircumference?: number | null;
  leftProximalThighCircumference?: number | null;
  whr?: number | null;
  leanMass?: number | null;
  fatMass?: number | null;
  notes?: string | null;
  nutritionGoal?: {
    id: string;
    protocol: WorkspaceAnthropometryProtocol;
    activityFactor: number;
    tmbKcal: number;
    tdeeKcal: number;
    calculatedAtUtc: string;
  } | null;
  createdAt: string;
  updatedAt?: string | null;
};

export type SaveAnthropometryRequest = {
  evaluationDateUtc: string;
  weight?: number | null;
  height?: number | null;
  bmi?: number | null;
  bodyFatPercentage?: number | null;
  musclePercentage?: number | null;
  abdominalCircumference?: number | null;
  hipCircumference?: number | null;
  rightRelaxedArmCircumference?: number | null;
  leftRelaxedArmCircumference?: number | null;
  rightFlexedArmCircumference?: number | null;
  leftFlexedArmCircumference?: number | null;
  rightForearmCircumference?: number | null;
  leftForearmCircumference?: number | null;
  rightWristCircumference?: number | null;
  leftWristCircumference?: number | null;
  neckCircumference?: number | null;
  shoulderCircumference?: number | null;
  chestCircumference?: number | null;
  waistCircumference?: number | null;
  rightCalfCircumference?: number | null;
  leftCalfCircumference?: number | null;
  rightThighCircumference?: number | null;
  leftThighCircumference?: number | null;
  rightProximalThighCircumference?: number | null;
  leftProximalThighCircumference?: number | null;
  whr?: number | null;
  leanMass?: number | null;
  fatMass?: number | null;
  notes?: string | null;
  nutritionGoal?: {
    protocol: WorkspaceAnthropometryProtocol;
    activityFactor: number;
  } | null;
};

export type CalculateEnergyRequest = {
  weight: number;
  height: number;
  ageYears: number;
  gender: EnergyCalculationGender;
  protocol: WorkspaceAnthropometryProtocol;
  activityFactor: number;
};

export type EnergyCalculationResult = {
  protocol: WorkspaceAnthropometryProtocol;
  weight: number;
  height: number;
  ageYears: number;
  gender: EnergyCalculationGender;
  activityFactor: number;
  tmbKcal: number;
  tdeeKcal: number;
};

export type WorkspaceAnthropometryResponse = PagedResult<WorkspaceAnthropometryListItem>;

// ----------------------------------------------------------------------

export type WorkspaceAnthropometricEvolutionSelectorOption = {
  patientId: string;
  evaluationId: string;
  evaluationDateUtc: string;
  description?: string | null;
  label: string;
};

export type WorkspaceAnthropometricEvolutionRequest = {
  patientId: string;
  evaluationIds: string[];
};

export type WorkspaceAnthropometricEvolutionMetric =
  | 'Weight'
  | 'Height'
  | 'BMI'
  | 'BodyFatPercentage'
  | 'LeanMass'
  | 'FatMass'
  | 'AbdominalCircumference'
  | 'HipCircumference'
  | 'RightRelaxedArmCircumference'
  | 'LeftRelaxedArmCircumference'
  | 'RightFlexedArmCircumference'
  | 'LeftFlexedArmCircumference'
  | 'RightForearmCircumference'
  | 'LeftForearmCircumference'
  | 'RightWristCircumference'
  | 'LeftWristCircumference'
  | 'NeckCircumference'
  | 'ShoulderCircumference'
  | 'ChestCircumference'
  | 'WaistCircumference'
  | 'RightCalfCircumference'
  | 'LeftCalfCircumference'
  | 'RightThighCircumference'
  | 'LeftThighCircumference'
  | 'RightProximalThighCircumference'
  | 'LeftProximalThighCircumference';

export type WorkspaceAnthropometricEvolutionSummary = {
  weightDelta?: number | null;
  bmiDelta?: number | null;
  bodyFatPercentageDelta?: number | null;
  leanMassDelta?: number | null;
  fatMassDelta?: number | null;
  waistCircumferenceDelta?: number | null;
};

export type WorkspaceAnthropometricEvolutionTrend = {
  metric: WorkspaceAnthropometricEvolutionMetric | string;
  initialValue?: number | null;
  finalValue?: number | null;
  delta?: number | null;
};

export type WorkspaceAnthropometricEvolutionPoint = {
  metric: WorkspaceAnthropometricEvolutionMetric | string;
  evaluationId: string;
  evaluationDateUtc: string;
  value?: number | null;
};

export type WorkspaceAnthropometricEvolutionView = {
  patientId: string;
  periodStartUtc: string;
  periodEndUtc: string;
  totalEvaluations: number;
  summary?: WorkspaceAnthropometricEvolutionSummary | null;
  trends: WorkspaceAnthropometricEvolutionTrend[];
  points: WorkspaceAnthropometricEvolutionPoint[];
};

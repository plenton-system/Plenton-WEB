import type { MeasurementPoint, AnthropometricEvolution } from 'src/types/domain/patient-portal';

import { ANTHROPOMETRY_METRICS } from 'src/types/domain/patient-portal';

const measurementMetrics = new Set<string>([
  ANTHROPOMETRY_METRICS.waist,
  ANTHROPOMETRY_METRICS.abdomen,
  ANTHROPOMETRY_METRICS.hip,
  ANTHROPOMETRY_METRICS.rightArm,
  ANTHROPOMETRY_METRICS.leftArm,
  ANTHROPOMETRY_METRICS.rightThigh,
  ANTHROPOMETRY_METRICS.leftThigh,
]);

export const chronologicalPoints = (points: MeasurementPoint[]) =>
  [...points].sort(
    (first, second) => Date.parse(first.evaluationDateUtc) - Date.parse(second.evaluationDateUtc)
  );

export type MeasurementComparison = {
  metric: string;
  initialValue: number;
  finalValue: number;
  delta?: number;
};

export function derivePatientProgress(evolution: AnthropometricEvolution | null) {
  const points = chronologicalPoints(evolution?.points ?? []);
  const latestByMetric = new Map<string, MeasurementPoint>();
  points.forEach((point) => {
    if (Number.isFinite(point.value)) latestByMetric.set(point.metric, point);
  });

  const weightPoints = points.filter((point) => point.metric === ANTHROPOMETRY_METRICS.weight);
  const measurementPoints = new Map<string, MeasurementPoint[]>();
  points.forEach((point) => {
    if (!measurementMetrics.has(point.metric) || !Number.isFinite(point.value)) return;
    const values = measurementPoints.get(point.metric) ?? [];
    values.push(point);
    measurementPoints.set(point.metric, values);
  });
  const measurements: MeasurementComparison[] = Array.from(measurementPoints.entries()).map(
    ([metric, values]) => {
      const initialValue = values[0].value;
      const finalValue = values.at(-1)?.value ?? initialValue;
      return {
        metric,
        initialValue,
        finalValue,
        delta: values.length > 1 ? finalValue - initialValue : undefined,
      };
    }
  );
  const latestWeight = latestByMetric.get(ANTHROPOMETRY_METRICS.weight)?.value;
  const fatPercentage = latestByMetric.get(ANTHROPOMETRY_METRICS.bodyFatPercentage)?.value;
  const explicitLeanMass = latestByMetric.get(ANTHROPOMETRY_METRICS.leanMass)?.value;
  const explicitFatMass = latestByMetric.get(ANTHROPOMETRY_METRICS.fatMass)?.value;
  const fatMass =
    explicitFatMass ??
    (latestWeight != null && fatPercentage != null && fatPercentage >= 0 && fatPercentage <= 100
      ? latestWeight * (fatPercentage / 100)
      : undefined);
  const leanMass =
    explicitLeanMass ??
    (latestWeight != null && fatMass != null ? Math.max(0, latestWeight - fatMass) : undefined);

  const hasRenderableData =
    weightPoints.length > 0 || measurements.length > 0 || leanMass != null || fatMass != null;

  return { weightPoints, measurements, leanMass, fatMass, hasRenderableData };
}

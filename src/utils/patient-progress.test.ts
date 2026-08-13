import type { MeasurementPoint, AnthropometricEvolution } from 'src/types/domain/patient-portal';

import { it, expect, describe } from 'vitest';

import { ANTHROPOMETRY_METRICS } from 'src/types/domain/patient-portal';

import { derivePatientProgress } from './patient-progress';

const point = (metric: string, value: number, date: string): MeasurementPoint => ({
  metric,
  value,
  evaluationDateUtc: date,
  evaluationId: `${metric}-${date}`,
});

const evolution = (points: MeasurementPoint[]): AnthropometricEvolution => ({
  totalEvaluations: 1,
  points,
  trends: [],
});

describe('derivePatientProgress', () => {
  it('orders weight points chronologically', () => {
    const result = derivePatientProgress(
      evolution([
        point(ANTHROPOMETRY_METRICS.weight, 70, '2026-02-02T00:00:00Z'),
        point(ANTHROPOMETRY_METRICS.weight, 72, '2026-01-01T00:00:00Z'),
      ])
    );
    expect(result.weightPoints.map(({ value }) => value)).toEqual([72, 70]);
  });

  it('uses explicit composition values when supplied', () => {
    const result = derivePatientProgress(
      evolution([
        point(ANTHROPOMETRY_METRICS.weight, 80, '2026-01-01T00:00:00Z'),
        point(ANTHROPOMETRY_METRICS.leanMass, 61, '2026-01-01T00:00:00Z'),
        point(ANTHROPOMETRY_METRICS.fatMass, 19, '2026-01-01T00:00:00Z'),
      ])
    );
    expect(result).toMatchObject({ leanMass: 61, fatMass: 19 });
  });

  it('derives composition from valid body-fat percentage', () => {
    const result = derivePatientProgress(
      evolution([
        point(ANTHROPOMETRY_METRICS.weight, 80, '2026-01-01T00:00:00Z'),
        point(ANTHROPOMETRY_METRICS.bodyFatPercentage, 25, '2026-01-01T00:00:00Z'),
      ])
    );
    expect(result).toMatchObject({ leanMass: 60, fatMass: 20 });
  });

  it('omits unavailable composition instead of treating it as zero', () => {
    const result = derivePatientProgress(evolution([]));
    expect(result.leanMass).toBeUndefined();
    expect(result.fatMass).toBeUndefined();
  });

  it('keeps a supported measurement from a single assessment', () => {
    const result = derivePatientProgress(
      evolution([point(ANTHROPOMETRY_METRICS.waist, 82, '2026-01-01T00:00:00Z')])
    );
    expect(result.measurements).toEqual([
      {
        metric: ANTHROPOMETRY_METRICS.waist,
        initialValue: 82,
        finalValue: 82,
        delta: undefined,
      },
    ]);
    expect(result.hasRenderableData).toBe(true);
  });

  it('treats unsupported-only points as an empty progress state', () => {
    const result = derivePatientProgress(evolution([point('Height', 170, '2026-01-01T00:00:00Z')]));
    expect(result.hasRenderableData).toBe(false);
    expect(result.measurements).toEqual([]);
  });
});

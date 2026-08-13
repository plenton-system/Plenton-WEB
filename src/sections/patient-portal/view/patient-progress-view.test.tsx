import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { usePatientProgress } from 'src/hooks/patient-portal/use-patient-progress';

import i18n from 'src/i18n';

import { ANTHROPOMETRY_METRICS } from 'src/types/domain/patient-portal';

import { PatientProgressView } from './patient-progress-view';

vi.mock('src/hooks/patient-portal/use-patient-progress', () => ({ usePatientProgress: vi.fn() }));
vi.mock('src/components/chart', () => ({
  Chart: () => <div>chart</div>,
  useChart: (options: unknown) => options,
}));

describe('PatientProgressView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    void i18n.changeLanguage('pt-BR');
  });

  it('shows the clinical empty state for unsupported-only points', () => {
    vi.mocked(usePatientProgress).mockReturnValue({
      evolution: {
        data: {
          totalEvaluations: 1,
          trends: [],
          points: [
            { metric: 'Height', value: 170, evaluationId: 'e1', evaluationDateUtc: '2026-01-01' },
          ],
        },
        loading: false,
        error: false,
      },
      retryEvolution: vi.fn(),
    });
    render(
      <MemoryRouter>
        <PatientProgressView />
      </MemoryRouter>
    );
    expect(screen.getByText('Nenhuma avaliação disponível')).toBeInTheDocument();
  });

  it('renders a single supported measurement with semantic table headers', () => {
    vi.mocked(usePatientProgress).mockReturnValue({
      evolution: {
        data: {
          totalEvaluations: 1,
          trends: [],
          points: [
            {
              metric: ANTHROPOMETRY_METRICS.waist,
              value: 82,
              evaluationId: 'e1',
              evaluationDateUtc: '2026-01-01',
            },
          ],
        },
        loading: false,
        error: false,
      },
      retryEvolution: vi.fn(),
    });
    render(<PatientProgressView />);
    const table = screen.getByRole('table', { name: /comparação das medidas/i });
    expect(table).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Inicial' })).toBeInTheDocument();
    expect(screen.getByText('Não disponível')).toBeInTheDocument();
  });
});

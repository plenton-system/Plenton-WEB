import type * as ReactI18next from 'react-i18next';
import type { WorkspaceAnthropometryDetail } from 'src/types';

import userEvent from '@testing-library/user-event';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { usePatientDetail } from 'src/hooks/patient/use-patient-detail';
import { useWorkspaceAnthropometryDetail } from 'src/hooks/workspace/use-workspace-anthropometry-detail';
import { useEnergyExpenditureCalculation } from 'src/hooks/workspace/use-energy-expenditure-calculation';

import { WorkspaceAnthropometryDetailDrawer } from './workspace-anthropometry-detail-drawer';

vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal<typeof ReactI18next>()),
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('src/hooks/patient/use-patient-detail', () => ({ usePatientDetail: vi.fn() }));
vi.mock('src/hooks/workspace/use-workspace-anthropometry-detail', () => ({
  useWorkspaceAnthropometryDetail: vi.fn(),
}));
vi.mock('src/hooks/workspace/use-energy-expenditure-calculation', () => ({
  useEnergyExpenditureCalculation: vi.fn(),
}));
vi.mock('./anthropometry-form-section', () => ({
  AnthropometryFormSection: ({
    values,
    onChange,
  }: {
    values: { notes: string };
    onChange: (field: 'notes', value: string) => void;
  }) => (
    <input
      aria-label="notes"
      value={values.notes}
      onChange={(event) => onChange('notes', event.target.value)}
    />
  ),
}));
vi.mock('./energy-expenditure-section', () => ({ EnergyExpenditureSection: () => null }));

const savedDetail: WorkspaceAnthropometryDetail = {
  id: 'evaluation-1',
  patientId: 'p-1',
  createdAt: '2026-08-17T12:00:00Z',
  evaluationDateUtc: '2026-08-17T12:00:00Z',
  weight: 70,
  height: 1.7,
  bmi: 24.2,
  notes: 'preserved',
  nutritionGoal: null,
};

describe('WorkspaceAnthropometryDetailDrawer', () => {
  const createSave = vi.fn();
  const updateSave = vi.fn();
  const reset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePatientDetail).mockReturnValue({
      data: null,
      loading: false,
      error: null,
    } as ReturnType<typeof usePatientDetail>);
    vi.mocked(useEnergyExpenditureCalculation).mockReturnValue({
      result: null,
      loading: false,
      error: null,
      reset: vi.fn(),
      setResult: vi.fn(),
      calculate: vi.fn(),
    });
    vi.mocked(useWorkspaceAnthropometryDetail).mockImplementation((_patientId, evaluationId) => ({
      data: null,
      loading: false,
      saving: false,
      error: null,
      saveError: null,
      refetch: vi.fn(),
      reset,
      save: evaluationId ? updateSave : createSave,
    }));
    createSave.mockResolvedValue(savedDetail);
    updateSave.mockResolvedValue(savedDetail);
  });

  it('keeps creation feedback through promotion and uses update on the second save', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    const onClose = vi.fn();
    const view = render(
      <WorkspaceAnthropometryDetailDrawer
        open
        patientId="p-1"
        evaluationId={null}
        onClose={onClose}
        onSaved={onSaved}
      />
    );
    await user.type(screen.getByLabelText('notes'), 'preserved');
    await user.click(screen.getByText('actions.save'));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'workspace.anthropometry.saveSuccess'
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    view.rerender(
      <WorkspaceAnthropometryDetailDrawer
        open
        patientId="p-1"
        evaluationId="evaluation-1"
        onClose={onClose}
        onSaved={onSaved}
      />
    );
    expect(screen.getByRole('status')).toHaveTextContent('workspace.anthropometry.saveSuccess');
    await user.click(screen.getByText('actions.save'));
    await waitFor(() => expect(updateSave).toHaveBeenCalledTimes(1));
    expect(createSave).toHaveBeenCalledTimes(1);
    await user.click(screen.getByText('actions.cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('preserves input after failure, retries, and reports synchronization separately', async () => {
    const user = userEvent.setup();
    createSave
      .mockRejectedValueOnce(new Error('persistence failed'))
      .mockResolvedValueOnce(savedDetail);
    const onSaved = vi.fn().mockRejectedValueOnce(new Error('sync failed'));
    vi.mocked(useWorkspaceAnthropometryDetail).mockImplementation(() => ({
      data: null,
      loading: false,
      saving: false,
      error: null,
      saveError: 'persistence failed',
      refetch: vi.fn(),
      reset,
      save: createSave,
    }));
    render(
      <WorkspaceAnthropometryDetailDrawer
        open
        patientId="p-1"
        evaluationId={null}
        onClose={vi.fn()}
        onSaved={onSaved}
      />
    );
    await user.type(screen.getByLabelText('notes'), 'preserved');
    await user.click(screen.getByText('actions.save'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('notes')).toHaveValue('preserved');
    expect(screen.getByRole('alert')).toHaveTextContent('persistence failed');

    await user.click(screen.getByText('actions.save'));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'workspace.anthropometry.saveSuccess'
    );
    expect(screen.getAllByRole('alert').at(-1)).toHaveTextContent(
      'workspace.anthropometry.syncError'
    );
  });
});

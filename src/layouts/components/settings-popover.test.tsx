import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { useThemeMode } from 'src/hooks/common/use-theme-mode';

import i18n from 'src/i18n';

import { SettingsPopover } from './settings-popover';

vi.mock('src/hooks/common/use-theme-mode', () => ({ useThemeMode: vi.fn() }));
vi.mock('src/services/anamnesis/anamnesisService', () => ({
  anamnesisService: { getAll: vi.fn() },
}));

beforeEach(async () => {
  vi.clearAllMocks();
  await i18n.changeLanguage('pt-BR');
  vi.mocked(useThemeMode).mockReturnValue({
    mode: 'dark',
    setMode: vi.fn(),
    systemMode: 'light',
    resolvedMode: 'dark',
  });
});

it('preserves the Nutritionist operational settings payload', async () => {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const user = userEvent.setup();
  render(
    <SettingsPopover
      open
      onClose={vi.fn()}
      onSave={onSave}
      data={{
        id: 'settings',
        userId: 'nutritionist',
        generalDto: { orderBy: 'Name', autoSendBirthdayEmail: true },
        anamnesisDto: { defaultTemplateId: 'template', name: 'Padrão' },
        appSystemSettingsDto: { showAnthropometry: false, showPrescriptions: true },
        preferenceDto: { theme: 'dark', preferredLanguage: 'pt-BR' },
      }}
    />
  );

  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: /ordenação padrão/i })).toHaveTextContent('Nome')
  );
  await user.click(screen.getByRole('button', { name: 'Salvar' }));
  await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
  expect(onSave).toHaveBeenCalledWith({
    id: 'settings',
    userId: 'nutritionist',
    generalDto: { orderBy: 'Name', autoSendBirthdayEmail: true },
    anamnesisDto: { defaultTemplateId: 'template' },
    appSystemSettingsDto: { showAnthropometry: false, showPrescriptions: true },
    preferenceDto: { theme: 'dark', preferredLanguage: 'pt-BR' },
  });
});

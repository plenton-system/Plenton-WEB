import { MemoryRouter } from 'react-router';
import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import i18n from 'src/i18n';
import { ThemeProvider } from 'src/theme/theme-provider';

import { NavContent } from './nav';

vi.mock('src/components/logo', () => ({ Logo: () => <div>logo</div> }));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

beforeEach(() => i18n.changeLanguage('pt-BR'));

it('marks the current portal destination and exposes semantic navigation', () => {
  render(
    <MemoryRouter initialEntries={['/portal/meal-plan']}>
      <ThemeProvider>
        <NavContent
          data={[
            { title: 'patientPortal.nav.home', path: '/portal', icon: <span /> },
            { title: 'patientPortal.nav.mealPlan', path: '/portal/meal-plan', icon: <span /> },
            { title: 'patientPortal.nav.account', path: '/portal/account', icon: <span /> },
          ]}
        />
      </ThemeProvider>
    </MemoryRouter>
  );
  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /plano alimentar/i })).toHaveAttribute(
    'aria-current',
    'page'
  );
  expect(screen.getByRole('link', { name: /início/i })).not.toHaveAttribute('aria-current');
});

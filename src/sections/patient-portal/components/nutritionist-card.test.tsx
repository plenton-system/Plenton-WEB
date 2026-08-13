import 'src/i18n';

import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { NutritionistCard } from './nutritionist-card';

it('renders available professional presentation and address information', () => {
  render(
    <NutritionistCard
      loading={false}
      error={false}
      onRetry={vi.fn()}
      data={{
        name: 'Dra. Ana',
        phone: '11999999999',
        crn: '12345',
        about: 'Nutrição clínica e esportiva.',
        address: {
          street: 'Rua Verde',
          number: '10',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01000-000',
        },
      }}
    />
  );

  expect(screen.getByText(/Rua Verde, 10/)).toBeInTheDocument();
  expect(screen.getByText(/Nutrição clínica e esportiva/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /11999999999/ })).toHaveAttribute(
    'href',
    'tel:11999999999'
  );
});

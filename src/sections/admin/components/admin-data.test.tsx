import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ThemeProvider } from 'src/theme';

import { AdminMetadata, AdminStateDiff } from './admin-data';

const themed = (component: ReactNode) =>
  render(<ThemeProvider defaultMode="light">{component}</ThemeProvider>);

describe('sanitized administrative data', () => {
  it('renders hostile metadata only as escaped text without links or executable markup', () => {
    const hostile = '<script>window.pwned=true</script> https://evil.example/path';
    const { container } = themed(
      <AdminMetadata
        metadata={{
          unknown: hostile,
          accessToken: 'secret',
          rawPayload: '{ sensitive: true }',
          paymentCard: '4111111111111111',
        }}
      />
    );
    expect(screen.getByText(hostile)).toBeInTheDocument();
    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    expect(screen.queryByText('{ sensitive: true }')).not.toBeInTheDocument();
    expect(screen.queryByText('4111111111111111')).not.toBeInTheDocument();
    expect(screen.getAllByText('••••••')).toHaveLength(3);
  });

  it('conveys added, removed, changed and unchanged differences with text', () => {
    const { container } = themed(
      <AdminStateDiff
        before={{ removed: 'old', changed: 'old', same: 'value' }}
        after={{ added: 'new', changed: 'new', same: 'value' }}
      />
    );
    for (const kind of ['added', 'removed', 'changed', 'unchanged']) {
      const row = container.querySelector(`[data-diff-kind="${kind}"]`);
      expect(row).toBeInTheDocument();
      expect(row).toHaveTextContent(`admin.data.diff.${kind}`);
    }
  });
});
import type { ReactNode } from 'react';

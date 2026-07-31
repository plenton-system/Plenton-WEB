import { useTranslation } from 'react-i18next';

import Container from '@mui/material/Container';

import { AdminEmptyState, AdminPageHeader } from '../components/admin-shared';

export function AdminPlaceholderView({
  section,
}: {
  section: 'tenants' | 'users' | 'subscriptions' | 'operations' | 'audit';
}) {
  const { t } = useTranslation();
  return (
    <Container maxWidth="xl">
      <AdminPageHeader title={t(`admin.nav.${section}`)} />
      <AdminEmptyState title={t('admin.states.comingSoon')} />
    </Container>
  );
}

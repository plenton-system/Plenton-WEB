import type { AdminApiError, AdminAccessFlow, AdminUserTransition } from 'src/types/admin';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link as RouterLink } from 'react-router-dom';

import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { useAuth } from 'src/hooks/common/use-auth';
import { useAdminResource } from 'src/hooks/admin/use-admin-resource';

import { mapAdminApiError } from 'src/utils/admin-api-error';
import { applyUserTransition } from 'src/utils/admin-transitions';

import { adminUserService } from 'src/services/admin/adminTenantUserService';

import { AdminCommandDialog } from '../components/admin-command-dialog';
import {
  AdminPageHeader,
  AdminErrorState,
  AdminStatusBadge,
  AdminLoadingState,
} from '../components/admin-shared';

type Action = 'block' | 'unblock' | 'revoke' | 'activation' | 'recovery';
type Command = { action: Action; stamp: string };

export function AdminUserDetailView() {
  const { id = '' } = useParams();
  const { t } = useTranslation();
  const { user: authenticatedUser } = useAuth();
  const state = useAdminResource((signal) => adminUserService.detail(id, signal), id);
  const [command, setCommand] = useState<Command | null>(null);
  const [commandError, setCommandError] = useState<AdminApiError | null>(null);
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const apply = (transition: AdminUserTransition) => {
    state.setData((current) => current && applyUserTransition(current, transition));
    setFeedback(
      transition.revokedSessionCount
        ? t('admin.feedback.sessionsRevoked', { count: transition.revokedSessionCount })
        : t(transition.changed ? 'admin.feedback.changed' : 'admin.feedback.requested')
    );
  };
  const submit = async (reason: string) => {
    if (!command) return;
    setBusy(true);
    setCommandError(null);
    setFeedback('');
    const payload = { reason, concurrencyStamp: command.stamp };
    try {
      let transition: AdminUserTransition;
      if (command.action === 'block') transition = await adminUserService.block(id, payload);
      else if (command.action === 'unblock')
        transition = await adminUserService.unblock(id, payload);
      else if (command.action === 'revoke')
        transition = await adminUserService.revokeSessions(id, payload);
      else
        transition = await adminUserService.resendAccess(id, {
          ...payload,
          flow: (command.action === 'activation' ? 1 : 2) as AdminAccessFlow,
        });
      apply(transition);
      setCommand(null);
    } catch (cause: unknown) {
      const error = mapAdminApiError(cause);
      setCommandError(error);
      if (error.kind === 'conflict') state.refetch();
    } finally {
      setBusy(false);
    }
  };
  if (state.loading) return <AdminLoadingState />;
  if (state.error?.kind === 'notFound')
    return (
      <Container>
        <AdminErrorState message={state.error.message} />
        <Link component={RouterLink} to="/admin/users">
          {t('admin.actions.backToList')}
        </Link>
      </Container>
    );
  if (state.error)
    return (
      <Container>
        <AdminErrorState message={state.error.message} onRetry={state.refetch} />
      </Container>
    );
  if (!state.data) return null;
  const user = state.data;
  const isSelf = user.id === authenticatedUser?.id;
  const protectedUser = user.roles.includes('Admin') || isSelf;
  const open = (action: Action) => {
    setCommandError(null);
    setCommand({ action, stamp: user.concurrencyStamp });
  };
  const activationEligible = user.roles.includes('Patient') && !user.emailConfirmed;
  const recoveryEligible = user.emailConfirmed;
  return (
    <Container maxWidth="lg">
      <Stack spacing={3}>
        <AdminPageHeader
          title={user.name ?? user.email ?? user.id}
          description={t('admin.users.detailDescription')}
          actions={
            <Button component={RouterLink} to="/admin/users">
              {t('admin.actions.backToList')}
            </Button>
          }
        />
        {feedback && (
          <Alert severity="success" role="status">
            {feedback}
          </Alert>
        )}
        {commandError?.kind === 'conflict' && (
          <Alert severity="warning">{t('admin.errors.conflictRefresh')}</Alert>
        )}
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography>
                <strong>{t('admin.fields.email')}:</strong> {user.email ?? '—'}
              </Typography>
              <Typography>
                <strong>{t('admin.fields.tenant')}:</strong> {user.tenantId}
              </Typography>
              <Typography>
                <strong>{t('admin.filters.role')}:</strong> {user.roles.join(', ') || '—'}
              </Typography>
              <Typography>
                <strong>{t('admin.fields.lockoutEnabled')}:</strong>{' '}
                {t(user.lockoutEnabled ? 'admin.filters.yes' : 'admin.filters.no')}
              </Typography>
              <Typography>
                <strong>{t('admin.fields.lockoutEnd')}:</strong>{' '}
                {user.lockoutEndUtc ? new Date(user.lockoutEndUtc).toLocaleString() : '—'}
              </Typography>
              <Typography sx={{ overflowWrap: 'anywhere' }}>
                <strong>{t('admin.fields.concurrencyStamp')}:</strong> {user.concurrencyStamp}
              </Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                <AdminStatusBadge
                  status={user.isLocked ? 'error' : 'success'}
                  label={t(user.isLocked ? 'admin.userStatus.blocked' : 'admin.userStatus.active')}
                />
                <AdminStatusBadge
                  status={user.emailConfirmed ? 'success' : 'warning'}
                  label={t(
                    user.emailConfirmed
                      ? 'admin.userStatus.emailConfirmed'
                      : 'admin.userStatus.emailPending'
                  )}
                />
              </Stack>
              {protectedUser && (
                <Alert severity="info">
                  {t(isSelf ? 'admin.users.selfProtected' : 'admin.users.adminProtected')}
                </Alert>
              )}
              {!protectedUser && (
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} flexWrap="wrap">
                  <Button
                    variant="contained"
                    color={user.isLocked ? 'success' : 'error'}
                    onClick={() => open(user.isLocked ? 'unblock' : 'block')}
                  >
                    {t(user.isLocked ? 'admin.actions.unblockUser' : 'admin.actions.blockUser')}
                  </Button>
                  <Button variant="outlined" onClick={() => open('revoke')}>
                    {t('admin.actions.revokeSessions')}
                  </Button>
                  {activationEligible && (
                    <Button variant="outlined" onClick={() => open('activation')}>
                      {t('admin.actions.resendActivation')}
                    </Button>
                  )}
                  {recoveryEligible && (
                    <Button variant="outlined" onClick={() => open('recovery')}>
                      {t('admin.actions.passwordRecovery')}
                    </Button>
                  )}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
        <AdminCommandDialog
          open={!!command}
          busy={busy}
          error={commandError?.message}
          title={t(`admin.command.${command?.action ?? 'block'}`)}
          consequence={t(`admin.consequences.${command?.action ?? 'block'}`)}
          onClose={() => {
            setCommand(null);
            setCommandError(null);
          }}
          onConfirm={submit}
        />
      </Stack>
    </Container>
  );
}

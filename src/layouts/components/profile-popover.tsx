import type { FormikProps } from 'formik';
import type { SyntheticEvent } from 'react';
import type { ProfileFormValues } from 'src/types';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Chip, Card, Alert, Stack, DialogActions, CircularProgress } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { useCurrentSubscription } from 'src/hooks/subscription/use-current-subscription';

import { authService } from 'src/services';

import { formatDate, statusColor, statusLabel, billingCycleLabel } from 'src/sections/subscription/utils';

import ProfileTabs from '../profile/components/form-tabs/profile-tabs';
import { ChangePasswordDialog, type ChangePasswordFormValues } from './change-password-dialog';

type Props = {
  open: boolean;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  formik: FormikProps<ProfileFormValues>;
};

export function ProfilePopover({ open, loading, error, onClose, formik }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const subscription = useCurrentSubscription({ auto: open });
  const [showChangePassword, setSwhoChangePassword] = useState(true);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changePasswordFeedback, setChangePasswordFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangeTab = (_: SyntheticEvent, v: number) => {
    setTab(v);
    setSwhoChangePassword(v === 0);
  };

  const handleSubmitChangePassword = useCallback(async (values: ChangePasswordFormValues) => {
    setChangePasswordFeedback(null);
    setChangingPassword(true);
    try {
      await authService.changePassword(values);
      setChangePasswordFeedback({ type: 'success', message: 'Senha alterada com sucesso.' });
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível alterar a senha no momento.';
      setChangePasswordFeedback({ type: 'error', message });
      return false;
    } finally {
      setChangingPassword(false);
    }
  }, []);

  const handleCloseChangePassword = () => {
    setChangePasswordOpen(false);
    setChangePasswordFeedback(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: { sx: { borderRadius: 2.5, overflow: 'hidden' } },
        }}
      >
        {/* Abas superiores */}
        <Box sx={{ px: 2, pt: 1.5 }}>
          <Tabs
            value={tab}
            onChange={handleChangeTab}
            sx={{
              '.MuiTabs-indicator': { bgcolor: 'primary.main', height: 3, borderRadius: 2 },
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minWidth: 120 },
            }}
          >
            <Tab label="Meus dados" />
            <Tab label="Minha assinatura" />
          </Tabs>
        </Box>

        <Divider />

        {/* Título + ações */}
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 1,
            pr: 6,
          }}
        >
          <IconButton
            aria-label="Fechar"
            onClick={onClose}
            sx={{ position: 'absolute', right: 12, top: 10 }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <form id="profile-form" onSubmit={formik.handleSubmit}>
          {/* Aba 1: Meus dados */}
          {tab === 0 && <Card sx={{ p: 3 }}><ProfileTabs formik={formik} /></Card>}
          {/* Aba 2: Minha assinatura */}
          {tab === 1 && (
            <Box sx={{ py: 3, px: 3 }}>
              <Stack spacing={2}>
                {subscription.loading && (
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CircularProgress size={20} />
                    <Typography variant="body2">Carregando assinatura...</Typography>
                  </Stack>
                )}

                {subscription.error && (
                  <Alert severity="warning" action={<Button onClick={subscription.reload}>Tentar novamente</Button>}>
                    {subscription.error}
                  </Alert>
                )}

                {subscription.empty && (
                  <Alert severity="info" action={<Button onClick={() => router.push('/#planos')}>Escolher plano</Button>}>
                    Nenhuma assinatura encontrada.
                  </Alert>
                )}

                {subscription.data && (
                  <Stack spacing={1.5}>
                    <Chip
                      label={statusLabel(subscription.data.status)}
                      color={statusColor(subscription.data.status) as any}
                      sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {subscription.data.planName ?? 'Plano nao informado'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Ciclo {billingCycleLabel(subscription.data.billingCycle)}
                        {formatDate(subscription.data.nextChargeDate ?? subscription.data.dueDate)
                          ? ` · Proxima cobranca em ${formatDate(subscription.data.nextChargeDate ?? subscription.data.dueDate)}`
                          : ''}
                      </Typography>
                    </Box>
                  </Stack>
                )}

                <Button
                  variant="contained"
                  onClick={() => {
                    onClose();
                    router.push('/settings/subscription');
                  }}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Abrir area de assinatura
                </Button>
              </Stack>
            </Box>
          )}
        </form>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {showChangePassword && (
            <Button
              variant="contained"
              sx={{ gridColumn: 1, justifySelf: 'start' }}
              onClick={() => setChangePasswordOpen(true)}
            >
              Alterar senha
            </Button>
          )}

          {/* grupo da direita sempre na coluna 2 */}
          <Box sx={{ gridColumn: 2, display: 'grid', gridAutoFlow: 'column', columnGap: 1 }}>
            <Button onClick={onClose} variant="outlined">
              Cancelar
            </Button>
            <Button variant="contained" type="submit" form="profile-form" disabled={tab !== 0}>
              Salvar
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <ChangePasswordDialog
        open={changePasswordOpen}
        loading={changingPassword}
        feedback={changePasswordFeedback}
        onClose={handleCloseChangePassword}
        onSubmit={handleSubmitChangePassword}
      />
    </>
  );
}

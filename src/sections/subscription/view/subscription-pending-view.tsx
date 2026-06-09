import type { SubscriptionBillingType, SubscriptionPaymentDetails } from 'src/types';

import { Icon } from '@iconify/react';
import { useLocation, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { billingTypeLabel } from '../utils';

type PendingState = {
  billingType?: SubscriptionBillingType;
  planName?: string;
  payment?: SubscriptionPaymentDetails | null;
};

export function SubscriptionPendingView() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as PendingState;
  const payment = state.payment ?? {};
  const paymentUrl = payment.chargeUrl ?? payment.invoiceUrl ?? payment.bankSlipUrl;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 2 }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Box component={Icon} icon="solar:clock-circle-bold" sx={{ width: 42, height: 42, color: 'warning.main' }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Pagamento iniciado
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Aguardando confirmacao do pagamento para liberar a assinatura.
            </Typography>
          </Stack>

          <Alert severity="info">
            {state.planName ? `Plano: ${state.planName}. ` : ''}
            Metodo: {billingTypeLabel(state.billingType)}.
          </Alert>

          {payment.pixQrCode && (
            <Box
              component="img"
              alt="QR Code PIX"
              src={payment.pixQrCode}
              sx={{ width: 180, height: 180, objectFit: 'contain', border: '1px solid', borderColor: 'divider' }}
            />
          )}

          {payment.pixCopyPaste && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, wordBreak: 'break-word' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                PIX copia e cola
              </Typography>
              <Typography variant="body2">{payment.pixCopyPaste}</Typography>
            </Paper>
          )}

          {paymentUrl && (
            <Button
              variant="contained"
              href={paymentUrl}
              target="_blank"
              rel="noreferrer"
              sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
            >
              Abrir link de pagamento
            </Button>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant="outlined" onClick={() => navigate('/subscription/success')}>
              Verificar status
            </Button>
            <Button onClick={() => navigate('/#planos')}>Escolher outro plano</Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}

import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useCurrentSubscription } from 'src/hooks/subscription/use-current-subscription';

import { formatDate, statusColor, statusLabel, billingTypeLabel, billingCycleLabel } from '../utils';

export function SubscriptionManagementView() {
  const navigate = useNavigate();
  const { data, loading, error, empty, reload } = useCurrentSubscription();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Minha assinatura
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Acompanhe o plano, status e proximas cobrancas da sua conta.
          </Typography>
        </Box>

        {loading && (
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={22} />
              <Typography>Carregando assinatura...</Typography>
            </Stack>
          </Paper>
        )}

        {error && (
          <Alert severity="error" action={<Button onClick={reload}>Tentar novamente</Button>}>
            {error}
          </Alert>
        )}

        {empty && (
          <Alert severity="info" action={<Button onClick={() => navigate('/#planos')}>Escolher plano</Button>}>
            Nenhuma assinatura encontrada.
          </Alert>
        )}

        {data && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Stack spacing={2}>
                  <Chip
                    label={statusLabel(data.status)}
                    color={statusColor(data.status) as any}
                    sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {data.planName ?? 'Plano nao informado'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {data.planCode ?? 'Codigo nao informado'}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Ciclo
                      </Typography>
                      <Typography>{billingCycleLabel(data.billingCycle)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Pagamento
                      </Typography>
                      <Typography>{billingTypeLabel(data.billingType)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Proxima cobranca
                      </Typography>
                      <Typography>{formatDate(data.nextChargeDate ?? data.dueDate) ?? 'Nao informado'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Expira em
                      </Typography>
                      <Typography>{formatDate(data.expiresAt) ?? 'Nao informado'}</Typography>
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Acoes
                  </Typography>
                  {[
                    ['solar:refresh-circle-bold', 'Alterar plano'],
                    ['solar:card-2-bold', 'Alterar pagamento'],
                    ['solar:bill-list-bold', 'Ver cobrancas'],
                    ['solar:trash-bin-trash-bold', 'Cancelar assinatura'],
                  ].map(([icon, label]) => (
                    <Button
                      key={label}
                      variant="outlined"
                      disabled
                      startIcon={<Box component={Icon} icon={icon} />}
                      sx={{ justifyContent: 'flex-start' }}
                    >
                      {label}
                    </Button>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Stack>
    </Container>
  );
}

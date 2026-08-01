import type { SubscriptionPlan } from 'src/types';
import type {
  AdminApiError,
  AdminSubscriptionDetail,
  AdminSubscriptionProration,
  AdminSubscriptionCommandResult,
} from 'src/types/admin';

import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormHelperText from '@mui/material/FormHelperText';

import { mapAdminApiError } from 'src/utils/admin-api-error';
import { futureDateToUtc } from 'src/utils/admin-subscriptions';

type Action = 'plan' | 'suspend' | 'reactivate';
type Payload = {
  tenantId: string;
  expectedVersion: string;
  reason: string;
  planPriceId?: string;
  proration?: AdminSubscriptionProration;
  nextDueDate?: string;
};
type Submitted = { payload: Payload; key: string };

export function AdminSubscriptionDialog({
  open,
  action,
  subscription,
  plans,
  plansLoading,
  plansError,
  onReloadPlans,
  onClose,
  onSubmit,
  onConflict,
}: {
  open: boolean;
  action: Action;
  subscription: AdminSubscriptionDetail;
  plans: SubscriptionPlan[];
  plansLoading?: boolean;
  plansError?: boolean;
  onReloadPlans?: () => Promise<unknown> | void;
  onClose: () => void;
  onSubmit: (
    action: Action,
    payload: Payload,
    idempotencyKey: string
  ) => Promise<AdminSubscriptionCommandResult>;
  onConflict: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [planPriceId, setPlanPriceId] = useState('');
  const [proration, setProration] = useState<AdminSubscriptionProration>(1);
  const [nextDueDate, setNextDueDate] = useState('');
  const [error, setError] = useState<AdminApiError | null>(null);
  const [busy, setBusy] = useState(false);
  const submitted = useRef<Submitted | null>(null);
  const locked = !!submitted.current && !!error?.retryable;
  const prices = plans.flatMap((plan) =>
    plan.prices.map((price) => ({ ...price, planName: plan.name }))
  );

  const reset = () => {
    setReason('');
    setPlanPriceId('');
    setProration(1);
    setNextDueDate('');
    setError(null);
    submitted.current = null;
  };
  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const dateUtc = action === 'reactivate' ? futureDateToUtc(nextDueDate) : undefined;
  const valid =
    reason.trim().length >= 3 &&
    reason.trim().length <= 500 &&
    (action !== 'plan' || !!planPriceId) &&
    (action !== 'reactivate' || !!dateUtc);

  const makePayload = (): Payload => ({
    tenantId: subscription.tenantId,
    expectedVersion: subscription.version,
    reason: reason.trim(),
    ...(action === 'plan' ? { planPriceId, proration } : {}),
    ...(action === 'reactivate' && dateUtc ? { nextDueDate: dateUtc } : {}),
  });

  const submit = async () => {
    if (!valid && !submitted.current) return;
    setBusy(true);
    setError(null);
    const intention =
      submitted.current ??
      ({
        payload: structuredClone(makePayload()),
        key: crypto.randomUUID(),
      } satisfies Submitted);
    submitted.current = intention;
    try {
      await onSubmit(action, structuredClone(intention.payload), intention.key);
      submitted.current = null;
      onClose();
    } catch (cause: unknown) {
      const mapped = mapAdminApiError(cause);
      if (mapped.kind === 'conflict') {
        submitted.current = null;
        onConflict();
        onClose();
      } else {
        if (!mapped.retryable) submitted.current = null;
        setError(mapped);
      }
    } finally {
      setBusy(false);
    }
  };

  const title = t(`admin.subscriptionManagement.actions.${action}`);
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {action === 'plan' && (
          <>
            <FormControl
              fullWidth
              margin="dense"
              disabled={busy || locked || plansLoading || plansError}
            >
              <InputLabel id="admin-subscription-price-label">
                {t('admin.subscriptionManagement.fields.activePrice')}
              </InputLabel>
              <Select
                labelId="admin-subscription-price-label"
                label={t('admin.subscriptionManagement.fields.activePrice')}
                value={planPriceId}
                onChange={(event) => setPlanPriceId(event.target.value)}
              >
                {prices.map((price) => (
                  <MenuItem key={price.planPriceId} value={price.planPriceId}>
                    {price.planName} ·{' '}
                    {new Intl.NumberFormat(undefined, {
                      style: 'currency',
                      currency: price.currency,
                    }).format(price.value)}{' '}
                    · {t(`subscription.billingCycle.${price.billingCycle}`)}
                  </MenuItem>
                ))}
              </Select>
              {(plansError || prices.length === 0) && (
                <>
                  <FormHelperText error>
                    {t('admin.subscriptionManagement.catalogUnavailable')}
                  </FormHelperText>
                  {onReloadPlans && (
                    <Button
                      size="small"
                      disabled={plansLoading}
                      onClick={() => void onReloadPlans()}
                    >
                      {t('admin.subscriptionManagement.actions.reloadCatalog')}
                    </Button>
                  )}
                </>
              )}
            </FormControl>
            <FormControl fullWidth margin="dense" disabled={busy || locked}>
              <InputLabel id="admin-subscription-proration-label">
                {t('admin.subscriptionManagement.fields.proration')}
              </InputLabel>
              <Select
                labelId="admin-subscription-proration-label"
                label={t('admin.subscriptionManagement.fields.proration')}
                value={proration}
                onChange={(event) =>
                  setProration(Number(event.target.value) as AdminSubscriptionProration)
                }
              >
                <MenuItem value={1}>
                  {t('admin.subscriptionManagement.proration.futureOnly')}
                </MenuItem>
                <MenuItem value={2}>
                  {t('admin.subscriptionManagement.proration.includePending')}
                </MenuItem>
              </Select>
              <FormHelperText>
                {t(
                  proration === 1
                    ? 'admin.subscriptionManagement.proration.futureOnlyHelp'
                    : 'admin.subscriptionManagement.proration.includePendingHelp'
                )}
              </FormHelperText>
            </FormControl>
          </>
        )}
        {action === 'suspend' && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {t('admin.subscriptionManagement.suspendHelp')}
          </Alert>
        )}
        {action === 'reactivate' && (
          <>
            <Alert severity="info" sx={{ mt: 1 }}>
              {t('admin.subscriptionManagement.reactivateHelp')}
            </Alert>
            <TextField
              fullWidth
              margin="dense"
              type="datetime-local"
              label={t('admin.subscriptionManagement.fields.nextDueDate')}
              value={nextDueDate}
              onChange={(event) => setNextDueDate(event.target.value)}
              disabled={busy || locked}
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!nextDueDate && !dateUtc}
              helperText={
                nextDueDate && !dateUtc
                  ? t('admin.subscriptionManagement.validation.futureDate')
                  : t('admin.subscriptionManagement.utcHelp')
              }
            />
          </>
        )}
        <TextField
          autoFocus={action !== 'reactivate'}
          fullWidth
          margin="dense"
          multiline
          minRows={3}
          label={t('admin.dialogs.reason')}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          disabled={busy || locked}
          required
          inputProps={{ maxLength: 500 }}
        />
        {error && (
          <Alert severity={error.retryable ? 'warning' : 'error'} sx={{ mt: 2 }}>
            {error.message}
            {error.retryable && ` ${t('admin.subscriptionManagement.retrySameIntention')}`}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        {locked && (
          <Button
            onClick={() => {
              submitted.current = null;
              setError(null);
            }}
          >
            {t('admin.subscriptionManagement.actions.changeIntention')}
          </Button>
        )}
        <Button disabled={busy} onClick={onClose}>
          {t('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          disabled={busy || (!locked && (!valid || (action === 'plan' && prices.length === 0)))}
          onClick={submit}
        >
          {locked ? t('admin.subscriptionManagement.actions.retrySame') : t('actions.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

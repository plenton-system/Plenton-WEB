import type { ReactNode } from 'react';
import type { AdminApiError } from 'src/types/admin';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useIdempotentIntention } from 'src/hooks/admin/use-idempotent-intention';

import { mapAdminApiError } from 'src/utils/admin-api-error';

export function AdminReasonDialog({
  open,
  title,
  onClose,
  onConfirm,
  submitting = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  submitting?: boolean;
  onConfirm: (reason: string) => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const valid = reason.trim().length >= 3;
  useEffect(() => {
    if (!open) setReason('');
  }, [open]);
  const close = () => {
    setReason('');
    onClose();
  };
  const confirm = async () => {
    await onConfirm(reason.trim());
    setReason('');
  };
  return (
    <Dialog open={open} onClose={submitting ? undefined : close} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          multiline
          minRows={3}
          label={t('admin.dialogs.reason')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={submitting} onClick={close}>
          {t('actions.cancel')}
        </Button>
        <Button variant="contained" disabled={submitting || !valid} onClick={confirm}>
          {t('actions.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function AdminConflictDialog({
  error,
  onClose,
  onRefresh,
}: {
  error: AdminApiError | null;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Dialog open={error?.kind === 'conflict'} onClose={onClose}>
      <DialogTitle>{t('admin.dialogs.conflictTitle')}</DialogTitle>
      <DialogContent>
        <Alert severity="warning">{error?.message}</Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('actions.cancel')}</Button>
        <Button variant="contained" onClick={onRefresh}>
          {t('admin.actions.refresh')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function AdminIdempotentActionDialog<T>({
  open,
  title,
  payload,
  children,
  onClose,
  onSubmit,
  onError,
}: {
  open: boolean;
  title: string;
  payload: T;
  children: ReactNode;
  onClose: () => void;
  onSubmit: (payload: T, key: string) => Promise<void>;
  onError?: (error: AdminApiError) => void;
}) {
  const { t } = useTranslation();
  const intention = useIdempotentIntention();
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<AdminApiError | null>(null);
  const submit = async () => {
    setSubmitting(true);
    setSubmissionError(null);
    try {
      const payloadSnapshot = structuredClone(payload);
      await onSubmit(payloadSnapshot, intention.begin(payloadSnapshot));
    } catch (reason: unknown) {
      const error = mapAdminApiError(reason);
      if (!error.retryable) intention.discard();
      setSubmissionError(error);
      try {
        onError?.(error);
      } catch {
        // Consumer notification failures must not become unhandled submission rejections.
      }
      return;
    } finally {
      setSubmitting(false);
    }
    intention.discard();
    onClose();
  };
  const close = () => {
    if (!submitting) {
      intention.discard();
      setSubmissionError(null);
      onClose();
    }
  };
  return (
    <Dialog open={open} onClose={close}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {children}
        {submissionError && (
          <Alert severity={submissionError.retryable ? 'warning' : 'error'} sx={{ mt: 2 }}>
            {submissionError.message}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={submitting} onClick={close}>
          {t('actions.cancel')}
        </Button>
        <Button
          disabled={submitting || (!!submissionError && !submissionError.retryable)}
          variant="contained"
          onClick={submit}
        >
          {submissionError?.retryable ? t('admin.actions.retry') : t('actions.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import type { AdminApiError, AdminReprocessOutcome } from 'src/types/admin';

import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { mapAdminApiError } from 'src/utils/admin-api-error';

type Intention = { idempotencyKey: string; reason: string };

export function AdminReprocessDialog({
  open,
  onClose,
  onConflict,
  onSubmit,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onConflict: () => void;
  onSubmit: (payload: Intention) => Promise<AdminReprocessOutcome>;
  onSuccess: (outcome: AdminReprocessOutcome) => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AdminApiError | null>(null);
  const intention = useRef<Intention | null>(null);
  const retryLocked = !!intention.current && !!error?.retryable;

  useEffect(() => {
    if (!open) {
      setReason('');
      setError(null);
      intention.current = null;
    }
  }, [open]);

  const submit = async () => {
    if ((!reason.trim() || reason.trim().length > 500) && !intention.current) return;
    const payload = intention.current ?? {
      idempotencyKey: crypto.randomUUID(),
      reason: reason.trim(),
    };
    intention.current = payload;
    setBusy(true);
    setError(null);
    try {
      const outcome = await onSubmit({ ...payload });
      intention.current = null;
      onSuccess(outcome);
      onClose();
    } catch (cause: unknown) {
      const mapped = mapAdminApiError(cause);
      if (mapped.kind === 'conflict') {
        intention.current = null;
        onConflict();
        onClose();
      } else {
        if (!mapped.retryable) intention.current = null;
        setError(mapped);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('admin.operations.reprocess.title')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          required
          fullWidth
          multiline
          minRows={3}
          margin="dense"
          label={t('admin.dialogs.reason')}
          value={reason}
          disabled={busy || retryLocked}
          inputProps={{ maxLength: 500 }}
          onChange={(event) => setReason(event.target.value)}
        />
        {error && (
          <Alert severity={error.retryable ? 'warning' : 'error'} sx={{ mt: 2 }}>
            {error.message}
            {error.retryable && ` ${t('admin.operations.reprocess.retrySame')}`}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          {t('admin.operations.reprocess.cancel')}
        </Button>
        <Button
          variant="contained"
          disabled={busy || (!retryLocked && (!reason.trim() || reason.trim().length > 500))}
          onClick={() => void submit()}
        >
          {retryLocked
            ? t('admin.operations.reprocess.retry')
            : t('admin.operations.reprocess.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

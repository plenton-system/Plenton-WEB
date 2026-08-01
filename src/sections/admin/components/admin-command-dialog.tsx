import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export function AdminCommandDialog({
  open,
  title,
  consequence,
  busy,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  consequence: string;
  busy: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (!open) setReason('');
  }, [open]);
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>{consequence}</Typography>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={3}
          required
          label={t('admin.dialogs.reason')}
          value={reason}
          slotProps={{ htmlInput: { maxLength: 500 } }}
          helperText={`${reason.length}/500`}
          onChange={(event) => setReason(event.target.value)}
        />
        {error && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>
          {t('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          disabled={busy || reason.trim().length < 3 || !!error}
          onClick={() => onConfirm(reason.trim())}
        >
          {t('actions.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

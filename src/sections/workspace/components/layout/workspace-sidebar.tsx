import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

// ----------------------------------------------------------------------

type Props = {
  onSendWhatsapp?: () => void;
  onGeneratePdf?: () => void;
};

// ----------------------------------------------------------------------

export function WorkspaceSidebar({ onGeneratePdf, onSendWhatsapp }: Props) {
  const { t } = useTranslation();
  const [checkPlan, setCheckPlan] = useState(false);
  const [checkNotes, setCheckNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const canSend = checkPlan && checkNotes;

  return (
    <Stack spacing={2}>
      <Card variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {t('workspace.sidebar.checklist')}
        </Typography>
        <Stack>
          <FormControlLabel
            control={
              <Checkbox
                checked={checkPlan}
                onChange={(event) => setCheckPlan(event.target.checked)}
              />
            }
            label={t('workspace.sidebar.planReviewed')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={checkNotes}
                onChange={(event) => setCheckNotes(event.target.checked)}
              />
            }
            label={t('workspace.sidebar.guidanceFilled')}
          />
        </Stack>
      </Card>

      <Card variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {t('workspace.sidebar.quickNotes')}
        </Typography>
        <TextField
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={t('workspace.sidebar.notesPlaceholder')}
          multiline
          minRows={4}
          fullWidth
        />
      </Card>

      <Card variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {t('workspace.sidebar.quickActions')}
        </Typography>
        <Stack spacing={1}>
          <Button variant="contained" disabled={!canSend} onClick={onSendWhatsapp}>
            {t('workspace.sidebar.sendWhatsapp')}
          </Button>
          <Button variant="outlined" disabled={!canSend} onClick={onGeneratePdf}>
            {t('workspace.sidebar.generatePdf')}
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}

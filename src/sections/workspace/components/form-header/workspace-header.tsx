import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

type Props = {
  onBack?: () => void;
  onNewAppointment?: () => void;
};

// ----------------------------------------------------------------------

export function WorkspaceHeader({ onBack, onNewAppointment }: Props) {
  const { t } = useTranslation();

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
        {onBack ? (
          <Tooltip title={t('workspace.header.back')}>
            <IconButton color="primary" onClick={onBack} aria-label={t('workspace.header.back')}>
              <ArrowBackIosNewIcon />
            </IconButton>
          </Tooltip>
        ) : null}
        <Box>
          <Typography variant="h5">{t('workspace.header.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('workspace.header.description')}
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button variant="outlined" onClick={onNewAppointment}>
          {t('workspace.header.newAppointment')}
        </Button>
      </Stack>
    </Stack>
  );
}

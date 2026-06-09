import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

// ----------------------------------------------------------------------

type Props = {
  onBack?: () => void;
  onNewAppointment?: () => void;
};

// ----------------------------------------------------------------------

export function WorkspaceHeader({ onBack, onNewAppointment }: Props) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
        {onBack ? (
          <Tooltip title="Voltar para listagem">
            <IconButton color="primary" onClick={onBack} aria-label="Voltar para listagem">
              <ArrowBackIosNewIcon />
            </IconButton>
          </Tooltip>
        ) : null}
        <Box>
          <Typography variant="h5">Área de trabalho do paciente</Typography>
          <Typography variant="body2" color="text.secondary">
            Central para gerenciar plano alimentar, antropometria e anamnese.
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button variant="outlined" onClick={onNewAppointment}>
          Nova consulta
        </Button>
      </Stack>
    </Stack>
  );
}

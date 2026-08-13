import type { PatientNutritionist } from 'src/types/domain/patient-portal';

import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { PortalEmpty, PortalError, PortalLoading } from './remote-state';

type Props = {
  data: PatientNutritionist | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
};

export function NutritionistCard({ data, loading, error, onRetry }: Props) {
  const { t } = useTranslation();

  if (loading) return <PortalLoading label={t('patientPortal.nutritionist.loading')} />;
  if (error) return <PortalError onRetry={onRetry} />;
  if (!data) {
    return (
      <PortalEmpty
        title={t('patientPortal.nutritionist.unlinkedTitle')}
        description={t('patientPortal.nutritionist.unlinkedDescription')}
      />
    );
  }

  const address = data.address
    ? [
        [data.address.street, data.address.number].filter(Boolean).join(', '),
        data.address.neighborhood,
        [data.address.city, data.address.state].filter(Boolean).join(' - '),
        data.address.zipCode,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <Card component="section" aria-labelledby="nutritionist-title">
      <CardContent>
        <Typography id="nutritionist-title" variant="h6" sx={{ mb: 2 }}>
          {t('patientPortal.nutritionist.title')}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Avatar src={data.profilePhoto ?? ''} alt={data.name} sx={{ width: 64, height: 64 }}>
            {data.name.charAt(0)}
          </Avatar>
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1">{data.name}</Typography>
            {data.crn && <Typography color="text.secondary">CRN {data.crn}</Typography>}
            {data.specification && (
              <Typography color="text.secondary">{data.specification}</Typography>
            )}
            {data.phone && (
              <Button
                component="a"
                href={`tel:${data.phone}`}
                size="small"
                sx={{ alignSelf: 'flex-start' }}
              >
                {t('patientPortal.nutritionist.contact', { phone: data.phone })}
              </Button>
            )}
            {address && (
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                <Box component="span" fontWeight={600}>
                  {t('patientPortal.nutritionist.address')}:{' '}
                </Box>
                {address}
              </Typography>
            )}
            {data.about && (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                <Box component="span" fontWeight={600}>
                  {t('patientPortal.nutritionist.about')}:{' '}
                </Box>
                {data.about}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

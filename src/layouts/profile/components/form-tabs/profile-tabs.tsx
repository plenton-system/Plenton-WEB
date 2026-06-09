import type { FormikProps } from 'formik';
import type { ProfileFormValues } from 'src/types';

import { useState } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Box, Card, CardContent } from '@mui/material';

import ProfileDataTab from './profile-data-tab';
import ProfileAddressTab from './profile-address-tab';

// ----------------------------------------------------------------------
type Props = { formik: FormikProps<ProfileFormValues> };

export default function ProfileTabs({ formik }: Props) {
  const [tab, setTab] = useState(0);

  return (
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Dados" />
          <Tab label="Endereço" />
        </Tabs>

        <Card sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {tab === 0 ? <ProfileDataTab formik={formik} /> : <ProfileAddressTab formik={formik} />}
          </CardContent>
        </Card>
      </Box>
  );
}

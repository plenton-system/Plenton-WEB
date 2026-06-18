import { useTranslation } from 'react-i18next';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

// ----------------------------------------------------------------------

type Props = {
    value: number;
    onChange: (v: number) => void;
};

// ----------------------------------------------------------------------

export default function PatientTabs({ value, onChange }: Props) {
    const { t } = useTranslation();

    return (
        <Tabs value={value} onChange={(_, v) => onChange(v)} sx={{ mb: 2 }}>
            <Tab label={t('patient.tabs.personal')} />
            <Tab label={t('patient.tabs.notes')} />
        </Tabs>
    );
}

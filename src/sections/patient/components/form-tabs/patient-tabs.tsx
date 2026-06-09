import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

// ----------------------------------------------------------------------

type Props = {
    value: number;
    onChange: (v: number) => void;
};

// ----------------------------------------------------------------------

export default function PatientTabs({ value, onChange }: Props) {
    return (
        <Tabs value={value} onChange={(_, v) => onChange(v)} sx={{ mb: 2 }}>
            <Tab label="Pessoais" />
            <Tab label="Anotações" />
        </Tabs>
    );
}

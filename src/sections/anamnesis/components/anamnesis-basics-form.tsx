import type { Basics } from 'src/types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ----------------------------------------------------------------------

type Props = {
    value: Basics;
    onChange: (patch: Partial<Basics>) => void;
    disabled?: boolean;
};

// ----------------------------------------------------------------------

export function AnamnesisBasicsForm({ value, onChange, disabled = false }: Props) {
    return (
        <Card variant="outlined">
            <CardHeader
                title="Anamnese - Informações básicas"
                subheader="Defina um título e, opcionalmente, uma descrição."
            />
            <CardContent>
                <Stack spacing={2}>
                    <TextField
                        label="Título"
                        value={value.title}
                        onChange={(e) => onChange({ title: e.target.value })}
                        fullWidth
                        disabled={disabled}
                        required
                    />
                    <TextField
                        label="Descrição (opcional)"
                        value={value.description ?? ''}
                        onChange={(e) => onChange({ description: e.target.value })}
                        fullWidth
                        multiline
                        minRows={2}
                        disabled={disabled}
                    />
                </Stack>
            </CardContent>
        </Card>
    );
}
